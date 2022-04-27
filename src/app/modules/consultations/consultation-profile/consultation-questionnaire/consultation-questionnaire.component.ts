import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { isObjectEmpty, checkPropertiesPresence, scrollToFirstError } from '../../../../shared/functions/modular.functions';
import { atLeastOneCheckboxCheckedValidator } from 'src/app/shared/validators/checkbox-validator';
import { Apollo } from 'apollo-angular';
import { SubmitResponseQuery, ConsultationProfileCurrentUser } from '../consultation-profile.graphql';
import { filter, map } from 'rxjs/operators';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';


@Component({
  selector: 'app-consultation-questionnaire',
  templateUrl: './consultation-questionnaire.component.html',
  styleUrls: ['./consultation-questionnaire.component.scss']
})
export class ConsultationQuestionnaireComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @Input() profileData;
  @Output() openThankYouModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('questionnaireContainer', { read: ElementRef , static: false }) questionnaireContainer: ElementRef<any>;

  responseFeedback: string;
  questionnaireForm: FormGroup;
  currentUser: any;
  responseAnswers: any[];
  showError: boolean;
  responseVisibility: any;
  longTextAnswer: any;
  templateText: any;
  templateId: any;
  responseSubmitLoading: boolean;
  consultationId: any;
  showConfirmEmailModal: boolean;
  questions: any;
  scrollToError: boolean;
  activeRoundNumber: any;
  respondedRounds = [];
  responseCreated: boolean;
  authModal = false;
  constructor(private _fb: FormBuilder,
    private userService: UserService,
    private consultationService: ConsultationsService,
    private apollo: Apollo,
    private errorService: ErrorService,
    private el: ElementRef) {
    this.questionnaireForm = this._fb.group({});
    this.consultationService.consultationId$
    .pipe(
      filter(i => i !== null)
    )
    .subscribe((consulationId: any) => {
      this.consultationId = consulationId;
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.subscribeProfileData();
    this.validateAnswers();
  }

  ngAfterViewInit() {
    this.subscribeUseTheResponseAnswer();
  }

  ngAfterViewChecked() {
    if (this.scrollToError) {
      scrollToFirstError('.error-msg', this.el.nativeElement);
      this.scrollToError = false;
    }
  }

  setSatisfactoryRating(value) {
    this.responseFeedback = value;
  }

  getCurrentUser() {
    this.userService.userLoaded$
    .subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  subscribeProfileData() {
    this.consultationService.consultationProfileData.subscribe((data) => {
      this.profileData = data;
      this.activeRoundNumber = this.getActiveRound(this.profileData.responseRounds);
      this.respondedRounds = this.getRespondedRounds();
      if (this.respondedRounds.includes(this.activeRoundNumber)) {
        this.responseCreated = true;
        return;
      } else {
        if (this.profileData && this.profileData.respondedOn) {
          this.consultationService.submitResponseActiveRoundEnabled.next(true);
        }
      }
      this.questionnaireForm = this.makeQuestionnaireModal();
    });
  }

  getRespondedRounds() {
    const respondedRounds = [];
    if (this.profileData) {
      const anonymousResponses = this.profileData.anonymousResponses && this.profileData.anonymousResponses.edges;
      const sharedResponses = this.profileData.sharedResponses  && this.profileData.sharedResponses.edges;
      if (anonymousResponses && anonymousResponses.length) {
        anonymousResponses.map((response: any) => {
          if (response && response.node && response.node.user) {
            respondedRounds.push(response.node.roundNumber);
          }
        });
      }
      if (sharedResponses && sharedResponses.length) {
        sharedResponses.map((response: any) => {
          if (response && response.node && response.node.user) {
            if (this.currentUser && (this.currentUser.id === response.node.user.id)) {
              respondedRounds.push(response.node.roundNumber);
            }
          }
        });
      }
    }
    return respondedRounds;
  }

  makeQuestionnaireModal(roundNumber?) {
    const responseRounds = this.profileData.responseRounds;
    if (responseRounds && responseRounds.length) {
      const activeRound  = responseRounds.find((round) => round.active);
      if (!isObjectEmpty(activeRound)) {
         this.questions = activeRound.questions;
          if (this.questions.length) {
            const form = new FormGroup({});
            this.questions.forEach(question => {
              if (question.questionType !== 'checkbox') {
                question.isOptional ? form.addControl(question.id, new FormControl(null)) :
                form.addControl(question.id, new FormControl(null, Validators.required ));
              } else if (question.questionType === 'checkbox') {
                form.addControl(question.id, this.makeCheckboxQuestionOptions(question));
              }
              if (question.is_other) {
                question.isOptional ? form.addControl('other_answer-' + question.id, new FormControl(null)) :
                  form.addControl('other_answer-' + question.id, new FormControl(null, Validators.required));
              }
            });
            return form;
          }
      }
    }
  }

  makeCheckboxQuestionOptions(question) {
    let form: any;
    form = question.isOptional ? new FormGroup({}) : new FormGroup({}, {
      validators: atLeastOneCheckboxCheckedValidator()
    });
    question.subQuestions.forEach(subQuestion => {
      form.addControl(subQuestion.id, new FormControl(false));
    });
    return form;
  }

  toggleCheckbox(questionId, subQuestionId) {
    const control = this.questionnaireForm.get([questionId, subQuestionId]);
    control.patchValue(!control.value);
  }

  validCurrentUser() {
    if (this.currentUser && !this.currentUser.confirmedAt) {
      this.showConfirmEmailModal = true;
      return false;
    }
    return true;
  }

  submitAnswer() {
    if (this.responseSubmitLoading) {
      return;
    }
    if (this.questionnaireForm.valid && this.responseFeedback) {
      this.responseAnswers = this.getResponseAnswers();
      const consultationResponse = this.getConsultationResponse();
      if (!isObjectEmpty(consultationResponse)) {
        if (this.currentUser) {
          this.submitResponse(consultationResponse);
          this.showError = false;
        } else {
          this.authModal = true;
          localStorage.setItem('consultationResponse', JSON.stringify(consultationResponse));
        }
      }
    } else {
      if (!this.responseFeedback) {
        this.consultationService.satisfactionRatingError.next(true);
      }
      this.showError = true;
      this.scrollToError = true;
    }
  }

  getResponseAnswers () {
    const answers = {...this.questionnaireForm.value};
    const responseAnswers = [];
    for (const item in answers) {
      if (answers.hasOwnProperty(item) && answers[item] !== null) {
        if (typeof(answers[item]) === 'object') {
            const keys = Object.keys(answers[item]);
            const filtered = keys.filter(function(key) {
                return answers[item][key];
            });
            answers[item] = filtered;
            let otherElement = false;
            for (let i = 0 ; i < answers[item].length; i++) {
              if (answers[item][i] === 'other') {
                otherElement = true;
                break;
              }
            }
            if (otherElement) {
              const filteredAnswers = answers[item].filter(val => {
                return val !== 'other';
              });
              if (filteredAnswers.length > 0) {
                responseAnswers.push({
                  question_id: item,
                  is_other: true,
                  other_option_answer: answers['other_answer-' + item],
                  answer: filteredAnswers
                });
              } else {
                responseAnswers.push({
                  question_id: item,
                  is_other: true,
                  other_option_answer: answers['other_answer-' + item]
                });
              }
            } else {
              if (answers[item].length > 0) {
                responseAnswers.push({
                  question_id: item,
                  answer: answers[item]
                });
              }
            }
        }
        if (answers[item] === 'other') {
          responseAnswers.push({
            question_id: item,
            is_other: true,
            other_option_answer: answers['other_answer-' + item],
          });
        } else if (!(item.includes('other')) && !Array.isArray(answers[item])) {
          if (answers[item].length > 0 || typeof answers[item] !== 'string') {
            responseAnswers.push({
              question_id: item,
              answer: answers[item]
            });
          }
        }
      }
    }
    return responseAnswers;
  }

  validateAnswers() {
    this.consultationService.validateAnswers.subscribe((value) => {
      if (value) {
        this.submitAnswer();
        this.consultationService.validateAnswers.next(false);
      }
    });
  }

  getConsultationResponse() {
    const consultationResponse =  {
      consultationId: this.profileData.id,
      satisfactionRating : this.responseFeedback,
      visibility: this.responseVisibility ? 'shared' : 'anonymous',
    };
    if (checkPropertiesPresence(consultationResponse)) {
      consultationResponse['templateId'] = this.templateId;
      consultationResponse['answers'] = this.responseAnswers;
      return consultationResponse;
    }
    return;
  }

  onAnswerChange(question?, value?, checkboxValue?) {
    if (question && value.id === 'other') {
      let otherValue = true;
      if (question.questionType === 'checkbox' && value.id === 'other' && !checkboxValue) {
         otherValue = false;
      }
      for (let i = 0; i < this.questions.length; i++) {
        if (this.questions[i].id === question.id) {
          this.questions[i].is_other = otherValue;
          if (question.isOptional) {
            this.questionnaireForm.addControl('other_answer-' + question.id, new FormControl(null));
          } else {
            this.questionnaireForm.addControl('other_answer-' + question.id, new FormControl(null, Validators.required));
          }
          break;
        }
      }
    } else {
      if (question.questionType !== 'checkbox') {
        this.questions.forEach(ques => {
          if (question.id === ques.id) {
            ques.is_other = false;
          }
        });
      }
    }
  }

  subscribeUseTheResponseAnswer() {
    this.consultationService.useThisResponseAnswer.subscribe((obj: any) => {
      if (obj && !isObjectEmpty(obj)) {
        const {templateId, longTextResponses} = obj;
        this.templateId = templateId;
        longTextResponses.map((response) => {
          const controlName = response.id.toString();
          this.longTextAnswer = this.templateText = response.answer;
            const textAreaElement = document.getElementById(`text-area-${controlName}`);
            if (textAreaElement) {
              window.scrollTo({
                top: this.questionnaireContainer.nativeElement.offsetTop - 80,
                behavior: 'smooth',
              });
              this.questionnaireForm.get(controlName).patchValue(this.longTextAnswer);
            }
        });

      }
    });
  }

  submitResponse(consultationResponse) {
    this.responseSubmitLoading = true;
    this.apollo.mutate({
      mutation: SubmitResponseQuery,
      variables: {
        consultationResponse: consultationResponse
      },
      update: (store, {data: res}) => {
        const variables = {id: this.consultationId};
        const resp: any = store.readQuery({query: ConsultationProfileCurrentUser, variables});
        if (res) {
          resp.consultationProfile.respondedOn = res.consultationResponseCreate.consultation.respondedOn;
          resp.consultationProfile.sharedResponses = res.consultationResponseCreate.consultation.sharedResponses;
          resp.consultationProfile.responseSubmissionMessage = res.consultationResponseCreate.consultation.responseSubmissionMessage;
          resp.consultationProfile.satisfactionRatingDistribution =
            res.consultationResponseCreate.consultation.satisfactionRatingDistribution;
        }
        store.writeQuery({query: ConsultationProfileCurrentUser, variables, data: resp});
      }
    })
    .pipe (
      map((res: any) => res.data.consultationResponseCreate)
    )
    .subscribe((res) => {
      this.openThankYouModal.emit(res.points);
      this.responseSubmitLoading = false;
      this.responseCreated = true;
      this.consultationService.submitResponseActiveRoundEnabled.next(false);
    }, err => {
      this.responseSubmitLoading = false;
      this.errorService.showErrorModal(err);
    });
  }

  showPublicResponseOption() {
    if (this.profileData && this.profileData.enforcePrivateResponse) {
      return false;
    }
    if (this.longTextAnswer && this.templateText) {
      return this.longTextAnswer !== this.templateText;
    }
    return true;
  }

  getActiveRound(responseRounds) {
    if (responseRounds && responseRounds.length) {
      const activeRound  = responseRounds.find((round) => round.active);
      if (!isObjectEmpty(activeRound)) {
        return activeRound.roundNumber;
      }
    }
  return;
  }


}

import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { UserService } from "src/app/shared/services/user.service";
import { ConsultationsService } from "src/app/shared/services/consultations.service";
import {
  isObjectEmpty,
  checkPropertiesPresence,
  scrollToFirstError,
  setResponseVisibility,
  getTranslatedText,
  createLangObject,
} from "../../../../shared/functions/modular.functions";
import { atLeastOneCheckboxCheckedValidator } from "src/app/shared/validators/checkbox-validator";
import { Apollo } from "apollo-angular";
import {
  SubmitResponseQuery,
  ConsultationProfileCurrentUser,
  CreateUserCountRecord,
  UpdateUserCountRecord,
  UserCountUser,
  ConsultationProfileUser,
  SubmitResponseGuestUser,
} from "../consultation-profile.graphql";
import { filter, map } from "rxjs/operators";
import { ErrorService } from "src/app/shared/components/error-modal/error.service";
import { profanityList } from "src/app/graphql/queries.graphql";
import { environment } from "../../../../../environments/environment";
import { MetaPixelService } from "src/app/shared/services/pixel.service";
import { CookieService } from 'ngx-cookie';
import { Router } from '@angular/router';
import { WHITE_LABEL_CONSULTATION_ID } from 'src/app/shared/models/constants/constants';

@Component({
  selector: "app-consultation-questionnaire",
  templateUrl: "./consultation-questionnaire.component.html",
  styleUrls: ["./consultation-questionnaire.component.scss"],
})
export class ConsultationQuestionnaireComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  public WHITE_LABEL_CONSULTATION_ID = WHITE_LABEL_CONSULTATION_ID;

  @Input() profileData;
  @Output() openThankYouModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("questionnaireContainer", { read: ElementRef, static: false })
  questionnaireContainer: ElementRef<any>;

  responseFeedback: string;
  questionnaireForm: FormGroup;
  currentUser: any;
  responseAnswers: any[];
  showError: boolean;
  responseVisibility: boolean = false;
  longTextAnswer: any;
  templateText: any;
  templateId: any;
  currentLanguage: any;
  responseSubmitLoading: boolean;
  consultationId: any;
  showConfirmEmailModal: boolean;
  questions: any;
  scrollToError: boolean;
  activeRoundNumber: any;
  respondedRounds = [];
  responseCreated: boolean;
  authModal = false;
  isConfirmModal = false;
  confirmMessage = {
    msg: "Do you want to reconsider your response? We detected some potentially harmful language, and to keep Civis safe and open we recommend revising responses that were detected as potentially harmful.",
    title: "",
  };
  nudgeMessageDisplayed = false;
  profanityCount: any;
  userData: any;
  profanity_count_changed: boolean = false;
  isUserResponseProfane: boolean = false;
  responseStatus = 0;
  profaneWords = [];
  environment: any = environment;

  get profanityCountGetter() {
    //TODO: Profanity filter feature, remove when ready for deployment to production
    return environment.production ? 0 : this.profanityCount;
  }

  constructor(
    private _fb: FormBuilder,
    private userService: UserService,
    private consultationService: ConsultationsService,
    private apollo: Apollo,
    private errorService: ErrorService,
    private metaPixelService: MetaPixelService,
    private el: ElementRef,
    private cookieService: CookieService,
    private router: Router,
  ) {
    this.currentLanguage = this.cookieService.get('civisLang');
    this.questionnaireForm = this._fb.group({});
    this.consultationService.consultationId$
      .pipe(filter((i) => i !== null))
      .subscribe((consulationId: any) => {
        this.consultationId = consulationId;
      });
    //TODO: Profanity filter feature, remove condition when ready fo deployment to production
    if (!environment.production) {
      this.apollo
        .watchQuery({
          query: profanityList,
          fetchPolicy: "network-only",
        })
        .valueChanges.pipe(map((res: any) => res.data))
        .subscribe(
          (response: any) => {
            this.profaneWords = response.profanityList.data.map(
              (profane) => profane.profaneWord
            );
          },
          (err: any) => {}
        );
    }
    if(this.consultationId === 404 || this.consultationId === 707) {
      this.responseFeedback = "satisfied";
    }
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
      scrollToFirstError(".error-msg", this.el.nativeElement);
      this.scrollToError = false;
    }
  }

  setSatisfactoryRating(value) {
    this.responseFeedback = value;
  }

  getCurrentUser() {
    this.userService.userLoaded$.subscribe((data) => {
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
      this.activeRoundNumber = this.getActiveRound(
        this.profileData.responseRounds
      );
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

  getTranslatedTextForQuestion(item: any) {
    const textMap = createLangObject({ source: item, suffix: "QuestionText" });
    return getTranslatedText(this.currentLanguage, textMap, item?.questionText);
  }

  getQuestionText(question) {
    return this.getTranslatedTextForQuestion(question);
  }

  getSubQuestionText(subQuestion: any) {
    return this.getTranslatedTextForQuestion(subQuestion);
  }

  getRespondedRounds() {
    const respondedRounds = [];
    if (this.profileData) {
      const anonymousResponses =
        this.profileData.anonymousResponses &&
        this.profileData.anonymousResponses.edges;
      const sharedResponses =
        this.profileData.sharedResponses &&
        this.profileData.sharedResponses.edges;
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
            if (
              this.currentUser &&
              this.currentUser.id === response.node.user.id
            ) {
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
    let draftObj: any = localStorage.getItem("consultationResponse");
    const savedAnswers = {};
    if (draftObj) {
      try {
        draftObj = JSON.parse(draftObj);
        if (draftObj.consultationId === this.consultationId) {
          draftObj?.answers?.forEach(({ question_id, answer }: any) => {
            savedAnswers[question_id] = answer;
          });
        }
      } catch {
        console.error("Failed to parse saved response");
      }
    }

    const getSavedAnswer = (questionId) => {
      return savedAnswers[questionId] ?? null;
    };

    if (responseRounds && responseRounds.length) {
      const activeRound = responseRounds.find((round) => round.active);
      if (!isObjectEmpty(activeRound)) {
        this.questions = activeRound.questions;
        if (this.questions.length) {
          const form = new FormGroup({});
          this.questions.forEach((question) => {
            if (question.questionType !== "checkbox") {
              question.isOptional
                ? form.addControl(
                    question.id,
                    new FormControl(getSavedAnswer(question.id))
                  )
                : form.addControl(
                    question.id,
                    new FormControl(
                      getSavedAnswer(question.id),
                      Validators.required
                    )
                  );
            } else if (question.questionType === "checkbox") {
              form.addControl(
                question.id,
                this.makeCheckboxQuestionOptions(
                  question,
                  getSavedAnswer(question.id)
                )
              );
            }
            if (question.is_other) {
              question.isOptional
                ? form.addControl(
                    "other_answer-" + question.id,
                    new FormControl(getSavedAnswer(question.id))
                  )
                : form.addControl(
                    "other_answer-" + question.id,
                    new FormControl(
                      getSavedAnswer(question.id),
                      Validators.required
                    )
                  );
            }
          });
          return form;
        }
      }
    }
  }

  makeCheckboxQuestionOptions(question, defaultValue?) {
    let form: any;
    form = question.isOptional
      ? new FormGroup({})
      : new FormGroup(
          {},
          {
            validators: atLeastOneCheckboxCheckedValidator(),
          }
        );
    question.subQuestions.forEach((subQuestion) => {
      form.addControl(
        subQuestion.id,
        new FormControl(defaultValue ? subQuestion.id === defaultValue : false)
      );
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
    if (!this.responseFeedback && !this.profileData?.isSatisfactionRatingOptional) {
      this.consultationService.satisfactionRatingError.next(true);
      this.showError = true;
      this.scrollToError = true;
      return;
    }
    if (this.questionnaireForm.valid) {
      this.responseAnswers = this.getResponseAnswers();
      const consultationResponse = this.getConsultationResponse();
      if (this.consultationId === 1089) {
        this.invokeSubmitResponse();
      } else {
        if (!isObjectEmpty(consultationResponse)) {
          if (this.currentUser) {
            this.metaPixelService.trackSubmitResponse();
            this.apollo
              .watchQuery({
                query: UserCountUser,
                variables: { userId: this.currentUser.id },
                fetchPolicy: "no-cache",
              })
              .valueChanges.pipe(map((res: any) => res.data.userCountUser))
              .subscribe(
                (data) => {
                  if (!this.profanity_count_changed) {
                    this.userData = data;
                    this.checkAndUpdateProfanityCount();
                  }
                },
                (err) => {
                  const e = new Error(err);
                  this.errorService.showErrorModal(err);
                }
              );
          } else {
            // If the user is not authenticated, show the auth modal and store the consultation response to local storage.
            const currentUrl = this.router.url;
            this.cookieService.put('loginCallbackUrl', currentUrl);
            this.authModal = true;
            localStorage.setItem(
              "consultationResponse",
              JSON.stringify(consultationResponse)
            );
          }
        }
      }
    } else {
      if (!this.responseFeedback && !this.profileData?.isSatisfactionRatingOptional) {
        this.consultationService.satisfactionRatingError.next(true);
      }
      this.showError = true;
      this.scrollToError = true;
    }
  }

  checkAndUpdateProfanityCount() {
    var Filter = require("bad-words"),
      filter = new Filter({ list: this.profaneWords });

    this.isUserResponseProfane = filter.isProfane(this.longTextAnswer);
    if (this.userData !== null) {
      this.profanityCount = this.userData.profanityCount;
    } else {
      this.profanityCount = 0;
      if (this.isUserResponseProfane) {
        if (!this.nudgeMessageDisplayed) {
          this.isConfirmModal = true;
          this.nudgeMessageDisplayed = true;
          return;
        }
        this.profanityCount += 1;
        this.responseStatus = +1;
      }
      this.apollo
        .mutate({
          mutation: CreateUserCountRecord,
          variables: {
            userCount: {
              userId: this.currentUser.id,
              //TODO: Profanity filter feature, remove condition when ready fo deployment to production
              profanityCount: this.profanityCountGetter,
              shortResponseCount: 0,
            },
          },
        })
        .subscribe(
          (data) => {
            this.invokeSubmitResponse();
          },
          (err) => {
            this.errorService.showErrorModal(err);
          }
        );
      this.profanity_count_changed = true;
      return;
    }

    if (this.isUserResponseProfane) {
      if (!this.nudgeMessageDisplayed) {
        this.isConfirmModal = true;
        this.nudgeMessageDisplayed = true;
        return;
      }
      this.profanityCount += 1;
      this.responseStatus = +1;
      if (this.profanityCount >= 3) {
        this.confirmMessage.msg =
          "We detected that your response may contain harmful language. This response will be moderated and sent to the Government at our moderator's discretion.";
        this.isConfirmModal = true;
      }
    } else {
      this.invokeSubmitResponse();
      return;
    }

    this.apollo
      .mutate({
        mutation: UpdateUserCountRecord,
        variables: {
          userCount: {
            userId: this.currentUser.id,
            //TODO: Profanity filter feature, remove condition when ready fo deployment to production
            profanityCount: this.profanityCountGetter,
            shortResponseCount: this.userData.shortResponseCount,
          },
        },
      })
      .subscribe(
        (data) => {
          this.invokeSubmitResponse();
        },
        (err) => {
          this.errorService.showErrorModal(err);
        }
      );
    this.profanity_count_changed = true;
  }

  confirmed(event) {
    this.isConfirmModal = false;
  }

  invokeSubmitResponse() {
    const consultationResponse = this.getConsultationResponse();
    this.submitResponse(consultationResponse);
    this.showError = false;
  }

  getResponseAnswers() {
    const answers = { ...this.questionnaireForm.value };
    const responseAnswers = [];
    for (const item in answers) {
      if (answers.hasOwnProperty(item) && answers[item] !== null) {
        if (typeof answers[item] === "object") {
          const keys = Object.keys(answers[item]);
          const filtered = keys.filter(function (key) {
            return answers[item][key];
          });
          answers[item] = filtered;
          let otherElement = false;
          for (let i = 0; i < answers[item].length; i++) {
            if (answers[item][i] === "other") {
              otherElement = true;
              break;
            }
          }
          if (otherElement) {
            const filteredAnswers = answers[item].filter((val) => {
              return val !== "other";
            });
            if (filteredAnswers.length > 0) {
              responseAnswers.push({
                question_id: item,
                is_other: true,
                other_option_answer: answers["other_answer-" + item],
                answer: filteredAnswers,
              });
            } else {
              responseAnswers.push({
                question_id: item,
                is_other: true,
                other_option_answer: answers["other_answer-" + item],
              });
            }
          } else {
            if (answers[item].length > 0) {
              responseAnswers.push({
                question_id: item,
                answer: answers[item],
              });
            }
          }
        }
        if (answers[item] === "other") {
          responseAnswers.push({
            question_id: item,
            is_other: true,
            other_option_answer: answers["other_answer-" + item],
          });
        } else if (!item.includes("other") && !Array.isArray(answers[item])) {
          if (answers[item].length > 0 || typeof answers[item] !== "string") {
            responseAnswers.push({
              question_id: item,
              answer: answers[item],
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
    const consultationResponse = {
      consultationId: this.profileData.id,
      satisfactionRating: this.responseFeedback || null,
      visibility: this.responseVisibility, // initial response visibility set by the user
      responseStatus: this.responseStatus,
    };
    if (checkPropertiesPresence(consultationResponse)) {
      consultationResponse["templateId"] = this.templateId;
      consultationResponse["answers"] = this.responseAnswers;
      return consultationResponse;
    }
    return;
  }

  onAnswerChange(question?, value?, checkboxValue?) {
    if (question && value.id === "other") {
      let otherValue = true;
      if (
        question.questionType === "checkbox" &&
        value.id === "other" &&
        !checkboxValue
      ) {
        otherValue = false;
      }
      for (let i = 0; i < this.questions.length; i++) {
        if (this.questions[i].id === question.id) {
          this.questions[i].is_other = otherValue;
          if (question.isOptional) {
            this.questionnaireForm.addControl(
              "other_answer-" + question.id,
              new FormControl(null)
            );
          } else {
            this.questionnaireForm.addControl(
              "other_answer-" + question.id,
              new FormControl(null, Validators.required)
            );
          }
          break;
        }
      }
    } else {
      if (question.questionType !== "checkbox") {
        this.questions.forEach((ques) => {
          if (question.id === ques.id) {
            ques.is_other = false;
            if (this.questionnaireForm.controls["other_answer-" + ques.id]) {
              this.questionnaireForm.removeControl("other_answer-" + ques.id);
            }
          }
        });
      }
    }
  }

  subscribeUseTheResponseAnswer() {
    this.consultationService.useThisResponseAnswer.subscribe((obj: any) => {
      if (obj && !isObjectEmpty(obj)) {
        const { templateId, longTextResponses } = obj;
        this.templateId = templateId;
        longTextResponses.map((response) => {
          const controlName = response.id.toString();
          this.longTextAnswer = this.templateText = response.answer;
          const textAreaElement = document.getElementById(
            `text-area-${controlName}`
          );
          if (textAreaElement) {
            window.scrollTo({
              top: this.questionnaireContainer.nativeElement.offsetTop - 80,
              behavior: "smooth",
            });
            this.questionnaireForm
              .get(controlName)
              .patchValue(this.longTextAnswer);
          }
        });
      }
    });
  }

  submitResponse(consultationResponse) {
    if (this.responseSubmitLoading) return;

    this.responseSubmitLoading = true;
    consultationResponse.visibility = setResponseVisibility(
      consultationResponse.visibility,
      this.currentUser?.isVerified
    );
    this.apollo
      .mutate({
        mutation: this.currentUser ? SubmitResponseQuery : SubmitResponseGuestUser,
        variables: {
          consultationResponse: consultationResponse,
        },
        update: (store, { data: res }) => {
          const variables = { id: this.consultationId };
          const resp: any = store.readQuery({
            query: this.currentUser ? ConsultationProfileCurrentUser : ConsultationProfileUser,
            variables,
          });
          if (res) {
            if(this.currentUser?.id) {
              resp.consultationProfile.respondedOn =
              res.consultationResponseCreate.consultation.respondedOn;
            }
            resp.consultationProfile.sharedResponses =
              res.consultationResponseCreate.consultation.sharedResponses;
            resp.consultationProfile.responseSubmissionMessage =
              res.consultationResponseCreate.consultation.responseSubmissionMessage;
            resp.consultationProfile.satisfactionRatingDistribution =
              res.consultationResponseCreate.consultation.satisfactionRatingDistribution;
          }
          store.writeQuery({
            query: this.currentUser ? ConsultationProfileCurrentUser : ConsultationProfileUser,
            variables,
            data: resp,
          });
        },
      })
      .pipe(map((res: any) => res.data.consultationResponseCreate))
      .subscribe(
        (res) => {
          this.openThankYouModal.emit(res.points);
          this.responseSubmitLoading = false;
          this.responseCreated = true;
          this.consultationService.submitResponseActiveRoundEnabled.next(false);
        },
        (err) => {
          this.responseSubmitLoading = false;
          this.errorService.showErrorModal(err);
        }
      );
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
      const activeRound = responseRounds.find((round) => round.active);
      if (!isObjectEmpty(activeRound)) {
        return activeRound.roundNumber;
      }
    }
    return;
  }

  getSubmitButtonTooltip(): string {
    if (this.showError && !this.responseFeedback && !this.profileData?.isSatisfactionRatingOptional) {
      return 'Please select a Satisfaction Rating to submit the response';
    } else if (this.showError && !this.questionnaireForm?.valid) {
      return 'Please fill all the answers to submit response.';
    } else {
      return '';
    }
  }
}

import { VOICE_DEMO_CONSULTATION_ID } from "src/app/shared/models/constants/constants";
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
import { ChangeDetectorRef } from "@angular/core";
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
import { CookieService } from "ngx-cookie";
import { Router } from "@angular/router";
import { WhiteLabelService } from "src/app/shared/services/white-label.service";
import { AudioRecordingService } from "src/app/shared/services/audio-recording.service";
import { DomSanitizer } from "@angular/platform-browser";
import { print } from "graphql";

const errorMessages: { [key: string]: string } = {
  duplicatePriority:
    "You have selected the same priority for multiple options. Please assign a unique priority to each.",
  missingPriority: "Please assign a priority to all selected options.",
  required: "This is a mandatory question and your response is required",
};

@Component({
  selector: "app-consultation-questionnaire",
  templateUrl: "./consultation-questionnaire.component.html",
  styleUrls: ["./consultation-questionnaire.component.scss"],
})
export class ConsultationQuestionnaireComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  public VOICE_DEMO_CONSULTATION_ID = VOICE_DEMO_CONSULTATION_ID;
  private static readonly OTHER_ANSWER_PREFIX = "other_answer-";
  private static readonly SINGLE_QUESTION = "single_question";

  public whiteLabelConsultationId: number | null = null;

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
  // https://stackblitz.com/edit/angular-audio-recorder
  private currentRecordingQuestionId: number | null = null;
  private isRecordingByQuestionId: { [questionId: number]: boolean } = {};
  private recordedTimeByQuestionId: { [questionId: number]: string } = {};
  private blobUrlByQuestionId: { [questionId: number]: any } = {};
  private blobByQuestionId: { [questionId: number]: Blob } = {};
  private titleByQuestionId: { [questionId: number]: string } = {};
  currentQuestionIndex: number = 0;
  isStepByStepFlow: boolean = false;
  private readonly priorityOptionsCache: Map<
    number,
    {
      options: number[];
      subQuestionsLength: number;
      numSelectedOptions: number;
    }
  > = new Map();

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
    private whiteLabelService: WhiteLabelService,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.currentLanguage = this.cookieService.get("civisLang");
    this.questionnaireForm = this._fb.group({});
    this.whiteLabelConsultationId =
      this.whiteLabelService.getConsultationIdForHostname();
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
    if (this.consultationId === 404 || this.consultationId === 707) {
      this.responseFeedback = "satisfied";
    }

    this.audioRecordingService.recordingFailed().subscribe(() => {
      if (this.currentRecordingQuestionId != null) {
        this.isRecordingByQuestionId[this.currentRecordingQuestionId] = false;
      }
    });
    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      if (this.currentRecordingQuestionId != null) {
        this.recordedTimeByQuestionId[this.currentRecordingQuestionId] = time;
      }
    });
    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      if (this.currentRecordingQuestionId == null) return;
      const qid = this.currentRecordingQuestionId;
      this.blobByQuestionId[qid] = data.blob;
      this.titleByQuestionId[qid] = data.title;
      this.blobUrlByQuestionId[qid] = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(data.blob)
      );
      this.isRecordingByQuestionId[qid] = false;
      this.currentRecordingQuestionId = null;
      this.changeFieldRequirement(qid, false);
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
      scrollToFirstError(".error-msg", this.el.nativeElement);
      this.scrollToError = false;
    }
  }

  getOtherAnswerControlName(id: string | number): string {
    return ConsultationQuestionnaireComponent.OTHER_ANSWER_PREFIX + id;
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
      if (this.profileData.hasUserFilledResponseInCurrentResponseRound) {
        this.responseCreated = true;
        return;
      } else {
        if (this.profileData && this.profileData.respondedOn) {
          this.consultationService.submitResponseActiveRoundEnabled.next(true);
        }
      }
      this.questionnaireForm = this.makeQuestionnaireModal();
      this.checkIsStepByStepFlow();
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

  // Used for questions where voice response is given
  changeFieldRequirement(
    questionId: string | number,
    shouldBeRequired: boolean
  ) {
    const questionObj = this.questions.find((q) => q.id === questionId);
    const isOptional = questionObj?.isOptional;
    if (!questionObj && isOptional) {
      return;
    }

    const formControl = this.questionnaireForm.get(questionId.toString());
    if (!formControl) {
      return;
    }

    if (shouldBeRequired) {
      formControl.setValidators(Validators.required);
    } else {
      formControl.clearValidators();
      formControl.updateValueAndValidity();
    }
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
              const otherControlName = this.getOtherAnswerControlName(
                question.id
              );
              question.isOptional
                ? form.addControl(
                    otherControlName,
                    new FormControl(getSavedAnswer(question.id))
                  )
                : form.addControl(
                    otherControlName,
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
    form = new FormGroup(
      {},
      {
        validators: atLeastOneCheckboxCheckedValidator(1, question.isOptional),
      }
    );
    question.subQuestions.forEach((subQuestion) => {
      const optionForm = new FormGroup({
        value: new FormControl(
          defaultValue ? subQuestion.id === defaultValue : false
        ),
        priority: new FormControl(0),
      });

      form.addControl(subQuestion.id, optionForm);
    });
    return form;
  }

  toggleCheckbox(questionId, subQuestionId) {
    const control = this.questionnaireForm.get([
      questionId,
      subQuestionId,
      "value",
    ]);
    control.patchValue(!control.value);
  }

  validCurrentUser() {
    if (this.currentUser && !this.currentUser.confirmedAt) {
      this.showConfirmEmailModal = true;
      return false;
    }
    return true;
  }

  async submitAnswer() {
    if (this.responseSubmitLoading) {
      return;
    }
    if (
      !this.responseFeedback &&
      !this.profileData?.isSatisfactionRatingOptional
    ) {
      this.consultationService.satisfactionRatingError.next(true);
      this.showError = true;
      this.scrollToError = true;
      return;
    }
    if (this.isFormValidForVisibleQuestions()) {
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
            this.cookieService.put("loginCallbackUrl", currentUrl);
            this.authModal = true;
            // Persist voice recordings by encoding each File as base64 before writing to localStorage; JSON.stringify drops Blob/File objects.
            const responseForStorage =
              await this.getConsultationResponseForStorage();
            if (responseForStorage) {
              localStorage.setItem(
                "consultationResponse",
                JSON.stringify(responseForStorage)
              );
            }
          }
        }
      }
    } else {
      if (
        !this.responseFeedback &&
        !this.profileData?.isSatisfactionRatingOptional
      ) {
        this.consultationService.satisfactionRatingError.next(true);
      }
      this.showError = true;
      this.scrollToError = true;
    }
  }

  /**
   * Validate only visible questions (parents and actually shown conditional children)
   */
  private isFormValidForVisibleQuestions(): boolean {
    if (!this.questions || !this.questionnaireForm) return true;

    let allValid = true;

    const parents = this.getTopLevelQuestions();
    parents.forEach((parent: any) => {
      const parentCtrl = this.questionnaireForm.get(parent.id.toString());
      if (parentCtrl) {
        parentCtrl.markAsTouched({ onlySelf: true });
        parentCtrl.updateValueAndValidity({ onlySelf: true });
        if (parentCtrl.invalid) allValid = false;
      }
      const parentOther = this.questionnaireForm.get(
        this.getOtherAnswerControlName(parent.id)
      );
      if (parent.is_other && parentOther) {
        parentOther.markAsTouched({ onlySelf: true });
        parentOther.updateValueAndValidity({ onlySelf: true });
        if (parentOther.invalid) allValid = false;
      }

      const children = this.getDirectConditionalChildren(parent);
      children.forEach((child: any) => {
        if (!this.shouldShowConditionalQuestion(parent, child.id)) return;
        const childCtrl = this.questionnaireForm.get(child.id.toString());
        if (childCtrl) {
          childCtrl.markAsTouched({ onlySelf: true });
          childCtrl.updateValueAndValidity({ onlySelf: true });
          if (childCtrl.invalid) allValid = false;
        }
        const childOther = this.questionnaireForm.get(
          this.getOtherAnswerControlName(child.id)
        );
        if (child.is_other && childOther) {
          childOther.markAsTouched({ onlySelf: true });
          childOther.updateValueAndValidity({ onlySelf: true });
          if (childOther.invalid) allValid = false;
        }
      });
    });

    return allValid;
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
          const isCheckBoxAnswer = Object.values(answers[item]).every(
            (obj) =>
              typeof obj === "object" &&
              obj.hasOwnProperty("value") &&
              obj.hasOwnProperty("priority")
          );

          const allKeys = Object.keys(answers[item]);
          const selectedKeys = allKeys.filter(function (key) {
            const keyObj = answers[item][key];
            return isCheckBoxAnswer ? keyObj.value === true : keyObj;
          });

          const getOptionsWithPriority = (optionKey) => {
            if (!isCheckBoxAnswer) {
              return optionKey;
            }

            const userSelection = answers[item][optionKey];
            return {
              priority: userSelection.priority,
              option_id: optionKey,
            };
          };

          let hasOtherElement = selectedKeys.includes("other");

          if (hasOtherElement) {
            const otherTextAnswer =
              answers[this.getOtherAnswerControlName(item)];
            let otherOptionAnswer = otherTextAnswer;

            if (isCheckBoxAnswer) {
              const otherPriority = answers[item]["other"].priority;
              otherOptionAnswer = {
                option_id: otherTextAnswer,
                priority: otherPriority,
              };
            }

            const response: any = {
              question_id: item,
              is_other: true,
              other_option_answer: otherOptionAnswer,
            };

            const filteredAnswers = selectedKeys
              .filter((val) => {
                return val !== "other";
              })
              .map(getOptionsWithPriority);
            if (filteredAnswers.length > 0) {
              response.answer = filteredAnswers;
            }

            responseAnswers.push(response);
          } else if (selectedKeys.length > 0) {
            responseAnswers.push({
              question_id: item,
              answer: selectedKeys.map(getOptionsWithPriority),
            });
          }
        } else if (answers[item] === "other") {
          responseAnswers.push({
            question_id: item,
            is_other: true,
            other_option_answer: answers[this.getOtherAnswerControlName(item)],
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
      // Build voiceResponses array with proper File objects (not Blob)
      const voiceResponses: Array<{ questionId: string; file: File }> = [];
      Object.keys(this.blobByQuestionId).forEach((key) => {
        const qidNum = Number.parseInt(key, 10);
        const blob = this.blobByQuestionId[qidNum];
        if (!blob) return;
        const mimeType = blob.type || "audio/webm";
        let ext = "webm";
        if (mimeType.includes("webm")) {
          ext = "webm";
        } else if (mimeType.includes("mp3")) {
          ext = "mp3";
        }
        const fileName = `voice-${qidNum}-${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: mimeType });
        voiceResponses.push({ questionId: String(qidNum), file });
      });
      if (voiceResponses.length > 0) {
        consultationResponse["voiceResponses"] = voiceResponses;
      }
      return consultationResponse;
    }
    return;
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async getConsultationResponseForStorage(): Promise<any> {
    // Returns a version with base64-encoded blobs for localStorage storage
    const consultationResponse = this.getConsultationResponse();
    if (!consultationResponse) return null;

    // Convert File objects to base64 for storage
    const voiceResponses: Array<{ questionId: string; file: File }> =
      consultationResponse["voiceResponses"] || [];
    if (voiceResponses.length > 0) {
      const base64VoiceResponses = await Promise.all(
        voiceResponses.map(async (vr) => {
          const base64 = await this.blobToBase64(vr.file);
          return {
            questionId: vr.questionId,
            base64Data: base64,
            mimeType: vr.file.type,
            fileName: vr.file.name,
          };
        })
      );
      consultationResponse["voiceResponses"] = base64VoiceResponses;
    }
    return consultationResponse;
  }

  getNextAvailablePriority(
    questionId: number,
    subQuestionId: number | "other"
  ): number {
    const value = this.questionnaireForm.get([questionId]).value;
    const numSubOptionsSelected = Object.entries(value).filter(
      ([key, val]: [string, any]) =>
        key !== `${subQuestionId}` && val.value === true
    ).length;

    return numSubOptionsSelected + 1;
  }

  reassignPrioritiesAfterDeselection(
    questionId: number,
    deselectedSubQuestionId: number | "other"
  ): void {
    const questionFormGroup = this.questionnaireForm.get([questionId]);
    if (!questionFormGroup) return;

    const value = questionFormGroup.value;

    const selectedOptionsWithPriorities: Array<{
      key: string;
      priority: number;
    }> = [];

    Object.entries(value).forEach(([key, val]: [string, any]) => {
      if (
        key !== `${deselectedSubQuestionId}` &&
        val.value === true &&
        val.priority > 0
      ) {
        selectedOptionsWithPriorities.push({
          key: key,
          priority: val.priority,
        });
      }
    });

    selectedOptionsWithPriorities.sort((a, b) => a.priority - b.priority);

    selectedOptionsWithPriorities.forEach((option, index) => {
      const priorityControl = questionFormGroup.get([option.key, "priority"]);
      if (priorityControl) {
        priorityControl.setValue(index + 1);
      }
    });

    this.priorityOptionsCache.delete(questionId);
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
              this.getOtherAnswerControlName(question.id),
              new FormControl(null)
            );
          } else {
            this.questionnaireForm.addControl(
              this.getOtherAnswerControlName(question.id),
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
            const otherName = this.getOtherAnswerControlName(ques.id);
            if (this.questionnaireForm.controls[otherName]) {
              this.questionnaireForm.removeControl(otherName);
            }
          }
        });
      }
    }

    if (question.questionType === "checkbox") {
      if (checkboxValue === true) {
        // Auto set priority when checked for first time
        const priorityControl = this.questionnaireForm.get([
          question.id,
          value.id,
          "priority",
        ]);
        if (
          priorityControl &&
          (!priorityControl.value || priorityControl.value === 0)
        ) {
          const nextPriority = this.getNextAvailablePriority(
            question.id,
            value.id
          );
          priorityControl.setValue(nextPriority);
        }
      } else if (checkboxValue === false) {
        // Reset priority when unchecked and reassign priorities for remaining selected options
        const priorityControl = this.questionnaireForm.get([
          question.id,
          value.id,
          "priority",
        ]);
        if (priorityControl) {
          priorityControl.setValue(0);
        }

        // Reassign priorities for remaining selected options to maintain sequential order
        if (question.hasChoicePriority) {
          this.reassignPrioritiesAfterDeselection(question.id, value.id);
        }
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
    const hasUploads =
      Array.isArray(consultationResponse?.voiceResponses) &&
      consultationResponse.voiceResponses.length > 0;
    if (hasUploads) {
      const mutationDoc = this.currentUser
        ? SubmitResponseQuery
        : SubmitResponseGuestUser;
      this.submitResponseMultipart(consultationResponse, mutationDoc)
        .then((res: any) => {
          const data = res?.data?.consultationResponseCreate;
          this.openThankYouModal.emit(data?.points);
          this.responseSubmitLoading = false;
          this.responseCreated = true;
          // Best-effort cache refresh
          try {
            const variables = { id: this.consultationId };
            const queryDoc = this.currentUser
              ? ConsultationProfileCurrentUser
              : ConsultationProfileUser;
            const store: any = (this.apollo as any).getClient();
            const resp: any = store.readQuery({ query: queryDoc, variables });
            if (data) {
              if (this.currentUser?.id && resp?.consultationProfile) {
                resp.consultationProfile.respondedOn =
                  data.consultation.respondedOn;
              }
              if (resp?.consultationProfile) {
                resp.consultationProfile.sharedResponses =
                  data.consultation.sharedResponses;
                resp.consultationProfile.responseSubmissionMessage =
                  data.consultation.responseSubmissionMessage;
                resp.consultationProfile.satisfactionRatingDistribution =
                  data.consultation.satisfactionRatingDistribution;
              }
              store.writeQuery({ query: queryDoc, variables, data: resp });
            }
          } catch (_e) {
            // If cache not primed, ignore.
          }
          this.consultationService.submitResponseActiveRoundEnabled.next(false);
        })
        .catch((err) => {
          this.responseSubmitLoading = false;
          this.errorService.showErrorModal(err);
        });
    } else {
      this.apollo
        .mutate({
          mutation: this.currentUser
            ? SubmitResponseQuery
            : SubmitResponseGuestUser,
          variables: {
            consultationResponse: consultationResponse,
          },
          update: (store, { data: res }) => {
            const variables = { id: this.consultationId };
            const resp: any = store.readQuery({
              query: this.currentUser
                ? ConsultationProfileCurrentUser
                : ConsultationProfileUser,
              variables,
            });
            if (res) {
              if (this.currentUser?.id) {
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
              query: this.currentUser
                ? ConsultationProfileCurrentUser
                : ConsultationProfileUser,
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
            this.consultationService.submitResponseActiveRoundEnabled.next(
              false
            );
          },
          (err) => {
            this.responseSubmitLoading = false;
            this.errorService.showErrorModal(err);
          }
        );
    }
  }

  private submitResponseMultipart(
    consultationResponse: any,
    mutationDoc: any
  ): Promise<any> {
    const uri = `${environment.api}/graphql`;
    const operations = {
      query: print(mutationDoc),
      variables: {
        consultationResponse,
      },
    };

    // Build files map
    const fileMap: any = {};
    let fileIndex = 0;
    const files: File[] = [];
    const voiceResponses = consultationResponse.voiceResponses || [];
    voiceResponses.forEach((vr: any, idx: number) => {
      if (vr && vr.file instanceof File) {
        fileMap[fileIndex] = [
          `variables.consultationResponse.voiceResponses.${idx}.file`,
        ];
        files.push(vr.file);
        fileIndex++;
      }
    });

    const form = new FormData();
    form.append("operations", JSON.stringify(operations));
    form.append("map", JSON.stringify(fileMap));
    files.forEach((file, i) => {
      form.append(String(i), file, file.name);
    });

    const headers: any = {};
    const token: string = localStorage.getItem("civis-token") || null;
    if (token) headers["Authorization"] = token;

    return fetch(uri, {
      method: "POST",
      headers,
      body: form,
    }).then(async (resp) => {
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Upload failed");
      }
      const json = await resp.json();
      if (json.errors) {
        throw json.errors[0] || json.errors;
      }
      return json;
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
      const activeRound = responseRounds.find((round) => round.active);
      if (!isObjectEmpty(activeRound)) {
        return activeRound.roundNumber;
      }
    }
    return;
  }

  getSubmitButtonTooltip(): string {
    if (
      this.showError &&
      !this.responseFeedback &&
      !this.profileData?.isSatisfactionRatingOptional
    ) {
      return "Please select a Satisfaction Rating to submit the response";
    } else if (this.showError && !this.isFormValidForVisibleQuestions()) {
      return "Please fill all the answers to submit response.";
    } else {
      return "";
    }
  }

  // ===== CONDITIONAL QUESTIONS LOGIC =====

  /**
   * Check if a question should be visible
   */
  isQuestionVisible(question: any): boolean {
    // Non-conditional questions are always visible
    if (!question.isConditionalQuestion) return true;

    // For conditional questions, check if parent has selected value with conditional questions
    const parentQuestion = this.findParentQuestion(question.id);
    if (!parentQuestion) return false;

    return this.shouldShowConditionalQuestion(parentQuestion, question.id);
  }

  /**
   * Find parent question that controls a conditional question
   */
  private findParentQuestion(conditionalQuestionId: number): any {
    return this.questions?.find((question) =>
      question.subQuestions?.some(
        (sq) => sq.conditionalQuestion?.id === conditionalQuestionId
      )
    );
  }

  /**
   * Check if parent question should show conditional questions
   */
  shouldShowConditionalQuestion(
    parentQuestion: any,
    conditionalQuestionId: number
  ): boolean {
    const control = this.questionnaireForm?.get(parentQuestion.id.toString());
    if (!control?.value) return false;

    if (parentQuestion.questionType === "checkbox") {
      // Check if any selected option has the specific conditional question
      const selectedOptions = Object.entries(control.value)
        .filter(([_key, val]: [string, any]) => val?.value === true)
        .map(([optionId]) => optionId);

      return selectedOptions.some((optionId) => {
        const subQuestion = parentQuestion.subQuestions?.find(
          (sq) => sq.id.toString() === optionId
        );
        return subQuestion?.conditionalQuestion?.id === conditionalQuestionId;
      });
    } else if (parentQuestion.questionType === "long_text") {
      const textValue = control.value;
      if (textValue && textValue.trim().length > 0) {
        // For long text, check if any subQuestion has this conditional question
        return parentQuestion.subQuestions?.some(
          (sq) => sq.conditionalQuestion?.id === conditionalQuestionId
        );
      }
      return false;
    } else {
      // For dropdown/radio, check if selected option has this conditional question
      const subQuestion = parentQuestion.subQuestions?.find(
        (sq) => sq.id === control.value
      );
      return subQuestion?.conditionalQuestion?.id === conditionalQuestionId;
    }
  }

  getQuestionDisplayNumber(question: any): number {
    const visibleQuestions =
      this.questions?.filter((q) => this.isQuestionVisible(q)) || [];
    const sortedVisibleQuestions = visibleQuestions.sort(
      (a, b) => a.position - b.position
    );

    const index = sortedVisibleQuestions.findIndex((q) => q.id === question.id);
    return index >= 0 ? index + 1 : 0;
  }

  getOrderedQuestions(): any[] {
    if (!this.questions) return [];
    return this.questions.slice().sort((a, b) => a.position - b.position);
  }

  /**
   * Return only top-level (non-conditional) questions, ordered by position
   */
  getTopLevelQuestions(): any[] {
    if (!this.questions) return [];
    return this.questions
      .filter((q) => !q.isConditionalQuestion)
      .sort((a, b) => a.position - b.position);
  }

  /**
   * Return direct conditional children of a given parent question, preserving
   * the order defined in the parent's subQuestions (no sorting by position).
   */
  getDirectConditionalChildren(parentQuestion: any): any[] {
    if (!this.questions || !parentQuestion?.subQuestions) return [];

    const idToQuestionMap: Record<string, any> = {};
    for (const q of this.questions) {
      idToQuestionMap[q.id?.toString()] = q;
    }

    const orderedChildren: any[] = [];
    parentQuestion.subQuestions.forEach((sq: any) => {
      const childId = sq?.conditionalQuestion?.id;
      if (childId) {
        const child = idToQuestionMap[childId.toString()];
        if (child && child.isConditionalQuestion) {
          orderedChildren.push(child);
        }
      }
    });

    return orderedChildren;
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.questionnaireForm?.controls?.[controlName];
    if (!control?.errors) return null;

    for (const key of Object.keys(control.errors)) {
      if (errorMessages[key]) {
        return errorMessages[key];
      }
    }

    return errorMessages.required;
  }

  getPriorityOptionList(question: any): number[] {
    if (!question?.subQuestions || !Array.isArray(question.subQuestions)) {
      return [1];
    }

    const questionId =
      typeof question.id === "number" ? question.id : parseInt(question.id, 10);
    const numSelectedOptions = this.getNumOptionsSelected(questionId);

    if (numSelectedOptions === 0) {
      return [];
    }

    const cachedOptions = this.priorityOptionsCache.get(questionId);
    if (
      cachedOptions &&
      cachedOptions.numSelectedOptions === numSelectedOptions
    ) {
      return cachedOptions.options;
    }

    const options = Array.from({ length: numSelectedOptions }, (_, i) => i + 1);
    const subQuestionsLength = question.subQuestions.length;
    this.priorityOptionsCache.set(questionId, {
      options,
      numSelectedOptions,
      subQuestionsLength,
    });

    return options;
  }

  getCheckboxHelpText(question: any): string {
    if (question?.selectedOptionsLimit) {
      return `Choose up to ${question.selectedOptionsLimit} options and assign a priority to each.`;
    }

    return "Choose as many as you like";
  }

  getNumOptionsSelected(questionId: number): number {
    const control = this.questionnaireForm.get([questionId]);
    if (!control || !control.value) {
      return 0;
    }

    const value = control.value;
    const numSubOptionsSelected = Object.values(value).filter(
      (val: any) => val && val.value === true
    ).length;

    return numSubOptionsSelected;
  }

  checkSubQuestionSelected(question: any, subQuestion: any): boolean {
    const control = this.questionnaireForm.get([question.id, subQuestion.id]);

    if (!control || !control.value) {
      return false;
    }

    const subQuestionObj = control.value;
    return subQuestionObj.value === true;
  }

  checkRadioOptionSelected(question: any, subQuestion: any): boolean {
    const questionControl = this.questionnaireForm.get([question.id]);
    if (!questionControl) return false;
    return questionControl.value === subQuestion.id;
  }

  checkDropdownOptionDisabled(question: any, subQuestion: any): boolean {
    // Cant disable if no limit set
    if (!question?.selectedOptionsLimit) {
      return null;
    }

    // Already selected options cannot be disabled
    if (this.checkSubQuestionSelected(question, subQuestion)) {
      return null;
    }

    const numSubOptionsSelected = this.getNumOptionsSelected(question.id);

    return numSubOptionsSelected >= question.selectedOptionsLimit ? true : null;
  }

  ngOnDestroy(): void {
    this.abortCurrentRecording();
  }

  // ===== Voice recording helpers (per question) =====
  private abortCurrentRecording(): void {
    if (
      this.currentRecordingQuestionId != null &&
      this.isRecordingByQuestionId[this.currentRecordingQuestionId]
    ) {
      this.isRecordingByQuestionId[this.currentRecordingQuestionId] = false;
      this.audioRecordingService.abortRecording();
      this.currentRecordingQuestionId = null;
    }
  }

  isRecordingFor(questionId: number): boolean {
    return !!this.isRecordingByQuestionId[questionId];
  }

  getRecordedTimeFor(questionId: number): string {
    return this.recordedTimeByQuestionId[questionId] || "00:00";
  }

  getBlobUrlFor(questionId: number): any {
    return this.blobUrlByQuestionId[questionId] || null;
  }

  startRecordingFor(questionId: number): void {
    if (
      this.currentRecordingQuestionId != null &&
      this.currentRecordingQuestionId !== questionId
    ) {
      this.abortCurrentRecording();
    }
    if (this.isRecordingFor(questionId)) return;
    this.currentRecordingQuestionId = questionId;
    this.isRecordingByQuestionId[questionId] = true;
    this.recordedTimeByQuestionId[questionId] = "00:00";
    this.audioRecordingService.startRecording();
  }

  stopRecordingFor(questionId: number): void {
    if (!this.isRecordingFor(questionId)) return;
    if (this.currentRecordingQuestionId !== questionId) return;
    this.audioRecordingService.stopRecording();
  }

  clearRecordedDataFor(questionId: number): void {
    this.blobUrlByQuestionId[questionId] = null;
    this.blobByQuestionId[questionId] = null;
    this.titleByQuestionId[questionId] = null;
    this.startRecordingFor(questionId);
  }

  // ===== STEP-BY-STEP FLOW FOR SPECIFIC CONSULTATION =====

  private checkIsStepByStepFlow(): void {
    this.isStepByStepFlow =
      this.profileData?.questionFlow ===
      ConsultationQuestionnaireComponent.SINGLE_QUESTION;
    if (this.isStepByStepFlow) {
      this.currentQuestionIndex = 0;
    }
  }

  getVisibleQuestionsForStepFlow(): any[] {
    if (!this.questions) return [];
    return this.getTopLevelQuestions();
  }

  getCurrentQuestion(): any {
    const visibleQuestions = this.getVisibleQuestionsForStepFlow();
    return visibleQuestions[this.currentQuestionIndex] || null;
  }

  getTotalQuestionsCount(): number {
    return this.getVisibleQuestionsForStepFlow().length;
  }

  getCurrentQuestionNumber(): number {
    return this.currentQuestionIndex + 1;
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex >= this.getTotalQuestionsCount() - 1;
  }

  isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  nextQuestion(): void {
    if (!this.isLastQuestion()) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (!this.isFirstQuestion()) {
      this.currentQuestionIndex--;
    }
  }

  /**
   * Check if current question is valid before allowing navigation
   */
  isCurrentQuestionValid(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return true;

    let allValid = true;

    // Validate main question
    const control = this.questionnaireForm.get(currentQuestion.id.toString());
    if (control) {
      control.markAsTouched({ onlySelf: true });
      control.updateValueAndValidity({ onlySelf: true });
      if (control.invalid) allValid = false;
    }

    // Check other answer control for main question if applicable
    if (currentQuestion.is_other) {
      const otherControl = this.questionnaireForm.get(
        this.getOtherAnswerControlName(currentQuestion.id)
      );
      if (otherControl) {
        otherControl.markAsTouched({ onlySelf: true });
        otherControl.updateValueAndValidity({ onlySelf: true });
        if (otherControl.invalid) allValid = false;
      }
    }

    // Validate visible conditional questions
    const conditionalChildren =
      this.getDirectConditionalChildren(currentQuestion);
    conditionalChildren.forEach((child) => {
      if (this.shouldShowConditionalQuestion(currentQuestion, child.id)) {
        const childControl = this.questionnaireForm.get(child.id.toString());
        if (childControl) {
          childControl.markAsTouched({ onlySelf: true });
          childControl.updateValueAndValidity({ onlySelf: true });
          if (childControl.invalid) allValid = false;
        }

        if (child.is_other) {
          const childOtherControl = this.questionnaireForm.get(
            this.getOtherAnswerControlName(child.id)
          );
          if (childOtherControl) {
            childOtherControl.markAsTouched({ onlySelf: true });
            childOtherControl.updateValueAndValidity({ onlySelf: true });
            if (childOtherControl.invalid) allValid = false;
          }
        }
      }
    });

    return allValid;
  }

  onNextClick(): void {
    if (this.isCurrentQuestionValid()) {
      const currentQuestion = this.getCurrentQuestion();
      if (currentQuestion) {
        this.handleConditionalQuestionsForStepFlow(currentQuestion);
      }
      this.nextQuestion();
      this.showError = false;
      this.scrollToTop();
      this.cdr.detectChanges();
    } else {
      this.showError = true;
    }
  }

  /**
   * Ensure a conditional question has its form control
   */
  private ensureConditionalQuestionControl(child: any): void {
    if (!this.questionnaireForm.get(child.id.toString())) {
      if (child.questionType === "checkbox") {
        const checkboxControl = this.makeCheckboxQuestionOptions(child);
        this.questionnaireForm.addControl(child.id.toString(), checkboxControl);
      } else {
        const control = child.isOptional
          ? new FormControl(null)
          : new FormControl(null, Validators.required);
        this.questionnaireForm.addControl(child.id.toString(), control);
      }

      if (child.is_other) {
        const otherControlName = this.getOtherAnswerControlName(child.id);
        if (!this.questionnaireForm.get(otherControlName)) {
          const otherControl = child.isOptional
            ? new FormControl(null)
            : new FormControl(null, Validators.required);
          this.questionnaireForm.addControl(otherControlName, otherControl);
        }
      }
    }
  }

  /**
   * Handle conditional questions for step-by-step flow
   */
  private handleConditionalQuestionsForStepFlow(question: any): void {
    // Add/remove form controls for conditional questions based on current answer
    const conditionalChildren = this.getDirectConditionalChildren(question);

    conditionalChildren.forEach((child) => {
      const shouldShow = this.shouldShowConditionalQuestion(question, child.id);
      const childControl = this.questionnaireForm.get(child.id.toString());

      if (shouldShow && !childControl) {
        this.ensureConditionalQuestionControl(child);
      } else if (!shouldShow && childControl) {
        this.questionnaireForm.removeControl(child.id.toString());
        const otherControlName = this.getOtherAnswerControlName(child.id);
        if (this.questionnaireForm.get(otherControlName)) {
          this.questionnaireForm.removeControl(otherControlName);
        }
      }
    });
  }

  onPreviousClick(): void {
    if (!this.isFirstQuestion()) {
      this.currentQuestionIndex--;
      this.showError = false;

      // Template renders ALL conditional children (even hidden), so ensure all have controls
      const currentQuestion = this.getCurrentQuestion();
      if (currentQuestion) {
        const conditionalChildren =
          this.getDirectConditionalChildren(currentQuestion);
        conditionalChildren.forEach((child) =>
          this.ensureConditionalQuestionControl(child)
        );
      }

      this.cdr.detectChanges();
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    if (this.questionnaireContainer?.nativeElement) {
      this.questionnaireContainer.nativeElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
}

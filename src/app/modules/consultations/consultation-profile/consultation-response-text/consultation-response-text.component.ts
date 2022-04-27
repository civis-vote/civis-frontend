import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { filter, map } from 'rxjs/operators';
import {
  isObjectEmpty,
  checkPropertiesPresence,
  scrollToFirstError,
} from 'src/app/shared/functions/modular.functions';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import {
  ConsultationProfileCurrentUser,
  SubmitResponseQuery,
} from '../consultation-profile.graphql';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-consultation-response-text',
  templateUrl: './consultation-response-text.component.html',
  styleUrls: ['./consultation-response-text.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConsultationResponseTextComponent
  implements OnInit, AfterViewChecked {
  @Input() profileData;
  @ViewChild('responseIndex', { read: ElementRef, static: false })
  responseIndex: ElementRef<any>;
  @ViewChild('responseContainer', { read: ElementRef, static: false })
  responseContainer: ElementRef<any>;
  @Output() openThankYouModal: EventEmitter<any> = new EventEmitter();

  ckeConfig = {
    removePlugins: 'elementspath',
    resize_enabled: false,
  };
  currentUser: any;
  consultationId: any;
  isMobile = window.innerWidth <= 768;
  responseText: any;
  showPublicResponseOption: boolean;
  showAutoSaved: boolean;
  templateText: any;
  templateId: any;
  usingTemplate: boolean;
  responseVisibility: any;
  customStyleAdded: any;
  responseFeedback: any;
  showConfirmEmailModal: boolean;
  showError: boolean;
  responseSubmitLoading: boolean;
  scrollToError: any;
  authModal = false;

  constructor(
    private userService: UserService,
    private consultationService: ConsultationsService,
    private router: Router,
    private el: ElementRef,
    private apollo: Apollo,
    private sanitizer: DomSanitizer,
    private errorService: ErrorService
  ) {
    this.consultationService.consultationId$
      .pipe(filter((i) => i !== null))
      .subscribe((consulationId: any) => {
        this.consultationId = consulationId;
      });
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.subscribeUseTheResponseText();
    this.getResponseText();
    this.createResponse();
  }

  ngAfterViewChecked() {
    this.editIframe();
    if (this.scrollToError) {
      scrollToFirstError('.error-msg', this.el.nativeElement);
      this.scrollToError = false;
    }
  }

  createResponse() {
    this.consultationService.submitResponseText.subscribe((status) => {
      if (status) {
        this.submitAnswer();
        if (this.responseIndex) {
          window.scrollTo({
            top: this.responseIndex.nativeElement.offsetTop - 80,
            behavior: 'smooth',
          });
        }

      }
    });
  }

  subscribeProfileData() {
    this.consultationService.consultationProfileData.subscribe((data) => {
      if (data) {
        this.profileData = data;
      }
    });
  }

  getConsultationResponse() {
    const consultationResponse = {
      consultationId: this.consultationId,
      visibility: this.responseVisibility ? 'shared' : 'anonymous',
      responseText: this.responseText,
      satisfactionRating: this.responseFeedback,
    };
    if (checkPropertiesPresence(consultationResponse)) {
      consultationResponse['templateId'] = this.templateId
        ? this.templateId
        : null;
      return consultationResponse;
    }
    return;
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

  getResponseText() {
    let draftObj: any = localStorage.getItem('responseDraft');
    if (draftObj && !isObjectEmpty(draftObj)) {
      draftObj = JSON.parse(draftObj);
      let currentUser: any;
      if (draftObj.users && draftObj.users.length > 0) {
        currentUser = draftObj.users.find(
          (user) =>
            user.id === (this.currentUser ? this.currentUser.id : 'guest')
        );
      }
      if (currentUser) {
        const consultation = currentUser.consultations.find(
          (item) => item.id === this.consultationId
        );
        if (consultation) {
          this.responseText = consultation.responseText;
          if (consultation.templatesText) {
            this.showPublicResponseOption = false;
          }
        }
      }
    }
  }

  editIframe() {
    const editorElement = document.getElementById('editor-container');
    if (editorElement) {
      const iFrameElements = editorElement.getElementsByTagName('iframe');
      if (iFrameElements.length) {
       const doc = iFrameElements[0].contentDocument;
       const checkElementExist = setInterval(() => {
         if (!this.customStyleAdded) {
          if (doc.body) {
            this.customStyleAdded = true;
            doc.body.setAttribute('style', 'margin: 0; font-size: 16px');
          }
         }
       }, 100);
       if (this.customStyleAdded) {
         clearInterval(checkElementExist);
       }
      }
    }
  }

  onResponseTextChange(value) {
    if (!value) {
      return;
    } else {
      if (this.usingTemplate) {
        this.responseText = this.templateText = value;
        this.usingTemplate = this.showPublicResponseOption = false;
        this.autoSave(value);
      }
      if (this.templateText && value === this.templateText) {
        this.showPublicResponseOption = false;
      } else {
        this.showPublicResponseOption = true;
      }
      return;
    }
  }

  autoSave(text) {
    if (text) {
      this.showAutoSaved = true;
      let draftObj: any = localStorage.getItem('responseDraft');
      if (!draftObj || isObjectEmpty(draftObj)) {
        draftObj = {};
        draftObj['users'] = [
          {
            id: this.currentUser ? this.currentUser.id : 'guest',
            consultations: [
              {
                id: this.consultationId,
                responseText: text,
                templatesText: this.showPublicResponseOption ? false : true,
              },
            ],
          },
        ];
      } else {
        draftObj = JSON.parse(draftObj);
        let currentUser: any;
        if (draftObj.users) {
          currentUser = draftObj.users.find(
            (user) =>
              user.id === (this.currentUser ? this.currentUser.id : 'guest')
          );
        }
        if (currentUser) {
          const consultation = currentUser.consultations.find(
            (item) => item.id === this.consultationId
          );
          if (consultation) {
            currentUser.consultations.forEach((item) => {
              if (+item.id === +this.consultationId) {
                item.responseText = text;
                item['templatesText'] = this.showPublicResponseOption
                  ? false
                  : true;
              }
            });
          } else {
            currentUser.consultations.push({
              id: this.consultationId,
              responseText: text,
              templatesText: this.showPublicResponseOption ? false : true,
            });
          }
          draftObj.users.forEach((item) => {
            if (
              item.id === (this.currentUser ? this.currentUser.id : 'guest')
            ) {
              item = currentUser;
            }
          });
        } else {
          if (draftObj.users) {
            draftObj.users.push({
              id: this.currentUser ? this.currentUser.id : 'guest',
              consultations: [
                {
                  id: this.consultationId,
                  responseText: text,
                  templatesText: this.showPublicResponseOption ? false : true,
                },
              ],
            });
          }
        }
      }
      localStorage.setItem('responseDraft', JSON.stringify(draftObj || ''));
      setTimeout(() => {
        this.showAutoSaved = false;
      }, 1250);
    }
  }

  subscribeUseTheResponseText() {
    this.consultationService.useThisResponseText.subscribe((obj: any) => {
      if (obj && !isObjectEmpty(obj)) {
        this.usingTemplate = true;
        const { responseText, templateId } = obj;
        this.responseText = this.templateText = responseText;
        this.templateId = templateId;
        this.customStyleAdded = false;
        this.editIframe();
        window.scrollTo({
          top: this.responseIndex.nativeElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    });
  }

  scrollToResponses() {
    this.consultationService.scrollToPublicResponse.next(true);
  }

  validCurrentUser() {
    if (this.currentUser && !this.currentUser.confirmedAt) {
      this.showConfirmEmailModal = true;
      return false;
    }
    return true;
  }

  urlToText(text: string): string {
    if (text) {
      const str: any =  text.replace(/<\/?[^>]+(>|$)/g, '');
      return str.replaceAll('&nbsp;', '').trim();
    } else {
      return '';
    }
  }

  submitAnswer() {
    if (this.responseSubmitLoading) {
      return;
    }
    let responseTextString: any = this.sanitizer.bypassSecurityTrustHtml(
      this.responseText
    );
    responseTextString =
      responseTextString.changingThisBreaksApplicationSecurity;
    if (this.urlToText(responseTextString).length <= 0) {
      this.responseText = null;
      this.showError = true;
      return;
    }
    if (this.responseText && this.responseFeedback) {
      const consultationResponse = this.getConsultationResponse();
      if (!isObjectEmpty(consultationResponse)) {
        if (this.currentUser) {
          this.submitResponse(consultationResponse);
          this.showError = false;
        } else {
          this.authModal = true;
          localStorage.setItem(
            'consultationResponse',
            JSON.stringify(consultationResponse)
          );
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

  submitResponse(consultationResponse) {
    this.responseSubmitLoading = true;
    this.apollo
      .mutate({
        mutation: SubmitResponseQuery,
        variables: {
          consultationResponse: consultationResponse,
        },
        update: (store, { data: res }) => {
          const variables = { id: this.consultationId };
          const resp: any = store.readQuery({
            query: ConsultationProfileCurrentUser,
            variables,
          });
          if (res) {
            resp.consultationProfile.respondedOn =
              res.consultationResponseCreate.consultation.respondedOn;
            resp.consultationProfile.sharedResponses =
              res.consultationResponseCreate.consultation.sharedResponses;
            resp.consultationProfile.responseSubmissionMessage =
              res.consultationResponseCreate.consultation.responseSubmissionMessage;
            resp.consultationProfile.satisfactionRatingDistribution =
              res.consultationResponseCreate.consultation.satisfactionRatingDistribution;
          }
          store.writeQuery({
            query: ConsultationProfileCurrentUser,
            variables,
            data: resp,
          });
        },
      })
      .pipe(map((res: any) => res.data.consultationResponseCreate))
      .subscribe(
        (res) => {
          this.openThankYouModal.emit(res.points);
        },
        (err) => {
          this.responseSubmitLoading = false;
          this.errorService.showErrorModal(err);
        }
      );
  }
}

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
import { ConsultationProfileCurrentUser, SubmitResponseQuery, CreateUserCountRecord, UpdateUserCountRecord,UserCountUser } from '../consultation-profile.graphql';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { DomSanitizer } from '@angular/platform-browser';
import { profanityList } from 'src/app/graphql/queries.graphql';

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
  isConfirmModal = false;
  isResponseShort = false;
  confirmMessage = {
    msg: 'Do you want to reconsider your response? We detected some potentially harmful language, and to keep Civis safe and open we recommend revising responses that were detected as potentially harmful.',
    title: ''
  };
  responseMessage = {
      msg: 'Are you sure?',
      title: ''
    };
  nudgeMessageDisplayed = false;
  nudgeShortMessageDisplayed = false;
  profanityCount: any;
  shortResponseCount: any;
  userData:any;
  profanity_count_changed: boolean=false;
  short_response_count_changed: boolean=false;
  isUserResponseProfane: boolean=false;
  responseStatus = 0;
  profaneWords = [];

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

      this.apollo.watchQuery({
        query: profanityList,
        fetchPolicy: 'network-only'
      })
      .valueChanges
      .pipe(
        map((res: any) => res.data)
      )
      .subscribe((response: any) => {
        this.profaneWords = response.profanityList.data.map((profane) => profane.profaneWord);
      }, (err: any) => {
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
      responseStatus: this.responseStatus,
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
          // this query fetches the data for the user 
          this.apollo.watchQuery({
            query: UserCountUser,
            variables: {userId:this.currentUser.id},
            fetchPolicy:'no-cache'
          })
          .valueChanges
          .pipe (
            map((res: any) => res.data.userCountUser)
          )
          .subscribe(data => {
            // here this check ensures that this query doesn't runs again when we update the record
            if(!this.profanity_count_changed && !this.short_response_count_changed){
              this.userData=data;
              this.checkAndUpdateProfanityCount();
            }
          }, err => {
            const e = new Error(err);
            this.errorService.showErrorModal(err);
          });
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

  updateResponseCount(){
    if (this.userData!==null){
      this.shortResponseCount=this.userData.shortResponseCount;
    }
    else{
      this.shortResponseCount=0;
      if((this.responseText.length - 8) <= 50){
        this.shortResponseCount+=1;
        this.apollo.mutate({
          mutation: UpdateUserCountRecord,
          variables:{
            userCount:{
              userId: this.currentUser.id,
              profanityCount: 0,
              shortResponseCount: this.shortResponseCount
            }
          },
        })
        .subscribe((data) => {
           this.invokeSubmitResponse();
        }, err => {
          this.errorService.showErrorModal(err);
        });
        this.short_response_count_changed=true;
        return;
      }
    }

    if((this.responseText.length - 8) <= 50) {
      if (!this.nudgeShortMessageDisplayed && this.shortResponseCount > 2) {
        this.isResponseShort = true;
        this.nudgeShortMessageDisplayed=true;
        return;
      }
      this.shortResponseCount+=1;
    } else {
      this.shortResponseCount=0;
    }

    this.apollo.mutate({
      mutation: UpdateUserCountRecord,
      variables:{
        userCount:{
          userId: this.currentUser.id,
          profanityCount: this.userData.profanityCount,
          shortResponseCount: this.shortResponseCount
        }
      },
    })
    .subscribe((data) => {
      this.invokeSubmitResponse();
    }, err => {
      this.errorService.showErrorModal(err);
    });
    this.short_response_count_changed=true;
    return;
  }

  checkAndUpdateProfanityCount(){
    var Filter = require('bad-words'),
    filter = new Filter({list: this.profaneWords});
    this.isUserResponseProfane=filter.isProfane(this.responseText);
    
    //if we have no record for the user then we will create one
    //if response is profane then we will if display the nudge first, and then only proceed further
    //if response is not profane, then only we will check for the short response count, otherwise we will submit the response
    if (this.userData!==null){
      this.profanityCount=this.userData.profanityCount;
    }
    else{
      this.profanityCount=0;
      if(this.isUserResponseProfane){
        if (!this.nudgeMessageDisplayed) {
          this.isConfirmModal = true;
          this.nudgeMessageDisplayed=true;
          return;
        }
        this.profanityCount+=1;
        this.responseStatus=+1;
      }
      this.apollo.mutate({
        mutation: CreateUserCountRecord,
        variables:{
          userCount:{
            userId: this.currentUser.id,
            profanityCount: this.profanityCount,
            shortResponseCount: 0
          }
        },
      })
      .subscribe((data) => {
        if(this.profanityCount == 0 ){
          this.updateResponseCount();
        } else {
          this.invokeSubmitResponse();
        }
      }, err => {
        this.errorService.showErrorModal(err);
      });
      this.profanity_count_changed=true;
      return;
    }

    //if we have a record for the user in our table
    // if profane then display nudge, if the profanity count > 3, then submit the response with the second nudge
    // if not profane then proceed with the short response count check
    if(this.isUserResponseProfane){
      if (!this.nudgeMessageDisplayed) {
        this.isConfirmModal = true;
        this.nudgeMessageDisplayed=true;
        return;
      }
      this.profanityCount+=1;
      this.responseStatus=+1;
      if(this.profanityCount>=3){
        this.confirmMessage.msg = 'We detected that your response may contain harmful language. This response will be moderated and sent to the Government at our moderator\'s discretion.'
        this.isConfirmModal = true;
      }
    }
    else{
      this.updateResponseCount();
      return;
    }

    //update the existing record to reflect new profanity count
    this.apollo.mutate({
      mutation: UpdateUserCountRecord,
      variables:{
        userCount:{
          userId: this.currentUser.id,
          profanityCount: this.profanityCount,
          shortResponseCount: this.userData.shortResponseCount
        }
       },
    })
    .subscribe((data) => {
      this.invokeSubmitResponse();
    }, err => {
      this.errorService.showErrorModal(err);
    });
    this.profanity_count_changed=true;
  }

  confirmed(event) {
    this.isConfirmModal = false;
    this.isResponseShort = false;
  }

  invokeSubmitResponse(){
    const consultationResponse = this.getConsultationResponse();
    this.submitResponse(consultationResponse);
    this.showError = false;
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

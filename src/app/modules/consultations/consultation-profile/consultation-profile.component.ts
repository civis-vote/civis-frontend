import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { ConsultationProfile, SubmitResponseQuery, ConsultationProfileCurrentUser, VoteCreateQuery } from './consultation-profile.graphql';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from 'src/app/shared/services/user.service';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';



@Component({
  selector: 'app-consultation-profile',
  templateUrl: './consultation-profile.component.html',
  styleUrls: ['./consultation-profile.component.scss']
})

export class ConsultationProfileComponent implements OnInit, OnDestroy {

  @ViewChild('feedbackModal') feedbackModal: ModalDirective;
  @ViewChild('responseIndex', { read: ElementRef }) panel: ElementRef<any>;

  private subscription: Subscription;
  profileData: any;
  responseList: any;
  consultationId: number;
  satisfactionRatingDistribution: any;
  responseFeedback: any;
  responseText = '';
  responseVisibility = true;
  step: number;
  currentUser: any;
  responseType = '';
  templateId = null;

  constructor (
    private activatedRoute: ActivatedRoute,
    private apollo: Apollo,
    private userService: UserService,
    private consultationsService: ConsultationsService,
    private router: Router,
    private errorService: ErrorService
  ) {
      this.subscription = this.activatedRoute.params.subscribe((param: any) => {
        this.consultationId = +param['id'];
        this.consultationsService.consultationId$.next(this.consultationId);
      });
  }

  ngOnInit() {
    this.getCurrentUser();
    console.log('ac route: ', this.activatedRoute.url);
  }

  getConsultationProfile() {
    const query = ConsultationProfileCurrentUser;
    this.apollo.watchQuery({
      query: this.currentUser ? ConsultationProfileCurrentUser : ConsultationProfile,
      variables: {id: this.consultationId}
    })
    .valueChanges
    .pipe (
      map((res: any) => res.data.consultationProfile)
    )
    .subscribe((data: any) => {
        this.profileData = data;
        this.satisfactionRatingDistribution = data.satisfactionRatingDistribution;
        this.responseList = data.sharedResponses.edges;
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }

  // openFeedbackModal(type, response?) {
  //   this.responseType = type;
  //   if (this.responseType === 'create') {
  //     if (this.responseText) {
  //       this.checkUserPresent();
  //     }
  //   } else {
  //     if (!this.profileData.respondedOn) {
  //       this.responseText = response.responseText;
  //       this.templateId = response.id;
  //       this.checkUserPresent();
  //     }
  //   }
  // }

  openFeedbackModal() {
      if (this.responseText) {
        this.checkUserPresent();
      }
  }

  checkUserPresent() {
    if (this.currentUser) {
      this.step = 2;
      this.feedbackModal.show();
    } else {
      this.router.navigateByUrl('/auth');
      this.consultationsService.enableSubmitResponse.next(false);
    }
  }

  createResponse() {
    const consultationResponse =  {
      consultationId: this.consultationId,
      responseText : this.responseText,
      satisfactionRating : this.responseFeedback,
      visibility: this.responseVisibility ? 'shared' : 'anonymous',
    };
    if (this.checkProperties(consultationResponse)) {
      consultationResponse['templateId'] = this.templateId;
      this.submitResponse(consultationResponse);
    }
  }

  submitResponse(consultationResponse) {
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
        }
        store.writeQuery({query: ConsultationProfileCurrentUser, variables, data: res});
      }
    })
    .pipe (
      map((res: any) => res.data.consultationResponseCreate)
    )
    .subscribe((response) => {
      this.feedbackModal.hide();
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }

  checkProperties(obj) {
    for (const key in obj) {
      if (obj[key] === null ||  obj[key] === '' || obj[key] === undefined) {
        return false;
      }
    }
    return true;
}

  choose(value) {
    if (!this.responseFeedback) {
      this.responseFeedback = value;
    }
  }

  enableSubmitResponse(value) {
    if (!value) {
      this.consultationsService.enableSubmitResponse.next(false);
      return;
    } else {
      if (value.length === 1) {
        this.consultationsService.enableSubmitResponse.next(true);
        return;
      }
    }
  }

  getCurrentUser() {
    this.userService.userLoaded$
    .subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
        if (this.consultationId) {
          this.getConsultationProfile();
        }
      } else {
        this.currentUser = null;
        if (this.consultationId) {
          this.getConsultationProfile();
        }
      }
    });
  }

  getPercentageValue(rating, selectedKey) {
    let total = 0;
    for (const key in rating) {
      if (rating[key]) {
        total += rating[key];
      }
    }
    const selectedPercentage = (rating[selectedKey] / total) * 100;
    return selectedPercentage;
  }


  vote(direction, response) {
    if (!response.votedAs && this.currentUser) {
        const vote = {
          consultationResponseVote: {
            consultationResponseId: response.id,
            voteDirection: direction
          }
        };
        this.apollo.mutate({
          mutation: VoteCreateQuery,
          variables: vote,
          update: (store, {data: res}) => {
            const variables = {id: this.consultationId};
            const resp: any = store.readQuery({query: ConsultationProfileCurrentUser, variables});
            if (res) {
              for (const value of resp['consultationProfile'].sharedResponses.edges) {
                if (value.node.id ===  response['id']) {
                  if (value.node[res.voteCreate.voteDirection + 'VoteCount']) {
                    value.node[res.voteCreate.voteDirection + 'VoteCount'] += 1;
                  } else {
                    value.node[res.voteCreate.voteDirection + 'VoteCount'] = 1;
                  }
                  value.node.votedAs = res.voteCreate;
                  break;
                }
              }
            }
            store.writeQuery({query: ConsultationProfileCurrentUser, variables, data: resp});
          }
        })
        .subscribe((data) => {
          console.log(data);
        }, err => {
          this.errorService.showErrorModal(err);
        });
    }

  }

  // useThisResponse() {
  //     const consultationResponse = {
  //       consultationId: this.consultationId,
  //       responseText : this.responseText,
  //       satisfactionRating : this.responseFeedback,
  //       visibility: 'shared',
  //       templateId : this.templateId
  //     };
  //     if (this.checkProperties(consultationResponse)) {
  //       this.submitResponse(consultationResponse);
  //     }
  // }

  useThisResponse(response) {
    if (response) {
      this.responseText = response.responseText;
      this.templateId = response.id;
      window.scrollTo({
        top: this.panel.nativeElement.offsetTop,
        behavior: 'smooth',
      });
      if (this.responseText) {
        this.consultationsService.enableSubmitResponse.next(true);
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}


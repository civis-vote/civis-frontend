import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { UserService } from 'src/app/shared/services/user.service';
import { ConsultationProfileCurrentUser, ConsultationProfile } from '../consultation-profile.graphql';
import { Apollo } from 'apollo-angular';
import { map, filter } from 'rxjs/operators';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';

@Component({
  selector: 'app-read-respond',
  templateUrl: './read-respond.component.html',
  styleUrls: ['./read-respond.component.scss']
})
export class ReadRespondComponent implements OnInit {

  currentUser: any;
  consultationId: any;
  profileData: any;
  satisfactionRatingDistribution: any;
  responseList: any;

  constructor(
    private userService: UserService,
    private apollo: Apollo,
    private errorService: ErrorService,
    private consultationService: ConsultationsService,
  ) {
    this.consultationService.consultationId$
    .pipe(
      filter(i => i !== null)
    )
    .subscribe((consulationId: any) => {
      this.consultationId = consulationId;
    });
  }

  ngOnInit() {
    this.getCurrentUser();
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

  showCreateResponse() {
    if ((this.checkExpired(this.profileData ? this.profileData.responseDeadline : null) === 'Expired')
        || !this.currentUser || (this.profileData && this.profileData.respondedOn)) {
        return false;
    }
    return true;
  }

  checkExpired(deadline) {
    if (deadline) {
      const today = moment();
      const lastDate = moment(deadline);
      const difference = lastDate.diff(today, 'days');
      if (difference <= 0) {
        return 'Expired';
      } else {
        return `Active`;
      }
    }
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

}

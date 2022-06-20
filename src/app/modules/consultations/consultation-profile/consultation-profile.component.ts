import { Component, OnInit,  OnDestroy } from '@angular/core';
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
import { CookieService } from 'ngx-cookie';



@Component({
  selector: 'app-consultation-profile',
  templateUrl: './consultation-profile.component.html',
  styleUrls: ['./consultation-profile.component.scss']
})

export class ConsultationProfileComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  profileData: any;
  consultationId: number;
  currentUser: any;

  constructor (
    private activatedRoute: ActivatedRoute,
    private apollo: Apollo,
    private userService: UserService,
    private consultationsService: ConsultationsService,
    private router: Router,
    private errorService: ErrorService,
    private cookieService: CookieService
  ) {
      this.subscription = this.activatedRoute.params.subscribe((param: any) => {
        this.consultationId = +param['id'];
        this.consultationsService.consultationId$.next(this.consultationId);
      });
  }

  ngOnInit() {
    this.getCurrentUser();
    this.cookieService.put('loginCallbackUrl', this.router.url === '/' ? '' : this.router.url);
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
      this.updateConsultationStatus();
    }, err => {
      const e = new Error(err);
        if (e.message.includes('Invalid Access Token')) {
        this.cookieService.put('loginCallbackUrl', this.router.url === '/' ? '' : this.router.url);
        this.router.navigate(['/auth-private']);
      } else {
        this.errorService.showErrorModal(err);
      }
    });
  }

  updateConsultationStatus() {
    if ((this.consultationsService.checkClosed(this.profileData ? this.profileData.responseDeadline : null) === 'Closed')) {
      this.consultationsService.consultationStatus.next('closed');
      return;
    }
    this.consultationsService.consultationStatus.next('active');
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


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}


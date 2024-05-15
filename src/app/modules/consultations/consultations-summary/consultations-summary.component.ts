import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { ConsultationProfileQuery } from './consultations-summary.graphql';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { CookieService } from 'ngx-cookie';
import { isObjectEmpty } from 'src/app/shared/functions/modular.functions';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';


@Component({
  selector: 'app-consultations-summary',
  templateUrl: './consultations-summary.component.html',
  styleUrls: ['./consultations-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConsultationsSummaryComponent implements OnInit {

  consultationId: number;
  responseToken: any;
  profileData: any;
  responseList: any;
  publicResponses: any;
  annonymousResponses: any;
  summaryData: any;
  responseQuestions: any;
  currentLanguage: any;
  satisfactionRatingDistribution: any;
  useSummaryHindi: boolean;
  activeRoundNumber: any;
  responseRounds: any;
  publicResponsesLength: any;
  annonymousResponsesLength: any;
  roundNumberExist: any;

  constructor(private activatedRoute: ActivatedRoute,
              private apollo: Apollo,
              private errorService: ErrorService,
              private _cookieService: CookieService,
              private consultationService: ConsultationsService,
              ) {
    this.activatedRoute.params.subscribe((param: any) => {
      this.consultationId = +param['id'];
    });
    this.activatedRoute.queryParams
    .subscribe((queryParams: any) => {
      if (queryParams) {
        this.responseToken = queryParams.response_token;
      }
    });
    this.getConsultationProfile();
   }

  ngOnInit() {

  }

  getProfileSummary() {
    this.currentLanguage = this._cookieService.get('civisLang');
    if (this.currentLanguage === 'hi') {
      const summaryHindi = this.profileData.hindiSummary;
      if (summaryHindi) {
        this.useSummaryHindi = true;
      } else {
        this.useSummaryHindi = false;
      }
    } else {
      this.useSummaryHindi = false;
    }
  }

  getConsultationProfile() {
    if (this.consultationId && this.responseToken) {
      this.apollo.query({
        query: ConsultationProfileQuery,
        variables: {id: this.consultationId, responseToken: this.responseToken}
      })
      .pipe (
        map((res: any) => res.data.consultationProfile)
      )
      .subscribe((data: any) => {
          this.profileData = data;
          this.activeRoundNumber = this.getActiveRound(data);
          this.responseRounds = this.profileData.responseRounds;
          this.satisfactionRatingDistribution = data.satisfactionRatingDistribution;
          this.getProfileSummary();
          this.responseList = data.responses.edges;
          this.roundNumberExist = this.responseList.filter((response) => response.node.roundNumber).length;
          this.splitResponses(this.responseList);
      }, err => {
        const e = new Error(err);
      if (!e.message.includes('Invalid Access Token')) {
        this.errorService.showErrorModal(err);
      }
      });
    }
  }

  splitResponses(responsesList) {
    if (responsesList.length) {
      this.annonymousResponses = responsesList.filter(response => !response.node.user);
      this.publicResponses = responsesList.filter(response => response.node.user);
      this.publicResponsesLength = this.publicResponses.filter((response) => response.node.roundNumber === this.activeRoundNumber).length;
      this.annonymousResponsesLength =
      this.annonymousResponses.filter((response) => response.node.roundNumber === this.activeRoundNumber).length;
      this.summaryData = {
        publicResponseCount : this.publicResponses.length,
        title: 'RESPONSES TO'
      };
    }
  }

  getActiveRound(profileData) {
    if (profileData && profileData.responseRounds) {
      const responseRounds = profileData.responseRounds;
      if (responseRounds && responseRounds.length) {
        const activeRound  = responseRounds.find((round) => round.active);
        if (!isObjectEmpty(activeRound)) {
          return activeRound.roundNumber;
        }
      }
    }
    return;
  }

  setActiveRound(roundNumber) {
    this.activeRoundNumber = roundNumber;
    this.publicResponsesLength = this.publicResponses.filter((response) => response.node.roundNumber === roundNumber).length;
    this.annonymousResponsesLength = this.annonymousResponses.filter((response) => response.node.roundNumber === roundNumber).length;
  }

}

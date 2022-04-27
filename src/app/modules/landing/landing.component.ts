import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { slideInRight } from '../../shared/animations/slide';
import { fadeIn } from '../../shared/animations/fade';
import { ConsultationList } from '../consultations/consultation-list/consultation-list.graphql';
import { ConsultationResponseList, ImpactStats, LeaderListQuery } from './landing.graphql'; 
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [slideInRight, fadeIn],
  encapsulation: ViewEncapsulation.None
})

export class LandingComponent implements OnInit {
  coverCardData = [];
  latestResponse: any
  current_card_index = 0;
  current_response_index = 0;
  currentReponseData: any;
  activeTab = 'submit-response';
  impactStats: any;
  citizenLeaders: any;
  selectedUser: any;
  showLeaderProfileModal: boolean;
  loadingCard = false;

constructor( private apollo: Apollo, private errorService: ErrorService) { }

  ngOnInit() {
    this.getConsultationCard('published', true);
    this.getLatestResponse();
    this.rotateFeature();
    this.getImpactStats();
    this.getCiitizenLeaders();
  }

  getConsultationCard(status, featuredFilter) {
    this.loadingCard = true;
    const variables = {
      perPage: null,
      page: null,
      statusFilter: status,
      sort: 'response_deadline',
      sortDirection: status === 'published' ? 'asc' : 'desc',
      featuredFilter: featuredFilter,
    };
    this.apollo.query({
      query: ConsultationList,
      variables: variables
    })
    .pipe (
      map((res: any) => res.data.consultationList.data)
    )
    .subscribe((item: any) => {
      this.loadingCard = false;
      if (status === 'published' && featuredFilter) {
        this.coverCardData = this.coverCardData.concat(item);
        if (this.coverCardData && this.coverCardData.length >= 3) {
          this.sort(this.coverCardData.slice(0, 3));
          return;
        } else {
          this.getConsultationCard('published', false);
          return;
        }
      }

      if (status === 'published'  && !featuredFilter) {
        this.coverCardData = this.removeDuplicates(item);
        if (this.coverCardData && this.coverCardData.length >= 3) {
          this.sort(this.coverCardData.slice(0, 3));
          return;
        } else {
          this.getConsultationCard('expired', true);
          return;
        }
      }

      if (status === 'expired' && featuredFilter) {
        this.coverCardData = this.removeDuplicates(item);
        if (this.coverCardData && this.coverCardData.length >= 3) {
          this.sort(this.coverCardData.slice(0, 3));
          return;
        } else {
          this.getConsultationCard('expired', false);
          return;
        }
      }

      if (status === 'expired'  && !featuredFilter) {
        this.coverCardData = this.removeDuplicates(item);
        this.sort(this.coverCardData.slice(0, 3));
      }
    }, err => {
      this.loadingCard = false;
      this.errorService.showErrorModal(err);
    });
  }

  sort(data) {
    this.coverCardData = data.sort((a, b) => {
      const x: any = new Date(a.responseDeadline);
      const y: any = new Date(b.responseDeadline);
      return x - y;
    });
  }

  removeDuplicates(data) {
    if (this.coverCardData.length < 3) {
      const cardDataKeys = {};
      this.coverCardData.map(item => {
        cardDataKeys[item.id] = item.id;
      });
      data.map(item => {
        if (!cardDataKeys.hasOwnProperty(item.id) && this.coverCardData.length < 3) {
          this.coverCardData.push(item);
        }
      });
    }
    return this.coverCardData;
  }

  getLatestResponse() {
    this.apollo.query({
      query: ConsultationResponseList,
      variables: {sort: 'created_at', sortDirection: 'desc'}
    })
    .pipe (
      map((res: any) => res.data.consultationResponseList)
    )
    .subscribe((response: any) => {
      this.latestResponse = response.data;
      if (this.latestResponse &&  this.latestResponse.length > 3) {
        this.latestResponse = this.latestResponse.slice(0, 3);
      }
      this.currentReponseData = this.latestResponse[this.current_response_index];
    }, err => {
        this.errorService.showErrorModal(err);
    });
  }

  getImpactStats() {
    this.apollo.query({query: ImpactStats})
    .subscribe((stats: any) => {
      this.impactStats = stats.data.impactStats;
    });
  }

  openUserProfile(data) {
    this.selectedUser = data.id;
    this.showLeaderProfileModal = true;
  }

  closeModal(event) {
    if (event) {
      this.showLeaderProfileModal = false;
    }
  }

  getCiitizenLeaders() {
    this.apollo.query({
      query: LeaderListQuery,
      variables: {
        roleFilter: ['citizen', 'moderator'],
        sort: 'points',
        sortDirection: 'desc'
      }
    })
    .pipe (
      map((res: any) => res.data.userList.data)
    )
    .subscribe ((citizens) => {
      this.citizenLeaders = citizens.length ? citizens.slice(0, 6) : null;
    });
  }

  rotateFeature() {
    interval(5000).subscribe(() => {

      if (this.current_card_index === 2) {
        this.current_card_index = 0;
      } else {
        this.current_card_index++;
      }

      if (this.current_response_index === 2) {
        this.current_response_index = 0;
        this.currentReponseData = this.latestResponse[this.current_response_index];
      } else {
        this.current_response_index++;
        if (!this.latestResponse[this.current_response_index]) {
          this.current_response_index = 0;
        }
        this.currentReponseData = this.latestResponse[this.current_response_index];
      }
    });
  }

  changeCard(index) {
    this.current_card_index = index;
  }

  changeSlider(index) {
    this.current_response_index = index;
    this.currentReponseData = this.latestResponse[this.current_response_index];
  }

  nextSlide() {
    if (this.current_response_index === 2) {
      this.current_response_index = 0;
      this.currentReponseData = this.latestResponse[this.current_response_index];
    } else {
      this.current_response_index++;
      if (!this.latestResponse[this.current_response_index]) {
        this.current_response_index = 0;
      }
      this.currentReponseData = this.latestResponse[this.current_response_index];
    }
  }

  previousSlide() {
    if (this.current_response_index === 0) {
      this.current_response_index = this.latestResponse.length - 1;
      this.currentReponseData = this.latestResponse[this.current_response_index];
    } else {
      this.current_response_index--;
      this.currentReponseData = this.latestResponse[this.current_response_index];
    }
  }

  submitResponse(tabName) {
    this.activeTab = tabName;
  }

  addConsultation(tabName) {
    this.activeTab = tabName;
  }

  numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

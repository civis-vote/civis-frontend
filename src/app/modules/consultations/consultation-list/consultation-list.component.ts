import { Component, OnInit, HostListener } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { ConsultationList } from './consultation-list.graphql';
import { LinearLoaderService } from '../../../shared/components/linear-loader/linear-loader.service';
import * as moment from 'moment';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { UserService } from 'src/app/shared/services/user.service';
import { isObjectEmpty } from 'src/app/shared/functions/modular.functions';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-consultation-list',
  templateUrl: './consultation-list.component.html',
  styleUrls: ['./consultation-list.component.scss']
})

export class ConsultationListComponent implements OnInit {

  consultationListData: any;
  consultationListArray: Array<any>;
  consultationListPaging: any;
  perPageLimit = 15;
  consultationListQuery: QueryRef<any>;
  closedConsultationQuery: QueryRef<any>;
  loadingElements: any = {};
  closedConsultationList: Array<any>;
  closedConsultationPaging: any;
  loadClosedConsultation = false;
  loadingCard = false;
  currentUser: any;
  
  @HostListener('document:scroll', ['$event'])
  onScroll(event: any) {
    const boundingBox = document.documentElement.getBoundingClientRect();
    if ((Math.floor(+boundingBox.height) - window.scrollY) <= window.innerHeight && this.consultationListData && this.consultationListArray) {
      this.loadMoreCard();
    }
  }

  constructor(
    private apollo: Apollo, 
    private loader: LinearLoaderService,
    private consultationService: ConsultationsService, 
    private errorService: ErrorService,
    private userService: UserService
    ) { }

  ngOnInit() {
    this.checkUserSignedIn();
    this.fetchActiveConsultationList();
  }

  checkUserSignedIn(){
    this.userService.userLoaded$
    .subscribe((exists: boolean) => {
      if (exists) {
        this.currentUser = this.userService.currentUser;
      }
    },
    err => {
      this.errorService.showErrorModal(err);
    });
  }

  fetchActiveConsultationList() {
    this.loadingCard = true;
    this.consultationListQuery = this.getQuery('published');
    this.loader.show();
    this.loadingElements.consultationList = true;
    this.consultationListQuery
      .valueChanges 
        .pipe (
          map((res: any) => res.data.consultationList)
        )
        .subscribe(item => {
            this.loadingCard = false;
            this.loadingElements.consultationList = false;
            this.consultationListData = item;
            this.consultationListArray = item.data;
            this.updateDraftNotifications(item.data);
            //TODO: Profanity filter feature, remove condition when ready fo deployment to production
            if(!environment.production) {
              this.consultationListArray = this.sortConsulationList(item.data);
            }
            this.consultationListPaging = item.paging;
            if (!this.consultationListArray.length || 
              (this.consultationListPaging.currentPage === this.consultationListPaging.totalPages)) {
                this.loadClosedConsultation = true;
                this.fetchClosedConsultationList();
              }
        }, err => {
          this.loadingCard = false;
            this.loadingElements.consultationList = false;
            this.loader.hide();
            this.errorService.showErrorModal(err);
        });
  }

  updateDraftNotifications(value) {
    let draftObj = JSON.parse(localStorage.getItem('responseDraft'));

    if (draftObj && !isObjectEmpty(draftObj)) {
      let currentUser: any;
      let responsesArray = [];
      if (draftObj.users && draftObj.users.length > 0) {
        currentUser = draftObj.users.find(
          (user) =>
            user.id === (this.currentUser ? this.currentUser.id : 'guest')
        );
      }

      if (currentUser && currentUser.consultations.length) {
        if (this.currentUser.responses && this.currentUser.responses.edges.length) {
          responsesArray = this.currentUser.responses.edges.map(res => res.node.consultation.id);
        }

        value.forEach(allConsult => {
          currentUser.consultations.forEach(draftConsult => {
            if (allConsult.id === draftConsult.id) {
              draftConsult.responseDeadline = allConsult.responseDeadline;
              draftConsult.consultation_title = allConsult.title;
            } else {
              if (!draftConsult.notificationSeen) {
                draftConsult.notificationSeen = false;
              }
            }

            if (moment(new Date(draftConsult.responseDeadline)).endOf('day').isBefore(moment(new Date()).endOf('day'))) {
              draftConsult.notificationSeen = true;
            } else {
              if (!draftConsult.notificationSeen) {
                draftConsult.notificationSeen = false;
              }
            }

            if (responsesArray.indexOf(+(draftConsult.id)) !== -1) {
              draftConsult.notificationSeen = true;
            }
          })
        })

        const isNotificationReadyPresent = currentUser.consultations.some(currNoty => !currNoty.notificationSeen);

        if (!isNotificationReadyPresent) {
          currentUser.notificationSeen = true;
        }

        localStorage.removeItem('responseDraft');
        localStorage.setItem('responseDraft', JSON.stringify(draftObj));

        this.consultationService.setNotificationsCall.next(true);
      }
    }
  }
  
  sortConsulationList(list) {
    const city = (this.currentUser && this.currentUser.city)  ?  this.currentUser.city.id : undefined;
    if (list && city) {
      list.sort((a,b) => {
          if (a.ministry.locationId === city && b.ministry.locationId === city) return 1;
          return (a.ministry.locationId === city) ? -1: 1;
      });
    }
    return list;
  }
  
  loadMoreCard() {
    if (this.loadingElements.consultationListMore || this.loadingElements.consultationList) {
      return;
    }
    let pagingData = this.consultationListData.paging;
    if (this.loadClosedConsultation) {
      pagingData = this.closedConsultationPaging;
    }
    if(pagingData.totalPages > pagingData.currentPage) {
      this.loader.show();
      this.loadingElements.consultationListMore = true;
      this.consultationListQuery.fetchMore({
        variables: {
          page: ++pagingData.currentPage
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          this.loader.hide();
          this.loadingElements.consultationListMore = false;
          if (!fetchMoreResult) {
            return prev;
          }
          const updatedObject = Object.assign({}, prev, {
            ...prev,
            consultationList: {
              ...prev.consultationList,
              data: [
                ...prev.consultationList.data,
                ...fetchMoreResult.consultationList.data
              ],
              paging: fetchMoreResult.consultationList.paging
            }
          });
          return updatedObject;
        }
      });
    }
  }  

  getQuery(status) {
    const variables = {
      perPage: this.perPageLimit,
      page: 1,
      statusFilter: status,
      featuredFilter: false,
      sort: 'response_deadline',
      sortDirection: status === 'published' ? 'asc' : 'desc',
    };
    return this.apollo.watchQuery({query: ConsultationList, variables});
  }
  
  fetchClosedConsultationList() {
    this.consultationListQuery = this.getQuery('expired');
    this.loader.show();
    this.loadingElements.consultationList = true;
    this.consultationListQuery
      .valueChanges 
        .pipe (
          map((res: any) => res.data.consultationList)
        )
        .subscribe(item => {
            this.loadingElements.consultationList = false;
            this.closedConsultationList = item.data;
            this.closedConsultationPaging = item.paging;
        }, err => {
            this.loadingElements.consultationList = false;
            this.loader.hide();
            this.errorService.showErrorModal(err);
            console.log('error', err);
        });
  }
  
  convertDateType(date) {
    return moment(date).format("Do MMM YY");
  }
  
}

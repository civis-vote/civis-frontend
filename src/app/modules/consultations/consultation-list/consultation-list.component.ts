import { Component, OnInit, HostListener } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { ConsultationList } from './consultation-list.graphql';
import { LinearLoaderService } from '../../../shared/components/linear-loader/linear-loader.service';
import * as moment from 'moment';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { UserService } from 'src/app/shared/services/user.service';

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

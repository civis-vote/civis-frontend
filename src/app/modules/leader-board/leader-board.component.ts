import { Component, OnInit, ViewChild, HostListener, ViewEncapsulation } from '@angular/core';
import { map } from 'rxjs/operators';
import { Apollo, QueryRef } from 'apollo-angular';
import { UserList } from './leader-board.graphql';
import { UserService } from 'src/app/shared/services/user.service';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';


@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LeaderBoardComponent implements OnInit {

  locationObject = {
    name: 'National'
  };

  locations = [
    {
      name: 'National'
    },
    {
      name: 'State'
    },
    {
      name: 'Local'
    }
  ];

  locationFilter = null;

  perPageLimit = 15;
  userListQuery: QueryRef<any>;
  userListData: any;
  loadingElements: any = {};

  currentUser: any;
  showLeaderProfileModal: boolean;
  selectedLeader: any;

  @HostListener('document:scroll', ['$event'])
  onScroll(event: any) {
    const boundingBox = document.documentElement.getBoundingClientRect();
    if ((Math.floor(+boundingBox.height) - window.scrollY) <= window.innerHeight && this.userListData) {
      this.loadMoreCard();
    }
  }

  constructor(private apollo: Apollo, private userService: UserService, private errorService: ErrorService) { }

  ngOnInit() {
    this. fetchUserList();
    this.getCurrentUser();
  }

  changeLocationFilter(event) {
    if (this.currentUser) {
      switch (event.name) {
        case 'Local':
          this.locationFilter = this.currentUser.city.id;
          break;
        case 'State':
          this.locationFilter = this.currentUser.city.parent.id;
          break;
        case 'National':
          this.locationFilter = null;
          break;
        default:
          break;
      }
      this.fetchUserList();
    }
  }

  openLeaderModal(data) {
    this.selectedLeader = data.id;
    this.showLeaderProfileModal = true;
  }

  closeModal(event) {
    if (event) {
      this.showLeaderProfileModal = false;
    }
  }

  getQuery() {
    const variables = {
      perPage: this.perPageLimit,
      page: 1,
      roleFilter: ['citizen', 'moderator'],
      locationFilter: this.locationFilter,
      sort: 'points',
      sortDirection: 'desc'
    };
    return this.apollo.watchQuery({query: UserList, variables});
  }

  getCurrentUser() {
    this.userService.userLoaded$
    .subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  fetchUserList() {

    this.userListQuery = this.getQuery();
    this.loadingElements.userList = true;
    this.userListQuery
      .valueChanges
        .pipe (
          map((res: any) => res.data.userList)
        )
        .subscribe(item => {
          this.loadingElements.userList = false;
          this.userListData = item;
        }, err => {
          this.errorService.showErrorModal(err);
        });
  }

  loadMoreCard() {
    if (this.loadingElements.userListMore || this.loadingElements.userList) {
      return;
    }
    if(this.userListData.paging.totalPages > this.userListData.paging.currentPage) {
      this.loadingElements.userListMore = true;
      this.userListQuery.fetchMore({
        variables: {
          page: ++this.userListData.paging.currentPage
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          this.loadingElements.userListMore = false;
          if (!fetchMoreResult) {
            return prev;
          }
          const updatedObject = Object.assign({}, prev, {
            ...prev,
            userList: {
              ...prev.userList,
              data: [
                ...prev.userList.data,
                ...fetchMoreResult.userList.data
              ],
              paging: fetchMoreResult.userList.paging
            }
          });
          return updatedObject;
        }
      });
    }
  }

}

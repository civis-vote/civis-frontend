import { Component, OnInit, ViewChild, HostListener, ViewEncapsulation, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { Apollo } from 'apollo-angular';
import { map, filter } from 'rxjs/operators';
import { ConsultationList } from './navbar.graphql';
import { ConsultationProfileCurrentUser, ConsultationProfile } from '../consultations/consultation-profile/consultation-profile.graphql';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { CookieService } from 'ngx-cookie';
import { UserNotificationAnalysisQuery } from '../landing/landing.graphql';
import {
  isObjectEmpty,
} from 'src/app/shared/functions/modular.functions';
import moment from 'moment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {
  showDrawer = false;
  @ViewChild('menuModal', { static: false }) menuModal;
  @ViewChild('userProfileElement', { static: false }) userProfileElement: ElementRef;
  showNav = true;
  currentUrl: any;
  currentUser: any;
  profilePopup = false;
  routerId: any;
  transparentNav = false;
  activeCount: any;
  consultationId: number;
  reviewType: any;

  menuObject = {
    name: 'Read & Respond'
  };

  menus = [
    {
      name: 'Read & Respond',
      description: 'Submit your feedback'
    },
    {
      name: 'Discuss & Engage',
      description: 'Talk to the community'
    },
  ];
  activeTab: string;
  showConfirmEmailModal: boolean;
  consultationStatus: any;

  notifications: any;
  constructor(
    private router: Router,
    private userService: UserService,
    private apollo: Apollo,
    private route: ActivatedRoute,
    private consultationService: ConsultationsService,
    private errorService: ErrorService,
    private cookieService: CookieService,
    ) {
        this.consultationService.consultationId$
        .pipe(
          filter(i => i !== null)
        )
        .subscribe((consulationId: any) => {
          this.consultationId = consulationId;
          if (this.consultationId) {
            this.getConsultationProfile();
          }
        });
      }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.findUrl(event.url);
      }
    });
    this.getCurrentUser();
    this.getActiveConsulationCount();
    this.getActiveTab();
    this.watchConsultationStatus();
  }

  setNotifications() {
    this.notifications = [];
    this.apollo.query({
      query: UserNotificationAnalysisQuery,
      variables: {userId: this.currentUser.id},
      fetchPolicy:'no-cache'
    })
    .subscribe((uan: any) => {
      if(uan.data.userNotificationAnalysis.all.length) {
        this.notifications = uan.data.userNotificationAnalysis.all.filter(currNot => currNot !== null);
      };

      this.checkForDraftNotifications();
    });
  }

  checkForDraftNotifications() {
    const draftObj = JSON.parse(localStorage.getItem('responseDraft'));

    if (draftObj && !isObjectEmpty(draftObj)) {
      let currentUser: any;
      if (draftObj.users && draftObj.users.length > 0) {
        currentUser = draftObj.users.find(
          (user) =>
            user.id === (this.currentUser ? this.currentUser.id : 'guest')
        );
      }

      if (currentUser && currentUser.consultations.length && !currentUser.notificationSeen) {
        const notificationObj = {
          type: 'DRAFT',
          main_text: 'Did you forget something?',
          sub_text: 'Did you forget to submit your response on these consultations? Your response is lying in the drafts! Click here to submit it to the government',
          consultation_list: currentUser.consultations.filter(currConsult => moment(new Date(currConsult.responseDeadline)).isSameOrAfter(moment(new Date())))
        }

        this.notifications.push(notificationObj);
      }
    }
  }

  openNotificationDrawer() {
    this.showDrawer = !this.showDrawer;
  }

  closeModal(event) {
    this.showDrawer = false;
    !event && this.setNotifications();
  }

  openMenu() {
    this.menuModal.show();
  }

  closeMenu() {
    this.menuModal.hide();
  }

  findUrl(url) {
    if (url === '/') {
      return 'landing';
    }
    if (url.search('auth') !== -1) {
      return 'auth';
    }
    if (url.search('/consultations') !== -1) {

      if (url.search('/consultations/new') !== -1) {
        return 'consultations-new';
      }
      if (url.search('/consultations/list') !== -1) {
        return 'consultations-list';
      }
      if (url.search('summary') !== -1) {
        return 'consultations-summary';
      }
      if (url.search('response') !== -1) {
        return 'consultations-response';
      }

      return 'consultations-profile';
    }
    return '';
  }

  getCurrentUser() {
    this.userService.userLoaded$
    .subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
        this.setNotifications();
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
        this.reviewType  = data.reviewType;
    }, err => {
      const e = new Error(err);
      if (!e.message.includes('Invalid Access Token')) {
        this.errorService.showErrorModal(err);
      }
    });
  }

  getActiveTab() {
    this.consultationService.activeTab
    .subscribe((tab) => {
      if (tab) {
        this.activeTab = tab;
      }
    });
  }

  showProfilePopup() {
      this.profilePopup = !this.profilePopup;
  }

  getLogoUrl() {
    if (screen && screen.width <= 991) {
      if (this.currentUrl === 'consultations-profile') {
        return 'assets/images/mobile-logo.svg';
      }
      return 'assets/images/navlogo.png';
    } else {
      return 'assets/images/navlogo.png';
    }
  }

  logout(event) {
    event.stopPropagation();
    this.profilePopup = false;
    localStorage.removeItem('civis-token');
    this.userService.currentUser = null;
    this.userService.userLoaded$.next(false);
    this.router.navigate(['']);
  }

  @HostListener('window:scroll', [])
  scrollPos() {
    const number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number < 150) {
      this.transparentNav = false;
    } else if (number > 150) {
      this.transparentNav = true;
    }
  }

  @HostListener('document:click', ['$event']) clickedOutside(event) {
    this.profilePopup = false;
  }

  getActiveConsulationCount() {
    this.apollo.query({
      query: ConsultationList,
      variables: { statusFilter: 'published', featuredFilter: false }
    })
      .pipe(
        map((res: any) => res.data.consultationList)
      )
      .subscribe(item => {
        this.activeCount = item.paging.totalItems;
      });
  }

  routeToConsultation(subRoute: string) {
    if (!this.currentUser && subRoute === 'discuss') {
      this.router.navigateByUrl('/auth');
      return;
    }
    const urlArray = this.router.url.split('/');
    const consultationIndex = +urlArray.findIndex(i => i === 'consultations') + 1;
    if (consultationIndex > 0) {
      const consulationId = urlArray[consultationIndex];
      this.router.navigateByUrl(`/consultations/${consulationId}/${subRoute}`);
    }
  }

  donate() {
    this.router.navigateByUrl('/donate');
  }

  submitConsultation() {
    if (!this.currentUser) {
      this.router.navigateByUrl('/auth');
      return;
    } else {
      if (this.currentUser && this.currentUser.confirmedAt) {
        this.router.navigateByUrl('/consultations/new');
      } else {
        this.showConfirmEmailModal = true;
      }
    }
  }

  onSignUp() {
    if (this.currentUrl === 'consultations-profile') {
      this.router.navigateByUrl('/auth');
      return;
    }
    this.router.navigateByUrl('/auth');
  }


  changeMenu(event) {
    switch (event.name) {
      case 'Read & Respond':
          this.routeToConsultation('read');
        break;
      case 'Discuss & Engage':
          this.routeToConsultation('discuss');
        break;
      default:
        break;
    }
  }

  watchConsultationStatus() {
    this.consultationService.consultationStatus.subscribe((status) => {
      this.consultationStatus = status;
    });
  }
}

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

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {

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

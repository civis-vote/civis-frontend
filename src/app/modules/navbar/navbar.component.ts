import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { ConsultationList } from './navbar.graphql';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @ViewChild('menuModal') menuModal;
  showNav = true;
  currentUrl: any;
  currentUser: any;
  profilePopup = false;
  routerId: any;
  transparentNav = false;
  activeCount: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private apollo: Apollo,
    private route: ActivatedRoute,
    ) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.findUrl(event.url);
      }
    });
    this.getCurrentUser();
    this.getActiveConsulationCount();
    console.log('navbar ac route: ', this.router);
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

      return 'consultations-profile';
    }
    return '';
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

  showProfilePopup() {
    this.profilePopup = !this.profilePopup;
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
    const urlArray = this.router.url.split('/');
    const consultationIndex = +urlArray.findIndex(i => i === 'consultations') + 1;
    if (consultationIndex > 0) {
      const consulationId = urlArray[consultationIndex];
      this.router.navigateByUrl(`/consultations/${consulationId}/${subRoute}`);
    }
  }
}

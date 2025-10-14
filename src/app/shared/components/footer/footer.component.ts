import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { UserService } from '../../services/user.service';
import { LANGUAGES } from '../../models/constants/constants';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {

  languages = LANGUAGES;

  selectedLanguage = 'en';
  currentUser: any;
  showConfirmEmailModal: boolean;
  authModal: boolean;

  constructor(
    private _cookieService: CookieService,
    private router: Router,
    private userService: UserService) {
    const currentLanguage = this._cookieService.get('civisLang');
    if (currentLanguage) {
      this.selectedLanguage = currentLanguage;
    }
   }

  ngOnInit() {
    this.getCurrentUser();
  }

  setLanguage() {
    this._cookieService.put('civisLang', this.selectedLanguage);
    window.location.reload();
    window.scrollTo(0, 0);
  }

  getCurrentUser() {
    this.userService.userLoaded$.subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  submitConsultation() {
    if (!this.currentUser) {
      this.authModal = true;
      return;
    }
    if (this?.currentUser) {
      this.router.navigateByUrl('/consultations/new');
    } else {
      this.showConfirmEmailModal = true;
    }
  }

}

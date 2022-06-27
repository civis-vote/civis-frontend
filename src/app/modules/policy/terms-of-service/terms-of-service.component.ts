import { Component, OnInit } from '@angular/core';
import {CookieService} from 'ngx-cookie'
@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {

  currentLanguage: string;

  constructor(
    private _cookieService: CookieService,
  ) {
    this.currentLanguage = this._cookieService.get('civisLang');
   }

  ngOnInit() {
  }

}

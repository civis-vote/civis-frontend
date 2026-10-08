import { Component, OnInit } from '@angular/core';
import { V2AuthCookieService } from 'src/app/shared/services/v2-auth-cookie.service';

@Component({
  selector: 'app-failure',
  template: `
  <div class="w-100">
  <p class="text-center mt-5">
    There was a problem signing you in the platform. Click <a [routerLink]="['/']">here</a> to go to the platform and try again.
  </p>
</div>
  `,
  styleUrls: ['./failure.component.scss']
})
export class FailureComponent implements OnInit {

  constructor(
    private v2AuthCookieService: V2AuthCookieService,
  ) { }

  ngOnInit() {
    const v2CallbackUrl = this.v2AuthCookieService.getV2CallbackUrl();

    if (!v2CallbackUrl) {
      return;
    }

    this.v2AuthCookieService.clearV2Callback();
  }

}

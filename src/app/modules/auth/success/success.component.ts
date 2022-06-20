import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from 'src/app/shared/services/token.service';
import { UserService } from 'src/app/shared/services/user.service';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-success',
  template: `<p>
    Authentication successfull, loading Civis Platform...
  </p>
`,
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private router: Router,
    private userService: UserService,
    private cookieService: CookieService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.access_token) {
        const accessToken = params.access_token;
        this.tokenService.storeToken({
          accessToken
        });
        this.tokenService.tokenHandler();
        this.userService.manageUserToken();
        this.userService.userLoaded$.subscribe(data => {
          if (data) {
            const callbackUrl = this.cookieService.get('loginCallbackUrl');
            if (callbackUrl) {
              this.router.navigateByUrl(callbackUrl);
              this.cookieService.put('loginCallbackUrl', '');
            } else {
              this.router.navigateByUrl('/profile');
            }
          }
        });
      }
    });
  }

}

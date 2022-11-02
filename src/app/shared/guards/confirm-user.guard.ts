import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { ErrorService } from '../components/error-modal/error.service';
import { TokenService } from '../services/token.service';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';


const ConfirmEmailMutation = gql`
    mutation confirmEmail($confirmationToken: String!) {
        authConfirmEmail (confirmationToken: $confirmationToken) {
            accessToken
        }
    }
`;

@Injectable()
export class ConfirmUserGuard implements CanActivate {

  currentUser: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private apollo: Apollo,
    private errorService: ErrorService,
    private tokenService: TokenService,
    private cookieService: CookieService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : any {
    return Observable.create((observer) => {
      const token = route.queryParams.token;
      const variables = {
        confirmationToken: token
      };
      this.apollo.mutate({ mutation: ConfirmEmailMutation, variables: variables })
        .pipe(
          map((res: any) => res.data.authConfirmEmail)
        )
        .subscribe((tokenObj) => {
          if (tokenObj) {
            this.tokenService.storeToken(tokenObj);
            this.navigateTo();
            this.tokenService.tokenHandler();
            this.userService.manageUserToken();
          }
        }, err => {
          this.errorService.showErrorModal(err);
        });
    });
  }

  navigateTo() {
    this.userService.userLoaded$
      .subscribe((exists: boolean) => {
        if (exists) {
          this.currentUser = this.userService.currentUser;
          const loginCallbackUrl = this.cookieService.get('loginCallbackUrl');
          if (loginCallbackUrl) {
            this.router.navigateByUrl(loginCallbackUrl);
            return;
          }
          if (this.currentUser.callbackUrl) {
            this.router.navigateByUrl(this.currentUser.callbackUrl);
            return;
          }
          this.router.navigateByUrl('/profile');
        }
      },
        err => {
          this.errorService.showErrorModal(err);
        });
  }
}

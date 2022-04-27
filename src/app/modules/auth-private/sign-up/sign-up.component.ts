import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { SignUpMutation, CitiesSearchQuery, LocationListQuery,
  AuhtAcceptInviteMutation } from './sign-up.graphql';
import {debounceTime, distinctUntilChanged, map, switchMap, takeWhile, tap} from 'rxjs/operators';
import { TokenService } from 'src/app/shared/services/token.service';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { GraphqlService } from 'src/app/graphql/graphql.service';
import { NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import gql from 'graphql-tag';
import { isObjectEmpty } from 'src/app/shared/functions/modular.functions';

const ResendEmailConfirmationMutation = gql`
  mutation resendEmail($email: String!) {
    authResendVerificationEmail(email: $email)
  }
`;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  @ViewChild('signupForm', {static: false}) signupForm: NgForm;
  @ViewChild('captchaRef', {static: false}) captchaRef;
  signupObject = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    password: '',
    cityId: null,
    agreedForTermsCondition: false,
    organization: '',
    designation: '',
    callbackUrl: ''
  };
  searchEmitter: EventEmitter<any> = new EventEmitter();
  loadingCities: boolean;
  cities: any;
  dropdownText = 'Begin Typing';
  reCAPTCHA_KEY: string;
  isCaptchaResolved: boolean;
  nextScreen:boolean = false;
  currentUser:any;
  consultationId: any;
  invitationToken: any;
  showLogoutModal: boolean;

  constructor(private apollo: Apollo,
              private tokenService: TokenService,
              private errorService: ErrorService,
              private userService: UserService,
              private router: Router,
              private graphqlService: GraphqlService,
              private cookieService: CookieService,
              private route: ActivatedRoute,
              ) {
  this.reCAPTCHA_KEY = this.graphqlService.environment.RECAPTCHA_SITE_KEY;
  }

  ngOnInit() {
    this.subscribeToSearch();
    this.onInvitationSignup();
  }

  nextPage(){
    if (!this.signupForm.valid) {
      return;
    } else {
      this.signupObject.callbackUrl = this.cookieService.get('loginCallbackUrl');
      this.nextScreen = true;
    }
  }

  subscribeToSearch() {
    this.searchEmitter
      .pipe(
        distinctUntilChanged(),
        debounceTime(400),
        takeWhile(data => !!data),
        switchMap(data => {
          if (data) {
            this.loadingCities = true;
            return this.searchCity(data.term);
          }
        })
      )
      .subscribe((result) => {
        this.loadingCities = false;
        this.cities = result;
        if (!this.cities.length) {
          this.dropdownText = 'City not found';
        }
      }, (err: any) => this.loadingCities = false);
  }

  getCurrentUser(){
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

  onSearch(query: any) {
    if (!query.term) {
      query = null;
      return;
    }
    this.searchEmitter.emit(query);
  }

  searchCity(name: string) {
    if (name.trim()) {
      return this.apollo.query({
          query: CitiesSearchQuery,
          variables: {
            q: name,
            type: 'city',
            isInternationalCity: true
          }
        })
        .pipe(
          map((i: any) => i.data.locationAutocomplete),
          tap(() => this.loadingCities = false)
        );
    }
  }

  submitAuthAcceptInvite() {
    const {firstName, lastName, password, organization, designation, phoneNumber} = this.signupObject;
    const authVariables = {
      firstName,
      lastName,
      password,
      phoneNumber,
      organization,
      designation,
      invitationToken: this.invitationToken,
      consultationId: +this.consultationId
    };
    this.apollo.mutate({mutation: AuhtAcceptInviteMutation, variables: {auth: authVariables}})
    .pipe(
      map((res: any) => res.data.authAcceptInvite)
    ).subscribe((token) => {
      if (token) {
        this.tokenService.storeToken(token);
        this.getCurrentUser();
        this.onSignUp();
        this.userService.userLoaded$
        .subscribe((exists: boolean) => {
          if (exists) {
            this.currentUser = this.userService.currentUser;
            const url = `consultations/${this.consultationId}/read`;
            this.router.navigateByUrl(url);
          }
        },
        err => {
          this.errorService.showErrorModal(err);
        });
      }
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }

  submit() {

    if (!this.signupForm.valid || !this.isCaptchaResolved) {
      return;
    } else if (this.invitationToken) {
      this.submitAuthAcceptInvite();
      return;
    } else {

      const signupObject = {...this.signupObject};
      delete signupObject['agreedForTermsCondition'];
      // signupObject['callbackUrl'] = this.cookieService.get('loginCallbackUrl');
      // console.log(this.signupObject.callbackUrl);
      const variables = {
        auth: signupObject
      };
      this.apollo.mutate({mutation: SignUpMutation, variables: variables})
      .pipe(
        map((res: any) => res.data.authSignUp)
      )
      .subscribe((token) => {
        if (token) {
          this.tokenService.storeToken(token);
          this.getCurrentUser();
          this.onSignUp();
          this.userService.userLoaded$
          .subscribe((exists: boolean) => {
            if (exists) {
              this.currentUser = this.userService.currentUser;
              if (this.currentUser) {
                this.sendEmailVerification();
              }
            }
          },
          err => {
            this.errorService.showErrorModal(err);
          });
        }
      }, err => {
        this.errorService.showErrorModal(err);
      });
    }
  }

  onSignUp() {
    this.tokenService.tokenHandler();
    this.userService.manageUserToken();
  }

  // redirectTo(socialPlatform) {
  //   switch (socialPlatform) {
  //     case 'google':
  //       window.location.href = `${this.graphqlService.environment.api}/signin_google`;
  //       break;
  //     case 'facebook':
  //       window.location.href = `${this.graphqlService.environment.api}/signin_facebook`;
  //       break;
  //   }
  // }

  checkForCaptcha() {
    if (this.isCaptchaResolved) {
      this.submit();
    } else {
      if (!this.captchaRef.executeRequested) {
        this.captchaRef.execute();
      }
    }
  }

  sendEmailVerification() {
    const variables = {
      email: this.currentUser.email
    };
    this.apollo.mutate({mutation: ResendEmailConfirmationMutation, variables: variables})
    .subscribe ((res) => {
      if (res) {
        this.router.navigate(['/auth-private','verify-email']);
      }
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }

  loadCities() {
    this.loadingCities = true;
    this.apollo.query({
      query: LocationListQuery,
      variables: {
        type: 'city',
        isInternationalCity: true
      }
    })
    .pipe(
      map((res: any) => res.data.locationList)
    )
    .subscribe((cities) => {
      this.loadingCities = false;
      this.cities = cities;
    }, err => {
      this.loadingCities = false;
      this.errorService.showErrorModal(err);
    });
  }

  captchaResolved(event) {
    this.isCaptchaResolved = true;
    if (this.signupForm.valid) {
      this.submit();
    }
  }

  onInvitationSignup() {
    this.route.queryParams
    .subscribe(async (params) =>  {
      if (!isObjectEmpty(params)) {
        const {email, first_name, last_name, consultation_id, invitation_token} = params;
        this.consultationId = consultation_id;
        this.signupObject.firstName = first_name;
        this.signupObject.lastName = last_name;
        this.signupObject.email = email;
        this.invitationToken = invitation_token;
      }
    });
  }

  logoutInvitedUser() {
    this.showLogoutModal = false;
    this.invitationToken = null;
    localStorage.removeItem('civis-token');
    this.userService.currentUser = null;
    this.userService.userLoaded$.next(false);
    this.router.navigateByUrl('/auth-private');
  }

}

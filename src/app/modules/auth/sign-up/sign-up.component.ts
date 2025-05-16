import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { LocationListQuery } from './sign-up.graphql';
import { map } from 'rxjs/operators';
import { TokenService } from 'src/app/shared/services/token.service';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { GraphqlService } from 'src/app/graphql/graphql.service';
import { NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie';
import gql from 'graphql-tag';

const AUTH_LOGIN_MUTATION = gql`
  mutation AuthLogin($email: String!) {
    authLogin(auth: { email: $email })
  }
`;

const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($email: String!, $otp: String!) {
    verifyOtp(auth: { email: $email, otp: $otp }) {
      accessToken
      expiresAt
    }
  }
`;

const USER_CURRENT_QUERY = gql`
  query UserCurrent {
    userCurrent {
      email
      firstName
      id
      isVerified
      phoneNumber
      city {
        id
        locationType
        name
      }
    }
  }
`;

const CURRENT_USER_UPDATE_MUTATION = gql`
  mutation CurrentUserUpdate($user: CurrentUserUpdateInput!) {
    currentUserUpdate(user: $user) {
      email
      id
      firstName
      lastName
      phoneNumber
      city {
        id
        locationType
        name
      }
    }
  }
`;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  @ViewChild('emailSignupForm', {static: false}) emailSignupForm: NgForm;
  @ViewChild('otpForm', {static: false}) otpForm: NgForm;
  @ViewChild('userDetailsNgForm', {static: false}) userDetailsNgForm: NgForm;

  // Email step
  emailForOtp: string = '';
  loadingEmail: boolean = false;
  emailError: string = '';
  emailStep: boolean = true;

  // OTP step
  otp: string = '';
  otpStep: boolean = false;
  loadingOtp: boolean = false;
  otpError: string = '';

  // User details step
  showUserDetailsModal = false;
  userDetailsForm: any = {
    firstName: '',
    cityId: null,
    email: ''
  };
  userDetailsError: string = '';
  userDetailsLoading: boolean = false;
  userDetailsCitiesLoading: boolean = false;
  userDetailsCities: any[] = [];

  constructor(
    private apollo: Apollo,
    private tokenService: TokenService,
    private errorService: ErrorService,
    private userService: UserService,
    private router: Router,
    private graphqlService: GraphqlService,
    private cookieService: CookieService,
  ) {}

  ngOnInit() {}

  submitEmailSignup(form: NgForm) {
    if (!form.valid) return;
    this.loadingEmail = true;
    this.emailError = '';
    this.apollo.mutate({
      mutation: AUTH_LOGIN_MUTATION,
      variables: { email: this.emailForOtp }
    }).subscribe(
      (res: any) => {
        this.loadingEmail = false;
        if (res?.data?.authLogin) {
          this.otpStep = true;
          this.emailStep = false;
          this.otpError = '';
        } else {
          this.emailError = 'Unexpected error. Please try again.';
        }
      },
      err => {
        this.loadingEmail = false;
        this.emailError = err?.message || 'Failed to send OTP. Please try again.';
      }
    );
  }

  submitOtp(form: NgForm) {
    if (!form.valid) return;
    this.loadingOtp = true;
    this.otpError = '';
    this.apollo.mutate({
      mutation: VERIFY_OTP_MUTATION,
      variables: { email: this.emailForOtp, otp: this.otp }
    }).subscribe(
      (res: any) => {
        this.loadingOtp = false;
        const tokenObj = res?.data?.verifyOtp;
        if (tokenObj?.accessToken) {
          this.tokenService.storeToken(tokenObj);
          this.fetchAndCheckUserDetails();
        } else {
          this.otpError = 'Invalid OTP. Please try again.';
        }
      },
      err => {
        this.loadingOtp = false;
        this.otpError = err?.message || 'Failed to verify OTP. Please try again.';
      }
    );
  }

  fetchAndCheckUserDetails() {
    this.apollo.query({
      query: USER_CURRENT_QUERY,
      fetchPolicy: 'network-only'
    }).subscribe(
      (result: any) => {
        const user = result?.data?.userCurrent;
        if (
          !user ||
          !user.firstName ||
          !user.email ||
          !user.city ||
          !user.city.id
        ) {
          this.userDetailsForm = {
            firstName: user?.firstName || '',
            cityId: user?.city?.id || null,
            email: user?.email || this.emailForOtp
          };
          this.showUserDetailsModal = true;
          this.loadUserDetailsCities();
        } else {
          this.onSignUp();
        }
      },
      err => {
        this.userDetailsForm = {
          firstName: '',
          cityId: null,
          email: this.emailForOtp
        };
        this.showUserDetailsModal = true;
        this.loadUserDetailsCities();
      }
    );
  }

  loadUserDetailsCities() {
    this.userDetailsCitiesLoading = true;
    this.apollo.query({
      query: LocationListQuery,
      variables: { type: 'city' }
    })
    .pipe(map((res: any) => res.data.locationList))
    .subscribe(
      (cities) => {
        this.userDetailsCitiesLoading = false;
        this.userDetailsCities = cities;
      },
      err => {
        this.userDetailsCitiesLoading = false;
        this.userDetailsError = 'Failed to load cities. Please try again.';
      }
    );
  }

  submitUserDetails(form: NgForm) {
    if (!form.valid) return;
    this.userDetailsLoading = true;
    this.userDetailsError = '';
    this.apollo.mutate({
      mutation: CURRENT_USER_UPDATE_MUTATION,
      variables: {
        user: {
          firstName: this.userDetailsForm.firstName,
          cityId: this.userDetailsForm.cityId
        }
      }
    }).subscribe(
      (res: any) => {
        this.userDetailsLoading = false;
        this.showUserDetailsModal = false;
        this.onSignUp();
      },
      err => {
        this.userDetailsLoading = false;
        this.userDetailsError = err?.message || 'Failed to update details. Please try again.';
      }
    );
  }

  resendOtp() {
    if (!this.emailForOtp) return;
    this.loadingOtp = true;
    this.otpError = '';
    this.apollo.mutate({
      mutation: AUTH_LOGIN_MUTATION,
      variables: { email: this.emailForOtp }
    }).subscribe(
      (res: any) => {
        this.loadingOtp = false;
      },
      err => {
        this.loadingOtp = false;
        this.otpError = err?.message || 'Failed to resend OTP. Please try again.';
      }
    );
  }

  onSignUp() {
    this.tokenService.tokenHandler();
    this.userService.manageUserToken();
    this.router.navigate(['/']);
  }

  redirectTo(socialPlatform) {
    switch (socialPlatform) {
      case 'google':
        window.location.href = `${this.graphqlService.environment.api}/signin_google`;
        break;
      case 'facebook':
        window.location.href = `${this.graphqlService.environment.api}/signin_facebook`;
        break;
    }
  }
}

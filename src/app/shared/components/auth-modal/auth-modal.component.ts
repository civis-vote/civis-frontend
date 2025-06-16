import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { NgForm } from '@angular/forms';
import { SignUpMutation, LocationListQuery } from 'src/app/modules/auth-private/sign-up/sign-up.graphql';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { TokenService } from '../../services/token.service';
import { ErrorService } from '../error-modal/error.service';
import { UserService } from '../../services/user.service';
import { GraphqlService } from 'src/app/graphql/graphql.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { CURRENT_USER_UPDATE_MUTATION } from '../city-selection-modal/city-selection-modal.graphql';
import { WhiteLabelService } from '../../services/white-label.service';

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

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {

  @ViewChild('authModal', { static: false }) authModal: ModalDirective;
  @ViewChild('signupForm', { static: false }) signupForm: NgForm;
  @Output() close: EventEmitter<any> = new EventEmitter();

  signupObject = {
    firstName: '',
    email: '',
    notifyForNewConsultation: true,
    agreedForTermsCondition: false,
    cityId: null
  };
  signup = false;
  signin = false;
  login = false;
  loginObject = {
    email: ''
  };
  loadingCities: boolean;
  cities: any;
  @Input() consultationId;

  emailSignup = false;
  emailForOtp: string = '';
  otpStep = false;
  otp: string = '';
  otpError: string = '';
  emailError: string = '';
  loadingOtp: boolean = false;
  loadingEmail: boolean = false;
  resendingOtp: boolean = false;
  resendOtpCountdown: number = 0;
  resendOtpTimer: any = null;

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

  @Input() fromNavbar: boolean = false;

  isWhiteLabelDomain: boolean = false;

  constructor(
    private apollo: Apollo,
    private tokenService: TokenService,
    private errorService: ErrorService,
    private userService: UserService,
    private graphqlService: GraphqlService,
    private readonly whiteLabelService: WhiteLabelService
  ) { }

  ngOnInit() {
    this.isWhiteLabelDomain = this.whiteLabelService.isWhiteLabelSubdomain();
  }

  submit() {
    if (!this.signupForm.valid) {
      return;
    } else {
      const signupObject = { ...this.signupObject };
      delete signupObject['agreedForTermsCondition'];
      delete signupObject['designation'];
      delete signupObject['company'];
      const variables: any = {
        auth: signupObject
      };
      variables.auth.referringConsultationId = this.consultationId;
      this.apollo.mutate({ mutation: SignUpMutation, variables: variables })
        .pipe(
          map((res: any) => res.data.authSignUp)
        )
        .subscribe((token) => {
          if (token) {
            this.tokenService.storeToken(token);
            this.onSignUp();
            this.authModal.hide();
            this.close.emit(true);
          }
        }, err => {
          this.errorService.showErrorModal(err);
        });
    }
  }

  loadCities() {
    this.loadingCities = true;
    this.apollo.query({
      query: LocationListQuery,
      variables: {
        type: 'city'
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

  onSignUp() {
    this.tokenService.tokenHandler();
    this.userService.manageUserToken();
  }

  onClose() {
    this.authModal.hide();
    this.close.emit(true);
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

  startEmailSignup() {
    this.signup = false;
    this.signin = false;
    this.emailSignup = true;
    this.otpStep = false;
    this.emailError = '';
    this.otpError = '';
    this.emailForOtp = '';
    this.otp = '';
  }

  startResendOtpCountdown(seconds: number = 10) {
    this.resendOtpCountdown = seconds;
    if (this.resendOtpTimer) {
      clearInterval(this.resendOtpTimer);
    }
    this.resendOtpTimer = setInterval(() => {
      if (this.resendOtpCountdown > 0) {
        this.resendOtpCountdown--;
      }
      if (this.resendOtpCountdown === 0 && this.resendOtpTimer) {
        clearInterval(this.resendOtpTimer);
        this.resendOtpTimer = null;
      }
    }, 1000);
  }

  submitEmailSignup(emailInput: NgForm) {
    if (!emailInput.valid) return;
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
          this.otpError = '';
          this.startResendOtpCountdown();
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

  submitOtp(otpForm: NgForm) {
    if (!otpForm.valid) return;
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
        let msg = err?.message || 'Failed to verify OTP. Please try again.';
        if (msg.startsWith('GraphQL error: ')) {
          msg = msg.replace('GraphQL error: ', '');
        }
        this.otpError = msg;
      }
    );
  }

  fetchAndCheckUserDetails() {
    this.apollo.query({
      query: USER_CURRENT_QUERY,
      fetchPolicy: 'network-only'
    }).subscribe(
      (result: ApolloQueryResult<any>) => {
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
          this.authModal.hide();
          this.close.emit(true);
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
        this.authModal.hide();
        this.close.emit(true);
        this.onSignUp();
      },
      err => {
        this.userDetailsLoading = false;
        this.userDetailsError = err?.message || 'Failed to update details. Please try again.';
      }
    );
  }

  resendOtp() {
    if (!this.emailForOtp || this.resendOtpCountdown > 0) return;
    this.resendingOtp = true;
    this.otpError = '';
    this.apollo.mutate({
      mutation: AUTH_LOGIN_MUTATION,
      variables: { email: this.emailForOtp }
    }).subscribe(
      (res: any) => {
        this.resendingOtp = false;
        this.startResendOtpCountdown();
      },
      err => {
        this.resendingOtp = false;
        this.otpError = err?.message || 'Failed to resend OTP. Please try again.';
      }
    );
  }

  ngOnDestroy() {
    if (this.resendOtpTimer) {
      clearInterval(this.resendOtpTimer);
    }
  }
}

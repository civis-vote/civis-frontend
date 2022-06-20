import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { NgForm } from '@angular/forms';
import { SignUpMutation, LocationListQuery } from 'src/app/modules/auth-private/sign-up/sign-up.graphql';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { TokenService } from '../../services/token.service';
import { ErrorService } from '../error-modal/error.service';
import { UserService } from '../../services/user.service';
import { LoginMutation } from 'src/app/modules/auth-private/login/login.graphql';
import { GraphqlService } from 'src/app/graphql/graphql.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {


  @ViewChild('authModal', { static: false }) authModal: ModalDirective;
  @ViewChild('signupForm', {static: false}) signupForm: NgForm;
  @Output() close: EventEmitter<any> = new EventEmitter();

  signupObject = {
    firstName: '',
    email: '',
    password: '',
    notifyForNewConsultation: true,
    agreedForTermsCondition: false,
    cityId: null
  };
  signup = false;
  signin = false;
  login = false;
  loginObject = {
    email: '',
    password: ''
  };
  loadingCities: boolean;
  cities: any;
  @Input() consultationId;


  constructor(
    private apollo: Apollo,
    private tokenService: TokenService,
    private errorService: ErrorService,
    private userService: UserService,
    private graphqlService: GraphqlService
  ) { }

  ngOnInit() {
  }

  submit() {

    if (!this.signupForm.valid ) {
      return;
    } else {

      const signupObject = {...this.signupObject};
      delete signupObject['agreedForTermsCondition'];
      delete signupObject['designation'];
      delete signupObject['company'];
      const variables: any = {
        auth: signupObject
      };
      variables.auth.referringConsultationId = this.consultationId;
      this.apollo.mutate({mutation: SignUpMutation, variables: variables})
      .pipe(
        map((res: any) => res.data.authSignUp)
      )
      .subscribe((token) => {
        if (token) {
          this.tokenService.storeToken(token);
          // this.getCurrentUser();
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

  submitLogin(isValid: boolean) {
    if (!isValid) {
      return;
    }

    this.apollo.mutate({
        mutation: LoginMutation,
        variables: {auth: this.loginObject}
      })
      .pipe(
        map((res: any) => res.data.authLogin)
      )
      .subscribe((tokenObject: any) => {
        if (tokenObject) {
          this.tokenService.storeToken(tokenObject);
          this.authModal.hide();
          this.close.emit(true);
          this.onSignUp();
        }
      }, (err: any) => {
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

}

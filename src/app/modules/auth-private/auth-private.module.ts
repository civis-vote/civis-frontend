import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthPrivateRoutingModule } from './auth-private-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';
import { ModalModule } from 'ngx-bootstrap';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CookieService } from 'ngx-cookie-service';
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AuthPrivateRoutingModule,
    NgSelectModule,
    FormsModule,
    RecaptchaModule,
    ModalModule,
    PipesModule,
    SharedComponentsModule,
  ],
  declarations: [
    SignUpComponent,
    LoginComponent,
    ForgotPasswordComponent,
    LogoutConfirmationComponent
  ],
  providers: [CookieService]
})
export class AuthPrivateModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component';
import { ResendVerificationComponent } from 'src/app/shared/components/resendVerification/resendVerification.component';

const routes: Routes = [
    { path: '', redirectTo: 'sign-up', pathMatch: 'full', component: SignUpComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'login', component: LoginComponent},
    { path: 'forgot-password', component: ForgotPasswordComponent},
    { path: 'verify-email', component: ResendVerificationComponent},
    { path: 'logout-confirmation', component: LogoutConfirmationComponent}
]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]

})

export class AuthPrivateRoutingModule {}

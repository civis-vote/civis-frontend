import {NgModule} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuccessComponent } from './success/success.component';
import { FailureComponent } from './failure/failure.component';
import { ResendVerificationComponent } from 'src/app/shared/components/resendVerification/resendVerification.component';

const routes: Routes = [
    { path: 'success', component: SuccessComponent},
    { path: 'failure', component: FailureComponent},
    { path: 'verify-email', component: ResendVerificationComponent},
];




@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule
    ]
})

export class AuthRoutingModule {}

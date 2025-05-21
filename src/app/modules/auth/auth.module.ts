import {CommonModule} from '@angular/common';
import { NgModule } from '@angular/core';
import {NgSelectModule} from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { RouterModule } from '@angular/router';
import { SuccessComponent } from './success/success.component';
import { FailureComponent } from './failure/failure.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
    declarations: [
        SuccessComponent,
        FailureComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        AuthRoutingModule,
        NgSelectModule,
        FormsModule,
        RecaptchaModule,
        PipesModule,
        SharedComponentsModule,
    ],
    exports: []
})

export class AuthModule {}

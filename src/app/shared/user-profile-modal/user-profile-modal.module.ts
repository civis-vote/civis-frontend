import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
;
import { UserProfileModalComponent } from './user-profile-modal.component';
import { SharedDirectivesModule } from '../directives/shared-directives.module';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        SharedDirectivesModule,
        RouterModule,
        PipesModule,
    ],
    exports: [
        UserProfileModalComponent
    ],
    declarations: [
        UserProfileModalComponent
    ],
    providers: []
})
export class UserProfileModalModule { }
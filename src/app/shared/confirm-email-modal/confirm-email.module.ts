import { NgModule } from '@angular/core';
import { ConfirmEmailModalComponent } from './confirm-email-modal.component';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
;
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        PipesModule,
    ],
    exports: [
        ConfirmEmailModalComponent
    ],
    declarations: [
        ConfirmEmailModalComponent
    ],
    providers: []
})
export class ConfirmEmailModule { }

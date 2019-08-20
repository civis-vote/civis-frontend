import { NgModule } from '@angular/core';
import { CreateConsultationComponent } from './create-consultation/create-consultation.component';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { CommonModule } from '@angular/common';
import { ConsultationsRoutingModule } from './consultations-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedDirectivesModule } from 'src/app/shared/directives/shared-directives.module';
import { ConsultationProfileComponent } from './consultation-profile/consultation-profile.component';
import { ProfileCardComponent } from './consultation-profile/profile-card/profile-card.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {ModalModule} from 'ngx-bootstrap';
import { NgxUploaderModule } from 'ngx-uploader';
import { AngularDraggableModule } from 'angular2-draggable';
import { ConsultationsSummaryComponent } from './consultations-summary/consultations-summary.component';
import { DisqusModule } from 'src/app/shared/components/disqus/disqus.module';
import { ReadRespondComponent } from './consultation-profile/read-respond/read-respond.component';
import { DiscussEngageComponent } from './consultation-profile/discuss-engage/discuss-engage.component';




@NgModule({
    imports: [
        CommonModule,
        ConsultationsRoutingModule,
        FormsModule,
        SharedComponentsModule,
        SharedDirectivesModule,
        NgSelectModule,
        BsDatepickerModule.forRoot(),
        ModalModule,
        NgxUploaderModule,
        AngularDraggableModule,
        DisqusModule,
    ],
    exports: [],
    declarations: [
        CreateConsultationComponent,
        ConsultationListComponent,
        ConsultationProfileComponent,
        ProfileCardComponent,
        ConsultationsSummaryComponent,
        ReadRespondComponent,
        DiscussEngageComponent
    ],
    providers: []
})
export class ConsultationsModule { }

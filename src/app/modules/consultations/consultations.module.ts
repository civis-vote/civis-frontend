import { NgModule } from '@angular/core';
import { CreateConsultationComponent } from './create-consultation/create-consultation.component';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { CommonModule } from '@angular/common';
import { ConsultationsRoutingModule } from './consultations-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedDirectivesModule } from 'src/app/shared/directives/shared-directives.module';
import { ConsultationProfileComponent } from './consultation-profile/consultation-profile.component';
import { ProfileCardComponent } from './consultation-profile/profile-card/profile-card.component';


@NgModule({
    imports: [
        CommonModule,
        ConsultationsRoutingModule,
        FormsModule,
        SharedComponentsModule,
        SharedDirectivesModule
    ],
    exports: [],
    declarations: [
        CreateConsultationComponent,
        ConsultationListComponent,
        ConsultationProfileComponent,
        ProfileCardComponent
    ],
    providers: []
})
export class ConsultationsModule { }

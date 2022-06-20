import { NgModule } from '@angular/core';
import { CreateConsultationComponent } from './create-consultation/create-consultation.component';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { CommonModule } from '@angular/common';
import { ConsultationsRoutingModule } from './consultations-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedDirectivesModule } from 'src/app/shared/directives/shared-directives.module';
import { ConsultationProfileComponent } from './consultation-profile/consultation-profile.component';
import { ProfileCardComponent } from './consultation-profile/profile-card/profile-card.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {ModalModule, TooltipModule} from 'ngx-bootstrap';
import { NgxUploaderModule } from 'ngx-uploader';
import { AngularDraggableModule } from 'angular2-draggable';
import { ConsultationsSummaryComponent } from './consultations-summary/consultations-summary.component';
import { ResponseComponent } from './response/response.component';
import { DisqusModule } from 'src/app/shared/components/disqus/disqus.module';
import { ReadRespondComponent } from './consultation-profile/read-respond/read-respond.component';
import { DiscussEngageComponent } from './consultation-profile/discuss-engage/discuss-engage.component';
import { ShareButtonModule } from '@ngx-share/button';
import { ConfirmEmailModule } from 'src/app/shared/confirm-email-modal/confirm-email.module';
import { UserProfileModalModule } from 'src/app/shared/user-profile-modal/user-profile-modal.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CookieService } from 'ngx-cookie-service';
import { ConsultationQuestionnaireComponent } from './consultation-profile/consultation-questionnaire/consultation-questionnaire.component';
import { ResponseFooterComponent } from './consultation-profile/response-footer/response-footer.component';
import { ThankYouModalComponent } from './consultation-profile/thank-you-modal/thank-you-modal.component';
import { ConsultationResponseTextComponent } from './consultation-profile/consultation-response-text/consultation-response-text.component';
import {
    ConsultationPublicResponsesComponent
 } from './consultation-profile/consultation-public-responses/consultation-public-responses.component';
import {
    SatisfactionRatingDistributionComponent
 } from './consultation-profile/satisfaction-rating-distribution/satisfaction-rating-distribution.component';
import { ResponseContainerComponent } from './consultation-profile/response-container/response-container.component';
import { SummaryResponseContainerComponent } from './consultation-profile/summary-response-container/summary-response-container.component';
import {
    SatisfactionRatingSelectionComponent
 } from './consultation-profile/satisfaction-rating-selection/satisfaction-rating-selection.component';

@NgModule({
    imports: [
        CommonModule,
        ConsultationsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SharedComponentsModule,
        SharedDirectivesModule,
        NgSelectModule,
        BsDatepickerModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule,
        NgxUploaderModule,
        AngularDraggableModule,
        DisqusModule,
        ShareButtonModule,
        ConfirmEmailModule,
        UserProfileModalModule,
        CKEditorModule,
        PipesModule,
    ],
    exports: [TooltipModule],
    declarations: [
        CreateConsultationComponent,
        ConsultationListComponent,
        ConsultationProfileComponent,
        ProfileCardComponent,
        ConsultationsSummaryComponent,
        ResponseComponent,
        ReadRespondComponent,
        DiscussEngageComponent,
        ConsultationQuestionnaireComponent,
        ResponseFooterComponent,
        ThankYouModalComponent,
        ConsultationResponseTextComponent,
        ConsultationPublicResponsesComponent,
        SatisfactionRatingDistributionComponent,
        ResponseContainerComponent,
        SummaryResponseContainerComponent,
        SatisfactionRatingSelectionComponent,
    ],
    providers: [CookieService]
})
export class ConsultationsModule { }

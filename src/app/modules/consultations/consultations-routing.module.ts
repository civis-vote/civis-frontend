import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateConsultationComponent } from './create-consultation/create-consultation.component';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { ConsultationProfileComponent } from './consultation-profile/consultation-profile.component';
import { ConsultationsSummaryComponent } from './consultations-summary/consultations-summary.component';
import { ReadRespondComponent } from './consultation-profile/read-respond/read-respond.component';
import { DiscussEngageComponent } from './consultation-profile/discuss-engage/discuss-engage.component';

const routes: Routes = [
    { path: 'new', component: CreateConsultationComponent },
    { path: 'list', component: ConsultationListComponent },
    { path: ':id', children: [
            { path: '', component: ConsultationProfileComponent,
                children: [
                    { path: '', redirectTo: 'read', pathMatch: 'full' },
                    { path: 'read', component: ReadRespondComponent },
                    { path: 'discuss', component: DiscussEngageComponent },
                ]
            },
            { path: 'summary', component: ConsultationsSummaryComponent }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [],
    providers: []
})
export class ConsultationsRoutingModule { }

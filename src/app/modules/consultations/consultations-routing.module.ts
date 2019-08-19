import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateConsultationComponent } from './create-consultation/create-consultation.component';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { ConsultationProfileComponent } from './consultation-profile/consultation-profile.component';
import { ConsultationsSummaryComponent } from './consultations-summary/consultations-summary.component';
import { DisqusComponent } from 'src/app/shared/components/disqus/disqus.component';
import { ReadRespondComponent } from './consultation-profile/read-respond/read-respond.component';

const routes: Routes = [
    { path: 'new', component: CreateConsultationComponent },
    { path: 'list', component: ConsultationListComponent },
    {
        path: ':id', children: [
            { path: '', pathMatch: 'full', component: ConsultationProfileComponent,
                children: [
                    { path: '', redirectTo: 'read', pathMatch: 'full' },
                    { path: 'read', component: ReadRespondComponent },
                    { path: 'discuss', component: DisqusComponent },
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

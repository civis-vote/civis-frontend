import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateConsultationComponent } from './create-consultation/create-consultation.component';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { ConsultationProfileComponent } from './consultation-profile/consultation-profile.component';

const routes: Routes = [
    { path: '', component: CreateConsultationComponent },
    { path: 'list', component: ConsultationListComponent},
    { path: ':id', component: ConsultationProfileComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [],
    providers: []
})
export class ConsultationsRoutingModule { }

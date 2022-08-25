import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DonateComponent } from './donate.component';
import { WindowRefService } from '../../shared/services/window-ref.service';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: DonateComponent
  }
];

@NgModule({
  declarations: [
    DonateComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    SharedComponentsModule,
    PipesModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [WindowRefService],
  exports: [RouterModule],
})
export class DonateModule { }

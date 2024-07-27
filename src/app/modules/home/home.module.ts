import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {HomeRoutingModule} from './home-routing.module';
import {HomeComponent} from './home.component';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    PipesModule
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisqusComponent } from './disqus.component';

@NgModule({
  declarations: [
    DisqusComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    DisqusComponent,
  ]
})
export class DisqusModule { }

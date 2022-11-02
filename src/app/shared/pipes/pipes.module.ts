import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './safe-html.pipe';
import { JoinPipe } from './join.pipe';
import { TitleizePipe } from './titleize.pipe';
import { TranslatePipe } from './translate.pipe';
import { NotificationFilter } from './notification-filter.pipe';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    JoinPipe,
    TitleizePipe,
    TranslatePipe,
    NotificationFilter
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TranslatePipe,
    SafeHtmlPipe,
    NotificationFilter
  ]
})
export class PipesModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlossaryComponent } from './glossary.component';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    GlossaryComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    SharedComponentsModule,
    PipesModule
  ],
  exports: [GlossaryComponent],
})
export class GlossaryModule { }

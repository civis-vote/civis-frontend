import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitySelectionModalComponent } from './city-selection-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { LinearLoaderModule } from '../linear-loader/linear-loader.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [CitySelectionModalComponent],
  imports: [
    CommonModule,
    ModalModule,
    NgSelectModule,
    FormsModule,
    LinearLoaderModule,
    PipesModule,
  ],
  exports: [
    CitySelectionModalComponent,
  ]
})
export class CitySelectionModalModule { }

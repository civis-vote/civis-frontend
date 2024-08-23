import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ModalModule} from 'ngx-bootstrap/modal';
import {ImageCropperModule} from 'ngx-img-cropper'
import {ImageUploaderComponent} from './image-uploader.component';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [ImageUploaderComponent],
  imports: [
    CommonModule,
    ModalModule,
    ImageCropperModule,
    PipesModule
  ],
  exports: [ImageUploaderComponent]
})
export class ImageUploaderModule {
}

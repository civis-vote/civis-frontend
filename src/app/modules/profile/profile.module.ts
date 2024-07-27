import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile.routing.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { ImageUploaderModule } from 'src/app/shared/components/image-uploader/image-uploader.module';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        ProfileRoutingModule,
        ModalModule,
        FormsModule,
        ImageUploaderModule,
        SharedComponentsModule,
        PipesModule
    ],
    exports: [],
    declarations: [ProfileComponent],
    providers: []
})
export class ProfileModule { }

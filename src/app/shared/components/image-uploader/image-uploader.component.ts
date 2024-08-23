import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ModalDirective} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-img-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnChanges {
  @ViewChild('imgUploadModal', {static: false}) imgUploadModal: ModalDirective;
  @Output() upload: EventEmitter<any> = new EventEmitter();
  @Input() config: any;
  _options = {
    fileSize: 1024, // in Bytes (by default 2048 Bytes = 2 MB)
    fileType: ['image/gif', 'image/jpeg', 'image/png'], // mime type of files accepted
    quality: 0.8,
    crop: [  // array of objects for mulitple image crop instances (by default null, signifies no cropping)
      {
        ratio: 1, // ratio in which image needed to be cropped (by default null, signifies ratio to be free of any restrictions)
        width: 150,  // width of image to be exported (by default 0, signifies any width)
        height: 150  // height of image to be exported (by default 0, signifies any height)
      }
    ]
  };
  base64 = '';
  showModal = true;

  ngOnChanges(changes: SimpleChanges): void {
    this._options = {...this._options, ...this.config};
  }

  sendData() {
    this.upload.emit(this.base64);
    this.hideModal();
  }

  closeModal() {
    this.upload.emit(false);
    this.hideModal();
  }

  hideModal() {
    this.showModal = false;
    this.imgUploadModal.hide();
  }

}

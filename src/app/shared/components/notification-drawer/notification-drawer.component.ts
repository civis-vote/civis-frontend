import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss']
})
export class NotificationDrawerComponent implements OnInit {
  @Output() close: EventEmitter<any> = new EventEmitter();
  @ViewChild('notificationModal', { static: false }) notificationModal: ModalDirective;
  constructor() { }

  ngOnInit() {
  }

  closeModal() {
    this.notificationModal.hide();
    this.close.emit(true);
  }
}

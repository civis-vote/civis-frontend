import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.scss']
})
export class LogoutConfirmationComponent implements OnInit {

  @ViewChild('logoutConfirmationModal', { static: false }) logoutConfirmationModal: ModalDirective;
  @Output() logout: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  logoutUser() {
    this.logout.emit();
    this.logoutConfirmationModal.hide();
  }

  closeModal() {
    this.close.emit();
    this.logoutConfirmationModal.hide();
  }

}

import { Input } from '@angular/core';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss']
})
export class NotificationDrawerComponent implements OnInit {
  @Input() notifications = [];
  @Output() close: EventEmitter<any> = new EventEmitter();
  @ViewChild('notificationModal', { static: false }) notificationModal: ModalDirective;
  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateToConsultations(consulationId) {
    this.router.navigateByUrl(`/consultations/${consulationId}/read`);
    this.closeModal();
  }

  closeModal() {
    this.notificationModal.hide();
    this.close.emit(true);
  }
}

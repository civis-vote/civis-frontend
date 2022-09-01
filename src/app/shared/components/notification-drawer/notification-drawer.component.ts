import { Input } from '@angular/core';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { UserService } from '../../services/user.service';

const UpdateNotificationStatus = gql`
mutation userNotification($notificationId: Int!){
  userNotification(notificationId: $notificationId){
    id
  }
}
`;

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss']
})
export class NotificationDrawerComponent implements OnInit {
  @Input() notifications = [];
  @Output() close: EventEmitter<any> = new EventEmitter();
  @ViewChild('notificationModal', { static: false }) notificationModal: ModalDirective;

  currentUser: any;
  constructor(private router: Router, private apollo: Apollo, private errorService: ErrorService, private userService: UserService) { }

  ngOnInit() {
    this.getCurrentUser();
  }


  getCurrentUser() {
    this.userService.userLoaded$.subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  navigateToConsultations(notify, subNotify, consulationId) {
    if (notify.type === 'DRAFT') {
      this.updateNotification(notify, subNotify, consulationId)
    } else {
      this.apollo.mutate({
        mutation: UpdateNotificationStatus,
        variables:{
            notificationId: subNotify.id
        },
        })
        .subscribe((data) => {
          this.updateNotification(notify, subNotify, consulationId)
        }, err => {
        this.errorService.showErrorModal(err);
        });
    }
  }

  updateNotification(notify, subNotify, consulationId) {
    const reload  = (this.router.url.indexOf('consultations') !== -1);
    if (notify.type === 'RANK') {
      this.router.navigateByUrl(`/leader-board`);
    } else {
      this.router.navigateByUrl(`/consultations/${consulationId}/read`);
    }

    if (reload) {
      setTimeout(() => {
        window.location.reload();
        window.scrollTo(0, 0);
      })
    }

      this.closeModal();

      subNotify.notificationSeen = true;

      const isNotificationReadyPresent = notify.consultation_list.some(currNoty => !currNoty.notificationSeen);

      if (!isNotificationReadyPresent) {
        notify.notificationSeen = true;

        if (notify.type === 'DRAFT') {
          this.updateDraftNotifications();
        }
      } else {

      }
  }

  updateDraftNotifications() {
    let draftObj: any = JSON.parse(localStorage.getItem('responseDraft'));

    let currentUser = draftObj.users.find(
      (user) =>
        user.id === this.currentUser.id
    );

    if (currentUser) {
     currentUser.notificationSeen = true;
    }

    localStorage.removeItem('responseDraft');
    localStorage.setItem('responseDraft', JSON.stringify(draftObj));
  }

  closeModal() {
    this.notificationModal.hide();
    this.close.emit(this.notifications);
  }

  notificationClicked(notify) {
    if (!notify.consultation_list.length) {
      notify.notificationSeen = true
    }
  }
}

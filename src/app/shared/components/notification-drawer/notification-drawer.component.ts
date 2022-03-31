import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-notification-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss']
})
export class NotificationDrawerComponent implements OnInit {

  constructor( private userService: UserService) { }

  ngOnInit() {
  }

  closeDrawer() {
    this.userService.setNotificationDrawerStatus(false);
  }
}

import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UserProfileQuery } from './user-profile.graphql';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss']
})
export class UserProfileModalComponent implements OnInit {

  @Input() userId: string | number;

  @Output() close: EventEmitter<any> = new EventEmitter();
  @ViewChild('leaderModal', { static: false }) leaderModal: ModalDirective;
  currentUser: any;
  user: any;


  constructor(private userService: UserService,
              private router: Router,
              private apollo: Apollo) { }

  ngOnInit() {
    this.getCurrentUser();
    if (this.userId) {
      this.getUserDetail(this.userId);
    }
  }

  getUserDetail(id) {
    this.apollo.query({
      query: UserProfileQuery,
      variables: {id: id}
    })
    .subscribe((res: any) => {
      this.user = res.data.userProfile;
    }, err => {
      // Handle error silently or implement proper error handling
    });
  }

  closeModal() {
    this.leaderModal.hide();
    this.close.emit(true);
  }

  getCurrentUser() {
    this.userService.userLoaded$
      .subscribe((data) => {
        if (data) {
          this.currentUser = this.userService.currentUser;
        } else {
          this.currentUser = null;
        }
      });
  }

  viewResponse(response) {
    this.closeModal();
    this.router.navigateByUrl(`/consultations/${response.consultation.id}/read#${response.id}`);
  }

}

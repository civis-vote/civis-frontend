import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { UserService } from '../services/user.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { ErrorService } from '../components/error-modal/error.service';

const ResendEmailConfirmationMutation = gql`
  mutation resendEmail($email: String!) {
    authResendVerificationEmail(email: $email)
  }
`;

@Component({
  selector: 'app-confirm-email-modal',
  templateUrl: './confirm-email-modal.component.html',
  styleUrls: ['./confirm-email-modal.component.scss']
})

export class ConfirmEmailModalComponent implements OnInit {

  @ViewChild('confirmEmailModal', {static: false}) confirmEmailModal: ModalDirective;
  @Output() close: EventEmitter<any> = new EventEmitter();
  showModal = true;
  currentUser: any;
  loading: boolean;

  constructor(private userService: UserService, private apollo: Apollo, private errorService: ErrorService) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  closeModal() {
    this.showModal = false;
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

  resendEmail() {
    this.loading = true;
    const variables = {
      email: this.currentUser.email
    };
    this.apollo.mutate({mutation: ResendEmailConfirmationMutation, variables: variables})
    .subscribe ((res) => {
      this.loading = false;
      if (res) {
        this.closeModal();
      }
    }, err => {
      this.loading = false;
      this.errorService.showErrorModal(err);
    });
  }

}

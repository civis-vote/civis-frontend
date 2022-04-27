import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

const ResendEmailConfirmationMutation = gql`
mutation resendEmail($email: String!) {
  authResendVerificationEmail(email: $email)
}
`;

@Component({
  selector: 'app-resendVerification',
  templateUrl: './resendVerification.component.html',
  styleUrls: ['./resendVerification.component.scss']
})
export class ResendVerificationComponent implements OnInit {
  currentUser: any;

  constructor(
    private userService: UserService,
    private apollo: Apollo,
    private errorService: ErrorService,
    private toastService: ToastService
    ) { }

  ngOnInit() {
    this.getCurrentUser();
  }
  resendEmailVerification() {
    const variables = {
      email: this.currentUser.email
    };
    this.apollo.mutate({mutation: ResendEmailConfirmationMutation, variables: variables})
    .subscribe ((res) => {
      if (res) {
          this.toastService.displayToast("success","Email has been sent again!!");
      }
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }
  getCurrentUser(){
    this.userService.userLoaded$
    .subscribe((exists: boolean) => {
      if (exists) {
        this.currentUser = this.userService.currentUser;
      }
    },
    err => {
      this.errorService.showErrorModal(err);
    });
  }

}

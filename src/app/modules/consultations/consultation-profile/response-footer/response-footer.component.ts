import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { Apollo } from 'apollo-angular';
import {
  VoteDeleteQuery,
  ConsultationProfileCurrentUser,
  VoteCreateQuery,
} from '../consultation-profile.graphql';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { filter } from 'rxjs/operators';
import * as moment from 'moment';
import { getSocialLink } from '../../consultation-profile/socialLink.function';
import { isObjectEmpty } from 'src/app/shared/functions/modular.functions';

@Component({
  selector: 'app-response-footer',
  templateUrl: './response-footer.component.html',
  styleUrls: ['./response-footer.component.scss'],
})
export class ResponseFooterComponent implements OnInit {
  @ViewChild('shareBlockElement', { static: false })
  shareBlockElement: ElementRef;
  @ViewChild('shareButtonElement', { static: false })
  shareButtonElement: ElementRef;

  @Input() response;
  currentUser: any;
  profileData: any;
  consultationId: any;
  responseId: any;
  showShareBlock = false;
  usingTemplate: boolean;
  responseQuestions: any;
  longTextResponses: any;
  shareBtnClicked: any;
  getSocialLink = getSocialLink;
  currentUrl: string;
  activeRoundNumber: any;
  responseRounds: any;
  loading = false;

  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private apollo: Apollo,
    private consultationService: ConsultationsService
  ) {
    this.consultationService.consultationId$
      .pipe(filter((i) => i !== null))
      .subscribe((consulationId: any) => {
        this.consultationId = consulationId;
      });
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href;
    this.getCurrentUser();
    this.subscribeProfileData();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    if (this.showShareBlock) {
      if (this.shareBtnClicked) {
        this.shareBtnClicked = false;
        return;
      }
      if (this.shareBlockElement.nativeElement.contains(targetElement)) {
        return;
      } else {
        this.showShareBlock = false;
      }
    }
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

  subscribeProfileData() {
    this.consultationService.consultationProfileData.subscribe((data) => {
      this.profileData = data;
      this.responseRounds = this.profileData.responseRounds;
      this.activeRoundNumber = this.getActiveRound(this.responseRounds);
    });
  }

  vote(direction, response) {
    if (!this.loading) {
      this.loading = true;
      if (response.votedAs) {
        if (response.votedAs.voteDirection === direction) {
          this.undoVote(response, direction);
        } else {
          this.undoVote(response, direction, true);
        }
      } else {
        this.createVote(response, direction);
      }
    }
  }

  undoVote(response, direction, createVote?) {
    if (response.id) {
      this.apollo
        .mutate({
          mutation: VoteDeleteQuery,
          variables: {
            consultationResponseId: response.id,
          },
          update: (store, { data: res }) => {
            const variables = { id: this.consultationId };
            const resp: any = store.readQuery({
              query: ConsultationProfileCurrentUser,
              variables,
            });
            if (res) {
              for (const value of resp['consultationProfile'].sharedResponses
                .edges) {
                if (value.node.id === response['id']) {
                  if (response.votedAs) {
                    value.node[
                      response.votedAs.voteDirection + 'VoteCount'
                    ] -= 1;
                  }
                  value.node.votedAs = null;
                  this.response = value;
                  break;
                }
              }
            }
            store.writeQuery({
              query: ConsultationProfileCurrentUser,
              variables,
              data: resp,
            });
          },
        })
        .subscribe(
          (res) => {
            if (createVote) {
              this.createVote(response, direction);
            } else {
              this.loading = false;
            }
          },
          (err) => {
            this.errorService.showErrorModal(err);
          }
        );
    }
  }

  createVote(response, direction) {
    const vote = {
      consultationResponseVote: {
        consultationResponseId: response.id,
        voteDirection: direction,
      },
    };
    this.apollo
      .mutate({
        mutation: VoteCreateQuery,
        variables: vote,
        update: (store, { data: res }) => {
          const variables = { id: this.consultationId };
          const resp: any = store.readQuery({
            query: ConsultationProfileCurrentUser,
            variables,
          });
          if (res) {
            for (const value of resp['consultationProfile'].sharedResponses
              .edges) {
              if (value.node.id === response['id']) {
                if (value.node[res.voteCreate.voteDirection + 'VoteCount']) {
                  value.node[res.voteCreate.voteDirection + 'VoteCount'] += 1;
                } else {
                  value.node[res.voteCreate.voteDirection + 'VoteCount'] = 1;
                }
                value.node.votedAs = res.voteCreate;
                this.response = value;
                break;
              }
            }
          }
          store.writeQuery({
            query: ConsultationProfileCurrentUser,
            variables,
            data: resp,
          });
        },
      })
      .subscribe(
        (data) => {
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.errorService.showErrorModal(err);
        }
      );
  }

  toggleShareBlock(id) {
    if (id) {
      this.responseId = id;
      this.showShareBlock = !this.showShareBlock;
    }
  }

  showCreateResponse() {
    if (
      this.consultationService.checkClosed(
        this.profileData ? this.profileData.responseDeadline : null
      ) === 'Closed' ||
      (this.profileData && this.profileData.respondedOn)
    ) {
      return false;
    }
    return true;
  }

  useThisResponse(response) {
    if (this.profileData.respondedOn) {
      return;
    }
    if (response) {
      this.usingTemplate = true;
      this.responseQuestions = this.consultationService.getQuestions(
        this.profileData,
        response.roundNumber
      );
      if (this.responseQuestions && this.responseQuestions.length) {
        this.longTextResponses = this.getLongTextAnswer(response);
        if (this.longTextResponses && this.longTextResponses.length) {
          const obj = {
            longTextResponses: this.longTextResponses,
            templateId: response.id,
          };
          this.consultationService.useThisResponseAnswer.next(obj);
        }
      } else {
        const obj = {
          responseText: response.responseText,
          templateId: response.id,
        };
        this.consultationService.useThisResponseText.next(obj);
      }
    }
  }

  getLongTextAnswer(response) {
    const responseAnswers = response && response.answers;
    const answers = [];
    if (responseAnswers && responseAnswers.length) {
      responseAnswers.map((item) => {
        if (this.responseQuestions && this.responseQuestions.length) {
          const responseQuestion = this.responseQuestions.find(
            (question) => +question.id === +item.question_id
          );
          if (responseQuestion.questionType === 'long_text') {
            answers.push({
              id: responseQuestion.id,
              questionType: responseQuestion.questionType,
              questionText: responseQuestion.questionText,
              answer: item.answer,
            });
          }
        }
      });
      return answers;
    }
    return;
  }

  getActiveRound(responseRounds) {
    if (responseRounds && responseRounds.length) {
      const activeRound = responseRounds.find((round) => round.active);
      if (!isObjectEmpty(activeRound)) {
        return activeRound.roundNumber;
      }
    }
    return;
  }
}

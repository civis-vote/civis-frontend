import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { isObjectEmpty } from '../functions/modular.functions';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {

    consultationId$ = new BehaviorSubject(null);
    activeTab = new BehaviorSubject (null);
    validateAnswers = new BehaviorSubject (null);
    consultationProfileData = new BehaviorSubject (null);
    useThisResponseAnswer = new BehaviorSubject(null);
    useThisResponseText = new BehaviorSubject(null);
    scrollToPublicResponse = new BehaviorSubject(null);
    submitResponseText = new BehaviorSubject(null);
    satisfactionRatingError = new BehaviorSubject(null);
    consultationStatus = new BehaviorSubject(null);
    submitResponseActiveRoundEnabled = new BehaviorSubject(null);

  constructor() {
  }

  getQuestions(profileData, roundNumber?) {
    if (profileData && profileData.responseRounds) {
      const responseRounds = profileData.responseRounds;
      if (responseRounds && responseRounds.length) {
        let activeRound;
        if (roundNumber) {
          activeRound = responseRounds.find((round) => +round.roundNumber === +roundNumber);
        } else {
          activeRound  = responseRounds.find((round) => round.active);
        }
        if (!isObjectEmpty(activeRound)) {
          const questions = activeRound.questions;
            if (questions.length) {
              return questions;
            }
        }
      }
    }
    return;
  }

  checkClosed(deadline) {
    if (deadline) {
      const today = moment();
      const lastDate = moment(deadline);
      const difference = lastDate.diff(today, 'days');
      if (difference <= 0) {
        return difference === 0 ? 'Last day to respond' : 'Closed';
      } else {
        return `Active`;
      }
    }
  }

}

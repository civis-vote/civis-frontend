import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {

    enableSubmitResponse =  new BehaviorSubject(null);
    consultationId$ = new BehaviorSubject(null);

  constructor() {
  }

}

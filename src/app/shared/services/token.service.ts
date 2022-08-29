import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  token: string;
  hasToken$ = new BehaviorSubject(null);

  constructor() {
    this.tokenHandler();
  }

  tokenHandler() {
    if (localStorage.getItem('civis-token')) {
      this.token = localStorage.getItem('civis-token');
      this.hasToken$.next(true);
    } else {
      this.token = '';
      this.hasToken$.next(false);
    }
  }

  storeToken(tokenObject: any) {
    const token = tokenObject.accessToken;
    localStorage.setItem('civis-token', token);
  }
}

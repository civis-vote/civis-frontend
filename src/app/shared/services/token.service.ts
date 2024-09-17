import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  token: string;
  expiresAt: any;
  hasToken$ = new BehaviorSubject(null);

  constructor() {
    this.tokenHandler();
  }

  tokenHandler() {
    this.checkTokenExpiration();
    if (localStorage.getItem('civis-token') && localStorage.getItem("civis-token_expires")) {
      this.token = localStorage.getItem('civis-token');
      this.expiresAt = localStorage.getItem("civis-token_expires");
      this.hasToken$.next(true);
    } else {
      this.token = '';
      this.expiresAt = '';
      this.hasToken$.next(false);
      localStorage.removeItem("civis-token");
      localStorage.removeItem("civis-token_expires");
    }
  }

  checkTokenExpiration() {
    const currentTime = new Date().toISOString();
    const tokenExpirationString = localStorage.getItem("civis-token_expires");

    const tokenExpirationTime = new Date(tokenExpirationString);

    // Validating the expiration date
    if (isNaN(tokenExpirationTime.getTime())) {
        localStorage.removeItem("civis-token");
        localStorage.removeItem("civis-token_expires");
        return;
    }

    if (currentTime > tokenExpirationTime.toISOString()) {
        localStorage.removeItem("civis-token");
        localStorage.removeItem("civis-token_expires");
    }
  }


  storeToken(tokenObject: any) {
    const token = tokenObject.accessToken;
    const expiresAt = tokenObject.expiresAt;
    localStorage.setItem('civis-token', token);
    localStorage.setItem("civis-token_expires", expiresAt);
  }
}

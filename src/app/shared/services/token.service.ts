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
    this.checkTokenExpiration();
  }

  tokenHandler() {
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
    const tokenExpirationTime = localStorage.getItem("civis-token_expires") ?? 0;
    
    if (currentTime > tokenExpirationTime) {
      localStorage.removeItem("civis-token");
      localStorage.removeItem("civis-token_expires");
    } 
    if(!tokenExpirationTime && localStorage.getItem('civis-token')) {
      localStorage.setItem("civis-token_expires", JSON.stringify(this.expiresAt));
    }
  }


  storeToken(tokenObject: any) {
    const token = tokenObject.accessToken;
    const expiresAt = tokenObject.expiresAt;
    localStorage.setItem('civis-token', token);
    localStorage.setItem("civis-token_expires", expiresAt);
  }
}

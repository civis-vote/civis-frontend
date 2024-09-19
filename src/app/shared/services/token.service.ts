import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: "root",
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
    if (
      localStorage.getItem("civis-token") &&
      localStorage.getItem("civis-token_expires")
    ) {
      this.token = localStorage.getItem("civis-token");
      this.expiresAt = localStorage.getItem("civis-token_expires");
      this.hasToken$.next(true);
    } else {
      this.token = "";
      this.expiresAt = "";
      this.hasToken$.next(false);
      localStorage.removeItem("civis-token");
      localStorage.removeItem("civis-token_expires");
    }
  }

  checkTokenExpiration() {
    const currentTime = new Date().toISOString();
    const tokenExpirationString = localStorage.getItem("civis-token_expires");

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

    const clearTokenData = () => {
      localStorage.removeItem("civis-token");
      localStorage.removeItem("civis-token_expires");
    };

    if (
      typeof tokenExpirationString !== "string" ||
      !isoDateRegex.test(tokenExpirationString)
    ) {
      clearTokenData();
      return;
    }

    const tokenExpirationTime = new Date(tokenExpirationString);

    if (
      isNaN(tokenExpirationTime.getTime()) ||
      currentTime > tokenExpirationTime.toISOString()
    ) {
      clearTokenData();
    }
  }

  storeToken(tokenObject: any) {
    const token = tokenObject.accessToken;
    const expiresAt = tokenObject.expiresAt;
    localStorage.setItem("civis-token", token);
    localStorage.setItem("civis-token_expires", expiresAt);
  }
}

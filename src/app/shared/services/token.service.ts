import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class TokenService {
  token: string;
  expiresAt: string | null;
  hasToken$ = new BehaviorSubject<boolean | null>(null);

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
    const tokenExpirationTime = localStorage.getItem("civis-token_expires") ?? new Date(0).toISOString();

    // logout user if token expired
    if (currentTime > tokenExpirationTime) {
      localStorage.removeItem("civis-token");
      localStorage.removeItem("civis-token_expires");
    }
  }

  storeToken(tokenObject: { accessToken: string; expiresAt?: string }): void {
    const token = tokenObject.accessToken;
    const expiresAt = tokenObject.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default to 24 hours
    localStorage.setItem("civis-token", token);
    localStorage.setItem("civis-token_expires", expiresAt);
  }
}

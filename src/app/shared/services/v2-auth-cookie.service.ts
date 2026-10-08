import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class V2AuthCookieService {
  private readonly domain = 'civis.vote';
  private readonly storagePrefix = environment.v2StoragePrefix;
  private readonly callbackCookieName = `${this.storagePrefix}-loginCallbackUrl`;
  private readonly tokenCookieName = `${this.storagePrefix}-token`;
  private readonly tokenExpiresCookieName = `${this.storagePrefix}-token_expires`;

  constructor(private cookieService: CookieService) {}

  getV2CallbackUrl() {
    if (!this.storagePrefix) {
      return null;
    }

    const callbackUrl = this.getCookieValue(this.callbackCookieName);
    const trustedOrigin = environment.v2FrontendUrl;

    if (!callbackUrl || !trustedOrigin) {
      return null;
    }

    try {
      const parsedCallbackUrl = new URL(callbackUrl);
      const trustedUrl = new URL(trustedOrigin);
      const isAllowedOrigin =
        parsedCallbackUrl.protocol === 'https:' &&
        parsedCallbackUrl.origin === trustedUrl.origin &&
        !parsedCallbackUrl.username &&
        !parsedCallbackUrl.password;

      if (!isAllowedOrigin) {
        return null;
      }

      return parsedCallbackUrl.toString();
    } catch (error) {
      return null;
    }
  }

  storeV2Token(tokenObject: { accessToken: string; expiresAt?: string }) {
    if (!this.storagePrefix) {
      return;
    }

    this.setCookie(this.tokenCookieName, tokenObject.accessToken);
    this.setCookie(this.tokenExpiresCookieName, tokenObject.expiresAt || '');
  }

  clearV2Callback() {
    if (!this.storagePrefix) {
      return;
    }

    this.removeCookie(this.callbackCookieName);
  }

  clearV2LoginCookies() {
    if (!this.storagePrefix) {
      return;
    }

    this.removeCookie(this.tokenCookieName);
    this.removeCookie(this.tokenExpiresCookieName);
    this.removeCookie(this.callbackCookieName);
  }

  private setCookie(name: string, value: string) {
    this.cookieService.set(
      name,
      value,
      undefined,
      '/',
      this.domain,
      true,
      'Lax'
    );
  }

  private removeCookie(name: string) {
    this.cookieService.set(
      name,
      '',
      new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
      '/',
      this.domain,
      true,
      'Lax'
    );
  }

  private getCookieValue(name: string) {
    try {
      return this.cookieService.get(name) || null;
    } catch (error) {
      return null;
    }
  }
}

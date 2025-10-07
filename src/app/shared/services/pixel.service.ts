import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class MetaPixelService {
  trackSubmitResponse() {
    const pathName = window.location.pathname;
    if (window.fbq && pathName === '/consultations/475/read') {
      window.fbq("track", "SubmitApplication");
    }
  }
}

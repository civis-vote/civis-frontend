import { DOCUMENT } from "@angular/common";
import { Injectable, Inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { WhiteLabelService } from "../services/white-label.service";
import {
  WHITE_LABEL_ALLOWED_PATHS,
  WHITE_LABEL_CONSULTATION_URL,
} from "../models/constants/constants";

@Injectable()
export class WhiteLabelGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly whiteLabelService: WhiteLabelService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    try {
      const path = this.document?.location?.pathname;
      const isWhiteLabelSubdomain =
        this.whiteLabelService.isWhiteLabelSubdomain();
      const isAllowed = WHITE_LABEL_ALLOWED_PATHS.some(function (allowedPath) {
        return path?.startsWith(allowedPath);
      });

      if (isWhiteLabelSubdomain && !isAllowed) {
        this.router.navigate([WHITE_LABEL_CONSULTATION_URL]);
        console.log("navigating")
        return false;
      }
      return true;
    } catch (error) {
      console.error("WhiteLabelGuard error:", error);
      this.router.navigate([""]);
      return true;
    }
  }
}

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
import { WHITE_LABEL_CONFIGS } from "../models/constants/constants";

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
      
      if (isWhiteLabelSubdomain) {
        const allowedPaths = this.whiteLabelService.getAllowedPathsForHostname();
        const isAllowed = allowedPaths.some(function (allowedPath) {
          return path?.startsWith(allowedPath);
        });

        if (!isAllowed) {
          const config = this.whiteLabelService.getCurrentWhiteLabelConfig();
          if (config) {
            this.router.navigate([config.consultationUrl]);
            console.log("navigating to", config.consultationUrl);
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("WhiteLabelGuard error:", error);
      this.router.navigate([""]);
      return true;
    }
  }
}

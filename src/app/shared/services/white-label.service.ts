import { Injectable, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  WHITE_LABEL_CONFIGS,
  WhiteLabelConfig,
} from "../models/constants/constants";

@Injectable({
  providedIn: "root",
})
export class WhiteLabelService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  private get currentHostname(): string {
    return this.document.location.hostname;
  }

  isWhiteLabelSubdomain(): boolean {
    return this.getCurrentWhiteLabelConfig() !== null;
  }

  getCurrentWhiteLabelConfig(): WhiteLabelConfig | null {
    return (
      WHITE_LABEL_CONFIGS.find((config) => config.hostname === this.currentHostname) || null
    );
  }

  getConsultationIdForHostname(): number | null {
    const config = this.getCurrentWhiteLabelConfig();
    return config ? config.consultationId : null;
  }

  getAllowedPathsForHostname(): string[] {
    const config = this.getCurrentWhiteLabelConfig();
    return config ? config.allowedPaths : [];
  }
}

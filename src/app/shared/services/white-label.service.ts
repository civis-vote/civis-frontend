import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WHITE_LABEL_CONFIGS, WhiteLabelConfig } from '../models/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class WhiteLabelService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  isWhiteLabelSubdomain(): boolean {
    const hostname = this.document.location.hostname;
    return WHITE_LABEL_CONFIGS.some(config => config.hostname === hostname);
  }

  getCurrentWhiteLabelConfig(): WhiteLabelConfig | null {
    const hostname = this.document.location.hostname;
    return WHITE_LABEL_CONFIGS.find(config => config.hostname === hostname) || null;
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

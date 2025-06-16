import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WHITE_LABEL_HOSTNAME } from '../models/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class WhiteLabelService {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  isWhiteLabelSubdomain(): boolean {
    const hostname = this.document.location.hostname;
    return hostname === WHITE_LABEL_HOSTNAME;
  }
}

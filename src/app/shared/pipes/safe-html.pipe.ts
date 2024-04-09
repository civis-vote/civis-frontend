import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser'; 
import createDOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: any, args?: any): any {
    const DOMPurify = createDOMPurify(window);
    const clean = DOMPurify.sanitize(value, { ADD_ATTR: ['style'] });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }

}

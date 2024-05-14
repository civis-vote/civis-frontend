import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-page-content-renderer',
  templateUrl: './page-content-renderer.component.html',
  styleUrls: ['./page-content-renderer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PageContentRendererComponent implements OnInit, AfterViewChecked {

  @Input() page: any;
  finalHtml = '';
  safePage: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.safePage = this.sanitizer.bypassSecurityTrustHtml(this.page);
  }

  ngAfterViewChecked() {
    this.addAttribute();
  }

  urlSanitizer(url: string) {
    return  url.includes('https:') ? this.sanitizer.bypassSecurityTrustResourceUrl(url) :
      this.sanitizer.bypassSecurityTrustResourceUrl(`https:${url}`);
  }

  getListItems(items: any, index: number, type: string) {
    if (!items) {
      return;
    }
    const content = this.getHtmlContent(items[index].content);
    const el = `<li>${content}</li>`;
    this.finalHtml += el;

    if (items[index + 1] && items[index + 1].componentType === type) {
      return null;
    } else {
      const result = this.finalHtml;
      this.finalHtml = '';
      return result;
    }
  }

  getHtmlContent(htmlString) {
    const divElement = document.createElement('div');
    divElement.innerHTML = htmlString;
    return divElement.textContent || divElement.innerText;
  }

  trackByFn(index, item) {
    return index;
  }

  addAttribute() {
    const elementCollections = document.getElementsByClassName('para');
    for (let i = 0; i < elementCollections.length; i++) {
      const anchorElements = elementCollections[0].getElementsByTagName('a');
      for (let j = 0; j < anchorElements.length; j++) {
        anchorElements[j].setAttribute('target', '_blank');
      }
    }
  }

}

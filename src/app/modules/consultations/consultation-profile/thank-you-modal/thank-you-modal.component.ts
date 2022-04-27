import { Component, OnInit, ViewChild, Output, EventEmitter, Input, Renderer2, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { getSocialLink } from '../socialLink.function';


@Component({
  selector: 'app-thank-you-modal',
  templateUrl: './thank-you-modal.component.html',
  styleUrls: ['./thank-you-modal.component.scss']
})
export class ThankYouModalComponent implements OnInit {
  @ViewChild('thankyouModal', { static: false }) thankyouModal: ModalDirective;
  @Output() closeThankYouModal: EventEmitter<any> = new EventEmitter();
  @Input() profileData;
  @Input() points;
  showThankYouModal = true;
  copyStatus: boolean;
  currentUrl: string;
  getSocialLink = getSocialLink;

  constructor(private renderer: Renderer2, private elRef: ElementRef) { }

  ngOnInit(): void {
    this.currentUrl = window.location.href;
  }

  closeModal() {
    this.thankyouModal.hide();
    this.closeThankYouModal.emit();
    this.showThankYouModal = false;
  }

  copyMessage(val: string) {
    const selBox = this.renderer.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    this.renderer.appendChild(this.elRef.nativeElement, selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    this.renderer.removeChild(this.elRef.nativeElement, selBox);
    this.copyStatus = true;
  }
}

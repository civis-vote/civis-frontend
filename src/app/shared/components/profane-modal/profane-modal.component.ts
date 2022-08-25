import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-profane-modal',
  templateUrl: './profane-modal.component.html',
  styleUrls: ['./profane-modal.component.scss']
})
export class ProfaneModalComponent implements OnInit {
  @Input() message = {
    title: null,
    msg: null
  };
  @Output() close = new EventEmitter<boolean>();
  @Input() showCancel = false;

  constructor() { 
    
  }

  ngOnInit() {
    console.log(this.showCancel);
  }

  selectOpt(opt: string) {
    opt === 'ok' ? this.close.emit(true) : this.close.emit(false);
  }

}

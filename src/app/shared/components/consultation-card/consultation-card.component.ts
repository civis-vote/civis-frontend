import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-consultation-card',
  templateUrl: './consultation-card.component.html',
  styleUrls: ['./consultation-card.component.scss']
})
export class ConsultationCardComponent implements OnInit {
  @Input() consultation: any;
  @Input() type: string;

  constructor() { }

  ngOnInit() {
  }

  getRemainigDays(deadline) {
    if (deadline) {
      if (this.consultation.status === 'expired') {
        return 'Closed';
      }
      let diff_in_days = this.getDifferenceInDays(deadline);
      diff_in_days = Math.floor(diff_in_days );
      if (diff_in_days <= 0) {
        return diff_in_days === 0 ? 'Last day to respond' : 'Closed';
      } else {
        return `${diff_in_days} Days Remaining`;
      }
    }
  }

  getDifferenceInDays(deadline) {
    if (deadline) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const lastDate = moment(deadline);
      const diff_in_time = lastDate.valueOf() - today.getTime();
      const diff_in_days = diff_in_time / (1000 * 3600 * 24);
      return diff_in_days;
    }
  }

}

import { Component, Input, OnInit } from "@angular/core";
import * as moment from "moment";

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

      let { diffInDays, isSameDay } = this.getDifferenceInDays(deadline);
      diffInDays = Math.floor(diffInDays);

      if (diffInDays < 0) {
        return 'Closed';
      } else if (diffInDays === 0) {
        if (isSameDay) {
          return 'Last day to respond';
        }

        return '1 Day Remaining';
      } else {
        return `${diffInDays} Days Remaining`;
      }
    }
  }

  getDifferenceInDays(deadline) {
    if (deadline) {
      const today = new Date();
      const lastDate = moment(deadline);
      const diff_in_time = lastDate.valueOf() - today.getTime();
      const diffInDays = diff_in_time / (1000 * 3600 * 24);
      const isSameDay = lastDate.isSame(moment(today), 'day');
      return { diffInDays, isSameDay };
    }
  }
}

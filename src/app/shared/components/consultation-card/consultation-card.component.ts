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

  getRemainingDays(): number | string {
    if (this.consultation?.responseDeadline) {
      if (this.consultation.status === 'expired') {
        return '';
      }

      let { diffInDays } = this.getDifferenceInDays(this.consultation?.responseDeadline);
      diffInDays = Math.floor(diffInDays);

      if (diffInDays > 0) {
        return diffInDays;
      }
    }
    return '';
  }

  getRemainingDaysText(): string {
    if (this.consultation.status === 'expired') {
      return 'Closed';
    }

    const { diffInDays, isSameDay } = this.getDifferenceInDays(this.consultation?.responseDeadline);

    if (diffInDays < 0) {
      return 'Closed';
    } else if (diffInDays === 0 && isSameDay) {
      return 'Last day to respond';
    } else if (diffInDays === 1) {
      return 'Day Remaining';
    } else if (diffInDays > 1) {
      return `Days Remaining`;
    }

    return '';
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

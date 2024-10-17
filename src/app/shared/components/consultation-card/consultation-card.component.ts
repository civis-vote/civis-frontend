import { Component, Input, OnInit } from "@angular/core";
import * as moment from "moment";
import { CookieService } from "ngx-cookie";
import { getTranslatedText } from "../../functions/modular.functions";

@Component({
  selector: 'app-consultation-card',
  templateUrl: './consultation-card.component.html',
  styleUrls: ['./consultation-card.component.scss']
})
export class ConsultationCardComponent implements OnInit {
  @Input() consultation: any;
  @Input() type: string;

  currentLanguage: string;

  constructor(private cookieService: CookieService) { }

  ngOnInit() {
    this.currentLanguage = this.cookieService.get("civisLang");
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

  getConsultationTitle() {
    return getTranslatedText(this.currentLanguage, {
      hindi: this.consultation?.hindiTitle,
      odia: this.consultation?.odiaTitle
    }, this.consultation?.title);
  }

  getMinistryName() {
    return getTranslatedText(this.currentLanguage, {
      hindi: this.consultation?.ministry?.hindiName,
      odia: this.consultation?.ministry?.odiaName
    }, this.consultation?.ministry?.name);
  }
}

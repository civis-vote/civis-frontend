import { Component, Input, OnInit } from "@angular/core";
import * as moment from "moment";
import { CookieService } from "ngx-cookie";
import { getTranslatedText, createLangObject } from "../../functions/modular.functions";

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

  getRemainingDays(): number | string {
    if (!this.consultation?.responseDeadline) return '';
    
    const { diffInDays, isSameDay } = this.getDifferenceInDays(this.consultation.responseDeadline);
    const roundedDays = Math.floor(diffInDays);
    
    if (roundedDays < 0) return '';
    if (roundedDays === 0 || isSameDay) return '';
    if (roundedDays === 1) return '2';
    
    return roundedDays;
  }
  
  getRemainingDaysText(): string {
    if (!this.consultation?.responseDeadline) return '';
    
    const { diffInDays, isSameDay } = this.getDifferenceInDays(this.consultation.responseDeadline);
    const roundedDays = Math.floor(diffInDays);
    
    if (roundedDays < 0) return 'Closed';
    if (roundedDays === 0 || isSameDay) return 'Last day to respond';
    if (roundedDays === 1) return 'days to respond';
    
    return 'days remaining';
  }

  getDifferenceInDays(deadline: string) {
    const deadlineDateLocal = moment(deadline).local().startOf('day');
    const todayLocal = moment().startOf('day');
    const diff_in_time = deadlineDateLocal.valueOf() - todayLocal.valueOf();
    const diffInDays = diff_in_time / (1000 * 3600 * 24);
    const isSameDay = deadlineDateLocal.isSame(todayLocal, 'day');
    return { diffInDays, isSameDay };
  }

  getConsultationTitle() {
    const textMap = createLangObject({ source: this.consultation, suffix: "Title" });
    return getTranslatedText(this.currentLanguage, textMap, this.consultation?.title);
  }

  getMinistryName() {
    const textMap = createLangObject({ source: this.consultation?.ministry, suffix: "Name" });
    return getTranslatedText(this.currentLanguage, textMap, this.consultation?.ministry?.name);
  }
}

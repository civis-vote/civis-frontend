import { Component, Input, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie";
import { getTranslatedText, createLangObject } from "../../functions/modular.functions";
import { ConsultationDeadlineService } from "../../services/consultation-deadline.service";

@Component({
  selector: 'app-consultation-card',
  templateUrl: './consultation-card.component.html',
  styleUrls: ['./consultation-card.component.scss']
})
export class ConsultationCardComponent implements OnInit {
  @Input() consultation: any;
  @Input() type: string;

  currentLanguage: string;

  constructor(
    private cookieService: CookieService,
    private consultationDeadlineService: ConsultationDeadlineService
  ) { }

  ngOnInit() {
    this.currentLanguage = this.cookieService.get("civisLang");
  }

  getRemainingDays(): number | string {
    return this.consultationDeadlineService.getRemainingDays(this.consultation?.responseDeadline);
  }
  
  getRemainingDaysText(): string {
    return this.consultationDeadlineService.getRemainingDaysText(this.consultation?.responseDeadline);
  }


  getConsultationTitle() {
    const textMap = createLangObject({ source: this.consultation, suffix: "Title" });
    return getTranslatedText(this.currentLanguage, textMap, this.consultation?.title);
  }

  getDepartmentName() {
    const textMap = createLangObject({ source: this.consultation?.department, suffix: "Name" });
    return getTranslatedText(this.currentLanguage, textMap, this.consultation?.department?.name);
  }
}
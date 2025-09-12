import { Component, OnInit, Input, HostListener, ViewChild, ElementRef, ViewEncapsulation,
  OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { getTranslatedText, createLangObject } from 'src/app/shared/functions/modular.functions';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileCardComponent implements OnInit, OnChanges {

  @ViewChild('shareOptionsElement', { static: false }) shareOptionsElement: ElementRef;
  @ViewChild('spreadButtonElement', { static: false }) spreadButtonElement: ElementRef;

  @Input() profile: any;
  @Input() summaryData: any;
  @Input() loading: boolean;

  currentUser: any;
  currentLanguage: any;
  showShareOptions: boolean;
  currentUrl = '';
  showConfirmEmailModal: boolean;
  consultationStatus: any;
  showResponseCreation: boolean;
  showGlossaryModal: boolean;


  constructor(
    private consultationsService: ConsultationsService,
    private userService: UserService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit() {
      this.currentUrl = window.location.href;
      this.currentLanguage = this.cookieService.get("civisLang");
      this.getCurrentUser();
      this.watchConsultationStatus();
      this.enableSubmitResponse();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'profile': {
            if (changes[propName].currentValue) {
              this.profile = changes[propName].currentValue;
            }
          }
        }
      }
    }
  }

  downloadReport() {
    window.print();
  }

  getCurrentUser() {
    this.userService.userLoaded$
    .subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  getProfileTitle() {
    const textMap = createLangObject({ source: this.profile, suffix: "Title" });
    return getTranslatedText(this.currentLanguage, textMap, this.profile?.title);
  }

  getMinistryName() {
    const textMap = createLangObject({ source: this.profile?.ministry, suffix: "Name" });
    return getTranslatedText(this.currentLanguage, textMap, this.profile?.ministry?.name);
  }

  enableSubmitResponse() {
    this.consultationsService.submitResponseActiveRoundEnabled
      .subscribe((value) => {
        if (value) {
          this.showResponseCreation = true;
        } else {
          this.showResponseCreation = false;
        }
      });
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    if (this.showShareOptions) {
      if (this.shareOptionsElement.nativeElement.contains(targetElement) ||
          this.spreadButtonElement.nativeElement.contains(targetElement)) {
            return;
      } else {
        this.showShareOptions = false;
      }
    }
  }

  getRemainingDays(): number | string {
    if (!this.profile?.responseDeadline) return '';
    
    const { diffInDays, isSameDay, diffInHours } = this.getDifferenceInDays(this.profile.responseDeadline);
    const roundedDays = Math.floor(diffInDays);
    
    if (roundedDays < 0 || diffInHours < 0) return '';
    if (roundedDays === 0 || isSameDay) {
      return Math.ceil(diffInHours);
    }
    
    const displayDays = roundedDays + 1;
    
    return displayDays;
  }
  
  getRemainingDaysText(): string {
    if (!this.profile?.responseDeadline) return '';
    
    const { diffInDays, isSameDay, diffInHours } = this.getDifferenceInDays(this.profile.responseDeadline);
    const roundedDays = Math.floor(diffInDays);
    
    if (roundedDays < 0 || diffInHours < 0) return 'Closed';
    if (roundedDays === 0 || isSameDay) {
      const hoursRemaining = Math.ceil(diffInHours);
      return hoursRemaining === 1 ? 'hour to respond' : 'hours to respond';
    }
    
    const displayDays = roundedDays + 1;
    
    if (displayDays === 2) {
      return 'days to respond';
    } else {
      return 'days remaining';
    }
  }

  convertDateFormat(date: string): string {
    if (date) {
      return moment(date).format('Do MMM YY');
    }
    return '';
  }

  formatPublicationDate(date: string): string {
    if (date) {
      return moment(date).format('MMMM D, YYYY');
    }
    return '';
  }

  getSecureUrl(url: string): string {
    if (url && !/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  }


  getDifferenceInDays(deadline: string) {
    const deadlineDate = moment(deadline).local();
    const currentTime = moment();
    const deadlineDateLocal = moment(deadline).local().startOf('day');
    const todayLocal = moment().startOf('day');
    
    const diff_in_time = deadlineDateLocal.valueOf() - todayLocal.valueOf();
    const diffInDays = diff_in_time / (1000 * 3600 * 24);
    const isSameDay = deadlineDateLocal.isSame(todayLocal, 'day');
    
    // Calculate hours difference for more precise timing
    const diffInHours = deadlineDate.diff(currentTime, 'hours', true);
    
    return { diffInDays, isSameDay, diffInHours };
  }

  getTwitterUrl(link) {
    let { diffInDays, isSameDay } = this.getDifferenceInDays(this.profile.responseDeadline);
      diffInDays = Math.floor(diffInDays );
    let remainingDays = '';

    if (diffInDays < 0) {
      remainingDays = '.'
    } else if (diffInDays === 0) {
      if (isSameDay) {
        remainingDays = ', last day for you to share your feedback too!';
      } else {
        diffInDays = 1
      }
    }

    if (diffInDays > 0) {
      remainingDays = `, only ${diffInDays} Days Remaining for you to share your feedback too!`;
    }

    const text  = `It’s your turn citizen! I shared my feedback on ` +
    `${this.profile.title}${remainingDays}`;
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
    return url;
  }

  getFbUrl(link) {
    if (link) {
      return `https://www.facebook.com/sharer/sharer.php?u=${link}`;
    }
    return null;
  }

  getWhatsappUrl(link) {
    if (link) {
      return `https://api.whatsapp.com/send?text=${link}`;
    }
    return null;
  }

  getLinkedinUrl(link) {
    if (link) {
      return `https://www.linkedin.com/shareArticle?mini=true&url=${link}`;
    }
    return null;
  }

  createCalendarEvent() {
    if (this.profile && this.profile.title && this.profile.responseDeadline) {
      let startDate: any =  new Date(this.profile.responseDeadline).setHours(0, 0, 0);
      startDate = new Date(startDate).toISOString();
      let endDate: any  = new Date(this.profile.responseDeadline).setHours(23, 59, 59);
      endDate = new Date(endDate).toISOString();
      const calendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=` +
      `Civis consultation response deadline- ${this.profile.title}` +
      `&dates=${startDate.split('-').join('').split(':').join('').split('.000').join('')}/` +
      `${endDate.split('-').join('').split(':').join('').split('.000').join('')}` +
      `&details=&sf=true&output=xml`;
      return calendarUrl;
    }
    return '';
  }

  stepNext(hasResponseSubmited) {
    if (!hasResponseSubmited || this.showResponseCreation) {
      const questions = this.consultationsService.getQuestions(this.profile);
      if (questions && questions.length) {
        this.consultationsService.validateAnswers.next(true);
        return;
      }
    }
    this.consultationsService.submitResponseText.next(true);
  }

  watchConsultationStatus() {
    this.consultationsService.consultationStatus.subscribe((status) => {
      this.consultationStatus = status;
    });
  }

  openDialog() {
    this.showGlossaryModal = true;
  }
}

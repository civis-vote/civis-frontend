import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';

@Component({
  selector: 'app-satisfaction-rating-selection',
  templateUrl: './satisfaction-rating-selection.component.html',
  styleUrls: ['./satisfaction-rating-selection.component.scss']
})
export class SatisfactionRatingSelectionComponent implements OnInit {
  @Output() selectSatisfaction: EventEmitter<any> = new EventEmitter(null);
  profileData: any;
  responseFeedback: any;
  showError: boolean;

  constructor(private consultationService: ConsultationsService) { }

  ngOnInit(): void {
    this.subscribeProfileData();
    this.validateRating();
  }

  subscribeProfileData() {
    this.consultationService.consultationProfileData.subscribe((data) => {
      this.profileData = data;
    });
  }

  setSatisfactoryRating(rating) {
    this.responseFeedback = rating;
    this.selectSatisfaction.emit(rating);
  }

  validateRating() {
    this.consultationService.satisfactionRatingError
    .subscribe((status) => {
      if (status) {
        this.showError = true;
        this.consultationService.satisfactionRatingError.next(false);
      }
    });
  }


}

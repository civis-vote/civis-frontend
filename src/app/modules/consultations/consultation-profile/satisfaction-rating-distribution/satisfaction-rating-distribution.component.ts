import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-satisfaction-rating-distribution',
  templateUrl: './satisfaction-rating-distribution.component.html',
  styleUrls: ['./satisfaction-rating-distribution.component.scss']
})
export class SatisfactionRatingDistributionComponent implements OnInit {
  @Input() satisfactionRatingDistribution: any;
  @Input() profileData: any;

  constructor() { }

  ngOnInit(): void {
  }

}

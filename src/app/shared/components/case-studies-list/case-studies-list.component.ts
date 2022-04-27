import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-case-studies-list',
  templateUrl: './case-studies-list.component.html',
  styleUrls: ['./case-studies-list.component.scss']
})
export class CaseStudiesListComponent implements OnInit {

  caseStudyList = [];
  activeCaseStudy = 0;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.makeCaseStudiesList();
    this.rotateFeature();
  }

  makeCaseStudiesList() {
    this.authService.getCaseStudiesList().subscribe((res: any) => {
      this.caseStudyList = res.data;
    });
  }

  rotateFeature() {
    interval(5000).subscribe(() => {
      if (this.activeCaseStudy === 2) {
        this.activeCaseStudy = 0;
      } else {
        this.activeCaseStudy++;
      }
    });
  }

}

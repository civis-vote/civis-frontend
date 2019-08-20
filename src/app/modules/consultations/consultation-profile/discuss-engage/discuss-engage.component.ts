import { Component, OnInit } from '@angular/core';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-discuss-engage',
  templateUrl: './discuss-engage.component.html',
  styleUrls: ['./discuss-engage.component.scss']
})
export class DiscussEngageComponent implements OnInit {

  consultationId: any;
  ssoAuth: any;

  constructor(
    private consultationService: ConsultationsService,
  ) {
    this.consultationService.consultationId$
    .pipe(
      filter(i => i !== null)
    )
    .subscribe((consulationId: any) => {
      this.consultationId = consulationId;
    });
  }

  ngOnInit() {
  }

}

import { CookieService } from 'ngx-cookie';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { UserService } from './shared/services/user.service';
import { filter, pairwise } from 'rxjs/operators';
import { StarterService } from './shared/services/starter.service';
import { Subscription } from 'rxjs';
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "civis";
  showCitySelection: boolean;
  paramsSubscription: Subscription;
  selectedLanguage = "en";
  confirmMessage = {};
  language = {
    id: null,
    name: null
  };
  isPrivate = false;
  confirmModalOpen = false;
  languages = [
    {
      id: "en",
      name: "English",
    },
    {
      id: "hi",
      name: "Hindi",
    },
  ];
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private starterService: StarterService,
    private _cookieService: CookieService
  ) {
    this.starterService.loadGoogleAnalyticsSupport();
    const currentLanguage = this._cookieService.get("civisLang");
    if (currentLanguage) {
      this.selectedLanguage = currentLanguage;
    }
  }

  ngOnInit() {
    this.router.events.pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
    .subscribe((evt) => {
      if (evt) {
        this.isPrivate = evt[0].urlAfterRedirects.includes('private');
        window.scrollTo(0, 0);
      }
    });
    this.checkCityPresent();
    this.checkLang();
  }

  translate(selected: boolean) {
    if (selected) {
      this.selectedLanguage = this.language.id;
      this.setLanguage();
    }
  }

  checkLang() {
    this.paramsSubscription = this.route.queryParams.subscribe((params) => {
      if (params.lang) {
        const langReq = params["lang"];
        this.language = this.languages.find(lang => lang.id === langReq);
        if (this.selectedLanguage !== langReq) {
          this.translate(true);
          // this.confirmModalOpen = true;
          // this.confirmMessage = {
          //   title: "Website Language",
          //   msg: `Are you sure you want to change the language to ${this.language.name}?`,
          // };
        } else {
          this.router.navigate([], { relativeTo: this.route });
        }
      }
    });
  }

  setLanguage() {
    this._cookieService.put("civisLang", this.selectedLanguage);
    window.location.reload();
    window.scrollTo(0, 0);
  }

  checkCityPresent() {
    this.userService.forceCitySelection$
      .pipe(filter((data) => data !== null))
      .subscribe((res) => {
        if (res) {
          this.showCitySelection = true;
        }
      });
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}

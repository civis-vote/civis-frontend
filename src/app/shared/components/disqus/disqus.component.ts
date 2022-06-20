import { Component, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GraphqlService } from 'src/app/graphql/graphql.service';
import { UserService } from '../../services/user.service';
import { ErrorService } from '../error-modal/error.service';

@Component({
  selector: 'app-disqus',
  templateUrl: './disqus.component.html',
  styleUrls: ['./disqus.component.scss']
})

export class DisqusComponent implements OnInit {

  @Input() public identifier: string;
  @Input() ssoAuth: any;
  shortname = 'civis-1';
  pubKey = '0OmI8FaGlf8KlhbV1J0EGtLHLtgZRVn93wP0OmQniIkti1Tl7LZqjIQWfJj2c687';

  dom: any;
  currentUser: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private http: HttpClient,
    private graphqlService: GraphqlService,
    private userService: UserService,
    private errorService: ErrorService
    ) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    this.userService.userLoaded$
    .subscribe(data => {
      if (data) {
        this.currentUser = this.userService.currentUser;
        this.getSSO();
      } else {
        this.setupDisqus();
      }
    });
  }

  getSSO() {
    this.http.post(`https://4o9df1qcg8.execute-api.ap-south-1.amazonaws.com/dev/disqus/sso`,
      {
        userId: this.currentUser.id,
        username: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        email: this.currentUser.email
      }
    )
    .subscribe((res: any) => {
      this.ssoAuth = res.auth;
      this.setupDisqus();
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }

  setupDisqus() {
    if ((<any>window).DISQUS === undefined) {
      this.addScriptTag();
    } else {
      this.reset();
    }
  }

  /**
   * Reset Disqus with new information.
   */
  reset() {
    (<any>window).DISQUS.reset({
      reload: true,
      config: this.getConfig()
    });
  }

  /**
   * Add the Disqus script to the document.
   */
  addScriptTag() {
    (<any>window).disqus_config = this.getConfig();

    const script = this.renderer.createElement('script');
    script.src = `https://civis-1.disqus.com/embed.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-timestamp', new Date().getTime().toString());
    this.renderer.appendChild(this.el.nativeElement, script);
  }

  /**
   * Get Disqus config
   */
  getConfig() {
    const _self = this;
    return function () {
      this.page.url = window.location.href;
      this.page.identifier = _self.identifier;
      this.page.remote_auth_s3 = _self.ssoAuth;
      this.page.api_key = _self.pubKey;
      this.language = 'en';
      // this.disqus_url = 'localhost:3200/consultations/5/discuss';
      // this.disqus_developer = 1;
    };
  }
}

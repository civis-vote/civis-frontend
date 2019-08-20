import { Component, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GraphqlService } from 'src/app/graphql/graphql.service';

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

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private http: HttpClient,
    private graphqlService: GraphqlService,
    ) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    this.getSSO();
  }

  getSSO() {
    this.http.post(`${this.graphqlService.appApiEndpoint}/disqus/sso`,
      {
        userId: 34, username: 'manzurtest', email: 'manzur+hardcoded@commutatus.com'
      }
    )
    .subscribe((res: any) => {
      this.ssoAuth = res.auth;
      if ((<any>window).DISQUS === undefined) {
        this.addScriptTag();
      } else {
        this.reset();
      }
    }, err => {
      console.log('error is: ', err);
    });
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
    script.src = `//${this.shortname}.disqus.com/embed.js`;
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
      this.page.identifier = 'test-123';
      this.page.remote_auth_s3 = _self.ssoAuth;
      this.page.api_key = _self.pubKey;
      this.language = 'en';
      this.disqus_url = 'http://127.0.0.1:3200/consultations/38/discuss/';
      this.disqus_developer = 1;
    };
  }
}

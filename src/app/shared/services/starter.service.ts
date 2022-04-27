import { Injectable, Renderer2, Inject, RendererFactory2 } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

declare const dataLayer;

// declare let window;
@Injectable()
export class StarterService {
  private renderer: Renderer2;

  constructor(
      private rendererFactory: RendererFactory2,
      private router: Router,
    @Inject(DOCUMENT) private document,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }


    loadGoogleAnalyticsSupport() {
        const GTMKey = environment.production ? 'GTM-5SHVQF8' : '';
        if (GTMKey) {
            const tagManagerScript = this.renderer.createElement('script');
            tagManagerScript.innerHTML =
                `(function (w, d, s, l, i) {
                    w[l] = w[l] || []; w[l].push({
                      'gtm.start':
                        new Date().getTime(), event: 'gtm.js'
                    }); var f = d.getElementsByTagName(s)[0],
                      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                        'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
                  })(window, document, 'script', 'dataLayer','${GTMKey}');
                `;
            this.renderer.appendChild(this.document.head, tagManagerScript);
            this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                  dataLayer.push({ event: 'pageview' });
                }
              });
        }
    }

}

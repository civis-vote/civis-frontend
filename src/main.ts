import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {hmrBootstrap} from './hmr';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

import './app/shared/icons';

if (environment.production) {
  enableProdMode();

  var googleTranslateScript = document.createElement('script');
  googleTranslateScript.setAttribute('src','//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&key=AIzaSyAdO8QLYV_rOrCcSs64KhGi4HuLi_HupWc')
  googleTranslateScript.setAttribute('type','text/javascript')
  document.getElementsByTagName("body")[0].appendChild(googleTranslateScript);


  var googleTranslateFunction = document.createElement('script');
  googleTranslateFunction.innerHTML = `function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element"
    );
  }`
  googleTranslateFunction.setAttribute('type','text/javascript')
  document.getElementsByTagName("body")[0].appendChild(googleTranslateFunction);
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);


Sentry.init({
  dsn: 'https://6c7282af128d432ba4a6bfd81296d164@o62908.ingest.sentry.io/5884402',
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['localhost', 'https://api.civis.vote'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});


if (environment.hmr) {
  if (module['hot']) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap().catch(err => console.log(err));
}

if (!environment.production) {
  var scriptFile = document.createElement('script');
  scriptFile.setAttribute("src","https://checkout.razorpay.com/v1/checkout.js");
  document.getElementsByTagName("body")[0].appendChild(scriptFile);

  var googleTranslateScript = document.createElement('script');
  googleTranslateScript.setAttribute('src','//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&key=AIzaSyAdO8QLYV_rOrCcSs64KhGi4HuLi_HupWc')
  googleTranslateScript.setAttribute('type','text/javascript')
  document.getElementsByTagName("body")[0].appendChild(googleTranslateScript);


  var googleTranslateFunction = document.createElement('script');
  googleTranslateFunction.innerHTML = `function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element"
    );
  }`
  googleTranslateFunction.setAttribute('type','text/javascript')
  document.getElementsByTagName("body")[0].appendChild(googleTranslateFunction);

}


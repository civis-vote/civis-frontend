import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GraphQLModule} from './graphql/graphql.module';
import {SharedComponentsModule} from './shared/components/shared-components.module';
import {SharedDirectivesModule} from './shared/directives/shared-directives.module';
import { RouterModule } from '@angular/router';
import { NavbarModule } from './modules/navbar/navbar.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileModule } from './modules/profile/profile.module';
import { LandingGuard } from './shared/guards/landing.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { PolicyModule } from './modules/policy/policy.module';
import { CitySelectionModalModule } from './shared/components/city-selection-modal/city-selection-modal.module';
import { ConfirmUserGuard } from './shared/guards/confirm-user.guard';
import { UnsubscribeUserGuard } from './shared/guards/unsubscribe-user.guard';
import { CookieModule, CookieService } from 'ngx-cookie';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { StarterService } from './shared/services/starter.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    SharedDirectivesModule,
    SharedComponentsModule,
    GraphQLModule,
    HttpClientModule,
    NavbarModule,
    ProfileModule,
    BrowserAnimationsModule,
    PolicyModule,
    CitySelectionModalModule,
    CookieModule.forRoot(),
    NgxWebstorageModule.forRoot()
  ],
  providers: [
    LandingGuard,
    AuthGuard,
    ConfirmUserGuard,
    UnsubscribeUserGuard,
    CookieService,
    StarterService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

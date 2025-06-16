import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { TermsOfServiceComponent } from './modules/policy/terms-of-service/terms-of-service.component';
import { ContentPolicyComponent } from './modules/policy/content-policy/content-policy.component';
import { PrivacyPolicyComponent } from './modules/policy/privacy-policy/privacy-policy.component';
import { ConfirmUserGuard } from './shared/guards/confirm-user.guard';
import { UnsubscribeUserGuard } from './shared/guards/unsubscribe-user.guard';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { environment } from '../environments/environment';
import { WhiteLabelGuard } from './shared/guards/white-label.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/landing/landing.module').then((m) => m.LandingModule),
    canActivate: [WhiteLabelGuard],
  },
  {
    //TODO: Donate feature, remove condition when ready fo deployment to production
    path: !environment.production ? 'donate' : '',
    loadChildren: () =>
      import('./modules/donate/donate.module').then((m) => m.DonateModule),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'auth-private',
    loadChildren: () =>
      import('./modules/auth-private/auth-private.module').then(
        (m) => m.AuthPrivateModule
      ),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'consultations',
    loadChildren: () =>
      import('./modules/consultations/consultations.module').then(
        (m) => m.ConsultationsModule
      ),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./modules/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard, WhiteLabelGuard],
  },
  {
    path: 'leader-board',
    loadChildren: () =>
      import('./modules/leader-board/leader-board.module').then(
        (m) => m.LeaderBoardModule
      ),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'how-civis-works',
    loadChildren: () =>
      import('./modules/how-civis-works/how-civis-works.module').then(
        (m) => m.HowCivisWorksModule
      ),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'about-us',
    loadChildren: () =>
      import('./modules/about-us/about-us.module').then((m) => m.AboutUsModule),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'terms',
    component: TermsOfServiceComponent,
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'content-policy',
    component: ContentPolicyComponent,
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'privacy',
    component: PrivacyPolicyComponent,
    canActivate: [WhiteLabelGuard],
  },
  {
    path: 'confirm',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
    canActivate: [ConfirmUserGuard, WhiteLabelGuard],
  },
  {
    path: 'emails/unsubscribe',
    loadChildren: () =>
      import('./modules/landing/landing.module').then((m) => m.LandingModule),
    canActivate: [UnsubscribeUserGuard, WhiteLabelGuard],
  },
  {
    path: 'citizens-report-on-mumbai-open-spaces',
    loadChildren: () =>
      import('./modules/mumbai-open-spaces/mumbai-open-spaces.module').then(
        (m) => m.MumbaiOpenSpacesModule
      ),
    canActivate: [WhiteLabelGuard],
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

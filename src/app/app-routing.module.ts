import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { LandingGuard } from './shared/guards/landing.guard';
import { AuthGuard } from './shared/guards/auth.guard';
import { TermsOfServiceComponent } from './modules/policy/terms-of-service/terms-of-service.component';
import { ContentPolicyComponent } from './modules/policy/content-policy/content-policy.component';
import { PrivacyPolicyComponent } from './modules/policy/privacy-policy/privacy-policy.component';
import { ConfirmUserGuard } from './shared/guards/confirm-user.guard';
import { UnsubscribeUserGuard } from './shared/guards/unsubscribe-user.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'donate',
    loadChildren: () => import('./modules/donate/donate.module').then(m => m.DonateModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'auth-private',
    loadChildren: () => import('./modules/auth-private/auth-private.module').then(m => m.AuthPrivateModule)
  },
  {
    path: 'consultations',
    loadChildren: () => import('./modules/consultations/consultations.module').then(m => m.ConsultationsModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'leader-board',
    loadChildren: () => import('./modules/leader-board/leader-board.module').then(m => m.LeaderBoardModule)
  },
  {
    path: 'how-civis-works',
    loadChildren: () => import('./modules/how-civis-works/how-civis-works.module').then(m => m.HowCivisWorksModule)
  },
  {
    path: 'about-us',
    loadChildren: () => import('./modules/about-us/about-us.module').then(m => m.AboutUsModule)
  },
  {
    path: 'terms',
    component: TermsOfServiceComponent
  },
  {
    path: 'content-policy',
    component: ContentPolicyComponent
  },
  {
    path: 'privacy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'confirm',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    canActivate: [ConfirmUserGuard]
  },
  {
    path: 'emails/unsubscribe',
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule),
    canActivate: [UnsubscribeUserGuard]
  },
  {
    path: 'citizens-report-on-mumbai-open-spaces',
    loadChildren: () => import('./modules/mumbai-open-spaces/mumbai-open-spaces.module').then(m => m.MumbaiOpenSpacesModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

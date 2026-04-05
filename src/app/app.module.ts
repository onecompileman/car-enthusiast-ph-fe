import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AngularFireModule } from '@angular/fire/compat';
import { AuthErrorInterceptor } from './core/interceptors/auth-error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { ApiBaseUrlInterceptor } from './core/interceptors/app-base-url.interceptor';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CoreModule,
    SharedModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CarouselModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    NgxSpinnerModule.forRoot({ type: 'square-loader' }),
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiBaseUrlInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

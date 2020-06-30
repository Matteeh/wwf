import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { UserService } from "./services/user.service";

const firebaseConfig = {
  apiKey: "AIzaSyCKti8GY-KRoqfBj0rxvSeZAr0xwY0cbEM",
  authDomain: "wwf-4d.firebaseapp.com",
  databaseURL: "https://wwf-4d.firebaseio.com",
  projectId: "wwf-4d",
  storageBucket: "wwf-4d.appspot.com",
  messagingSenderId: "794130457895",
  appId: "1:794130457895:web:b72ddf67453ccaa2b6b502",
  measurementId: "G-NF97THJE0R",
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UserService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

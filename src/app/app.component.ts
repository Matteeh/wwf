import { Component, OnInit } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./services/auth.service";
import { PresenceService } from "./services/presence.service";
import { Router } from "@angular/router";
import { UserService } from "./services/user.service";
import { switchMap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public labels = ["Xqc", "Lirik", "Sodapoppin", "Reckful", "Nmplol", "Jok3rd"];
  public users = [];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public auth: AuthService,
    private router: Router,
    public presence: PresenceService,
    public userService: UserService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.userService.getUsers().subscribe((users) => (this.users = users));
    this.auth.user.subscribe((user) => {
      if (user !== null) {
      } else {
        this.router.navigate(["/sign-in"]);
      }
    });
  }
}

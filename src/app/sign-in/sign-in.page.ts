import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
  styleUrls: ["./sign-in.page.scss"],
})
export class SignInPage implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    console.log("i run");
    this.auth.user.subscribe((user) => {
      console.log(user);
      if (user !== null) {
        this.router.navigate([`/${user.username}`]);
      }
    });
  }
}

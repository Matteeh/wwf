import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
  styleUrls: ["./sign-in.page.scss"],
})
export class SignInPage implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.user.pipe(first()).subscribe((user) => {
      console.log(user);
      if (user !== null) {
        this.router.navigate([`/${user.username}`]);
      }
    });
  }
}

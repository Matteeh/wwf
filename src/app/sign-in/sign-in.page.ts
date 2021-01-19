import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
  styleUrls: ["./sign-in.page.scss"],
})
export class SignInPage implements OnInit {
  constructor(
    public auth: AuthService,
    private router: Router,
    public alertController: AlertController
  ) {}

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      header: "Enter your Username",
      inputs: [
        {
          name: "username",
          type: "text",
          placeholder: "Username",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: "Ok",
          handler: ({ username }) => {
            this.auth.anonymousSignIn(username);
          },
        },
      ],
    });

    await alert.present();
  }

  ngOnInit() {
    this.auth.user.pipe(first()).subscribe((user) => {
      console.log(user);
      if (user !== null) {
        this.router.navigate([`/${user.username}`]);
      }
    });
  }
}

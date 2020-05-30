import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { auth } from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";

import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";

import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";

import { User } from "../models/user.model";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  // Use User interface here when its defined
  user: Observable<any>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        return user
          ? this.afs.doc<User>(`users/${user.uid}`).valueChanges()
          : of(null);
      })
    );
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credentials = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credentials.user);
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(["/"]);
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };

    return userRef.set(data, { merge: true });
  }
}

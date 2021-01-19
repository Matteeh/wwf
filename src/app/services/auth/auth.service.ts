import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { auth } from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";

import { AngularFireDatabase } from "@angular/fire/database";

import { Observable, of } from "rxjs";
import { switchMap, take } from "rxjs/operators";

import { User } from "../../models/user.model";
import { Channel } from "../../models/channel.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router
  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap((user) => {
        return user
          ? this.db.object(`users/${user.uid}`).valueChanges()
          : of(null);
      })
    );
  }

  getUser(): Promise<User> {
    return this.user.pipe(take(1)).toPromise();
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credentials: any = await this.afAuth.signInWithPopup(provider);
    const user = this.createUserFromGoogleData(credentials.user);
    this.updateUserData(user);
    this.updateChannelData(user);
    this.router.navigate([
      `/${credentials.user.displayName.replace(/\s/g, "")}`,
    ]);
  }

  async anonymousSignIn(username: string): Promise<any> {
    const credentials = await this.afAuth.signInAnonymously();
    const user = this.createAnonymousUser(credentials.user, username);
    console.log(user);
    this.updateAnonymousUserData(user);
    this.updateChannelData(user);
    this.router.navigate([`/${user.username}`]);
  }

  /**
   * Signs the user out
   */
  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(["/sign-in"]);
  }

  private updateUserData(user: User) {
    // Sets user data to firestore on login
    const userRef = this.db.object(`users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email,
      isReady: user.isReady || null,
      username: user.username.replace(/\s/g, ""),
      status: {
        status: user.status ? user.status.status : null,
        timestamp: user.status ? user.status.timestamp : null,
      },
    };
    // Set is destructive use update
    return userRef.update(data);
  }

  private createUserFromGoogleData(user: any): User {
    return {
      uid: user.uid,
      email: user.email,
      isReady: user.isReady || null,
      username: user.displayName.replace(/\s/g, ""),
      status: { status: null, timestamp: null },
    };
  }

  private createAnonymousUser(user: any, username) {
    return {
      uid: user.uid,
      isReady: user.isReady || null,
      username: `${username}-${user.uid}`,
      status: { status: null, timestamp: null },
    };
  }

  private updateAnonymousUserData(user: any) {
    // Sets user data to firestore on login
    const userRef = this.db.object(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      isReady: user.isReady || null,
      username: user.username.replace(/\s/g, ""),
      status: {
        status: user.status ? user.status.status : null,
        timestamp: user.status ? user.status.timestamp : null,
      },
    };
    // Set is destructive use update
    return userRef.update(data);
  }

  private updateChannelData(user) {
    // Sets user data to firestore on login
    const channelRef = this.db.object(`channels/${user.username}`);

    const data: Channel = {
      uid: user.username,
      hostIsOnline: null,
      status: { status: null, timestamp: null },
    };
    // Set is destructive use update
    return channelRef.update(data);
  }
}

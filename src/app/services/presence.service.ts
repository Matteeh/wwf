import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireAuth } from "@angular/fire/auth";
import { first, map, switchMap, tap } from "rxjs/operators";
import * as firebase from "firebase";
import { of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PresenceService {
  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {}

  initPresenceSubscriptions() {
    this.updateOnUser().subscribe();
    this.updateOnDisconnect().subscribe();
  }

  getPresence(uid: string) {
    return this.db.object(`users/${uid}`).valueChanges();
  }

  getUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  updateOnUser() {
    const connection = this.db
      .object(".info/connected")
      .valueChanges()
      .pipe(map((connected) => (connected ? "online" : "offline")));
    return this.afAuth.authState.pipe(
      switchMap((user) => (user ? connection : of("offline"))),
      tap((status) => this.setPresence(status))
    );
  }

  updateOnDisconnect() {
    return this.afAuth.authState.pipe(
      tap((user) => {
        if (user) {
          this.db
            .object(`users/${user.uid}`)
            .query.ref.onDisconnect()
            .update({
              status: {
                status: "offline",
                timestamp: this.timestamp,
              },
            });
        }
      })
    );
  }

  async setPresence(status: string) {
    const user = await this.getUser();
    console.log(user);
    if (user && user.uid) {
      return this.db
        .object(`users/${user.uid}`)
        .update({ status: { status, timestamp: this.timestamp } });
    }
  }
}

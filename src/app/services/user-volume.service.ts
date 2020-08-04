import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserVolume } from "../models/user.model";
import { AngularFireDatabase } from "@angular/fire/database";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UserVolumeService {
  constructor(private db: AngularFireDatabase) {}

  /**
   * Get user volume
   */
  getUserVolume(uid: string): Promise<any> {
    return this.db
      .object(`user_volumes/${uid}`)
      .valueChanges()
      .pipe(take(1))
      .toPromise();
  }

  /**
   * Set user volume
   */
  setChannelUser(uid: string, userVolume: UserVolume): Promise<void> {
    return this.db.object(`user_volumes/${uid}`).set(userVolume);
  }

  /**
   * Update user volume
   */
  updateChannelUser(uid: string, userVolume: UserVolume): Promise<void> {
    return this.db.object(`user_volumes/${uid}`).update(userVolume);
  }

  /**
   * Reomve user volume
   */
  removeChannelUser(uid: string): Promise<void> {
    return this.db.object(`user_volumes/${uid}`).remove();
  }
}

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserVolume } from "../models/user.model";
import { AngularFireDatabase } from "@angular/fire/database";
import { take, defaultIfEmpty } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UserVolumeService {
  constructor(private db: AngularFireDatabase) {}

  /**
   * Get user volume, if user has not volume saved return default volume
   */
  getUserVolume(uid: string): Promise<UserVolume> {
    return this.db
      .object(`user_volumes/${uid}`)
      .valueChanges()
      .pipe(take(1), defaultIfEmpty({ volume: 50, muted: false }))
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

import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";
import { ChannelUser } from "../models/channel.model";

@Injectable({
  providedIn: "root",
})
export class ChannelUsersService {
  constructor(private db: AngularFireDatabase) {}

  /**
   * Get channel users
   */
  getChannelUsers(uid: string): Observable<any> {
    return this.db.object(`channel_users/${uid}`).valueChanges();
  }

  /**
   * Set channel user
   */
  setChannelUser(uid: string, channelUser: ChannelUser): Promise<void> {
    return this.db.object(`channel_users/${uid}`).set(channelUser);
  }

  /**
   * Update channel user
   */
  updateChannelUser(uid: string, channelUser: ChannelUser): Promise<void> {
    return this.db.object(`channel_users/${uid}`).update(channelUser);
  }

  /**
   * Reomve channel user
   */
  removeChannelUser(uid: string, channelUser: ChannelUser): Promise<void> {
    const [channelUserUid] = Object.keys(channelUser);
    return this.db.object(`channel_users/${uid}/${channelUserUid}`).remove();
  }
}

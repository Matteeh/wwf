import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable, of } from "rxjs";
import { Channel } from "../models/channel.model";
import { map, first } from "rxjs/operators";
import { User } from "../models/user.model";
import * as firebase from "firebase";
import { removeUndefinedProperties } from "../../helpers/util";

@Injectable({
  providedIn: "root",
})
export class ChannelService {
  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  constructor(private db: AngularFireDatabase) {}

  getChannel(uid: string): Observable<any> {
    return this.db.object(`channels/${uid}`).valueChanges();
  }

  getChannelAsPromise(uid): Promise<any> {
    return this.db
      .object(`channels/${uid}`)
      .valueChanges()
      .pipe(first())
      .toPromise();
  }

  /**
   * Set channel data
   */
  setChannel(channel: Channel) {
    const channelRef = this.db.object(`channels/${channel.uid}`);
    const data: any = removeUndefinedProperties({ ...channel });
    data.video = removeUndefinedProperties(data.video);
    // console.log("data", data);
    return channelRef.set({ ...data });
  }

  addChannelUser(channel: Channel, userUid: string): Promise<any> {
    console.log(channel);
    const newChannel = { ...channel };
    let users = [];
    if (!newChannel.users || !newChannel.users.length) {
      users = [userUid];
    } else if (this.arrayContainsUser(userUid, newChannel.users)) {
      return Promise.resolve();
    } else {
      users = [...newChannel.users, userUid];
    }
    newChannel.users = users;
    this.setChannel(newChannel);
  }

  async removeChannelUser(channel: Channel, user: User) {
    const newChannel = { ...channel };
    let users = [];
    if (!newChannel.users || !newChannel.users.length) {
      users = [];
    } else if (!this.arrayContainsUser(user.uid, newChannel.users)) {
      return Promise.resolve();
    } else {
      users = newChannel.users.filter((uid: string) => uid === user.uid);
    }
    newChannel.users = users;
    return await this.setChannel(newChannel);
  }

  updateChannelVideoId(channel, videoId) {
    console.log("i run");
    const channelRef = this.db.object(`channels/${channel.uid}`);
    return channelRef.update({ video: { videoId: videoId } });
  }

  // Play // Pause // Stop
  updateChannelPlayStatus(channelUid: string, status: string) {
    const channelRef = this.db.object(`channels/${channelUid}`);
    return channelRef.update({ video: { videoStatus: status } });
  }

  /**
   * Check if array already contains current user
   */
  private arrayContainsUser(userUid: string, users: string[]): boolean {
    return users.some((uid) => uid === userUid);
  }
}

/*

  updateChannel(channel: Channel, user: User) {
    // Sets user data to firestore on login
    const channelRef = this.db.object(`channels/${channel.uid}`);
    const users = channel.users ? [...channel.users, user] : [user];
    const data: Channel = {
      uid: channel.uid,
      isPlaying: channel.isPlaying,
      users,
      canPlay: channel.canPlay,
      videoId: "",
      status: { status: null, timestamp: null },
      // Very poorly designed update asap
      hostIsOnline: users
        ? this.lookForHostInChannelUsers(users)
          ? true
          : false
        : false,
    };

    console.log(data, "channel data");

    // Set is destructive use update
    return channelRef.update(data);
  }*/

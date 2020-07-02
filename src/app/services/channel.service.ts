import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";
import { Channel } from "../models/channel.model";
import { map, first } from "rxjs/operators";
import { User } from "../models/user.model";
import * as firebase from "firebase";

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

  getChannelUsers(uid) {
    return this.db
      .list("channels", (channels) => channels.orderByChild("uid").equalTo(uid))
      .valueChanges()
      .pipe(
        first(),
        map((channel: Channel[]) => (channel.length ? channel[0].users : []))
      );
  }

  /**
   * Updates channel with new info
   */
  updateChannel(channelUid: string) {
    const channelRef = this.db.object(`channels/${channelUid}`);
    // return channelRef.update();
  }

  addChannelUser(channelUid: string, currentUsers: string[], userUid: string) {
    const channelRef = this.db.object(`channels/${channelUid}`);
    let users = [];
    if (!currentUsers || !currentUsers.length) {
      users = [userUid];
    } else if (this.arrayContainsUser(userUid, currentUsers)) {
      return Promise.resolve();
    } else {
      users = [...currentUsers, userUid];
    }

    return channelRef.update({ users });
  }

  removeChannelUser(channelUid: string, currentUsers: string[], user: User) {
    console.log("i run remove channel user");
    const channelRef = this.db.object(`channels/${channelUid}`);
    let users = [];
    if (!currentUsers || !currentUsers.length) {
      users = [];
    } else if (!this.arrayContainsUser(user.uid, currentUsers)) {
      return Promise.resolve();
    } else {
      users = currentUsers.filter((uid: string) => uid === user.uid);
    }

    return channelRef.update({ users });
  }

  updateChannelVideoId(channel, videoId) {
    const channelRef = this.db.object(`channels/${channel.uid}`);
    return channelRef.update({ videoId });
  }

  // Play // Pause // Stop
  updateChannelPlayStatus(channelUid: string, status: string) {
    const channelRef = this.db.object(`channels/${channelUid}`);
    return channelRef.update({ status: { status, timestamp: this.timestamp } });
  }

  private lookForHostInChannelUsers(users: any[]) {
    console.log(
      users.find((users) => users.isHost === true),
      "lookforhost"
    );
    return users.find((users) => users.isHost === true);
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

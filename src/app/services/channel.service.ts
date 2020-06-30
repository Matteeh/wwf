import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";
import { Channel } from "../models/channel.model";
import { map } from "rxjs/operators";
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

  getChannelByUsername(username): Observable<any> {
    return this.db
      .list("channels", (channels) =>
        channels.orderByChild("uid").equalTo(username)
      )
      .valueChanges();
  }

  updateChannelUsers(channel: Channel, user: User) {
    const channelRef = this.db.object(`channels/${channel.uid}`);
    const users = channel.users ? [...channel.users, user] : [user];
    return channelRef.update({ users });
  }

  updateChannelVideoId(channel, videoId) {
    const channelRef = this.db.object(`channels/${channel.uid}`);
    return channelRef.update({ videoId });
  }

  // Play // Pause // Stop
  updateChannelPlayStatus(channel: Channel, status: string) {
    const channelRef = this.db.object(`channels/${channel.uid}`);
    return channelRef.update({ status: { status, timestamp: this.timestamp } });
  }

  watchChannelPlayStatus(channelUid: string) {
    return this.db.object(`channels/${channelUid}`).valueChanges();
  }

  private lookForHostInChannelUsers(users: any[]) {
    console.log(
      users.find((users) => users.isHost === true),
      "lookforhost"
    );
    return users.find((users) => users.isHost === true);
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

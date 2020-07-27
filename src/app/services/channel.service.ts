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

import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";
import * as firebase from "firebase";
import { ChannelVideo } from "../models/channel.model";
import { removeUndefinedProperties } from "src/helpers/util";

@Injectable({
  providedIn: "root",
})
export class ChannelVideoService {
  private readonly CHANNEL_VIDEO = "channel_video/";
  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  constructor(private db: AngularFireDatabase) {}

  getChannelVideo(uid: string): Observable<any> {
    return this.db.object(`${this.CHANNEL_VIDEO}${uid}`).valueChanges();
  }

  /**
   * Set channel data
   */
  setChannelVideo(uid: string, channelVideo: ChannelVideo): Promise<void> {
    return this.db
      .object(`${this.CHANNEL_VIDEO}${uid}`)
      .set({ ...channelVideo });
  }

  /**
   * Update channel data
   */
  updateChannelVideo(uid: string, channelVideo: ChannelVideo): Promise<void> {
    return this.db
      .object(`${this.CHANNEL_VIDEO}${uid}`)
      .update({ ...channelVideo });
  }

  /**
   * Update channel data
   */
  updateChannelVideoTime(uid: string, channelVideoTime: number): Promise<void> {
    return this.db
      .object(`${this.CHANNEL_VIDEO}${uid}`)
      .update({ currentTime: channelVideoTime });
  }

  updateChannelVideoId(uid: string, videoId): Promise<void> {
    return this.db.object(`${this.CHANNEL_VIDEO}${uid}`).update({ videoId });
  }

  updateChannelPlayStatus(uid: string, status: string): Promise<void> {
    return this.db
      .object(`${this.CHANNEL_VIDEO}${uid}`)
      .update({ videoStatus: status });
  }
}

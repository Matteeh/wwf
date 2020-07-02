import { User } from "./user.model";
import { Status } from "./status.model";

export interface Channel {
  uid: string; // Username
  hostIsOnline: boolean;
  // User uids
  users: string[];
  status: Status;
  video: {
    videoId?: string;
    //playing,paused,stopped
    videoStatus?: string;
    // Users are ready to play video
    canPlay?: boolean;
    // isPlaying: boolean;
    //timestamp
    started?: string;
    duration?: number;
    currentTime?: number;
  };
}

import { User } from "./user.model";
import { Status } from "./status.model";

export interface Channel {
  uid: string; // Username
  hostIsOnline: boolean;
  status: Status;
}

export interface ChannelUser {
  [key: string]: true;
}

export interface ChannelVideo {
  videoId?: string;
  videoStatus?: VideoStatus;
  canPlay?: boolean;
  started?: string;
  duration?: number;
  currentTime?: number;
  isPlaying?: boolean;
}

export enum VideoStatus {
  PLAY = "PLAY",
  CUE = "CUE",
  PAUSE = "PAUSE",
  STOP = "STOP",
}

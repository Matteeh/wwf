import { User } from "./user.model";
import { Status } from "./status.model";

export interface Channel {
  uid: string; // Username
  hostIsOnline: boolean;
  users: User[];
  canPlay: boolean;
  isPlaying: boolean;
  videoId: string;
  status: Status;
}

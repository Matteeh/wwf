import { Status } from "./status.model";

export interface User {
  uid: string;
  email: string;
  username: string;
  isReady: boolean;
  status: Status;
}

export interface UserVolume {
  volume: number;
  muted: boolean;
}

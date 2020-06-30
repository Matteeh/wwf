import { Status } from "./status.model";

export interface User {
  uid: string;
  email: string;
  username: string;
  isHost: boolean;
  isReady: boolean;
  status: Status;
}

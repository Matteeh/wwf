import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private db: AngularFireDatabase) {}

  getUserByUsername(username) {
    return this.db
      .list("users", (users) =>
        users.orderByChild("username").equalTo(username)
      )
      .valueChanges();
  }

  getUsers(): Observable<any> {
    return this.db.list("users").valueChanges();
  }

  getUserStatus(uid: string): Observable<any> {
    console.log(uid);
    return this.db.list(`status/${uid}`).valueChanges();
  }
}

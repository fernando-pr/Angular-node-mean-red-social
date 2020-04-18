import { Component, OnInit, DoCheck } from '@angular/core';
import { UserService } from "./services/user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})

export class AppComponent implements DoCheck, OnInit {
  public title:string;
  public identity;
  constructor(
    private _userService:UserService
  ){
    this.title = "Friendly";
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
  }

  ngDoCheck() {
    this.identity = this._userService.getIdentity();
  }
}

import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from "../../models/user";
import { Follow } from "../../models/follow";
import { UserService } from "./../../services/user.service";
import { GLOBAL } from '../../services/global';
import { FollowService } from 'src/app/services/follow.service';



@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  providers: [UserService, FollowService]
})
export class UsersComponent implements OnInit {
  public title: string;
  public identity;
  public url :string;
  public token;
  public page;
  public next_page;
  public prev_page;
  public total;
  public pages;
  public users: User[];
  public status :string;
  public follows;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService : UserService,
    private _followService : FollowService
  ) {
    this.title = 'Gente';
    this.url = GLOBAL.url;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(){
    console.log("users.service ha sido cargado");
    this.actualPage();

  }


  actualPage() {
    this._route.params.subscribe((params) => {

      let page = +params['page'];
      this.page = page;
      if(!params['page']){
        page = 1;
      }
      if(!page){
        page = 1;
      } else {
        this.next_page = page + 1;
        this.prev_page = (page - 1 <= 0) ? 1 : page - 1;
      }

      //Devolver listado de usuarios
      this.getUsers(page);
    });
  }


  getUsers(page) {
    this._userService.getUsers(page).subscribe(
      response => {
        if(!response.users) {
          this.status = 'error';
        } else {
          this.total = response.total;
          this.users = response.users;
          this.pages = response.pages;
          this.follows = response.users_following;

          if (page > this.pages) {
            this._router.navigate(['/gente', 1]);
          }
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null){
          this.status = 'error';
        }
      }
    );
  }

  public followUserOver;

  mouseEnter(user_id){
    this.followUserOver = user_id;
  }

  mouseLeave(user_id) {
  this.followUserOver = 0;
  }


  followUser(followed){
    var follow = new Follow('', this.identity._id, followed);
   	this._followService.addFollow(this.token, follow).subscribe(
			response => {

				if(!response.followStored){
					this.status = 'error';
				}else{
					this.status = 'success';
					this.follows.push(followed);
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.status = 'error';
				}
			}
			);
  }

}

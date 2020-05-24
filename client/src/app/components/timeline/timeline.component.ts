import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { UserService } from "./../../services/user.service";
import { GLOBAL } from 'src/app/services/global';
import { PublicationService } from "./../../services/publication.service";
import { Publication } from "./../../models/publication";

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  providers: [UserService, PublicationService]
})

export class TimelineComponent implements OnInit {

  public identity;
  public token;
  public title: string;
  public url:string;
  public status:string;
  public page;
  public total;
  public pages;
  public publications: Publication[];
  public itemsPerPage;

  constructor(
    private _route:ActivatedRoute,
    private _router:Router,
    private _userService :UserService,
    private _publicationService : PublicationService
  ){
    this.title = 'Timeline';
		this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    this.page = 1;
  }
  ngOnInit(){
    console.log("timeline cargado");
    this.getPublications(this.page);
  }

  getPublications(page, adding = false){
    this._publicationService.getPublications(this.token, page).subscribe(
      response => {
        if(response.publications) {
          this.pages = response.pages;
          this.total = response.total_items;
          this.itemsPerPage = response.items_per_page;

          if(!adding) {
            this.publications = response.publications;
          } else {
            var arrayA =  this.publications;
            var arrayB = response.publications;
            this.publications = arrayA.concat(arrayB);

            $("html, body").animate({
              scrollTop: $('body').prop("scrollHeight")
            }, 1000);
          }

          if(page > this.page) {
           // this._router.navigate(['/home']);
          }

        } else {
          this.status = 'error';
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

  public noMore = false;
  viewMore(){
    this.page += 1;
    if(this.page == (this.pages)){
      this.noMore = true;
    }
    this.getPublications(this.page, true);
  }
}

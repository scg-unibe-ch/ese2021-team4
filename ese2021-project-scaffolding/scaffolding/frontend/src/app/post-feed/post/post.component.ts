import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) {

    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params['type'])
    });  }

  ngOnInit(): void {
  }

}

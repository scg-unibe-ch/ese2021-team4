import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  timeout: number = 2500;
  index : number = 0;
  words : String[] = [ "favourite spots", "secret tips", "magic moments", "traditional restaurants", "lovely views", "tasty brunch", "fancy bars", "cozy coffeeshops"];
  current = this.words[this.index];
  constructor() {}

  //on change animate vo unger

  ngOnInit(): void {
    this.index = 0;
    setInterval(() => {
      this.setSlogan();
    }, this.timeout);
  }

  setSlogan(): void {
    this.index = ((this.index + 1) % this.words.length);
    this.current = this.words[this.index];
  }

}

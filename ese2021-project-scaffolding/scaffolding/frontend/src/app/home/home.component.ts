import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  timeout: number = 4000;
  index : number = 0;
  words : String[] = [ "favourite spots", "secret tips", "magic moments", "traditional restaurants", "lovely views", "tasty brunch", "fancy bars", "cozy coffeeshops"];
  current = this.words[this.index];
  constructor() {}

  //on change animate vo unger

  ngOnInit(): void {
    this.index = 0;
    this.changeSlogan();


    //solution if you only want the change on init
    /*
    this.words.forEach(word => {
      setTimeout( () => {
        this.current = word;
      }, 5000);
    })*/


  }

  changeSlogan(): void {
    let i= this.timeout;
    let repetitions=0;
    while (repetitions < 100){
      this.setPause(i);
      repetitions++;
      i = i + this.timeout;
    }
  }

  setSlogan(): void {
    this.index = ((this.index + 1) % this.words.length);
    this.current = this.words[this.index];
  }

  setPause(ms: number){
    setTimeout(() => {
      this.setSlogan();
    }, ms);
  }

}

import {Component, Input, Output} from '@angular/core';

declare function require(path: string);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @Input() public sign_in: boolean;
  public state: any;
  public FIRST: any = null;
  public REGISTER: any = true;
  public LOGIN: any = false;
  public HIDDEN: any = false;
  imageSrc = null;

  constructor() {
    this.imageSrc = require('./../assets/logo.png');
    this.setFirst();
  }

  setRegister() {
    this.state = this.REGISTER;
  }

  setLogin() {
    this.state = this.LOGIN;
  }

  setFirst() {
    this.state = this.FIRST;
  }

  setHidden(value) {
    this.HIDDEN = value;
  }

}

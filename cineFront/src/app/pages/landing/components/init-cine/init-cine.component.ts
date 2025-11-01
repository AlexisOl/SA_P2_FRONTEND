import { Component } from '@angular/core';
import {ButtonDirective, ButtonModule} from "primeng/button";
import {NgOptimizedImage} from "@angular/common";
import {Ripple, RippleModule} from "primeng/ripple";

@Component({
  selector: 'app-init-cine',
    imports: [
      ButtonModule, RippleModule
    ],
  templateUrl: './init-cine.component.html',
  styleUrl: './init-cine.component.scss'
})
export class InitCineComponent {

}

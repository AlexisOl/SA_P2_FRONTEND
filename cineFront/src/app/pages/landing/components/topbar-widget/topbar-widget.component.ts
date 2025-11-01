import { Component } from '@angular/core';
import {AppFloatingConfigurator} from "@/layout/component/app.floatingconfigurator";
import {ButtonDirective, ButtonModule} from "primeng/button";
import {Ripple, RippleModule} from "primeng/ripple";
import {Router, RouterLink, RouterModule} from "@angular/router";
import {StyleClass, StyleClassModule} from "primeng/styleclass";

@Component({
  selector: 'app-topbar-widget',
    imports: [
        AppFloatingConfigurator,
        ButtonDirective,
        Ripple,
        RouterLink,
        StyleClass,
      RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator
    ],
  templateUrl: './topbar-widget.component.html',
  styleUrl: './topbar-widget.component.scss'
})
export class TopbarWidgetComponent {

  router: Router;

  constructor(private routers: Router) {
    this.router = routers;
  }

}

import { Component } from '@angular/core';
import {FeaturesWidget} from "@/pages/landing/components/featureswidget";
import {FooterWidget} from "@/pages/landing/components/footerwidget";
import {HighlightsWidget} from "@/pages/landing/components/highlightswidget";
import {InitCineComponent} from "@/pages/landing/components/init-cine/init-cine.component";
import {PricingWidget} from "@/pages/landing/components/pricingwidget";
import {TopbarWidget} from "@/pages/landing/components/topbarwidget.component";
import {RouterModule} from '@angular/router';
import {RippleModule} from 'primeng/ripple';
import {StyleClassModule} from 'primeng/styleclass';
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {TopbarWidgetComponent} from '@/pages/landing/components/topbar-widget/topbar-widget.component';

@Component({
  selector: 'app-landing-page',
  imports: [
    FeaturesWidget,
    FooterWidget,
    HighlightsWidget,
    InitCineComponent,
    PricingWidget,
    RouterModule, FeaturesWidget, HighlightsWidget, PricingWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule, InitCineComponent, TopbarWidgetComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}

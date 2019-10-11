import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { TabindexService } from '../serwisy/tabindex.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';

@Component({
  selector: 'ns-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  moduleId: module.id,
})
export class InfoComponent implements OnInit {

    constructor(private router: RouterExtensions, private indexService: TabindexService, private page: Page) { }

    ngOnInit() {
      this.page.actionBarHidden = true;
    }

    onSwipe(args: SwipeGestureEventData) {
      if (args.direction === 1) {
          this.zamknij();
      }
  }
      zamknij()
      {
          this.router.backToPreviousPage();
      }
  }


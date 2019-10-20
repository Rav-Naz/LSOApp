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
      zamknij()
      {
          this.indexService.nowyOutlet(2,"ustawieniaM")
          this.indexService.nowyOutlet(6,"ustawieniaO")
          this.router.back();
      }
  }


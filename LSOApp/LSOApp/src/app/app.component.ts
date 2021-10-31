import { WyborModalComponent } from './shared/modale/wybor-modal/wybor-modal.component';
import { PotwierdzenieModalComponent } from '../app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { Component, ViewContainerRef, ViewChild, OnInit, AfterViewInit } from "@angular/core";
import { firebase } from '@nativescript/firebase';
import { UiService } from "./serwisy/ui.service";
// const firebase = require('nativescript-plugin-firebase');
import * as platform from '@nativescript/core/platform';
import { HttpService } from "./serwisy/http.service";
import { TabindexService } from "./serwisy/tabindex.service";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, AfterViewInit {
    constructor(private vcRef: ViewContainerRef, private uiService: UiService, private http: HttpService, private tabService: TabindexService) {}
    @ViewChild('confirm', {static: false}) confirm: PotwierdzenieModalComponent;
    @ViewChild('choose', {static: false}) choose: WyborModalComponent;

    ngOnInit() {
        this.uiService.setRootVCRef(this.vcRef);

        firebase.init({
            showNotifications: true,
            showNotificationsWhenInForeground: true,


            onMessageReceivedCallback: (message) => {
              if(message.foreground)
              {
                if(this.tabService.opiekun === true)
                {
                    if(message.body === "Od: Administrator")
                    {
                        this.uiService.showFeedback("succes", "Dostałeś nową wiadomość od Administratora!", 3)
                    }
                }
                else if(this.tabService.opiekun === false)
                {
                    if(message.body === "Od: Administrator")
                    {
                        this.uiService.showFeedback("succes", "Dostałeś nową wiadomość od Administratora!", 3)
                    }
                    else if(message.body === "Od: Opiekun")
                    {
                        this.uiService.showFeedback("succes", "Dostałeś nową wiadomość od Opiekuna!", 3)
                    }
                    else if(message.title === "Przypomnienie o dyżurze")
                    {
                        this.uiService.showFeedback("succes", "Zbliża się Twój dyżur!", 3)
                    }
                }
              }
            }
          })
            .then(() => {
                firebase.getCurrentPushToken().then((res) => {
                    this.http.nadaj_wlasciwosci_urzadzenia(platform.isIOS ? "IOS" : platform.isAndroid ? "Android" : "Inny", res)
                })
            })
            .catch(error => {
                firebase.getCurrentPushToken().then((res) => {
                this.http.nadaj_wlasciwosci_urzadzenia(platform.isIOS ? "IOS" : platform.isAndroid ? "Android" : "Inny", res)
              })
            });
    }

    ngAfterViewInit(): void {
        this.uiService.setConfirmComponent(this.confirm);
        this.uiService.setChooseComponent(this.choose);
      }
}

import { Component, ViewContainerRef } from "@angular/core";
import { UiService } from "./serwisy/ui.service";
import * as firebase from 'nativescript-plugin-firebase';
import * as platform from 'tns-core-modules/platform'
import { HttpService } from "./serwisy/http.service";
import { TabindexService } from "./serwisy/tabindex.service";
import { WiadomosciService } from "./serwisy/wiadomosci.service";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private vcRef: ViewContainerRef, private uiService: UiService, private http: HttpService, private tabService: TabindexService, private wiadosciService: WiadomosciService) {}

    ngOnInit() {
        this.uiService.setRootVCRef(this.vcRef);
        firebase.init({
            showNotifications: true,
            showNotificationsWhenInForeground: true,


            onMessageReceivedCallback: (message: firebase.Message) => {
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
}

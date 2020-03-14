import { Component, ViewContainerRef } from "@angular/core";
import { UiService } from "./serwisy/ui.service";
import { Page } from "tns-core-modules/ui/page/page";
import * as firebase from 'nativescript-plugin-firebase';
import * as platform from 'tns-core-modules/platform'
import { HttpService } from "./serwisy/http.service";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private vcRef: ViewContainerRef, private uiService: UiService, private page: Page, private http: HttpService) {}

    ngOnInit() {
        let tok: string = ""
        this.uiService.setRootVCRef(this.vcRef);
        firebase.init({
            showNotifications: true,
            showNotificationsWhenInForeground: true,

            onPushTokenReceivedCallback: (token) => {
              tok = token
            },

            onMessageReceivedCallback: (message: firebase.Message) => {
              console.log('[Firebase] onMessageReceivedCallback:', { message });
            }
          })
            .then(() => {
              this.http.nadaj_wlasciwosci_urzadzenia(platform.isIOS ? "IOS" : platform.isAndroid ? "Android" : "Inny", tok)
            })
            .catch(error => {
              console.log('[Firebase] Initialize', { error });
            });
    }
}

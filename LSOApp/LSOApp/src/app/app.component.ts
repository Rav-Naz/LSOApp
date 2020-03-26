import { Component, ViewContainerRef } from "@angular/core";
import { UiService } from "./serwisy/ui.service";
import * as firebase from 'nativescript-plugin-firebase';
import * as platform from 'tns-core-modules/platform'
import { HttpService } from "./serwisy/http.service";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private vcRef: ViewContainerRef, private uiService: UiService, private http: HttpService) {}

    ngOnInit() {
        this.uiService.setRootVCRef(this.vcRef);
        firebase.init({
            showNotifications: true,
            showNotificationsWhenInForeground: true,

            onMessageReceivedCallback: (message: firebase.Message) => {
              console.log('[Firebase] onMessageReceivedCallback:', { message });
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

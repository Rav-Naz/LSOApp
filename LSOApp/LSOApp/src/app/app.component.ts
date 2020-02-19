import { Component, ViewContainerRef } from "@angular/core";
import { UiService } from "./serwisy/ui.service";
import { Page } from "tns-core-modules/ui/page/page";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private vcRef: ViewContainerRef, private uiService: UiService, private page: Page) {}

    ngOnInit() {
        this.uiService.setRootVCRef(this.vcRef);
    }
}

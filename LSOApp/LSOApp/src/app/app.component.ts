import { Component, ViewContainerRef } from "@angular/core";
import { UiService } from "./serwisy/ui.service";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private vcRef: ViewContainerRef, private uiService: UiService) {}

    ngOnInit() {
        this.uiService.setRootVCRef(this.vcRef);
    }
}

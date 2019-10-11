import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { CheckboxStatusComponent } from "./checkbox-status.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";

@NgModule({
    declarations: [CheckboxStatusComponent, CheckboxComponent],
    imports: [NativeScriptCommonModule],
    exports: [CheckboxStatusComponent, CheckboxComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class SharedModule {
}

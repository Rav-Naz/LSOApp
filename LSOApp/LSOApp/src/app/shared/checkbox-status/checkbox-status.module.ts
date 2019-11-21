import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { CheckboxStatusComponent } from "./checkbox-status.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { CheckboxZwyklyComponent } from "../checkbox-zwykly/checkbox-zwykly.component";

@NgModule({
    declarations: [CheckboxStatusComponent, CheckboxComponent, CheckboxZwyklyComponent],
    imports: [NativeScriptCommonModule],
    exports: [CheckboxStatusComponent, CheckboxComponent, CheckboxZwyklyComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class SharedModule {
}

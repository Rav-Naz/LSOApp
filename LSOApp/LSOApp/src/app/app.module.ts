import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms"
import {NativeScriptUICalendarModule} from "nativescript-ui-calendar/angular";
import { NativeScriptDateTimePickerModule } from "nativescript-datetimepicker/angular";
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LogowanieComponent } from './logowanie/logowanie.component';
import { RejestracjaComponent } from './rejestracja/rejestracja.component';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ZapomnialemComponent } from './zapomnialem/zapomnialem.component';
import { MenuComponent } from './menu/menu.component';
import { DyzuryComponent } from './ministrant/dyzury/dyzury.component';
import { WiadomosciMComponent } from './ministrant/wiadomosci-m/wiadomosci-m.component';
import { UstawieniaMComponent } from './ministrant/ustawienia-m/ustawienia-m.component';
import { ObecnoscComponent } from './opiekun/obecnosc/obecnosc.component';
import { MinistranciComponent } from './opiekun/ministranci/ministranci.component';
import { WiadomosciOComponent } from './opiekun/wiadomosci-o/wiadomosci-o.component';
import { UstawieniaOComponent } from './opiekun/ustawienia-o/ustawienia-o.component';
import { GodzinaPipe } from './pipes/godzina.pipe';
import { DaneProfiloweComponent } from './ministrant/dane-profilowe/dane-profilowe.component';
import { ZmienHasloMComponent } from './ministrant/zmien-haslo-m/zmien-haslo-m.component';
import { UsunKontoMComponent } from './ministrant/usun-konto-m/usun-konto-m.component';
import { InfoComponent } from './info/info.component';
import { SharedModule } from "./shared/checkbox-status/checkbox-status.module";
import { MinistrantSzczegolyComponent } from './opiekun/ministrant-szczegoly/ministrant-szczegoly.component';
import { CapsPipe } from './pipes/caps.pipe';
import { MinistrantDyzuryComponent } from './opiekun/ministrant-dyzury/ministrant-dyzury.component';
import { MinistrantNowyComponent } from './opiekun/ministrant-nowy/ministrant-nowy.component';
import { PunktacjaComponent } from './opiekun/punktacja/punktacja.component';
import { EdytujMszeComponent } from './opiekun/edytuj-msze/edytuj-msze.component';
import { UsunKontoOComponent } from './opiekun/usun-konto-o/usun-konto-o.component';
import { ZmienHasloOComponent } from './opiekun/zmien-haslo-o/zmien-haslo-o.component';
import { AktywacjaKontaComponent } from './opiekun/aktywacja-konta/aktywacja-konta.component';
import { WyborModalComponent } from './shared/modale/wybor-modal/wybor-modal.component';
import { PotwierdzenieModalComponent } from './shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { LogowanieJakoComponent } from './shared/modale/logowanie-jako/logowanie-jako.component';


// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports if you need to use the HttpClient wrapper
// import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        FormsModule,
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptFormsModule,
        NativeScriptCommonModule,
        NativeScriptDateTimePickerModule,
        ReactiveFormsModule,
        SharedModule,
        NativeScriptUICalendarModule,
        NativeScriptHttpClientModule
    ],
    declarations: [
        AppComponent,
        LogowanieComponent,
        RejestracjaComponent,
        ZapomnialemComponent,
        MenuComponent,
        DyzuryComponent,
        WiadomosciMComponent,
        UstawieniaMComponent,
        ObecnoscComponent,
        MinistranciComponent,
        WiadomosciOComponent,
        UstawieniaOComponent,
        GodzinaPipe,
        DaneProfiloweComponent,
        ZmienHasloMComponent,
        UsunKontoMComponent,
        InfoComponent,
        MinistrantSzczegolyComponent,
        CapsPipe,
        MinistrantDyzuryComponent,
        MinistrantNowyComponent,
        PunktacjaComponent,
        EdytujMszeComponent,
        UsunKontoOComponent,
        ZmienHasloOComponent,
        AktywacjaKontaComponent,
        WyborModalComponent,
        PotwierdzenieModalComponent,
        LogowanieJakoComponent,
    ],
    providers: [],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    entryComponents: [WyborModalComponent, PotwierdzenieModalComponent, LogowanieJakoComponent]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }

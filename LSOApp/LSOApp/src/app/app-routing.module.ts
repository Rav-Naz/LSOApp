import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { LogowanieComponent } from "./logowanie/logowanie.component";
import { RejestracjaComponent } from "./rejestracja/rejestracja.component";
import { ZapomnialemComponent } from "./zapomnialem/zapomnialem.component";
import { MenuComponent } from "./menu/menu.component";
import { DyzuryComponent } from "./ministrant/dyzury/dyzury.component";
import { WiadomosciMComponent } from "./ministrant/wiadomosci-m/wiadomosci-m.component";
import { UstawieniaMComponent } from "./ministrant/ustawienia-m/ustawienia-m.component";
import { ObecnoscComponent } from "./opiekun/obecnosc/obecnosc.component";
import { MinistranciComponent } from "./opiekun/ministranci/ministranci.component";
import { WiadomosciOComponent } from "./opiekun/wiadomosci-o/wiadomosci-o.component";
import { UstawieniaOComponent } from "./opiekun/ustawienia-o/ustawienia-o.component";
import { DaneProfiloweComponent } from "./ministrant/dane-profilowe/dane-profilowe.component";
import { ZmienHasloMComponent } from "./ministrant/zmien-haslo-m/zmien-haslo-m.component";
import { UsunKontoMComponent } from "./ministrant/usun-konto-m/usun-konto-m.component";
import { InfoComponent } from "./info/info.component";
import { MinistrantSzczegolyComponent } from "./opiekun/ministrant-szczegoly/ministrant-szczegoly.component";
import { MinistrantDyzuryComponent } from "./opiekun/ministrant-dyzury/ministrant-dyzury.component";
import { MinistrantNowyComponent } from "./opiekun/ministrant-nowy/ministrant-nowy.component";
import { PunktacjaComponent } from "./opiekun/punktacja/punktacja.component";
import { EdytujMszeComponent } from "./opiekun/edytuj-msze/edytuj-msze.component";
import { UsunKontoOComponent } from "./opiekun/usun-konto-o/usun-konto-o.component";
import { ZmienHasloOComponent } from "./opiekun/zmien-haslo-o/zmien-haslo-o.component";
import { AktywacjaKontaComponent } from "./opiekun/aktywacja-konta/aktywacja-konta.component";

const routes: Routes = [
    { path: '', redirectTo: "/logowanie", pathMatch: "full" },
    { path: 'logowanie', component: LogowanieComponent},
    { path: 'rejestracja', component: RejestracjaComponent },
    { path: 'zapomnialem', component: ZapomnialemComponent },
    { path: 'menu', component: MenuComponent, children:
    [
        {path: 'dyzury', component: DyzuryComponent, outlet: 'dyzury'},
        {path: 'wiadomosciM', component: WiadomosciMComponent, outlet: 'wiadomosciM'},
        {path: 'ustawieniaM', component: UstawieniaMComponent, outlet: 'ustawieniaM'},

          {path: 'dane-profilowe', component: DaneProfiloweComponent, outlet: 'ustawieniaM'},
          {path: 'zmien-haslo-m', component: ZmienHasloMComponent, outlet: 'ustawieniaM'},
          {path: 'usun-konto-m', component: UsunKontoMComponent, outlet: 'ustawieniaM'},
          {path: 'info-m', component: InfoComponent, outlet: 'ustawieniaM'},

        {path: 'obecnosc', component: ObecnoscComponent, outlet: 'obecnosc'},
        {path: 'ministranci', component: MinistranciComponent, outlet: 'ministranci'},

            {path: 'ministrant-szczegoly', component: MinistrantSzczegolyComponent, outlet: 'ministranci'},

                {path: 'ministrant-dyzury', component: MinistrantDyzuryComponent, outlet: 'ministranci'},
                {path: 'aktywacja-konta', component: AktywacjaKontaComponent, outlet: 'ministranci'},


            {path: 'ministrant-nowy', component: MinistrantNowyComponent, outlet: 'ministranci'},

        {path: 'wiadomosciO', component: WiadomosciOComponent, outlet: 'wiadomosciO'},
        {path: 'ustawieniaO', component: UstawieniaOComponent, outlet: 'ustawieniaO'},

            {path: 'punktacja', component: PunktacjaComponent, outlet: 'ustawieniaO'},
            {path: 'edytuj-msze', component: EdytujMszeComponent, outlet: 'ustawieniaO'},
            {path: 'usun-konto-o', component: UsunKontoOComponent, outlet: 'ustawieniaO'},
            {path: 'zmien-haslo-o', component: ZmienHasloOComponent, outlet: 'ustawieniaO'},
            {path: 'info-o', component: InfoComponent, outlet: 'ustawieniaO'},
    ]}
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }

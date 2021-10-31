import { Component, OnInit} from '@angular/core';
// import { Page } from 'tns-core-modules/ui/page/page';
// import { RouterExtensions } from 'nativescript-angular/router';
import { ParafiaService } from '../../../app/serwisy/parafia.service';
import { TabindexService } from '../../../app/serwisy/tabindex.service';
import { HttpService } from '../../../app/serwisy/http.service';
import { Parafia } from '../../../app/serwisy/parafia.model';
import { UiService } from '../../../app/serwisy/ui.service';
import { Page } from '@nativescript/core/ui/page';
import { RouterExtensions } from '@nativescript/angular';


@Component({
    selector: 'ns-punktacja',
    templateUrl: './punktacja.component.html',
    styleUrls: ['./punktacja.component.css'],
    moduleId: module.id,
})
export class PunktacjaComponent implements OnInit {

    zapisywanie: boolean = false;

    constructor(private page: Page, private router: RouterExtensions, private parafiaService: ParafiaService,
        private tabIndexService: TabindexService, private http: HttpService, private ui: UiService) {}

    pktZaObecnoscSluzba: number = 0;
    pktZaNieobecnoscSluzba: number = 0;
    pktZaDodatkowa: number = 0;
    pktZaObecnoscZbiorka: number = 0;
    pktZaNieobecnoscZbiorka: number = 0;
    pktZaNabozenstwo: number = 0;

    poczObecnoscSluzba: number = 0;
    poczNieobecnoscSluzba: number = 0;
    poczDodatkowa: number = 0;
    poczObecnoscZbiorka: number = 0;
    poczNieobecnoscZbiorka: number = 0;
    poczNabozenstwo: number = 0;

    ngOnInit() {
        this.page.actionBarHidden = true;

        let o = this.parafiaService.parafia.punkty_dod_sluzba;

        let n = this.parafiaService.parafia.punkty_uj_sluzba;

        let d = this.parafiaService.parafia.punkty_dodatkowe;

        let b = this.parafiaService.parafia.punkty_dod_zbiorka;

        let z = this.parafiaService.parafia.punkty_uj_zbiorka;

        let c = this.parafiaService.parafia.punkty_nabozenstwo;

        this.pktZaObecnoscSluzba = this.poczObecnoscSluzba = o ? o.valueOf() : 0;
        this.pktZaNieobecnoscSluzba = this.poczNieobecnoscSluzba = n ? n.valueOf() : 0;
        this.pktZaDodatkowa = this.poczDodatkowa = d ? d.valueOf() : 0;
        this.pktZaObecnoscZbiorka = this.poczObecnoscZbiorka = b ? b.valueOf() : 0;
        this.pktZaNieobecnoscZbiorka = this.poczNieobecnoscZbiorka = z ? z.valueOf() : 0;
        this.pktZaNabozenstwo = this.poczNabozenstwo = c ? c.valueOf() : 0;

    }

    zapisz() {

        this.ui.zmienStan(4,true)

        this.zapisywanie = true;

        this.http.aktualizacjaPunktow(this.pktZaObecnoscSluzba, this.pktZaNieobecnoscSluzba, this.pktZaDodatkowa, this.pktZaNabozenstwo, this.pktZaObecnoscZbiorka, this.pktZaNieobecnoscZbiorka).then(res => {
            let daneParafii: Parafia = JSON.parse(JSON.stringify(res))
            if(daneParafii.id_parafii)
            {
                this.parafiaService.parafia = daneParafii
                this.ui.zmienStan(4,false)
                setTimeout(() => {
                    this.ui.showFeedback('succes', "Zapisano punktację, zacznie ona obowiązywać od następnego sprawdzenia obecności",3.5)
                }, 400)
                this.anuluj();
            }
            else if(res === 404)
            {
                this.ui.sesjaWygasla()
                this.ui.zmienStan(4,false)
                this.zapisywanie = false;
            }
            else
            {
                this.ui.zmienStan(4,false)
                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                this.zapisywanie = true;
            }
        })
    }


    async anuluj() {
        await this.czyKontynuowac(this.czyZmienione).then((kontynuowac) => {
            if (kontynuowac) {
                this.tabIndexService.nowyOutlet(6, "ustawieniaO");
                this.router.back();
            }
        });
    }

    private czyKontynuowac(zmiana: boolean) {
        return new Promise<boolean>((resolve) => {
            if (this.czyZmienione) {
                if (this.zapisywanie === false) {
                    this.ui.pokazModalWyboru("Zmienione dane o punktacji nie zostaną zapisane.\nCzy chcesz kontynuować?").then((result) => {
                        resolve(result);
                    })
                }
                else {
                    resolve(true)
                }
            }
            else {
                resolve(true)
            }
        })
    }

    get czyZmienione()
    {
        return (this.pktZaNieobecnoscSluzba !== this.poczNieobecnoscSluzba) || (this.pktZaObecnoscSluzba !== this.poczObecnoscSluzba) || (this.pktZaDodatkowa !== this.poczDodatkowa) || (this.pktZaObecnoscZbiorka !== this.poczObecnoscZbiorka) || (this.pktZaNieobecnoscZbiorka !== this.poczNieobecnoscZbiorka) || (this.pktZaNabozenstwo !== this.poczNabozenstwo)
    }
}

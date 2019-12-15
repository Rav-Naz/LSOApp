import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { Wiadomosc } from '~/app/serwisy/wiadomosci.model';
import { Subscription } from 'rxjs';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { getFile } from 'tns-core-modules/http';
import * as fileSystem from "tns-core-modules/file-system";
import { isAndroid} from "tns-core-modules/platform";
import * as permission from 'nativescript-permissions'
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

declare var android


@Component({
    selector: 'ns-wiadomosci-o',
    templateUrl: './wiadomosci-o.component.html',
    styleUrls: ['./wiadomosci-o.component.css'],
    moduleId: module.id,
})
export class WiadomosciOComponent implements OnInit {

    wiadomosci: Array<Wiadomosc> = [];
    wiadomosciSub: Subscription;

    tresc: string = '';

    pisanieWiadomosci: boolean = false;

    @ViewChild('textview', { static: false }) textviewRef: ElementRef<TextField>;

    constructor(private page: Page, private wiadosciService: WiadomosciService, private modal: ModalDialogService, private vcRef: ViewContainerRef, public ui: UiService) {}

    ngOnInit() {
        this.ui.zmienStan(2, true)
        this.page.actionBarHidden = true;
        this.wiadosciService.pobierzWiadomosci();
        this.wiadomosciSub = this.wiadosciService.Wiadomosci.subscribe(wiadomosci => {
            this.wiadomosci = [];
            if (wiadomosci === null) {
                return;
            }
            else {
                this.wiadomosci = wiadomosci
            }
            this.ui.zmienStan(2, false)
        });
    }

    dataFormat(wiadomosc: Wiadomosc) {
        let data = new Date(wiadomosc.data)
        let dzien = data.getDate();
        let miesiac = data.getMonth() + 1;

        let dzienStr = dzien.toString();
        let miesiacStr = miesiac.toString();

        if (dzien < 10) {
            dzienStr = '0' + dzienStr;
        }

        if (miesiac < 10) {
            miesiacStr = '0' + miesiacStr;
        }

        return dzienStr + '/' + miesiacStr + '/' + data.getFullYear();
    }

    wyslij() {
        if (this.tresc.length >= 1) {
            this.pisanieWiadomosci = false;
            this.ui.zmienStan(2, true)
            this.textviewRef.nativeElement.dismissSoftInput();
            this.wiadosciService.nowaWiadomosc(this.tresc).then(res => {
                switch (res) {
                    case 0:
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                        break;
                    case 1:
                        this.wiadosciService.pobierzWiadomosci().then(() => {
                            this.tresc = '';
                            setTimeout(() => {
                                this.ui.showFeedback('succes',"Wysłano wiadomość",3)
                            }, 400)
                        });
                        break;
                    default:
                        this.ui.zmienStan(2, false)
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                        break;
                }
            });
        }
        else {
            this.pisanieWiadomosci = false;
        }
    }

    otworz() {
        this.pisanieWiadomosci = true;
    }

    pobierzObraz(url: string) {
        let pociety = url.split("/")

        let nazwaPliku = pociety[pociety.length - 1].toString();

        let sciezka: string;

        if (isAndroid) {
            permission.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE).then(() => {
                sciezka = fileSystem.path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), nazwaPliku)
                getFile(url, sciezka).then((result) => {
                    setTimeout(() => {
                        this.ui.showFeedback('succes', "Obraz pobrano do: " + result.path,3)
                    }, 200)
                })
            }).catch(() => {
                setTimeout(() => {
                    this.ui.zmienStan(2, false)
                    this.ui.showFeedback('error',"Bez Twojej zgody nie możemy nic zrobić :(",3)
                }, 200)
            })
        }
        else {
            sciezka = fileSystem.path.join(fileSystem.knownFolders.ios.downloads().path, nazwaPliku);
            getFile(url, sciezka).then((result) => {
                setTimeout(() => {
                    this.ui.showFeedback('succes', "Obraz pobrano do: " + result.path,3)
                }, 200)
            });
        }

    }

    async usunWiadomosc(wiadomosc: Wiadomosc) {
        if (wiadomosc.autor_id !== 0) {
            await this.czyKontynuowac(true).then((kontynuowac) => {
                if (!kontynuowac) {
                    this.ui.zmienStan(2, true)
                    this.wiadosciService.usunWiadomosc(wiadomosc).then(res => {
                        if(res === 1)
                        {
                            this.ui.showFeedback('succes', "Usunięto wiadomość",3)
                        }
                        else
                        {
                            this.ui.zmienStan(2, false)
                            this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                        }
                    });
                }
            });

        }
        else {
            this.ui.zmienStan(2, false)
            this.ui.showFeedback('error',"Nie możesz usunąć wiadomości od ADMINISTRATORA",3)
        }
    }

    private czyKontynuowac(zmiana: boolean) {
        return new Promise<boolean>((resolve) => {
            if (zmiana === true) {
                this.modal.showModal(PotwierdzenieModalComponent, {
                    context: "Wiadomość zostanie usunięta dla Ciebie i ministrantów.\nCzy chcesz kontynuować?",
                    viewContainerRef: this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated: true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                } as ExtendedShowModalOptions).then((wybor) => {
                    if (wybor === true) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                })
            }
            else {
                resolve(false)
            }
        })
    }

    dismiss()
    {
        if(this.pisanieWiadomosci)
        {
            this.textviewRef.nativeElement.dismissSoftInput()
        }
    }
}

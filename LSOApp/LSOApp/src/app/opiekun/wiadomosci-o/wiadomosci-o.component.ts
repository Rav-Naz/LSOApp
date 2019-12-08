import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { Page, Color } from 'tns-core-modules/ui/page/page';
import { Wiadomosc } from '~/app/serwisy/wiadomosci.model';
import { Subscription } from 'rxjs';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { getFile } from 'tns-core-modules/http';
import * as fileSystem from "tns-core-modules/file-system";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import * as permission from 'nativescript-permissions'
import { Feedback, FeedbackType } from "nativescript-feedback";
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

    private feedback: Feedback;

    constructor(private page: Page, private wiadosciService: WiadomosciService, private modal: ModalDialogService, private vcRef: ViewContainerRef, public ui: UiService) {
        this.feedback = new Feedback();
    }

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
                        this.feedback.show({
                            title: "Błąd!",
                            message: "Wystąpił nieoczekiwany błąd",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color("#e71e25"),
                            type: FeedbackType.Error,

                        });
                        break;
                    case 1:
                        this.wiadosciService.pobierzWiadomosci().then(() => {
                            this.tresc = '';
                            // this.pisanieWiadomosci = false;
                            setTimeout(() => {
                                this.feedback.show({
                                    title: "Sukces!",
                                    message: "Wysłano wiadomość",
                                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                                    duration: 3000,
                                    backgroundColor: new Color(255, 49, 155, 49),
                                    type: FeedbackType.Success,
                                });
                            }, 400)
                        });
                        break;
                    default:
                        this.ui.zmienStan(2, false)
                        this.feedback.show({
                            title: "Błąd!",
                            message: "Wystąpił nieoczekiwany błąd",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color("#e71e25"),
                            type: FeedbackType.Error,
                        });
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
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Obraz pobrano do: " + result.path,
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255, 49, 155, 49),
                            type: FeedbackType.Success,
                        });
                    }, 200)
                })
            }).catch(() => {
                setTimeout(() => {
                    this.ui.zmienStan(2, false)
                    this.feedback.show({
                        title: "Błąd!",
                        message: "Bez Twojej zgody nie możemy nic zrobić :(",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color("#e71e25"),
                        type: FeedbackType.Error,
                    });
                }, 200)
            })
        }
        else {
            sciezka = fileSystem.path.join(fileSystem.knownFolders.ios.downloads().path, nazwaPliku);
            getFile(url, sciezka).then((result) => {
                setTimeout(() => {
                    this.feedback.show({
                        title: "Sukces!",
                        message: "Obraz pobrano do: " + result.path,
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255, 49, 155, 49),
                        type: FeedbackType.Success,
                    });
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
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Usunięto wiadomość",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255, 49, 155, 49),
                            type: FeedbackType.Success,
                        });
                        else
                        {
                            this.ui.zmienStan(2, false)
                            this.feedback.show({
                                title: "Błąd!",
                                message: "Wystąpił nieoczekiwany błąd",
                                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                                duration: 3000,
                                backgroundColor: new Color("#e71e25"),
                                type: FeedbackType.Error,

                            });
                        }
                    });
                }
            });

        }
        else {
            this.ui.zmienStan(2, false)
            this.feedback.show({
                title: "Błąd!",
                message: "Nie możesz usunąć wiadomości od ADMINISTRATORA",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color("#e71e25"),
                type: FeedbackType.Error,
            });
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

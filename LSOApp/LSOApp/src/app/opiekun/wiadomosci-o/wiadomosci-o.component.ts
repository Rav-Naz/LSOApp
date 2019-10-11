import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { Page, Color } from 'tns-core-modules/ui/page/page';
import { Wiadomosc } from '~/app/serwisy/wiadomosci.model';
import { Subscription } from 'rxjs';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import {getFile} from'tns-core-modules/http';
import * as fileSystem from "tns-core-modules/file-system";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import * as permission from 'nativescript-permissions'
import { Feedback, FeedbackType} from "nativescript-feedback";
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { UiService } from '~/app/serwisy/ui.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { SecureStorage } from "nativescript-secure-storage";

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

    constructor(private page: Page, private indexService: TabindexService, private wiadosciService: WiadomosciService, private uiService: UiService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        // this.wiadosciService.pobierzWiadomosci();
        this.wiadomosciSub = this.wiadosciService.Wiadomosci.subscribe(wiadomosci => {
        this.wiadomosci = [];
        if(wiadomosci === null)
        {
            return;
        }
        wiadomosci.forEach(wiad => this.wiadomosci.push({id: wiad.id, autor_id: wiad.autor_id, odbiorca_id: wiad.odbiorca_id, data: wiad.data,do_opiekuna: wiad.do_opiekuna, tresc: wiad.tresc, linkobrazu: wiad.linkobrazu}))
        this.wiadomosci.sort((wiad1, wiad2) => {
            if (wiad1.data < wiad2.data) {
                return 1;
            }
            if (wiad1.data > wiad2.data) {
                return -1;
            }
            return 0;
        })
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

    onSwipe(args: SwipeGestureEventData) {
        if (args.direction === 1) {
            this.indexService.nowyIndex(1);
        }
        else if (args.direction === 2) {
            this.indexService.nowyIndex(3);
        }
    }

    wyslij()
    {
        if(this.tresc.length >= 1)
        {
            this.wiadosciService.nowaWiadomosc(this.tresc);
            this.tresc = '';
            this.textviewRef.nativeElement.dismissSoftInput();
            this.pisanieWiadomosci = false;
            setTimeout(() => {
                this.feedback.show({
                    title: "Sukces!",
                    message: "Wysłano wiadomość",
                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                    duration: 3000,
                    backgroundColor: new Color(255,49, 155, 49),
                    type: FeedbackType.Success,
                  });
            }, 400)
        }
        else
        {
            this.pisanieWiadomosci = false;
        }
    }

    otworz()
    {
        this.pisanieWiadomosci = true;
    }

    pobierzObraz(url: string)
    {
        let pociety = url.split("/")

        let nazwaPliku = pociety[pociety.length - 1].toString();

        let sciezka: string;

        if(isAndroid)
        {
            permission.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE).then(() => {
                sciezka = fileSystem.path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), nazwaPliku)
                getFile(url,sciezka).then((result) => {
                    setTimeout(() => {
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Obraz pobrano do: " + result.path,
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255,49, 155, 49),
                            type: FeedbackType.Success,
                          });
                    }, 200)
                })
            }).catch(() => {
                setTimeout(() => {
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
        else
        {
            sciezka = fileSystem.path.join(fileSystem.knownFolders.ios.downloads().path, nazwaPliku);
            getFile(url,sciezka).then((result) => {
                setTimeout(() => {
                    this.feedback.show({
                        title: "Sukces!",
                        message: "Obraz pobrano do: " + result.path,
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255,49, 155, 49),
                        type: FeedbackType.Success,
                      });
                }, 200)
            });
        }

    }

    async usunWiadomosc(wiadomosc: Wiadomosc)
    {
        if(wiadomosc.autor_id !== 0)
        {
            await this.czyKontynuowac(true).then((kontynuowac) => {
                if(!kontynuowac)
                {
                    this.wiadosciService.usunWiadomosc(wiadomosc).then(() => {
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Usunięto wiadomość",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255,49, 155, 49),
                            type: FeedbackType.Success,
                          });
                    });
                }
            });

        }
        else
        {
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

    private czyKontynuowac(zmiana: boolean)
    {
        return new Promise<boolean>((resolve) => {
            if(zmiana === true)
            {
                this.modal.showModal(PotwierdzenieModalComponent,{
                    context: "Wiadomość zostanie usunięta dla Ciebie i ministrantów.\nCzy chcesz kontynuować?",
                    viewContainerRef: this.uiService.getRootVCRef() ? this.uiService.getRootVCRef() : this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated:  true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                  } as ExtendedShowModalOptions).then((wybor) => {
                      if(wybor === true)
                      {
                        resolve(false);
                      }
                      else
                      {
                        resolve(true);
                      }
                  })
            }
            else
            {
                resolve(false)
            }
        })
    }
}

import { Component, OnInit } from '@angular/core';
import { Page, Color } from 'tns-core-modules/ui/page/page';
import { Wiadomosc } from '~/app/serwisy/wiadomosci.model';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { Subscription } from 'rxjs';
import {getFile} from'tns-core-modules/http';
import * as fileSystem from "tns-core-modules/file-system";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import * as permission from 'nativescript-permissions'
import { Feedback, FeedbackType} from "nativescript-feedback";

declare var android

@Component({
    selector: 'ns-wiadomosci-m',
    templateUrl: './wiadomosci-m.component.html',
    styleUrls: ['./wiadomosci-m.component.css'],
    moduleId: module.id,
})
export class WiadomosciMComponent implements OnInit {

    wiadomosci: Array<Wiadomosc> = [];
    wiadomosciSub: Subscription;
    private feedback: Feedback;

    constructor(private page: Page, private indexService: TabindexService, private wiadosciService: WiadomosciService) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.wiadosciService.pobierzWiadomosci();
        this.wiadomosciSub = this.wiadosciService.Wiadomosci.subscribe(wiadomosci => {
        this.wiadomosci = wiadomosci.sort((wiad1, wiad2) => {
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

    dataFormat(dzien: any, miesiac: any, rok: any) {
        let dzienF = dzien;
        let miesiacF = miesiac + 1;

        if (dzienF < 10) {
            dzienF = '0' + dzienF;
        }

        if (miesiacF < 10) {
            miesiacF = '0' + miesiacF;
        }

        return dzienF + '/' + miesiacF + '/' + rok;
    }

    onSwipe(args: SwipeGestureEventData) {
        if (args.direction === 1) {
            this.indexService.nowyIndex(0);
        }
        else if (args.direction === 2) {
            this.indexService.nowyIndex(2);
        }
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

}
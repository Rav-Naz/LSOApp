import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import * as utils from "tns-core-modules/utils/utils";
import * as email from "nativescript-email";
import { UserService } from '~/app/serwisy/user.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '~/app/serwisy/http.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { SecureStorage } from 'nativescript-secure-storage';
import { UiService } from '~/app/serwisy/ui.service';
import { isAndroid, isIOS} from "tns-core-modules/platform";
import * as fileSystem from "tns-core-modules/file-system";
import { ModalDialogService } from 'nativescript-angular/common';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import * as permission from 'nativescript-permissions'
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';

declare var NSData,NSObject,interop,UIImage,NSError,UIImageWriteToSavedPhotosAlbum:any

declare var android

@Component({
    selector: 'ns-ustawienia-o',
    templateUrl: './ustawienia-o.component.html',
    styleUrls: ['./ustawienia-o.component.css'],
    moduleId: module.id,
})
export class UstawieniaOComponent implements OnInit {

    secureStorage: SecureStorage;

    constructor(private page: Page, private router: RouterExtensions, private userService: UserService,
        private tabIndexService: TabindexService, private active: ActivatedRoute, private http: HttpService,
        public parafiaService: ParafiaService, private wiadomosciService: WiadomosciService, private wydarzeniaService: WydarzeniaService, private modal: ModalDialogService, private vcRef: ViewContainerRef,
        public ui: UiService) {}

    wersja = this.userService.wersja;
    PROSub: Subscription;
    PROLista: Array<string>;
    fonts: any;

    ngOnInit() {
        this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
            this.PROLista = listaOutletow;
        });

        this.secureStorage = new SecureStorage;

        this.page.actionBarHidden = true;
    }

    nawigujDo(sciezka: string) {
        if ((sciezka === "edytuj-msze" || sciezka === "punktacja") && this.PROLista[4] === "ministrant-dyzury") {
            this.ui.showFeedback('warning',"Aby skorzystać z tego widoku musisz zamknąć panel Edytuj dyżury",3);
            return;
        }
        this.tabIndexService.nowyOutlet(6, sciezka);
        this.router.navigate(['../' + sciezka], { relativeTo: this.active, transition: { name: 'slideLeft' } });
    }

    otworzLink(link: string) {
        utils.openUrl(link);
    }

    wyloguj() {
        this.ui.zmienStan(2, true);
        this.http.wyloguj().then((res) => {
            if(res === 1)
            {
                this.secureStorage.removeAll().then(() => {
                    this.http.wyczysc();
                    this.parafiaService.wyczysc();
                    this.tabIndexService.wyczysc();
                    this.userService.wyczysc();
                    this.wiadomosciService.wyczysc();
                    this.wydarzeniaService.wyczysc();
                    this.router.navigate([""],{clearHistory: true, transition: { name: 'slideBottom' }}).then(() => {
                        this.tabIndexService.nowyIndex(0);
                        setTimeout(() => {
                            this.ui.showFeedback('succes',"Pomyślnie wylogowano",3);
                        }, 400);
                    });
                });
            }
            else
            {
                this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",2);
            }
            this.ui.zmienStan(2, false);
        });
    }

    wyzerujPunkty() {
        if (this.PROLista[4] === "ministrant-szczegoly" || this.PROLista[4] === 'ministrant-dyzury' || this.PROLista[4] === 'aktywacja-konta') {
            this.ui.showFeedback('warning',"Aby skorzystać z tej funkcji musisz zamknąć panel Szczegóły Ministranta",3);
            return;
        }

       this.ui.pokazModalWyboru('Czy jesteś pewny, że chcesz wyzerować punkty WSZYSTKIM ministrantom w swojej parafii? Ta funkcja jest zalecana przy rozpoczęciu nowego roku liturgicznego.').then((wybor) => {
            if (wybor) {
                this.ui.zmienStan(4, true);
                this.ui.zmienStan(1, true);
                this.parafiaService.wyzerujPunkty().then(res => {
                    this.ui.zmienStan(4, false);
                    this.ui.zmienStan(1, false);
                    switch (res) {
                        case 0:
                            this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3);
                            break;
                        case 1:
                            this.ui.showFeedback('succes',"Pomyślnie wyzerowano punkty",2);
                            break;
                        case 404:
                            this.ui.sesjaWygasla();
                            break;
                        default:
                            this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3);
                            break;
                    }
                });
            }
        });
    }

    usunDyzury() {

        if (this.PROLista[4] === "ministrant-szczegoly" || this.PROLista[4] === 'ministrant-dyzury' || this.PROLista[4] === 'aktywacja-konta') {
            this.ui.showFeedback('warning',"Aby skorzystać z tej funkcji musisz zamknąć panel Szczegóły Ministranta",3);
            return;
        }

        this.ui.pokazModalWyboru('Czy jesteś pewny, że chcesz usunąć WSZYSTKIE dyżury ministrantów w swojej parafii? Ta funkcja jest zalecana przy rozpoczęciu nowego roku liturgicznego.').then((wybor) => {
            if (wybor) {
                this.ui.zmienStan(4, true);
                this.ui.zmienStan(0, true);
                this.parafiaService.usunWszystkieDyzury().then(res => {
                    this.ui.zmienStan(4, false);
                    this.ui.zmienStan(0, false);
                    switch (res) {
                        case 0:
                           this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3);
                            break;
                        case 1:
                            this.ui.showFeedback('succes',"Pomyślnie usunięto dyżury",2);
                            break;
                        case 404:
                            this.ui.sesjaWygasla();
                            break;
                        default:
                                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3);
                            break;
                    }
                });
            }
        });
    }

    kontakt() {
        email.available().then(avail => {
            if (avail) {
                email.compose({ to: ["kontakt@lsoapp.pl"] });
            }
            else {
                this.nawigujDo('info');
            }
        });
    }

    generujRaport()
    {
        this.modal.showModal(WyborModalComponent, {
            context: ["PDF","CSV"],
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: false,
            closeCallback: null,
            dimAmount: 0.8 // Sets the alpha of the background dim,

        } as ExtendedShowModalOptions).then((wybor) => {
            if (wybor !== undefined) {

                let printedPath = "";
                new Promise((resolve, reject) => {
                    this.ui.showFeedback('loading',"Trwa przygotowywanie raportu",10);
                    this.http.generujRaport(wybor).then(res => {
                        if(res !== '')
                        {
                            if(isAndroid)
                            {
                                permission.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE).then(() => {
                                    let basePath = fileSystem.path.join(android.os.Environment.getExternalStoragePublicDirectory(
                                        android.os.Environment.DIRECTORY_DOWNLOADS).toString(),"Raporty LSOApp");
                                    var teraz = new Date()
                                    let fileName = `${teraz.toISOString().slice(0,10)}-${teraz.toLocaleTimeString().slice(0,8)}.${wybor === 0 ? "pdf" : "txt"}`;
                                    let tofile = fileSystem.Folder.fromPath(basePath).getFile(fileName);
                                    printedPath = basePath.split('/').slice(4).join("/") + "/"+ fileName;
                                    if(tofile)
                                    {
                                        switch (wybor) {
                                            case 0:
                                                let data = android.util.Base64.decode(res, android.util.Base64.DEFAULT);
                                                tofile.writeSync(data, err =>
                                                    {
                                                        console.log("err :", err);
                                                    });
                                                resolve()
                                            break;

                                            case 1:
                                                break;
                                            }
                                    }
                                }).catch(() => {
                                    setTimeout(() => {
                                        this.ui.zmienStan(2, false)
                                        this.ui.showFeedback('error',"Bez Twojej zgody nie możemy nic zrobić :(",3)
                                    }, 200)
                                })
                            }
                            else if(isIOS)
                            {

                            }
                        }
                        else
                        {
                            this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3);
                        }
                    });

                    }).then(() => {
                        this.ui.showFeedback("succes", `Raport został zapisany w: ${printedPath}`,6)
                    })
            }
        });
    }

    saveToAlbum(imageSource, format, quality, callBack) {
        if (isIOS) {
            var res = false;
            if (!imageSource) {
                return res;
            }
            var result = true;
            var CompletionTarget = NSObject.extend({
                "thisImage:hasBeenSavedInPhotoAlbumWithError:usingContextInfo:": function(
                    image, error, context) {
                    if (error) {
                        result = false;
                    }
                }
            }, {
                exposedMethods: {
                    "thisImage:hasBeenSavedInPhotoAlbumWithError:usingContextInfo:": {
                        returns: interop.types.void,
                        params: [UIImage, NSError, interop.Pointer]
                    }
                }
            });
            var completionTarget = CompletionTarget.new();
            UIImageWriteToSavedPhotosAlbum(imageSource.ios, completionTarget,
                "thisImage:hasBeenSavedInPhotoAlbumWithError:usingContextInfo:",
                null);
                if (callBack) callBack();
            return result;
        }
    };
}

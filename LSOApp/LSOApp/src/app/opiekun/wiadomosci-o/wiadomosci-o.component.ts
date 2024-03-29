import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { Page, View, EventData, Color } from 'tns-core-modules/ui/page/page';
import { Wiadomosc } from '../../../app/serwisy/wiadomosci.model';
import { Subscription } from 'rxjs';
import { WiadomosciService } from '../../../app/serwisy/wiadomosci.service';
// import { TextField } from 'tns-core-modules/ui/text-field/text-field';
// import { getFile } from 'tns-core-modules/http';
// import * as fileSystem from "tns-core-modules/file-system";
// import { isAndroid, isIOS} from "tns-core-modules/platform";
import * as permission from 'nativescript-permissions'
import { UiService } from '../../../app/serwisy/ui.service';
import { ListViewEventData, PullToRefreshStyle, RadListView, LoadOnDemandListViewEventData} from 'nativescript-ui-listview';
import { TextField, Page, EventData, Color, View, isAndroid, ImageSource, isIOS, path } from '@nativescript/core';
import { getFile } from '@nativescript/core/http';
import { fromUrl } from '@nativescript/core/image-source';
// import { fromUrl, ImageSource } from "tns-core-modules/image-source";

declare var android, NSObject,interop,UIImage,NSError,UIImageWriteToSavedPhotosAlbum,PHPhotoLibrary, PHAuthorizationStatus:any

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

    doladowanie: boolean = true;
    limit: number = 30;
    ostatniaWiadomosc: Wiadomosc;

    pisanieWiadomosci: boolean = false;

    @ViewChild('textview', { static: false }) textviewRef: ElementRef<TextField>;
    @ViewChild('radListView', { static: false }) radListView: ElementRef<RadListView>;

    constructor(private page: Page, private wiadosciService: WiadomosciService, public ui: UiService) {}

    ngOnInit() {
        this.ui.zmienStan(2, true)
        this.page.actionBarHidden = true;
        this.wiadosciService.pobierzWiadomosci(1,this.limit).then((res) => {
            this.ui.zmienStan(2,false);
     });

     this.wiadomosciSub = this.wiadosciService.Wiadomosci.subscribe(wiadomosci => {
        this.wiadomosci = [];
        if (wiadomosci === null) {
            return;
        }
        else
        {
            this.wiadomosci = [...wiadomosci]
            if(this.radListView && this.ostatniaWiadomosc.id !== this.wiadomosci[this.wiadomosci.length - 1].id)
            {
                this.radListView.nativeElement.notifyPullToRefreshFinished(true)
            }
            else if(this.radListView && !this.doladowanie)
            {
                this.radListView.nativeElement.notifyLoadOnDemandFinished(true)
            }
            this.doladowanie = false;
            this.ostatniaWiadomosc = this.wiadomosci[this.wiadomosci.length - 1]
        }
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
                        this.doladowanie = true;
                        this.wiadosciService.pobierzWiadomosci(1, this.wiadomosci.length).then(() => {
                            this.tresc = '';
                            setTimeout(() => {
                                this.ui.showFeedback('succes',"Wysłano wiadomość",3)
                            }, 100)
                        });
                        break;
                    case 404:
                        this.ui.sesjaWygasla()
                        break;
                    default:
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                        break;
                }
                this.ui.zmienStan(2, false)
            });
        }
        else {
            this.pisanieWiadomosci = false;
        }
    }

    public onLoadMoreItemsRequested(args: LoadOnDemandListViewEventData)
    {
        this.wiadosciService.pobierzWiadomosci(1, this.wiadomosci.length + this.limit).then(res => {
            this.radListView.nativeElement.notifyLoadOnDemandFinished(false)
            args.returnValue = true
        })
    }

    public onPullToRefreshInitiated(args: ListViewEventData) {
        this.doladowanie = true;
        this.wiadosciService.pobierzWiadomosci(1, this.wiadomosci.length).then(res => {
            setTimeout(() => {
                const listView = args.object;
                listView.notifyPullToRefreshFinished(true);
            }, 1000);
        })
    }

    onLoaded(event: EventData) {
        let style = new PullToRefreshStyle();
        style.indicatorColor = new Color("red");
        style.indicatorBackgroundColor = new Color("black");
        (<RadListView>event.object).pullToRefreshStyle = style;
    }

    otworz() {
        this.pisanieWiadomosci = true;
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args['object'];
        const leftItem = swipeView.getViewById<View>('delete');
        swipeLimits.left = this.wiadomosci[args.index].autor_id === 0 ? 0 : leftItem.getMeasuredWidth();
        swipeLimits.right = 0;
        swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
    }

    onLeftSwipeClick(args)
    {
        let index = this.wiadomosci.indexOf(args.object.bindingContext);
        this.usunWiadomosc(this.wiadomosci[index]);
    }

    pobierzObraz(url: string) {
        let pociety = url.split("/")

        let nazwaPliku = pociety[pociety.length - 1].toString();

        let sciezka: string;

        if (isAndroid) {
            permission.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE).then(() => {
                sciezka = path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), nazwaPliku)
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
            PHPhotoLibrary.requestAuthorization((result) => {
                if(result === PHAuthorizationStatus.Authorized)
                {
                    fromUrl(url).then((imageSource: ImageSource) => {
                        this.saveToAlbum(imageSource, "png", 1, () => {
                            this.ui.showFeedback('succes',"Obraz pobrano do folderu Zdjęcia",3)
                        })
                    })
                }
                else
                {
                    setTimeout(() => {
                        this.ui.showFeedback('error',"Bez Twojej zgody nie możemy nic zrobić :(",3)
                    }, 200)
                }
            })
        }

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

    async usunWiadomosc(wiadomosc: Wiadomosc) {
        if (wiadomosc.autor_id !== 0) {
            await this.ui.pokazModalWyboru("Wiadomość zostanie usunięta dla Ciebie i ministrantów.\nCzy chcesz kontynuować?").then((kontynuowac) => {
                if (kontynuowac) {
                    this.ui.zmienStan(2, true)
                    this.tresc = ''
                    this.doladowanie = true;
                    this.wiadosciService.usunWiadomosc(wiadomosc, this.wiadomosci.length).then(res => {
                        if(res === 1)
                        {
                            this.ui.showFeedback('succes', "Usunięto wiadomość",3)
                        }
                        else if(res === 404)
                        {
                            this.ui.sesjaWygasla()
                        }
                        else
                        {
                            this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                        }
                        this.ui.zmienStan(2, false)
                    });
                }
            });

        }
        // else {
        //     this.ui.zmienStan(2, false)
        //     this.ui.showFeedback('error',"Nie możesz usunąć wiadomości od ADMINISTRATORA",3)
        // }
    }

    dismiss()
    {
        if(this.pisanieWiadomosci)
        {
            this.textviewRef.nativeElement.dismissSoftInput()
        }
    }
}

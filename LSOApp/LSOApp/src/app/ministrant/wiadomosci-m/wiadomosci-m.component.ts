import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, EventData, Color } from 'tns-core-modules/ui/page/page';
import { Wiadomosc } from '~/app/serwisy/wiadomosci.model';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { Subscription, from } from 'rxjs';
import {getFile} from'tns-core-modules/http';
import * as fileSystem from "tns-core-modules/file-system";
import { isAndroid, isIOS} from "tns-core-modules/platform";
import * as permission from 'nativescript-permissions'
import { UiService } from '~/app/serwisy/ui.service';
import { ListViewEventData, PullToRefreshStyle, RadListView, LoadOnDemandListViewEventData } from 'nativescript-ui-listview';
import { HttpService } from '~/app/serwisy/http.service';
import { UserService } from '~/app/serwisy/user.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { fromUrl, ImageSource } from "tns-core-modules/image-source";

declare var android, NSObject,interop,UIImage,NSError,UIImageWriteToSavedPhotosAlbum,PHPhotoLibrary, PHAuthorizationStatus:any

@Component({
    selector: 'ns-wiadomosci-m',
    templateUrl: './wiadomosci-m.component.html',
    styleUrls: ['./wiadomosci-m.component.css'],
    moduleId: module.id,
})
export class WiadomosciMComponent implements OnInit {

    wiadomosci: Array<Wiadomosc> = [];
    wiadomosciSub: Subscription;

    doladowanie: boolean = true;
    limit: number = 30;
    ostatniaWiadomosc: Wiadomosc;

    @ViewChild('radListView', { static: false }) radListView: ElementRef<RadListView>;

    constructor(private page: Page, public ui: UiService, private wiadosciService: WiadomosciService, private http: HttpService, private userService: UserService, private tabIndex: TabindexService) {}

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.ui.zmienStan(7,true);
        this.wiadosciService.pobierzWiadomosci(0, this.limit).then((res) => {
               this.ui.zmienStan(7,false);
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

    public onLoadMoreItemsRequested(args: LoadOnDemandListViewEventData)
    {
        this.wiadosciService.pobierzWiadomosci(0, this.wiadomosci.length + this.limit).then(res => {
            this.radListView.nativeElement.notifyLoadOnDemandFinished(false)
            args.returnValue = true
        })
    }

    public onPullToRefreshInitiated(args: ListViewEventData) {
        this.http.pobierzMinistranta(this.userService.UserID).then(res => {
            this.userService.zmienUsera(res);
        })
        this.doladowanie = true;
        this.wiadosciService.pobierzWiadomosci(0, this.wiadomosci.length + this.limit).then(res => {
            setTimeout(function () {
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
                        this.ui.showFeedback('succes',"Obraz pobrano do: " + result.path,3)
                    }, 200)
                })
            }).catch(() => {
                  setTimeout(() => {
                    this.ui.showFeedback('error',"Bez Twojej zgody nie możemy nic zrobić :(",3)
                }, 200)
            })
        }
        else
        {
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

}

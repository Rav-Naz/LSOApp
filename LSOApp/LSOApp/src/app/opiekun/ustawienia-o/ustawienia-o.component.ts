import { Component, OnInit } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import * as utils from "tns-core-modules/utils/utils";
import * as email from "nativescript-email";
import { UserService } from '~/app/serwisy/user.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Subscription } from 'rxjs';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '~/app/serwisy/http.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';

@Component({
  selector: 'ns-ustawienia-o',
  templateUrl: './ustawienia-o.component.html',
  styleUrls: ['./ustawienia-o.component.css'],
  moduleId: module.id,
})
export class UstawieniaOComponent implements OnInit {

    private feedback: Feedback;

  constructor(private page: Page, private router: RouterExtensions, private userService: UserService,
     private tabIndexService: TabindexService, private active: ActivatedRoute, private http: HttpService,
     private parafiaService: ParafiaService, private wiadomosciService: WiadomosciService, private wydarzeniaService: WydarzeniaService) {
    this.feedback = new Feedback();
  }

  wersja = this.userService.wersja;
  PROSub: Subscription;
  PROLista: Array<string>;

  ngOnInit() {
    this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
        this.PROLista = listaOutletow;
    })

    this.page.actionBarHidden = true;
  }

  nawigujDo(sciezka: string) {
    if((sciezka === "edytuj-msze" || sciezka === "punktacja") && this.PROLista[4] === "ministrant-dyzury")
    {

        this.feedback.show({
            title: "Uwaga!",
            message: "Aby skorzystać z tego widoku musisz zamknąć panel Edytuj dyżury",
            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
            duration: 3000,
            backgroundColor: new Color(255,255, 207, 51),
            type: FeedbackType.Warning,
          });
        return;
    }
    this.tabIndexService.nowyOutlet(6,sciezka);
    this.router.navigate(['../' + sciezka], {relativeTo: this.active, transition: { name: 'slideLeft' }});
    }

    otworzLink(link: string)
    {
        utils.openUrl(link);
    }

    wyloguj()
    {
        this.router.navigate([""],{clearHistory: true, transition: { name: 'slideBottom' }}).then(() => {
            this.http.wyczysc()
            this.parafiaService.wyczysc()
            this.tabIndexService.wyczysc()
            this.userService.wyczysc()
            this.wiadomosciService.wyczysc()
            this.wydarzeniaService.wyczysc()
            setTimeout(() => {
                this.feedback.show({
                    title: "Sukces!",
                    message: "Pomyślnie wylogowano",
                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                    duration: 3000,
                    backgroundColor: new Color(255,49, 155, 49),
                    type: FeedbackType.Success,
                  });
            }, 400)
        });
    }

    kontakt()
    {
        email.available().then(avail => {
            if(avail)
            {
                email.compose({ to: ["kontakt@lsoapp.pl"]});
            }
            else
            {
                this.nawigujDo('info');
            }
        });
    }
}

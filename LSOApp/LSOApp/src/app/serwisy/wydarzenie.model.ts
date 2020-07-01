import { Typ } from "./typ_wydarzenia.model";
import { DzienTyg } from "./dzien_tygodnia.model";

export class Wydarzenie {
    id: number;
    id_parafii: number;
    nazwa: string;
    typ: Typ;
    dzien_tygodnia: DzienTyg;
    godzina: string;
    data_dokladna?: string;
    grupa: number;
}

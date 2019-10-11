import { Stopien } from "./stopien.model";

export interface User {
    id_user: number;
    id_diecezji: number;
    id_parafii: number;
    punkty?: number;
    stopien?: Stopien;
    imie: string;
    nazwisko: string;
    ulica?: string;
    kod_pocztowy?: string;
    miasto?: string;
    email?: string;
    telefon?: string;
    aktywny: boolean;
}

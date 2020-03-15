export interface User {
    id_user: number,
    id_diecezji: number,
    id_parafii: number,
    punkty?: number,
    stopien?: number,
    imie: string,
    nazwisko: string,
    ulica?: string,
    kod_pocztowy?: string,
    miasto?: string,
    email?: string,
    telefon?: string,
    aktywny: number,
    admin: number,
    ranking: number,
    powiadomienia?: number
}

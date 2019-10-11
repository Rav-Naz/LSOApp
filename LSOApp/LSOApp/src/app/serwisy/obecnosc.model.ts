export interface Obecnosc{
    id: number;
    id_wydarzenia: number;
    id_user: number;
    data: string;
    status: Status;
}

export enum Status{
    "Nieobecny","Obecny"
}

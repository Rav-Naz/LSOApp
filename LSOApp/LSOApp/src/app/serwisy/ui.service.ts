import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {

    private _rootVCRef: ViewContainerRef;

    setRootVCRef(vcRef: ViewContainerRef)
    {
        this._rootVCRef = vcRef;
    }

    getRootVCRef()
    {
        return this._rootVCRef;
    }
}

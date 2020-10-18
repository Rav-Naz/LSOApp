import { AnimationCurve } from "tns-core-modules/ui/enums";

export function popupOpen(element: any, duration: number){
    return new Promise<void>((resolve => {
        element.animate(
            {
                opacity: 0,
                scale: {x: 0, y: 0},
                duration: 0
            })
            .then(() => {element.animate(
                {
                    opacity: 1,
                    scale: {x: 1.1, y: 1.1},
                    duration: duration,
                    curve: AnimationCurve.easeInOut
                }
                ).then(() => {element.animate(
                    {
                        scale: {x: 1, y: 1},
                        duration: duration/3,
                        curve: AnimationCurve.easeInOut
                    }
                ).then(() => {
                    resolve()
                })})})
    }))
}

export function popupClose(element: any, duration: number){
    return new Promise<void>((resolve => {
        element.animate(
            {
                opacity: 1,
                scale: {x: 1.1, y: 1.1},
                duration: duration/3,
                curve: AnimationCurve.easeInOut
            }).then(() => {
                element.animate(
                    {
                        opacity: 0,
                        scale: {x: 0, y: 0},
                        duration: duration
                    }).then(() => {
                        resolve();
                    })
            })
    }))
}

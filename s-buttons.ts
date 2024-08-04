
namespace sender { // s-buttons.ts

    export const c_ModellCount = 5

    export enum eModell { // zuletzt gewähltes Modell wird im Flash offset 1 dauerhaft gespeiechert
        //% block="Modell Calli:Bot"
        cb2e,
        //% block="Modell Maker Kit Car Sensoren"
        mkcs,
        //% block="Modell Maker Kit Car Gabelstapler"
        mkcg,
        //% block="Modell Maker Kit Car Kran"
        mkck,
        //% block="Modell Calliope auf Rädern 4"
        car4
    } // so viele Images müssen im Array sein - Bilder am Ende dieser Datei

    export enum eFunktion {
        //% block="gestartet"
        ng = 0,     // nicht gestartet
        //% block="00 Fahren und Lenken"
        m0_s0,      // Joystick steuert M0 und Servo (Fahren und Lenken)
        //% block="00 Gabelstapler"
        m0_m1_s0,   // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
        //% block="00 Seilrolle und Drehkranz"
        ma_mb,      // MA und MB (Seilrolle und Drehkranz)
        //% block="00 Zahnstange und Drehkranz"
        mc_mb,      // MC und MB (Zahnstange und Drehkranz)
        //% block="10 Programm fernstarten"
        _10fernstarten,
        //  mc_md_callibot_beispiele,
        //% block="20 Fahrplan senden"
        _20fahrplan,
        //  m1abcd_fahrplan,
        //% block="30 Sensoren fernprogrammieren"
        _30sensoren
    }


    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf A geklickt" weight=7
    export function buttonA() {

        if (!isFunktion(eFunktion.ng)) { // nicht gestartet
            //zeigeModellImagePause(0)
            //if (getStatusModell() > 0)
            //    setStatusModell(getStatusModell() - 1, true) // setStatusModell() schreibt auch in Flash
            //basic.pause(1500) // zeigeModellImagePause(1500)

            setStatusModell(getStatusModell() - 1, true, 1500) // setStatusModell() schreibt auch in Flash
            btf.zeigeFunkgruppe()
        }
        // Maker Kit Car && Gabelstapler (lenken mit Tasten)
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_m1_s0)) {
            addStatusButtonCounter(-1, 1, 31)
        }
        // Standardwerte    
        else {
            setStatusButtonA(!getStatusButtonA()) // immer wechseln true-false
        }
    }


    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf B geklickt" weight=6
    export function buttonB() {

        if (!isFunktion(eFunktion.ng)) { // nicht gestartet
            //zeigeModellImagePause(0)
            //if (getStatusModell() < c_ModellCount - 1)
            //    setStatusModell(getStatusModell() + 1, true) // setStatusModell() schreibt auch in Flash
            //basic.pause(1500) // zeigeModellImagePause(1500)

            setStatusModell(getStatusModell() + 1, true, 1500) // setStatusModell() schreibt auch in Flash
            btf.zeigeFunkgruppe()
        }
        // Maker Kit Car && Gabelstapler (lenken mit Tasten)
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_m1_s0)) {
            addStatusButtonCounter(1, 1, 31) // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
        }
        // Standardwerte       
        else {
            setStatusButtonB(!getStatusButtonB()) // immer wechseln true-false
        }
    }



    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf A+B geklickt" weight=5
    export function buttonAB() {
        // wenn einmal A+B geklickt, wird n_Funktion nie wieder ng (nicht gestartet)
        if (!isFunktion(eFunktion.ng)) { // nicht gestartet // beim ersten Mal (nach Reset)
            setStatusFunktion(eFunktion.m0_s0) // Standardwert immer Fahren und Lenken
            setStatusButtonA(false) // beide aus schalten
            setStatusButtonB(false)
        }

        // cb2e||mkcs // von Joystick auf fernstarten umschalten
        else if ((isModell(eModell.cb2e) || isModell(eModell.mkcs)) && isFunktion(eFunktion.m0_s0)) {
            setStatusFunktion(eFunktion._10fernstarten)
            setStatusButtonA(true)  // Ultraschall Sensor aktiv
            setStatusButtonB(false) // Beispiel noch nicht aktiv senden; erst nach B geklickt
        }
        // cb2e||mkcs // von fernstarten auf Fahrplan umschalten
        else if ((isModell(eModell.cb2e) || isModell(eModell.mkcs)) && isFunktion(eFunktion._10fernstarten)) {
            setStatusFunktion(eFunktion._20fahrplan)
            setStatusButtonA(false) // beide aus schalten
            setStatusButtonB(false)
        }

        // mkcs Maker Kit Car Sensoren // von Joystick auf Fahrplan umschalten
        //else if (isModell(eModell.mkcs) && isFunktion(eFunktion.m0_s0)) {
        //    setStatusFunktion(eFunktion._20fahrplan)
        //    setStatusButtonA(false) // beide aus schalten
        //    setStatusButtonB(false)
        //}

        // mkcg Maker Kit Car mit Gabelstapler // von Joystick auf Gabelstapler umschalten
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_s0)) {
            setStatusFunktion(eFunktion.m0_m1_s0)
            setStatusButtonCounter(16) // Gabelstapler mit A- B+ lenken
        }
        // mkcg Maker Kit Car mit Gabelstapler // von Gabelstapler auf Fahrplan umschalten
        //else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_m1_s0)) {
        //    setStatusFunktion(eFunktion._20fahrplan)
        //    setStatusButtonA(false) // beide aus schalten
        //    setStatusButtonB(false)
        //}


        // mkck Maker Kit Car mit Kran // von Joystick auf (Seilrolle und Drehkranz) umschalten
        else if (isModell(eModell.mkck) && isFunktion(eFunktion.m0_s0)) {
            setStatusFunktion(eFunktion.ma_mb)
        }
        // mkck Maker Kit Car mit Kran // von (Seilrolle und Drehkranz) auf (Zahnstange und Drehkranz) umschalten
        else if (isModell(eModell.mkck) && isFunktion(eFunktion.ma_mb)) {
            setStatusFunktion(eFunktion.mc_mb)
        }

        // Standardwert immer Fahren und Lenken
        else {
            setStatusFunktion(eFunktion.ng)
            zeigeModellImagePause(1500)
            setStatusFunktion(eFunktion.m0_s0)
            setStatusButtonA(false) // beide aus schalten
            setStatusButtonB(false)
        }
    }


    //% blockId=sender_ButtonA_Switch
    //% group="Schalter / Zähler" subcategory="Knopf A B"
    //% block="Knopf A Schalter" weight=4
    export function sender_ButtonA_Switch() {
        return getStatusButtonA()
    }

    //% blockId=sender_ButtonB_Switch
    //% group="Schalter / Zähler" subcategory="Knopf A B"
    //% block="Knopf B Schalter" weight=3
    export function sender_ButtonB_Switch() {
        return getStatusButtonB()
    }

    //% blockId=sender_ButtonAB_Counter
    //% group="Schalter / Zähler" subcategory="Knopf A B"
    //% block="Knopf A-B+ Zähler" weight=1
    export function sender_ButtonAB_Counter() {
        return getStatusButtonCounter()
    }



    // ========== group="aktuelles Modell" subcategory="Knopf A B"

    //% group="aktuelles Modell" subcategory="Knopf A B"
    //% block="%pModell" weight=4
    export function isModell(pModell: eModell) {
        return getStatusModell() == pModell
        //return btf.getStorageModell() == pModell
    }


    // ========== group="aktuelle Funktion" subcategory="Knopf A B"
    // btf.n_Funktion wird in b-fernsteuerung.ts gespeichert und dort beim Ändern der Funkgruppe auf 0 gesetzt

    //% group="aktuelle Funktion" subcategory="Knopf A B"
    //% block="%pFunktion" weight=3
    export function isFunktion(pFunktion: eFunktion) {
        if (pFunktion == eFunktion.ng)
            return pFunktion != getStatusFunktion()  // true wenn != 0 (nicht nicht) gestartet
        //return btf.n_Funktion != eFunktion.ng // true wenn != 0 (nicht nicht) gestartet
        else
            return pFunktion == getStatusFunktion()
        //return pFunktion == btf.n_Funktion
    }


    // group="Ereignisse" subcategory="Knopf A B"
    // block="%id" deprecated=true
    // id.defl=ButtonEvent.Hold
    //export function buttonEventValue(id: ButtonEvent): number {
    //    return id
    //}



    // ========== Bilder für Auswahl Modell

    //% group="aktuelles Modell" subcategory="Knopf A B"
    // block="%pModell" weight=2
    // group="Image" subcategory="Knopf A B" color=#54C9C9
    //% block="zeige Modell Bild • Pause (ms) %ms" weight=1
    export function zeigeModellImagePause(ms: number) {
        /* 
                [images.createImage(`
            . # . # .
            . . . . .
            . . . . .
            # # # # #
            . # . # .
            `),
                images.createImage(`
            . . # . .
            . . # . .
            . . # # #
            . . # . .
            # # # . .
            `),
                images.createImage(`
            . # # # #
            . # . . #
            . # . . .
            . # . . .
            # # # # .
            `),
                images.createImage(`
            . . . . .
            . # # # .
            # . . . #
            # # # # #
            . # . # .
            `)
                ][getStatusModell()].showImage(0)
         */

        let ai: number[] = []
        switch (getStatusModell()) {
            case eModell.cb2e: {
                ai = [2, 19, 2, 19, 2]
                break
            }
            case eModell.mkcs: {
                ai = [2, 3, 2, 3, 2]
                break
            }
            case eModell.mkcg: {
                ai = [1, 1, 31, 4, 4]
                break
            }
            case eModell.mkck: {
                ai = [1, 31, 17, 17, 24]
                break
            }
            case eModell.car4: {
                ai = [6, 11, 10, 11, 6]
                break
            }
        }

        for (let xLed = 0; xLed < ai.length; xLed++) {
            btf.zeigeBIN(ai[xLed], btf.ePlot.bin, xLed)
        }

        btf.setClearScreen()

        if (ms > 0)
            basic.pause(ms)
    }

} // s-buttons.ts

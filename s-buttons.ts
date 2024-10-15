
namespace sender { // s-buttons.ts

    export const c_ModellCount = 6

    export enum eModell { // zuletzt gewähltes Modell wird im Flash offset 1 dauerhaft gespeiechert
        //% block="Modell Calli:Bot"
        cb2e,
        //% block="Modell Maker Kit Car Sensoren"
        mkcs,
        //% block="Modell Maker Kit Car Gabelstapler"
        mkcg,
        //% block="Modell Maker Kit Car Kran"
        mkck,
        //% block="Modell Buggy"
        buggy,
        //% block="Modell Calliope auf Rädern 4"
        car4
    } // so viele Images müssen im Array sein - Bilder am Ende dieser Datei

    export enum eFunktion {
        //% block="gestartet"
        ng = 0,     // nicht gestartet
        //% block="0 Fahren und Lenken"
        m0_s0,      // Joystick steuert M0 und Servo (Fahren und Lenken)
        //% block="0 Gabelstapler"
        m0_m1_s0,   // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
        //% block="0 Kran Seilrolle und Drehkranz"
        ma_mb,      // MA und MB (Seilrolle und Drehkranz)
        //% block="0 Kran Zahnstange und Drehkranz"
        mc_mb,      // MC und MB (Zahnstange und Drehkranz)

        // _10fernstarten,
        //% block="1 Programm 'Spur folgen'"
        f10fernstartenSpurfolger,
        //% block="1 Programm 'Hindernis ausweichen'"
        f10fernstartenAbstand,
        //% block="2 Fahrplan '5 Strecken senden'"
        f20fahrplan,

        // _20fahrplan,
        //% block="3 Sensoren fernprogrammieren"
        f30sensoren
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

        // cb2e||mkcs // von 'Spur folgen' auf 'Abstand ausweichen' umschalten
        // nach A+B ist 'Spur folgen' eingestellt, müsste mit B noch gestartet werden Startbit MC-4
        else if ((isModell(eModell.cb2e) || isModell(eModell.mkcs)) && !getStatusButtonB() && isFunktion(eFunktion.f10fernstartenSpurfolger)) { // 'Spur folgen' und B false ist die Ruhestellung
            // wenn B aus ist, startet A 'Abstand ausweichen' (reagiert nicht auf getStatusButtonA oder B)
            //setStatusButtonA(true) // Abstand Sensor
            setStatusFunktion(eFunktion.f10fernstartenAbstand)
        }
        // cb2e||mkcs // von 'Abstand ausweichen' auf 'Spur folgen' umschalten
        else if ((isModell(eModell.cb2e) || isModell(eModell.mkcs)) && isFunktion(eFunktion.f10fernstartenAbstand)) {
            // wenn 'Abstand ausweichen', schaltet A zurück auf 'Spur folgen' (wird mit getStatusButtonB noch gestartet)
            //setStatusButtonA(false) // Abstand Sensor
            setStatusButtonB(false)
            setStatusFunktion(eFunktion.f10fernstartenSpurfolger) // 'Spur folgen' und B false ist die Ruhestellung
        }

        // mkcg Maker Kit Car Gabelstapler (lenken mit Tasten)
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_m1_s0)) {
            addStatusButtonCounter(-1, 1, 31)
        }

        // mkck Maker Kit Car Kran // Fahren und Lenken
        else if (isModell(eModell.mkck) && isFunktion(eFunktion.m0_s0)) {
            // setStatusButtonA soll nicht geändert werden
        }
        // mkck Maker Kit Car Kran // von (Seilrolle und Drehkranz) oder (Zahnstange und Drehkranz) ...
        else if (isModell(eModell.mkck)) { // NOT  && !isFunktion(eFunktion.m0_s0)
            setStatusButtonA(!getStatusButtonA())  // A immer wechseln true-false
            if (getStatusButtonA())
                setStatusFunktion(eFunktion.ma_mb) // auf (Seilrolle und Drehkranz) umschalten
            else
                setStatusFunktion(eFunktion.mc_mb) // auf (Zahnstange und Drehkranz) umschalten       
        }
        // mkck Maker Kit Car Kran // von (Zahnstange und Drehkranz) auf (Seilrolle und Drehkranz) umschalten
        //else if (isModell(eModell.mkck) && isFunktion(eFunktion.mc_mb)) {
        //    setStatusFunktion(eFunktion.ma_mb)
        //}


        // Standardwerte    
        else {
            setStatusButtonA(!getStatusButtonA()) // A immer wechseln true-false
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
        // Maker Kit Car && Gabelstapler 'Fahren und Lenken'
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

        // cb2e||mkcs // von 'Fahren und Lenken' auf 'fernstarten Spurfolger' umschalten
        else if ((isModell(eModell.cb2e) || isModell(eModell.mkcs)) && isFunktion(eFunktion.m0_s0)) {
            setStatusFunktion(eFunktion.f10fernstartenSpurfolger) // 'Spur folgen' und B false ist die Ruhestellung
            setStatusButtonA(isModell(eModell.cb2e)) // Ultraschall Sensor bei Calli:bot an
            setStatusButtonB(false) // 'fernstarten Spurfolger' noch nicht aktiv; B muss MC-4 aktivieren
            // oder A muss 'fernstarten Abstand ausweichen' und MD-5 aktivieren
        }
        // cb2e||mkcs // von 'fernstarten Spurfolger' auf 'Fahrplan' umschalten
        else if ((isModell(eModell.cb2e) || isModell(eModell.mkcs)) && !getStatusButtonB() && isFunktion(eFunktion.f10fernstartenSpurfolger)) { // 'Spur folgen' und B false ist die Ruhestellung
            setStatusFunktion(eFunktion.f20fahrplan)
            setStatusButtonA(false)
            setStatusButtonB(false) // war schon false
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


        // mkck Maker Kit Car Kran // von 'Fahren und Lenken' auf ...
        else if (isModell(eModell.mkck) && isFunktion(eFunktion.m0_s0)) {
            if (getStatusButtonA())
                setStatusFunktion(eFunktion.ma_mb) // auf (Seilrolle und Drehkranz) umschalten
            else
                setStatusFunktion(eFunktion.mc_mb) // auf (Zahnstange und Drehkranz) umschalten
        }
        // mkck Maker Kit Car Kran // von (Seilrolle und Drehkranz) oder (Zahnstange und Drehkranz) ...
        else if (isModell(eModell.mkck)) { // NOT && !isFunktion(eFunktion.m0_s0)
            setStatusFunktion(eFunktion.m0_s0) // auf Standardwert Fahren und Lenken umschalten
            // ohne A B zu ändern / A Motoren B Elektromagnet
        }

        // Standardwert immer Fahren und Lenken
        else {
            setStatusFunktion(eFunktion.ng) // senden unterbrechen, um Modell anzuzeigen
            zeigeModellImagePause(1500)
            setStatusFunktion(eFunktion.m0_s0) // Standardwert Fahren und Lenken
            setStatusButtonA(false)
            setStatusButtonB(false) // beide aus schalten
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
    //% block="Knopf A- B+ Zähler" weight=1
    export function sender_ButtonAB_Counter() {
        return getStatusButtonCounter()
    }



    // ========== group="aktuelles Modell" subcategory="Knopf A B"

    //% group="aktuelles Modell" subcategory="Knopf A B"
    //% block="%pModell" weight=4
    export function isModell(pModell: eModell) {
        return getStatusModell() == pModell
    }


    // ========== group="aktuelle Funktion" subcategory="Knopf A B"

    //% group="aktuelle Funktion" subcategory="Knopf A B"
    //% block="%pFunktion" weight=3
    export function isFunktion(pFunktion: eFunktion) {
        if (pFunktion == eFunktion.ng)
            return pFunktion != getStatusFunktion() // true wenn != 0 (nicht nicht) gestartet
        else
            return pFunktion == getStatusFunktion()
    }



    // ========== Bilder für Auswahl Modell

    //% group="aktuelles Modell" subcategory="Knopf A B"
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
                ai = [2, 19, 2, 19, 2] // Calli:bot
                break
            }
            case eModell.mkcs: {
                ai = [2, 3, 2, 3, 2] // Sensoren
                break
            }
            case eModell.mkcg: {
                ai = [1, 1, 31, 4, 4] // Gabelstapler
                break
            }
            case eModell.mkck: {
                ai = [1, 31, 17, 17, 24] // Kran
                break
            }
            case eModell.buggy: {
                ai = [14, 4, 4, 4, 14] // Buggy
                break
            }
            case eModell.car4: {
                ai = [6, 11, 10, 11, 6] // CaR 4
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

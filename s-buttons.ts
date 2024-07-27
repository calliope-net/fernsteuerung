
namespace sender { // s-buttons.ts

    export const c_ModellCount = 4

    export enum eModell { // zuletzt gewähltes Modell wird im Flash offset 1 dauerhaft gespeiechert
        //% block="Modell Calli:Bot"
        cb2e, // Standardwert CalliBot
        //% block="Modell Maker Kit Car"
        mkcg, // Maker Kit Car ohne und mit Gabelstapler
        //% block="Modell Maker Kit Car Kran"
        mkck, // Maker Kit Car mit Kran
        //% block="Modell Calliope auf Rädern 4"
        car4  // CaR 4
    } // so viele Images müssen im Array sein - Bilder am Ende dieser Datei
  
    export enum eFunktion {
        //% block="gestartet"
        ng = 0, // nicht gestartet
        //% block="00 Fahren und Lenken"
        m0_s0,      // Joystick steuert M0 und Servo (Fahren und Lenken)
        //% block="00 Gabelstapler"
        m0_m1_s0,   // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
        //% block="00 Seilrolle und Drehkranz"
        ma_mb,      // MA und MB (Seilrolle und Drehkranz)
        //% block="00 Zahnstange und Drehkranz"
        mc_mb,       // MC und MB (Zahnstange und Drehkranz)
        //% block="10 Calli:bot Programm fernstarten"
        mc_md_callibot_beispiele,
        //% block="20 Fahrplan senden"
        m1abcd_fahrplan
    }


    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf A geklickt" weight=7
    export function buttonA() {

        if (!isFunktion(eFunktion.ng)) { // nicht gestartet
            if (getStatusModell() > 0)
                setStatusModell(getStatusModell() - 1) // setStatusModell() schreibt auch in Flash
            zeigeModellImagePause(1500)
            btf.zeigeFunkgruppe()

        }

        // Calli:bot && Funktion Beispiele (Modell Nummer ++)
        /* else if (isModell(eModell.cb2e) && n_Funktion == eFunktion.mc_md_callibot_beispiele) {

            a_ButtonAB_Switch[eButtonAB_Switch.B] = false // Beispiel noch nicht aktiv senden; erst nach B geklickt

            if (n_ButtonAB_Counter < 3) // zählt bis 3, dann 1
                n_ButtonAB_Counter += 1
            else
                n_ButtonAB_Counter = 1
        } */

        // Maker Kit Car && Gabelstapler (lenken mit Tasten)
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_m1_s0)) {
            addStatusButtonCounter(-1, 1, 31)
        }
        // Standardwerte    
        else {
            setStatusButtonA(!getStatusButtonA())


        }
    }


    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf B geklickt" weight=6
    export function buttonB() {

        if (!isFunktion(eFunktion.ng)) { // nicht gestartet
            if (getStatusModell() < c_ModellCount - 1)
                setStatusModell(getStatusModell() + 1) // setStatusModell() schreibt auch in Flash
            zeigeModellImagePause(1500)
            btf.zeigeFunkgruppe()
        }

        // Calli:bot && Funktion Beispiele (mit A gewählte Modell Nummer starten)
        //else if (isModell(eModell.cb2e) && n_Funktion == eFunktion.mc_md_callibot_beispiele) {
        //    a_ButtonAB_Switch[eButtonAB_Switch.B] = !a_ButtonAB_Switch[eButtonAB_Switch.B] // Beispiel jetzt aktiv senden
        //}

        // Maker Kit Car && Gabelstapler (lenken mit Tasten)
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_m1_s0)) {
            addStatusButtonCounter(1, 1, 31) // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
        }
        // Standardwerte       
        else {
            setStatusButtonB(!getStatusButtonB()) // Standardwert immer wechseln true-false
        }

    }



    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf A+B geklickt" weight=5
    export function buttonAB() {
        // wenn einmal A+B geklickt, wird n_Funktion nie wieder ng (nicht gestartet)
        if (!isFunktion(eFunktion.ng)) { // nicht gestartet // beim ersten Mal (nach Reset)
            //n_einmalgestartet = true//  btf.n_FunkgruppeChanged = true // verhindert Ändern des Modell

            setStatusFunktion(eFunktion.m0_s0) // Standardwert immer Fahren und Lenken
            setStatusButtonA(false) //  n_ButtonA_Switch = false  // beide aus schalten
            setStatusButtonB(false) // n_ButtonB_Switch = false
        }
        // cb2e Calli:bot von Joystick auf fernstarten umschalten
        else if (isModell(eModell.cb2e) && isFunktion(eFunktion.m0_s0)) {

            setStatusButtonA(true) //  n_ButtonA_Switch = true  // Ultraschall Sensor aktiv
            setStatusButtonB(false) // n_ButtonB_Switch = false // Beispiel noch nicht aktiv senden; erst nach B geklickt
            setStatusFunktion(eFunktion.mc_md_callibot_beispiele)
            /* if (!btf.between(n_ButtonAB_Counter, 1, 3))
                n_ButtonAB_Counter = 1 */
        }
        // cb2e Calli:bot von fernstarten auf Fahrplan umschalten
        else if (isModell(eModell.cb2e) && isFunktion(eFunktion.mc_md_callibot_beispiele)) {
            setStatusFunktion(eFunktion.m1abcd_fahrplan)
            setStatusButtonA(false) // n_ButtonA_Switch = false  // beide aus schalten
            setStatusButtonB(false) // n_ButtonB_Switch = false
        }

        // mkcg Maker Kit Car ohne und mit Gabelstapler
        else if (isModell(eModell.mkcg) && isFunktion(eFunktion.m0_s0)) {
            setStatusFunktion(eFunktion.m0_m1_s0)
            setStatusButtonCounter(16)
            //n_ButtonAB_Counter = 16
        }
        // mkck Maker Kit Car mit Kran
        else if (isModell(eModell.mkck) && isFunktion(eFunktion.m0_s0))
            setStatusFunktion(eFunktion.ma_mb) // Funktion weiter schalten
        else if (isModell(eModell.mkck) && isFunktion(eFunktion.ma_mb))
            setStatusFunktion(eFunktion.mc_mb) // Funktion weiter schalten

        else {
            //  a_ButtonAB_Switch[eButtonAB_Switch.AB] = !a_ButtonAB_Switch[eButtonAB_Switch.AB] // Standardwert immer wechseln true-false

            setStatusFunktion(eFunktion.m0_s0) // Standardwert immer Fahren und Lenken
            setStatusButtonA(false) //  n_ButtonA_Switch = false  // beide aus schalten
            setStatusButtonB(false) //  n_ButtonB_Switch = false
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

        btf.setClearScreen()

        if (ms > 0)
            basic.pause(ms)
    }

} // s-buttons.ts

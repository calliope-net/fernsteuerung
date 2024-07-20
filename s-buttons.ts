
namespace sender { // s-buttons.ts

    export enum eButtonAB_Switch { A, B }//, AB
    export let a_ButtonAB_Switch = [false, false] //, false so viele Elemente wie Member in der Enum eButtonAB_Switch
    //  export let n_CalliBotBeispielButtonAB = 0
    export let n_ButtonAB_Counter = 0 // 1..16..31 mit A- B+ ändern

    export enum eModell { // zuletzt gewähltes Modell wird im offset 1 dauerhaft gespeiechert
        //% block="Modell Calli:Bot"
        cb2e, // Standardwert CalliBot
        //% block="Modell Maker Kit Car"
        mkcg, // Maker Kit Car ohne und mit Gabelstapler
        //% block="Modell Maker Kit Car Kran"
        mkck, // Maker Kit Car mit Kran
        //% block="Modell Calliope auf Rädern 4"
        car4  // CaR 4
    } // so viele Images müssen im Array sein - Bilder am Ende dieser Datei
    export const c_ModellCount = 4

    // Funktion: wird je nach Modell mit Tasten geändert, steht nicht im Flash

    export enum eFunktion {
        //% block="gestartet"
        ng, // nicht gestartet
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
    export let n_Funktion = eFunktion.ng // aktuell ausgewählte Funktion


    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf A geklickt" weight=7
    export function buttonA() {

        if (n_Funktion == eFunktion.ng) {
            if (btf.getStorageModell() > 0)
                btf.setStorageModell(btf.getStorageModell() - 1)

            zeigeImage(btf.getStorageModell())

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
        else if (isModell(eModell.mkcg) && n_Funktion == eFunktion.m0_m1_s0) {

            if (n_ButtonAB_Counter > 1)  // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
                n_ButtonAB_Counter--
        }
        // Standardwerte    
        else {
            a_ButtonAB_Switch[eButtonAB_Switch.A] = !a_ButtonAB_Switch[eButtonAB_Switch.A] // Standardwert immer wechseln true-false

        }
    }


    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf B geklickt" weight=6
    export function buttonB() {

        if (n_Funktion == eFunktion.ng) {
            if (btf.getStorageModell() < c_ModellCount - 1)
                btf.setStorageModell(btf.getStorageModell() + 1)

            zeigeImage(btf.getStorageModell())

        }
        // Calli:bot && Funktion Beispiele (mit A gewählte Modell Nummer starten)
        //else if (isModell(eModell.cb2e) && n_Funktion == eFunktion.mc_md_callibot_beispiele) {
        //    a_ButtonAB_Switch[eButtonAB_Switch.B] = !a_ButtonAB_Switch[eButtonAB_Switch.B] // Beispiel jetzt aktiv senden
        //}
        // Maker Kit Car && Gabelstapler (lenken mit Tasten)
        else if (isModell(eModell.mkcg) && n_Funktion == eFunktion.m0_m1_s0) {

            if (n_ButtonAB_Counter < 31)  // M0 und M1, Servo über Tasten A- B+ (Gabelstapler)
                n_ButtonAB_Counter++
        }
        // Standardwerte       
        else {
            a_ButtonAB_Switch[eButtonAB_Switch.B] = !a_ButtonAB_Switch[eButtonAB_Switch.B] // Standardwert immer wechseln true-false
            // mit B Licht, wenn oben nichts anderes steht
        }
        //   return modellChanged
    }



    //% group="in Eingabe Ereignisse einfügen" subcategory="Knopf A B"
    //% block="Knopf A+B geklickt" weight=5
    export function buttonAB() {
        // wenn einmal A+B geklickt, wird n_Funktion nie wieder ng (nicht gestartet)
        if (n_Funktion == eFunktion.ng) // beim ersten Mal (nach Reset)
            n_Funktion = eFunktion.m0_s0 // Standardwert immer Fahren und Lenken

        // cb2e Calli:bot von Joystick auf Beispiele umschalten
        else if (isModell(eModell.cb2e) && n_Funktion == eFunktion.m0_s0) {

            a_ButtonAB_Switch[eButtonAB_Switch.A] = true  // Ultraschall Sensor aktiv
            a_ButtonAB_Switch[eButtonAB_Switch.B] = false // Beispiel noch nicht aktiv senden; erst nach B geklickt
            n_Funktion = eFunktion.mc_md_callibot_beispiele
            /* if (!btf.between(n_ButtonAB_Counter, 1, 3))
                n_ButtonAB_Counter = 1 */
        }
        // mkcg Maker Kit Car ohne und mit Gabelstapler
        else if (isModell(eModell.mkcg) && n_Funktion == eFunktion.m0_s0) {
            n_Funktion = eFunktion.m0_m1_s0
            n_ButtonAB_Counter = 16
        }
        // mkck Maker Kit Car mit Kran
        else if (isModell(eModell.mkck) && n_Funktion == eFunktion.m0_s0)
            n_Funktion = eFunktion.ma_mb // Funktion weiter schalten
        else if (isModell(eModell.mkck) && n_Funktion == eFunktion.ma_mb)
            n_Funktion = eFunktion.mc_mb // Funktion weiter schalten

        else {
            //  a_ButtonAB_Switch[eButtonAB_Switch.AB] = !a_ButtonAB_Switch[eButtonAB_Switch.AB] // Standardwert immer wechseln true-false

            a_ButtonAB_Switch[eButtonAB_Switch.A] = false  // beide aus schalten
            a_ButtonAB_Switch[eButtonAB_Switch.B] = false

            n_Funktion = eFunktion.m0_s0 // Standardwert immer Fahren und Lenken
            //n_ButtonAB_Counter = 16

        }
    }



    //% group="Schalter / Zähler" subcategory="Knopf A B" deprecated=1
    //% block="Knopf %pSchalter Schalter" weight=5
    export function getButtonAB_Switch(pSwitch: eButtonAB_Switch): boolean {
        return a_ButtonAB_Switch[pSwitch]
    }

    //% group="Schalter / Zähler" subcategory="Knopf A B"
    //% blockId=sender_ButtonA_Switch
    //% block="Knopf A Schalter" weight=4
    export function sender_ButtonA_Switch() {
        return a_ButtonAB_Switch[eButtonAB_Switch.A]
    }

    //% group="Schalter / Zähler" subcategory="Knopf A B"
    //% blockId=sender_ButtonB_Switch
    //% block="Knopf B Schalter" weight=3
    export function sender_ButtonB_Switch() {
        return a_ButtonAB_Switch[eButtonAB_Switch.B]
    }

    //% group="Schalter / Zähler" subcategory="Knopf A B" deprecated=1
    //% block="Knopf A-B+ Zähler" weight=2
    export function getButtonAB_Counter() {
        return n_ButtonAB_Counter
    }

    //% group="Schalter / Zähler" subcategory="Knopf A B"
    //% blockId=sender_ButtonAB_Counter
    //% block="Knopf A-B+ Zähler" weight=1
    export function sender_ButtonAB_Counter() {
        return n_ButtonAB_Counter
    }



    // ========== group="aktuelles Modell" subcategory="Knopf A B"

    //% group="aktuelles Modell" subcategory="Knopf A B"
    //% block="%pModell" weight=4
    export function isModell(pModell: eModell) {
        // return btf.isModell(pModell)
        return btf.getStorageModell() == pModell
    }


    // ========== group="aktuelle Funktion" subcategory="Knopf A B"

    //% group="aktuelle Funktion" subcategory="Knopf A B"
    //% block="%pFunktion" weight=3
    export function isFunktion(pFunktion: eFunktion) {
        if (pFunktion == eFunktion.ng)
            return n_Funktion != eFunktion.ng // wenn nicht nicht gestartet
        else
            return pFunktion == n_Funktion
    }


    //% group="aktuelle Funktion" subcategory="Knopf A B"
    //% block="Funktion auf 'nicht gestartet' stellen" weight=2
    export function resetFunktion() {
        n_Funktion = eFunktion.ng
    }


    //% group="Ereignisse" subcategory="Knopf A B"
    //% block="%id" deprecated=true
    //% id.defl=ButtonEvent.Hold
    export function buttonEventValue(id: ButtonEvent): number {
        return id
    }



    // ========== Bilder für Auswahl Modell

    // group="Image" subcategory="Knopf A B" color=#54C9C9
    // block="zeige Bild %image" weight=1
    export function zeigeImage(index: number) {

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
        ][index].showImage(0)

        btf.n5x5_setClearScreen = true
    }

    /*  export let a_ModellImages_ = [
         images.createImage(`
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
     ] */

} // s-buttons.ts

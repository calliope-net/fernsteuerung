
namespace btf { // b-enums.ts

    export enum eFunkgruppe {
        //% block="1"
        b0 = 0xB0, // = c_funkgruppe_min
        //% block="2"
        b1,
        //% block="3"
        b2,
        //% block="4"
        b3,
        //% block="5"
        b4,
        //% block="6"
        b5,
        //% block="7"
        b6,
        //% block="8"
        b7
    }

    // ========== Buffer offset

    export enum eBufferPointer {
        //% block="[1] M0"
        m0 = 1,
        //% block="[4] M1 (1)"
        m1 = 4,
        //% block="[7] MA (2)"
        ma = 7,
        //% block="[10] MB (3)"
        mb = 10,
        //% block="[13] MC (4)"
        mc = 13,
        //% block="[16] MD (5)"
        md = 16,

        //% block="[4] Ultraschallsensor"
        ue = 4,
        //% block="[7] Spursensor 00"
        s00 = 7,
        //% block="[10] Spursensor 01"
        s01 = 10,
        //% block="[13] Spursensor 10"
        s10 = 13,
        //% block="[16] Spursensor 11"
        s11 = 16,
    }

    export enum eBufferOffset { // 3 Byte (b0-b1-b2) ab n_BufferPointer
        //% block="Motor (1 ↓ 128 ↑ 255)"
        b0_Motor = 0, // 1..128..255
        //% block="Servo (1 ↖ 16 ↗ 31)"
        b1_Servo = 1, // Bit 4-0 (0..31)
        //% block="Länge 0..255 cm"
        b2_Fahrstrecke = 2, // Encoder in cm max. 255cm
        // b1_3Bit = 3 // Bit 7-6-5
    }



    // ========== Steuer-Byte 3

    export enum e3aktiviert {

        //% block="Motor M0"
        m0 = 0x01,
        //% block="Motor M1-1"
        m1 = 0x02,
        //% block="Motor MA-2"
        ma = 0x04,
        //% block="Motor MB-3"
        mb = 0x08,
        //% block="Motor MC-4"
        mc = 0x10,
        //% block="Motor MD-5"
        md = 0x20,

        //% block="Ultraschallsensor"
        ue = 0x02,
        //% block="Spursensor 00"
        s00 = 0x04,
        //% block="Spursensor 01"
        s01 = 0x08,
        //% block="Spursensor 10"
        s10 = 0x10,
        //% block="Spursensor 11"
        s11 = 0x20
    }

    export enum e3Abstand {
        //% block="20 cm" // 40
        u0 = 0x00,
        //% block="30 cm" // 35
        u1 = 0x40,
        //% block="40 cm" // 20
        u2 = 0x80,
        //% block="50 cm" // 30
        u3 = 0xC0
    }

    export let a_Abstand = [20, 30, 40, 50] // auslesen beim Empfänger


    // ========== Servo Bits 7-6-5

    export enum eSensor {
        //% block="Stop bei Spursensor"
        b5Spur = 0x20,
        //% block="Stop bei Ultraschallsensor"
        b6Abstand = 0x40,
        //% block="Encoder Impulse"
        b7Impulse = 0x80
    }


    // ========== Steuer-Byte 0

    export enum e0Betriebsart {
        //% block="0 mit Joystick fernsteuern"
        p0Fahren = 0x00,
        //% block="1 Programm fernstarten"
        p1Lokal = 0x10,
        //% block="2 Fahrplan senden"
        p2Fahrplan = 0x20,
        //% block="3 Sensoren fernprogrammieren"
        p3Sensoren = 0x30,
    }

    export enum e0Schalter {
        //% block="0 Hupe"
        b0 = 0x01,
        //% block="1 Relais"
        b1 = 0x02,
        //% block="2 Licht"
        b2 = 0x04,
        //% block="3"
        b3 = 0x08,
        //% block="6 Status zurück senden"
        b6 = 0x40,
        //% block="7 zurücksetzen"
        b7 = 0x80
    }

    /* export enum eNOT {
        //% block=" "
        t,
        //% block="nicht"
        f
    } */


    export enum ePause { // Zehntelsekunden
        //% block="1 Sekunde"
        s1 = 10,
        //% block="0,5 Sekunden"
        s05 = 5,
        //% block="2 Sekunden"
        s2 = 20,
        //% block="5 Sekunden"
        s5 = 50,
        //% block="10 Sekunden"
        s10 = 100,
        //% block="15 Sekunden"
        s15 = 150,
        //% block="20 Sekunden"
        s20 = 200,
        //% block="25 Sekunden"
        s25 = 250
    }


    //% blockId=btf_zehntelsekunden
    //% block="%pause" blockHidden=true
    export function btf_zehntelsekunden(pause: ePause): number { return pause }


} // b-enums.ts

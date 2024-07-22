
namespace btf { // b-enums.ts


    // ========== Buffer offset

    export enum eBufferPointer {
        //% block="[1] M0"
        m0 = 1,
        //% block="[4] M1"
        m1 = 4,
        //% block="[7] MA"
        ma = 7,
        //% block="[10] MB"
        mb = 10,
        //% block="[13] MC"
        mc = 13,
        //% block="[16] MD"
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


        //% block="M0 | Joystick"
        p0 = 1,
        //% block="M1 | 1. Strecke | Ultraschall"
        p1 = 4,
        //% block="MA | 2. Strecke | Spur 00"
        p2 = 7,
        //% block="MB | 3. Strecke | Spur 01"
        p3 = 10,
        //% block="MC | 4. Strecke | Spur 10"
        p4 = 13,
        //% block="MD | 5. Strecke | Spur 11"
        p5 = 16
    }


        // block="[4] 1. Strecke"
        //f1 = 4,
        // block="[7] 2. Strecke"
        //f2 = 7,
        // block="[10] 3. Strecke"
        //f3 = 10,
        // block="[13] 4. Strecke"
        //f4 = 13,
        // block="[16] 5. Strecke"
        //f5 = 16,


    export enum eBufferOffset { // 3 Byte (b0-b1-b2) ab n_BufferPointer
        //% block="Motor (1 ↓ 128 ↑ 255)"
        b0_Motor = 0, // 1..128..255
        //% block="Servo (1 ↖ 16 ↗ 31)"
        b1_Servo = 1, // Bit 4-0 (0..31)
        //% block="Fahrstrecke 0..255 cm"
        b2_Fahrstrecke = 2, // Encoder in cm max. 255cm
        // b1_3Bit = 3 // Bit 7-6-5
    }



    // ========== Steuer-Byte 3

    export enum e3aktiviert {

        //% block="Motor M0"
        m0 = 0x01,
        //% block="Motor M1"
        m1 = 0x02,
        //% block="Motor MA"
        ma = 0x04,
        //% block="Motor MB"
        mb = 0x08,
        //% block="Motor MC"
        mc = 0x10,
        //% block="Motor MD"
        md = 0x20,


        //% block="1. Strecke"
        f1 = 0x02,
        //% block="2. Strecke"
        f2 = 0x04,
        //% block="3. Strecke"
        f3 = 0x08,
        //% block="4. Strecke"
        f4 = 0x10,
        //% block="5. Strecke"
        f5 = 0x20,


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


        //% block="M0 & M1 (0x03)"
        //  m01 = m0 + m1,
        //% block="MA & MB (0x0C)"
        //  mab = ma + mb,
        //% block="MC & MD (0x30)"
        //  mcd = mc + md,
        //% block="alle 6 Bit (0x3F)"
        //  m01abcd = m01 + mab + mcd
    }


    export enum e3Abstand {
        //% block="20 cm"
        u2 = 0x80,
        //% block="10 cm"
        u0 = 0x00,
        //% block="15 cm"
        u1 = 0x40,
        //% block="30 cm"
        u3 = 0xC0
    }

    export let a_Abstand = [10, 15, 20, 30] // auslesen beim Empfänger


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
        //% block="00 mit Joystick fernsteuern"
        p0Fahren = 0x00,
        //% block="10 Programm fernstarten"
        p1Lokal = 0x10,
        //% block="20 Fahrplan senden"
        p2Fahrplan = 0x20,
        //% block="30 Sensoren fernprogrammieren"
        p3Sensoren = 0x30,
        // block="00" deprecated=1
        //p0 = 0x00,
        // block="10" deprecated=true
        //p1 = 0x10,
        // block="20" deprecated=true
        //p2Strecken = 0x20,
        // block="30" deprecated=true
        //p3 = 0x30

    }

    export enum e0Schalter {
        //% block="0 Hupe"
        b0 = 0x01,
        //% block="1 Magnet"
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

    export enum eNOT {
        //% block=" "
        t,
        //% block="nicht"
        f
    }


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

    // blockId=btf_sekunden 
    // block="%pause" blockHidden=true
    // export function btf_sekunden(pause: ePause): number { return pause / 10 }

    //% blockId=btf_zehntelsekunden
    //% block="%pause" blockHidden=true
    export function btf_zehntelsekunden(pause: ePause): number { return pause }


} // b-enums.ts

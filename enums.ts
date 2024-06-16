
namespace radio { // enums.ts


    // ========== Buffer offset

    // group="Enums" advanced=true
    // block="%bufferpointer" weight=2
    //function radio_bufferpointer(bufferpointer: eBufferPointer) { return bufferpointer }
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

        //% block="[4] 1. Strecke"
        f1 = 4,
        //% block="[7] 2. Strecke"
        f2 = 7,
        //% block="[10] 3. Strecke"
        f3 = 10,
        //% block="[13] 4. Strecke"
        f4 = 13,
        //% block="[16] 5. Strecke"
        f5 = 16,

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

    // group="Enums" advanced=true
    // block="%bufferoffset" weight=1
    //function radio_bufferoffset(bufferoffset: eBufferOffset) { return bufferoffset }
    export enum eBufferOffset { // 3 Byte (b0-b1-b2) ab n_BufferPointer
        //% block="Motor (1 ↓ 128 ↑ 255)"
        b0_Motor = 0, // 1..128..255
        //% block="Servo (1 ↖ 16 ↗ 31)"
        b1_Servo = 1, // Bit 4-0 (0..31)
        //% block="Entfernung 0..255 cm"
        b2_Fahrstrecke = 2, // Encoder in cm max. 255cm
        // b1_3Bit = 3 // Bit 7-6-5
    }



    // ========== Steuer-Byte 3

    // group="Enums" advanced=true
    // block="[3] %motorbit aktiviert" weight=4
    //function radio_aktiviert(motorbit: e3aktiviert) { return motorbit }
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

    // group="Enums" advanced=true
    // block="[3] Ultraschall Entfernung %entfernung" weight=3
    //function radio_entfernung(entfernung: e3Entfernung) { return entfernung }
    export enum e3Entfernung {
        //% block="5 cm"
        u0 = 0x00,
        //% block="10 cm"
        u1 = 0x40,
        //% block="15 cm"
        u2 = 0x80,
        //% block="20 cm"
        u3 = 0xC0
    }



    // ========== Servo Bits 7-6-5

    export enum eSensor {
        //% block="Stop bei Spursensor"
        b5 = 0x20,
        //% block="Stop bei Ultraschallsensor"
        b6 = 0x40,
        //% block="Encoder Impulse"
        b7 = 0x80
    }



    // ========== Steuer-Byte 0

    // group="Enums" advanced=true
    // block="[0] Betriebsart %betriebsart" weight=6
    //function radio_betriebsart(betriebsart: e0Betriebsart) { return betriebsart }
    export enum e0Betriebsart {
        //% block="00 Fernsteuerung Motoren"
        p0 = 0x00,
        //% block="10 Fernsteuerung Motor M0 bis Sensor"
        p1 = 0x10,
        //% block="20 Programm 5 Strecken"
        p2 = 0x20,
        //% block="30 Programm Sensoren"
        p3 = 0x30
    }


    // group="Enums" advanced=true
    // block="[0] Schalter %schalter" weight=5
    //function radio_schalter(schalter: e0Schalter) { return schalter }
    export enum e0Schalter {
        //% block="0 Hupe"
        b0 = 0x01,
        //% block="1 Magnet"
        b1 = 0x02,
        //% block="2"
        b2 = 0x04,
        //% block="3"
        b3 = 0x08,
        //% block="6 Status zurück senden"
        b6 = 0x40,
        //% block="7 zurücksetzen"
        b7 = 0x80
    }


} // enums.ts

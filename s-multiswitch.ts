
namespace sender { // s-multiswitch.ts

    const i2cGroveMultiswitch_x03 = 0x03
    const i2c_CMD_GET_DEV_EVENT = 0x01	// gets device event status

    enum eMultiswitchPostion { oben = 4, links, unten, rechts, mitte }

    let n_GroveMultiswitchConnected = true // Antwort von i2cWriteBuffer == 0 wenn angeschlossen

    //% group="Grove Multiswitch 0x03"
    //% block="Multiswitch einlesen und Funktion umschalten || zeige I²C Fehler %zeigeFehler" weight=8
    //% zeigeFehler.shadow=toggleYesNo
    export function multiswitchGrove(zeigeFehler = false) {
        if (n_GroveMultiswitchConnected) {
            n_GroveMultiswitchConnected = pins.i2cWriteBuffer(i2cGroveMultiswitch_x03, Buffer.fromArray([i2c_CMD_GET_DEV_EVENT]), true) == 0

            if (n_GroveMultiswitchConnected) {
                let bu = pins.i2cReadBuffer(i2cGroveMultiswitch_x03, 10) // 4 Byte + 6 Schalter = 10
                // Byte 0-3: 32 Bit UInt32LE; Byte 4:Schalter 1 ... Byte 9:Schalter 6
                // Byte 4-9: 00000001:Schalter OFF; 00000000:Schalter ON; Bit 1-7 löschen & 0x01
                // Richtung N = 1, W = 2, S = 3, O = 4, M = 5
                // ON=00000000 OFF=00000001

                if (isModell(eModell.mkck)) { // (getModell() == eModell.mkck) { // Maker Kit Car mit Kran

                    if (bu[eMultiswitchPostion.mitte] == 0) {      // 5 Mitte gedrückt
                        setStatusFunktion(eFunktion.m0_s0) // Joystick steuert M0 und Servo (Fahren und Lenken)
                    }
                    else if (bu[eMultiswitchPostion.oben] == 0) { // 1 nach oben
                        setStatusFunktion(eFunktion.ma_mb) // MA und MB (Seilrolle und Drehkranz)
                    }
                    else if (bu[eMultiswitchPostion.unten] == 0) { // 3 nach unten
                        setStatusFunktion(eFunktion.mc_mb) // MC und MB (Zahnstange und Drehkranz)
                    }
                    else if (bu[eMultiswitchPostion.links] == 0) { // 2 nach links
                        setStatusButtonB(false) // Magnet = false
                    }
                    else if (bu[eMultiswitchPostion.rechts] == 0) { // 4 nach rechts
                        setStatusButtonB(true) // Magnet = true
                    }
                }
            }
            else if (zeigeFehler)
                btf.zeigeHexFehler(i2cGroveMultiswitch_x03)

        }
        return n_GroveMultiswitchConnected

    }


} // s-multiswitch.ts

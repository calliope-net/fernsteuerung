
namespace sender { // s-multiswitch.ts

    const i2cGroveMultiswitch_x03 = 0x03
    const i2c_CMD_GET_DEV_EVENT = 0x01	// gets device event status

    let n_GroveMultiswitchConnected = true // Antwort von i2cWriteBuffer == 0 wenn angeschlossen

    //% group="Grove Multiswitch 0x03"
    //% block="Schalter einlesen und Funktion umschalten" weight=8
    export function multiswitchGrove() {
        if (n_GroveMultiswitchConnected) {
            n_GroveMultiswitchConnected = pins.i2cWriteBuffer(i2cGroveMultiswitch_x03, Buffer.fromArray([i2c_CMD_GET_DEV_EVENT]), true) == 0

            if (!n_GroveMultiswitchConnected)
                btf.zeigeHex(i2cGroveMultiswitch_x03)

            else {
                let bu = pins.i2cReadBuffer(i2cGroveMultiswitch_x03, 10) // 4 Byte + 6 Schalter = 10
                // Byte 0-3: 32 Bit UInt32LE; Byte 4:Schalter 1 ... Byte 9:Schalter 6
                // Byte 4-9: 00000001:Schalter OFF; 00000000:Schalter ON; Bit 1-7 löschen & 0x01
                // Richtung N = 1, W = 2, S = 3, O = 4, M = 5
                // ON=00000000 OFF=00000001

                if (isModell(eModell.mkck)) { // (getModell() == eModell.mkck) { // Maker Kit Car mit Kran

                    if (bu[3 + 5] == 0) {      // 5 Mitte gedrückt
                        n_Funktion = eFunktion.m0_s0 // Joystick steuert M0 und Servo (Fahren und Lenken)
                    }
                    else if (bu[3 + 1] == 0) { // 1 nach oben
                        n_Funktion = eFunktion.ma_mb // MA und MB (Seilrolle und Drehkranz)
                    }
                    else if (bu[3 + 3] == 0) { // 3 nach unten
                        n_Funktion = eFunktion.mc_mb // MC und MB (Zahnstange und Drehkranz)
                    }
                    else if (bu[3 + 2] == 0) { // 2 nach links
                      
                        if (isModell(eModell.mkcg) && n_Funktion == eFunktion.m0_m1_s0)
                            a_ButtonAB_Switch[eButtonAB_Switch.A] = false // n_Magnet = false
                    }
                    else if (bu[3 + 4] == 0) { // 4 nach rechts
                      
                        if (isModell(eModell.mkcg) && n_Funktion == eFunktion.m0_m1_s0)
                            a_ButtonAB_Switch[eButtonAB_Switch.A] = true // n_Magnet = true
                    }
                }
            }
        }
        return n_GroveMultiswitchConnected

    }
    /* 
        export enum eStatus {
            //% block="[0] nicht angeschlossen"
            nicht_angeschlossen = 0,
            //% block="[5] Fahren und Lenken"
            fahren = 5,
            //% block="[1] Seilrolle und Drehkranz"
            seilrolle = 1,
            //% block="[3] Zahnstange und Drehkranz"
            zahnstange = 3,
            //% block="[2] Magnet aus"
            links = 2,
            //% block="[4] Magnet an"
            rechts = 4
            //fehler
        }
    
        //let n_rgb = basic.rgb(7, 7, 7)
        let n_Status_changed = false
        let n_Status: eStatus // NaN 
        // let n_Magnet = false
    
        //% group="Grove Multiswitch 0x03" deprecated=true
        //% block="Schalter einlesen und 1\\|3\\|5" weight=8
        export function i2cReadSwitch() {
            if (n_Status != eStatus.nicht_angeschlossen) {
                if (pins.i2cWriteBuffer(i2cGroveMultiswitch_x03, Buffer.fromArray([i2c_CMD_GET_DEV_EVENT])) != 0) {
                    n_Status = eStatus.nicht_angeschlossen // switch nicht mehr abfragen
                } else {
                    let bu = pins.i2cReadBuffer(i2cGroveMultiswitch_x03, 10) // 4 Byte + 6 Schalter = 10
                    // Byte 0-3: 32 Bit UInt32LE; Byte 4:Schalter 1 ... Byte 9:Schalter 6
                    // Byte 4-9: 00000001:Schalter OFF; 00000000:Schalter ON; Bit 1-7 löschen & 0x01
                    // Richtung N = 1, W = 2, S = 3, O = 4, M = 5
                    // ON=00000000 OFF=00000001
    
                    n_Status_changed = false // wird nur bei Änderung true
    
                    if (bu[3 + eStatus.fahren] == 0) {
                        n_Status_changed = (n_Status != eStatus.fahren)
                        n_Status = eStatus.fahren
                    } else if (bu[3 + eStatus.seilrolle] == 0) {
                        n_Status_changed = (n_Status != eStatus.seilrolle)
                        n_Status = eStatus.seilrolle
                    } else if (bu[3 + eStatus.zahnstange] == 0) {
                        n_Status_changed = (n_Status != eStatus.zahnstange)
                        n_Status = eStatus.zahnstange
                    } else if (bu[3 + eStatus.links] == 0) {
                        n_Magnet = false
                    } else if (bu[3 + eStatus.rechts] == 0) {
                        n_Magnet = true
                    }
                }
            } //else { } // nicht_angeschlossen nichts machen
            return getSwitch135()
    
            //return (n_Status == eStatus.fahren) || (n_Status == eStatus.seilrolle) || (n_Status == eStatus.zahnstange)
        }
    
        export function getSwitch135() {
            return (n_Status == eStatus.fahren) || (n_Status == eStatus.seilrolle) || (n_Status == eStatus.zahnstange)
        }
    
    
    
        //% group="Grove Multiswitch 0x03"
        //% block="Schalter Änderung" weight=6
        export function chSwitch(): boolean { return n_Status_changed }
    
        //% group="Grove Multiswitch 0x03"
        //% block="Schalter %pStatus" weight=5
        export function isSwitch(pStatus: eStatus): boolean { return pStatus == n_Status }
    
        //% group="Grove Multiswitch 0x03"
        //% block="Schalter 0 1 3 5" weight=4
        export function getSwitch(): eStatus { return n_Status }
    
        //% group="Grove Multiswitch 0x03"
        //% block="Magnet 2 4" weight=3
        export function getMagnet() { return n_Magnet }
     */

} // s-multiswitch.ts

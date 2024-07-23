
namespace sender { // s-fahrplan.ts


    // ========== group="20 Fahrplan (5 Teilstrecken) senden" subcategory="Fahrplan"

    //% group="20 Fahrplan (5 Teilstrecken) senden" subcategory="Fahrplan"
    //% block="20 Fahrplan %buffer Strecke 1 %p1 Strecke 2 %p2 Strecke 3 %p3 Strecke 4 %p4 Strecke 5 %p5" weight=8
    //% buffer.shadow="btf_sendBuffer19"
    //% p1.shadow=sender_StreckePicker
    //% p2.shadow=sender_StreckePicker
    // p3.shadow=sender_StreckePicker
    // p4.shadow=sender_StreckePicker
    //% p5.shadow=sender_Strecke
    export function send20Strecken(buffer: Buffer, p1: Buffer, p2: Buffer, p3: Buffer, p4: Buffer, p5: Buffer) {

        btf.setBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)

        if (p1 && p1.length == 3) buffer.write(btf.eBufferPointer.p1, p1) // 4-5-6
        if (p2 && p2.length == 3) buffer.write(btf.eBufferPointer.p2, p2)
        if (p3 && p3.length == 3) buffer.write(btf.eBufferPointer.p3, p3)
        if (p4 && p4.length == 3) buffer.write(btf.eBufferPointer.p4, p4)
        if (p5 && p5.length == 3) buffer.write(btf.eBufferPointer.p5, p5) // 16-17-18
    }





    //% blockId=sender_StreckePicker
    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Fahrplan"
    //% block="Fahren %motor Lenken %servo Länge %strecke cm\\|⅒s || Abstandssensor %abstandsSensor Spursensor %spurSensor Impulse %impulse" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% inlineInputMode=inline
    export function sender_StreckePicker(motor: number, servo: number, strecke: number, abstandsSensor = true, spurSensor = false, impulse = false) {
        return sender_Strecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, spurSensor, impulse)
        // -100..0..+100 umwandeln in (1 ↓ 128 ↑ 255)
        // 0..90..180 umwandeln in (1 ↖ 16 ↗ 31)     let buffer = Buffer.create(3)
        /*  buffer[0] = btf.speedPicker(motor) // -100..0..+100 umwandeln in (1 ↓ 128 ↑ 255)
         buffer[1] = btf.protractorPicker(servo)  // 0..90..180 umwandeln in (1 ↖ 16 ↗ 31)
         buffer[2] = strecke
 
         if (spurSensor)
             buffer[1] |= btf.eSensor.b5Spur
         if (abstandsSensor)
             buffer[1] |= btf.eSensor.b6Abstand
         if (impulse)
             buffer[1] |= btf.eSensor.b7Impulse
 
         return buffer */
        //   return Buffer.fromArray([motor, servo, strecke])
    }


    //% blockId=sender_Strecke
    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Fahrplan"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Abstandssensor %abstandsSensor Spursensor %spurSensor Impulse %impulse" weight=5
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% inlineInputMode=inline
    export function sender_Strecke(motor: number, servo: number, strecke: number, abstandsSensor = true, spurSensor = false, impulse = false) {
        let buffer = Buffer.create(3)
        buffer[0] = motor //  (1 ↓ 128 ↑ 255)
        buffer[1] = servo & 0x1F // (1 ↖ 16 ↗ 31)
        buffer[2] = strecke

        if (spurSensor)
            buffer[1] |= btf.eSensor.b5Spur
        if (abstandsSensor)
            buffer[1] |= btf.eSensor.b6Abstand
        if (impulse)
            buffer[1] |= btf.eSensor.b7Impulse

        return buffer
        //    return Buffer.fromArray([motor, servo, strecke])
    }


    //% blockId=sender_zehntelsekunden
    //% group="Zehntelsekunden ⅒s" subcategory="Fahrplan"
    //% block="%pause" weight=4
    export function sender_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }

    // ========== deprecated=1
/* 

    // blockId=sender_programmSchritt
    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Fahrplan" deprecated=1
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Abstandssensor %abstandsSensor Spursensor %spurSensor Impulse %impulse" weight=5
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% inlineInputMode=inline
    export function sender_programmSchritt(motor: number, servo: number, strecke: number, abstandsSensor = true, spurSensor = false, impulse = false) {
        let buffer = Buffer.create(3)
        buffer[0] = motor //  (1 ↓ 128 ↑ 255)
        buffer[1] = servo & 0x1F // (1 ↖ 16 ↗ 31)
        buffer[2] = strecke

        if (spurSensor)
            buffer[1] |= btf.eSensor.b5Spur
        if (abstandsSensor)
            buffer[1] |= btf.eSensor.b6Abstand
        if (impulse)
            buffer[1] |= btf.eSensor.b7Impulse

        return buffer
        //    return Buffer.fromArray([motor, servo, strecke])
    }




    // blockId=sender_programmPicker_zeit
    //% group="20 Fahrplan senden" subcategory="Fahrplan" deprecated=1
    //% block="Motor %motor Servo %servo Zeit %zehntelsekunden" weight=4
    //% motor.shadow="btf_speedPicker"
    //% servo.shadow="btf_protractorPicker"
    //% zehntelsekunden.shadow=btf_zehntelsekunden
    export function sender_programmPicker_zeit(motor: number, servo: number, zehntelsekunden: number) {
        return Buffer.fromArray([motor, servo, zehntelsekunden])
    }

    // blockId=sender_programmPicker_cm
    //% group="20 Fahrplan senden" subcategory="Fahrplan" deprecated=1
    //% block="Motor %motor Servo %servo Strecke %strecke cm" weight=3
    //% motor.shadow="btf_speedPicker"
    //% servo.shadow="btf_protractorPicker"
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    export function sender_programmPicker_cm(motor: number, servo: number, strecke: number) {
        return Buffer.fromArray([motor, servo, strecke])
    }
 */

} // s-fahrplan.ts

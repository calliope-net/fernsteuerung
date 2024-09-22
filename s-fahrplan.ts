
namespace sender { // s-fahrplan.ts


    // ========== group="2 Fahrplan (5 Teilstrecken) senden" subcategory="Fahrplan"

    //% group="Fahrplan (5 Teilstrecken) senden" subcategory="Fahrplan"
    //% block="2 Fahrplan senden • Fahren und Lenken %buffer Strecke 1 %p1 Strecke 2 %p2 Strecke 3 %p3 Strecke 4 %p4 Strecke 5 %p5 Anzahl Durchläufe %count" weight=8
    //% buffer.shadow="btf_sendBuffer19"
    //% p1.shadow=sender_StreckePicker
    //% p2.shadow=sender_StreckePicker
    //% p3.shadow=sender_StreckePicker
    //% p4.shadow=sender_StreckePicker
    //% p5.shadow=sender_StreckePicker
    //% count.min=1 count.max=8 count.defl=1
    export function send20Strecken(buffer: Buffer, p1: Buffer, p2: Buffer, p3: Buffer, p4: Buffer, p5: Buffer, count = 1) {

        btf.setBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, count) // m0-Servo Anzahl Durchläufe

        if (p1 && p1.length == 3) buffer.write(btf.eBufferPointer.m1, p1) // 4-5-6
        if (p2 && p2.length == 3) buffer.write(btf.eBufferPointer.ma, p2)
        if (p3 && p3.length == 3) buffer.write(btf.eBufferPointer.mb, p3)
        if (p4 && p4.length == 3) buffer.write(btf.eBufferPointer.mc, p4)
        if (p5 && p5.length == 3) buffer.write(btf.eBufferPointer.md, p5) // 16-17-18
    }


    //% blockId=sender_zehntelsekunden
    //% group="Fahrplan (5 Teilstrecken) senden" subcategory="Fahrplan"
    //% block="%pause" weight=4
    export function sender_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }



    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Fahrplan"

    //% blockId=sender_StreckePicker
    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100) • Winkel (0° ↖ 90° ↗ 180°)" subcategory="Fahrplan"
    //% block="Fahren %motor Lenken %servo Länge %strecke cm\\|⅒s || • Abstand Sensor %abstandsSensor • Spur Sensor %spurSensor • Impulse %impulse" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleYesNo
    //% inlineInputMode=inline
    export function sender_StreckePicker(motor: number, servo: number, strecke: number, abstandsSensor = true, spurSensor = false, impulse = false) {
        return sender_Strecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, spurSensor, impulse)
    }



    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Fahrplan"

    //% blockId=sender_Strecke
    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255) • Winkel (1 ↖ 16 ↗ 31)" subcategory="Fahrplan"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || • Abstand Sensor %abstandsSensor • Spur Sensor %spurSensor • Impulse %impulse" weight=5
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleYesNo
    //% inlineInputMode=inline
    export function sender_Strecke(motor: number, servo: number, strecke: number, abstandsSensor = true, spurSensor = false, impulse = false) {
        let buffer3 = Buffer.create(3)
        buffer3[0] = motor //  (1 ↓ 128 ↑ 255)
        buffer3[1] = servo & 0x1F // (1 ↖ 16 ↗ 31)
        buffer3[2] = strecke

        if (spurSensor)
            buffer3[1] |= btf.eSensor.b5Spur
        if (abstandsSensor)
            buffer3[1] |= btf.eSensor.b6Abstand
        if (impulse)
            buffer3[1] |= btf.eSensor.b7Impulse // Bit 7 setzen

        return buffer3
        //    return Buffer.fromArray([motor, servo, strecke])
    }



    // ========== group="2 Fahrplan (2 Teilstrecken • 2 Motoren) senden" subcategory="Fahrplan"

    //% group="Fahrplan 2 Motoren (2 Teilstrecken) senden" subcategory="Fahrplan"
    //% block="2 Fahrplan senden • 2 Motoren %buffer Strecke 1 %p1 Strecke 2 %p2 Anzahl Durchläufe %count" weight=8
    //% buffer.shadow="btf_sendBuffer19"
    //% p1.shadow=sender_2MotorenPicker
    //% p2.shadow=sender_2MotorenPicker
    //% count.min=1 count.max=8 count.defl=1
    // inlineInputMode=inline
    export function send2x2Motoren(buffer: Buffer, p1: Buffer, p2: Buffer, count = 1) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, count) // m0-Servo Anzahl Durchläufe

        if (p1 && p1.length == 6) buffer.write(btf.eBufferPointer.ma, p1) // 7-8-9-10-11-12
        if (p2 && p2.length == 6) buffer.write(btf.eBufferPointer.mc, p2) // 13-14-15-16-17-18
    }



    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100) • 2 Motoren getrennt • nach Zeit • mit Sensoren" subcategory="Fahrplan"

    //% blockId=sender_2MotorenZeitPicker blockHidden=true
    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100) • 2 Motoren getrennt • nach Zeit • mit Sensoren" subcategory="Fahrplan"
    //% block="Motor links %motorA Motor rechts %motorB Zeit ⅒s %zehntelsekunden || • %count • Abstand Sensor %abstandsSensor • Spur Sensor %spurSensor" weight=4
    //% motorA.shadow=speedPicker motorA.defl=50
    //% motorB.shadow=speedPicker motorB.defl=-50
    //% zehntelsekunden.shadow=sender_zehntelsekunden
    //% count.min=1 count.max=8 count.defl=1
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% inlineInputMode=inline
    export function sender_2MotorenZeitPicker(motorA: number, motorB: number, zehntelsekunden: number, count = 1, abstandsSensor = true, spurSensor = false) {
        return sender_2MotorenZeit(btf.speedPicker(motorA), btf.speedPicker(motorB), zehntelsekunden, count, abstandsSensor, spurSensor)
    }

    //% blockId=sender_2MotorenPicker
    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100) • 2 Motoren" subcategory="Fahrplan"
    //% block="2 Motoren links %motorA rechts %motorB Länge %streckeA cm\\|⅒s || ←links rechts→ %streckeB • Abstand Sensor %abstandsSensor • Impulse %impulse • %count" weight=2
    //% motorA.shadow=speedPicker motorA.defl=50
    //% motorB.shadow=speedPicker motorB.defl=-50
    //% streckeA.min=10 streckeA.max=255 streckeA.defl=25
    //% streckeB.min=0 streckeB.max=255 streckeB.defl=0
    //% abstandsSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleYesNo
    //% count.min=1 count.max=8 count.defl=1
    //% inlineInputMode=inline
    export function sender_2MotorenPicker(motorA: number, motorB: number, streckeA: number, streckeB = 0, abstandsSensor = false, impulse = false, count = 1) {
        return sender_2Motoren(btf.speedPicker(motorA), btf.speedPicker(motorB), streckeA, streckeB, abstandsSensor, impulse, count)
    }


    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255) • 2 Motoren getrennt • nach Zeit • mit Sensoren" subcategory="Fahrplan"

    //% blockId=sender_2MotorenZeit blockHidden=true
    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255) • 2 Motoren getrennt • nach Zeit • mit Sensoren" subcategory="Fahrplan"
    //% block="2 Motoren (1↓128↑255) | links %motorA rechts %motorB Zeit ⅒s %zehntelsekunden || • %count • Abstand Sensor %abstandsSensor • Spur Sensor %spurSensor" weight=4
    //% motorA.min=1 motorA.max=255 motorA.defl=192
    //% motorB.min=1 motorB.max=255 motorB.defl=64
    //% zehntelsekunden.min=10 zehntelsekunden.max=255 zehntelsekunden.defl=25
    //% count.min=1 count.max=8 count.defl=1
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% spurSensor.shadow=toggleOnOff
    //% inlineInputMode=inline
    export function sender_2MotorenZeit(motorA: number, motorB: number, zehntelsekunden: number, count = 1, abstandsSensor = true, spurSensor = false) {
        let buffer6 = Buffer.create(6)
        buffer6[0] = motorA //  (1 ↓ 128 ↑ 255)
        buffer6[1] = count & 0x1F // (1 ↖ 16 ↗ 31)
        buffer6[2] = zehntelsekunden
        buffer6[3] = motorB //  (1 ↓ 128 ↑ 255)
        //  buffer6[4] = servo & 0x1F // (1 ↖ 16 ↗ 31)
        buffer6[5] = zehntelsekunden

        if (spurSensor)
            buffer6[1] |= btf.eSensor.b5Spur
        if (abstandsSensor)
            buffer6[1] |= btf.eSensor.b6Abstand

        return buffer6
    }

    //% blockId=sender_2Motoren
    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255) • 2 Motoren" subcategory="Fahrplan"
    //% block="2 Motoren (1↓128↑255) | links %motorA rechts %motorB Länge %streckeA cm\\|⅒s || ←links rechts→ %streckeB • Abstand Sensor %abstandsSensor • Impulse %impulse • %count" weight=2
    //% motorA.min=1 motorA.max=255 motorA.defl=192
    //% motorB.min=1 motorB.max=255 motorB.defl=64
    //% streckeA.min=10 streckeA.max=255 streckeA.defl=25
    //% streckeB.min=0 streckeB.max=255 streckeB.defl=0
    //% abstandsSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleYesNo
    //% count.min=1 count.max=8 count.defl=1
    //% inlineInputMode=inline
    export function sender_2Motoren(motorA: number, motorB: number, streckeA: number, streckeB = 0, abstandsSensor = false, impulse = false, count = 1) {
        let buffer6 = Buffer.create(6)
        buffer6[0] = motorA //  (1 ↓ 128 ↑ 255)
        buffer6[1] = count & 0x1F // (1 ↖ 16 ↗ 31)
        buffer6[2] = streckeA
        buffer6[3] = motorB //  (1 ↓ 128 ↑ 255)
        //  buffer6[4] = servo & 0x1F // (1 ↖ 16 ↗ 31)
        if (streckeB == 0)
            buffer6[5] = streckeA
        else
            buffer6[5] = streckeB

        //if (spurSensor)
        //    buffer6[1] |= btf.eSensor.b5Spur
        if (abstandsSensor)
            buffer6[1] |= btf.eSensor.b6Abstand
        if (impulse)
            buffer6[1] |= btf.eSensor.b7Impulse // Bit 7 setzen
        return buffer6

    }


    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255) • 2 Motoren getrennt • nur mit Encoder • ohne Sensoren" subcategory="Fahrplan"

    //% blockId=sender_2MotorenEncoder blockHidden=true
    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255) • 2 Motoren getrennt • nur mit Encoder • ohne Sensoren" subcategory="Fahrplan"
    //% block="2 Motoren (1↓128↑255) | links %motorA rechts %motorB 2 Encoder (cm\\|Impulse) | links %encoderA rechts %encoderB || • %count Impulse %impulse" weight=3
    //% motorA.min=1 motorA.max=255 motorA.defl=192
    //% motorB.min=1 motorB.max=255 motorB.defl=64
    //% encoderA.min=10 encoderA.max=255 encoderA.defl=25
    //% encoderB.min=10 encoderB.max=255 encoderB.defl=25
    //% count.min=1 count.max=8 count.defl=1
    //% impulse.shadow=toggleYesNo
    //% inlineInputMode=inline
    export function sender_2MotorenEncoder(motorA: number, motorB: number, encoderA: number, encoderB: number, count = 1, impulse = false) {
        let buffer6 = Buffer.create(6)
        buffer6[0] = motorA //  (1 ↓ 128 ↑ 255)
        buffer6[1] = count & 0x1F // (1 ↖ 16 ↗ 31)
        buffer6[2] = encoderA
        buffer6[3] = motorB //  (1 ↓ 128 ↑ 255)
        //  buffer6[4] = servo & 0x1F // (1 ↖ 16 ↗ 31)
        buffer6[5] = encoderB


        //if (spurSensor)
        //    buffer[1] |= btf.eSensor.b5Spur
        //if (abstandsSensor)
        //    buffer[1] |= btf.eSensor.b6Abstand
        if (impulse)
            buffer6[1] |= btf.eSensor.b7Impulse // Bit 7 setzen
        return buffer6
    }



} // s-fahrplan.ts

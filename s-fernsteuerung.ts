
namespace sender { // s-fernsteuerung.ts


    // ========== group="Button A+B" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer M0 Fahren und Lenken" weight=5
    //% buffer.shadow="btf_sendBuffer19"
    export function send00M0(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0Fahren)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, joystickValue(eJoystickValue.servo16))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m0, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer M0 Fahren M1 Gabelstapler || * %prozent \\%" weight=4
    //% buffer.shadow="btf_sendBuffer19"
    //% prozent.min=10 prozent.max=100 prozent.defl=100
    export function send00M01(buffer: Buffer, prozent = 100) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0Fahren)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, btf.motorProzent(joystickValue(eJoystickValue.xmotor), prozent))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, n_ButtonAB_Counter)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m0, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m1, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer MA Seilrolle MB Drehkranz" weight=3
    //% buffer.shadow="btf_sendBuffer19"
    export function send00MAB(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0Fahren)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.ma, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mb, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer MC Zahnstange MB Drehkranz" weight=2
    //% buffer.shadow="btf_sendBuffer19"
    export function send00MCB(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0Fahren)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mc, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mb, true)
    }




    // ========== group="20 Programm 5 Strecken" subcategory="Fernsteuerung"

    //% group="20 Programm 5 Strecken" subcategory="Fernsteuerung"
    //% block="Programm 'Fahrplan' %buffer Schritt 1 %p1 Schritt 2 %p2 Schritt 3 %p3 Schritt 4 %p4 Schritt 5 %p5" weight=8
    //% buffer.shadow="btf_sendBuffer19"
    //% p1.shadow=sender_programmPicker_zeit
    // p2.shadow=btf_programmPicker
    // p3.shadow=btf_programmPicker
    // p4.shadow=btf_programmPicker
    // p5.shadow=btf_programmPicker
    export function send20Strecken(buffer: Buffer, p1: Buffer, p2: Buffer, p3: Buffer, p4: Buffer, p5: Buffer) {

        btf.setBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)

        if (p1 && p1.length == 3) buffer.write(btf.eBufferPointer.p1, p1) // 4-5-6
        if (p2 && p2.length == 3) buffer.write(btf.eBufferPointer.p2, p2)
        if (p3 && p3.length == 3) buffer.write(btf.eBufferPointer.p3, p3)
        if (p4 && p4.length == 3) buffer.write(btf.eBufferPointer.p4, p4)
        if (p5 && p5.length == 3) buffer.write(btf.eBufferPointer.p5, p5) // 16-17-18
    }

    //% blockId=sender_programmPicker_zeit
    //% group="20 Programm 5 Strecken" subcategory="Fernsteuerung"
    //% block="Motor %motor Servo %servo Zeit %zehntelsekunden" weight=4
    //% motor.shadow="btf_speedPicker"
    //% servo.shadow="btf_protractorPicker"
    //% zehntelsekunden.shadow=btf_zehntelsekunden
    export function sender_programmPicker_zeit(motor: number, servo: number, zehntelsekunden: number) {
        return Buffer.fromArray([motor, servo, zehntelsekunden])
    }

    //% blockId=sender_programmPicker_cm
    //% group="20 Programm 5 Strecken" subcategory="Fernsteuerung"
    //% block="Motor %motor Servo %servo Strecke %strecke cm" weight=3
    //% motor.shadow="btf_speedPicker"
    //% servo.shadow="btf_protractorPicker"
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    export function sender_programmPicker_cm(motor: number, servo: number, strecke: number) {
        return Buffer.fromArray([motor, servo, strecke])
    }

    //% blockId=sender_programmSchritt
    //% group="20 Programm 5 Strecken" subcategory="Fernsteuerung"
    //% block="Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Strecke %strecke cm" weight=2
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    export function sender_programmSchritt(motor: number, servo: number, strecke: number) {
        return Buffer.fromArray([motor, servo, strecke])
    }




} // s-fernsteuerung.ts

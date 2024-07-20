
namespace sender { // s-fernsteuerung.ts


    // ========== group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer M0 Fahren und Lenken" weight=5
    //% buffer.shadow="btf_sendBuffer19"
    export function send00M0(buffer: Buffer) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, joystickValue(eJoystickValue.servo16))
        btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)
    }

    //% group="00 Fernsteuerung Joystick" subcategory="Fernsteuerung"
    //% block="00 Joystick %buffer fahren %motor0 lenken %servo0 Stop %stop bei Abstand < %abstand" weight=5
    //% buffer.shadow="btf_sendBuffer19"
    //% buffer.shadow=btf_sendBuffer19
    //% motor0.shadow=sender_xmotor 
    //% servo0.shadow=sender_servo16
    //% stop.shadow=sender_ButtonA_Switch
    export function send00M0Joystick(buffer: Buffer, motor0: number, servo0: number, stop: boolean, abstand: btf.e3Abstand) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, motor0)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, servo0)
        btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)

        btf.setSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand, stop)
        btf.setAbstand(buffer, abstand)
    }



    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer M0 Fahren M1 Gabelstapler || * %prozent \\%" weight=4
    //% buffer.shadow="btf_sendBuffer19"
    //% prozent.min=10 prozent.max=100 prozent.defl=100
    export function send00M01(buffer: Buffer, prozent = 100) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, btf.motorProzent(joystickValue(eJoystickValue.xmotor), prozent))
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, n_ButtonAB_Counter)
        btf.setByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.m1, true)
    }

    //% group="00 Fernsteuerung Gabelstapler" subcategory="Fernsteuerung"
    //% block="00 Gabelstapler %buffer fahren %motor0 lenken %servo0 Gabelstapler %motor1 Stop %stop bei Abstand < %abstand" weight=4
    //% buffer.shadow=btf_sendBuffer19
    //% motor0.shadow=sender_xmotor 
    //% servo0.shadow=sender_ButtonAB_Counter
    //% motor1.shadow=sender_ymotor 
    //% stop.shadow=sender_ButtonA_Switch
    export function send00M01Gabelstapler(buffer: Buffer, motor0: number, servo0: number, motor1: number, stop: boolean, abstand: btf.e3Abstand) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, motor0)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, servo0)//n_ButtonAB_Counter
        btf.setByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor, motor1)
        btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.m1, true)

        btf.setSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand, stop)
        btf.setAbstand(buffer, abstand)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer MA Seilrolle MB Drehkranz" weight=3
    //% buffer.shadow="btf_sendBuffer19"
    export function send00MAB(buffer: Buffer) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(buffer, btf.e3aktiviert.ma, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.mb, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="00 %buffer MC Zahnstange MB Drehkranz" weight=2
    //% buffer.shadow="btf_sendBuffer19"
    export function send00MCB(buffer: Buffer) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(buffer, btf.e3aktiviert.mc, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.mb, true)
    }

    // ==========

    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="10 Spurfolger %buffer fahren (1↓128↑255) %motor128 langsam fahren %langsamfahren lenken (1↖16↗31) %servo16 lenkender Motor \\% %lenkenProzent Stop %stop bei Abstand < %abstand" weight=2
    //% buffer.shadow="btf_sendBuffer19"
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
    //% stop.shadow=sender_ButtonA_Switch
    // inlineInputMode=inline
    export function send10Spurfolger(buffer: Buffer, motor128: number, langsamfahren: number, servo16: number, lenkenProzent: number, stop: boolean, abstand: btf.e3Abstand) {

        btf.setBetriebsart(buffer, btf.e0Betriebsart.p1Lokal)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, 192)
        btf.setByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor, 160)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo, 31)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke, 0)

        btf.setSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand, stop)
        btf.setAbstand(buffer, abstand)
    }


    // ========== group="20 Programm 5 Strecken" subcategory="Fernsteuerung"

    //% group="20 Programm 5 Strecken" subcategory="Fernsteuerung"
    //% block="20 Fahrplan %buffer Schritt 1 %p1 Schritt 2 %p2 Schritt 3 %p3 Schritt 4 %p4 Schritt 5 %p5" weight=8
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

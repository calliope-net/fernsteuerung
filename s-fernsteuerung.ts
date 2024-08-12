
namespace sender { // s-fernsteuerung.ts

    /* 
        // ========== group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    
        // group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
        // block="00 %buffer M0 Fahren und Lenken" weight=5 deprecated=1
        // buffer.shadow=btf_sendBuffer19
        export function send00M0(buffer: Buffer) {
            btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
            btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
            btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, joystickValue(eJoystickValue.servo16))
            btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)
        }
    
        // group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
        // block="00 %buffer M0 Fahren M1 Gabelstapler || * %prozent \\%" weight=4 deprecated=1
        // buffer.shadow="btf_sendBuffer19"
        // prozent.min=10 prozent.max=100 prozent.defl=100
        export function send00M01(buffer: Buffer, prozent = 100) {
            btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
            btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, btf.btf_motorProzent(joystickValue(eJoystickValue.xmotor), prozent))
            btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, getStatusButtonCounter())// n_ButtonAB_Counter
            btf.setByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
            btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)
            btf.setaktiviert(buffer, btf.e3aktiviert.m1, true)
        }
    
        // group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
        // block="00 %buffer MA Seilrolle MB Drehkranz" weight=3 deprecated=1
        // buffer.shadow="btf_sendBuffer19"
        export function send00MAB(buffer: Buffer) {
            btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
            btf.setByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
            btf.setByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
            btf.setaktiviert(buffer, btf.e3aktiviert.ma, true)
            btf.setaktiviert(buffer, btf.e3aktiviert.mb, true)
        }
    
        // group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
        // block="00 %buffer MC Zahnstange MB Drehkranz" weight=2 deprecated=1
        // buffer.shadow="btf_sendBuffer19"
        export function send00MCB(buffer: Buffer) {
            btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
            btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
            btf.setByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
            btf.setaktiviert(buffer, btf.e3aktiviert.mc, true)
            btf.setaktiviert(buffer, btf.e3aktiviert.mb, true)
        }
     */

    // ========== group="00 fahren und lenken mit Joystick" subcategory="Fernsteuerung"

    //% group="00 fahren und lenken mit Joystick" subcategory="Fernsteuerung"
    //% block="00 Joystick %buffer fahren %motor0 lenken %servo0 Stop %stop bei Abstand < %abstand" weight=5
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


    // ========== group="00 Fernsteuerung Gabelstapler" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung Gabelstapler" subcategory="Fernsteuerung"
    //% block="00 Gabelstapler %buffer fahren %motor0 lenken %servo0 Gabelstapler ↕ %motor1" weight=4
    //% buffer.shadow=btf_sendBuffer19
    //% motor0.shadow=sender_motorProzent
    //% servo0.shadow=sender_ButtonAB_Counter
    //% motor1.shadow=sender_ymotor 
    // stop.shadow=toggleYesNo
    export function send00M01Gabelstapler(buffer: Buffer, motor0: number, servo0: number, motor1: number) {//, stop: boolean, abstand: btf.e3Abstand // Stop %stop bei Abstand < %abstand
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, motor0) // shadow=sender_motorProzent
        btf.setByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, servo0) // shadow=sender_ButtonAB_Counter
        btf.setByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor, motor1) // shadow=sender_ymotor
        btf.setaktiviert(buffer, btf.e3aktiviert.m0, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.m1, true)

        // btf.setSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand, stop)
        // btf.setAbstand(buffer, abstand)
    }


    //% blockId=sender_motorProzent
    //% group="00 Fernsteuerung Gabelstapler" subcategory="Fernsteuerung"
    //% block="%motor0 * %prozent \\%" weight=3
    //% motor0.shadow=sender_xmotor 
    //% prozent.min=10 prozent.max=100 prozent.defl=50
    export function sender_motorProzent(motor0: number, prozent: number) {
        return Math.idiv((motor0 - 128) * prozent, 100) + 128
    }



    // ========== group="00 Fernsteuerung Kran" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung Kran" subcategory="Fernsteuerung"
    //% block="00 Kran %buffer MA Seilrolle %motor0 MB Drehkranz %motor1" weight=5
    //% buffer.shadow=btf_sendBuffer19
    //% motor0.shadow=sender_xmotor 
    //% motor1.shadow=sender_ymotor 
    export function send00MABKran(buffer: Buffer, motor0: number, motor1: number) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor, motor0)
        btf.setByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, motor1)
        btf.setaktiviert(buffer, btf.e3aktiviert.ma, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.mb, true)
    }

    //% group="00 Fernsteuerung Kran" subcategory="Fernsteuerung"
    //% block="00 Kran %buffer MC Zahnstange %motor0 MB Drehkranz %motor1" weight=4
    //% buffer.shadow=btf_sendBuffer19
    //% motor0.shadow=sender_xmotor 
    //% motor1.shadow=sender_ymotor 
    export function send00MCBKran(buffer: Buffer, motor0: number, motor1: number) {
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, motor0)
        btf.setByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, motor1)
        btf.setaktiviert(buffer, btf.e3aktiviert.mc, true)
        btf.setaktiviert(buffer, btf.e3aktiviert.mb, true)
    }



    // ========== group="10 Programm fernstarten" subcategory="Fernsteuerung"

    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="10 Spurfolger %buffer Fahren (1↓128↑255) %motor128 langsam Fahren %langsamfahren Lenken (1↖16↗31) %servo16 lenkender Motor \\% %lenkenProzent Abstanssensor %stop bei Abstand < %abstand" weight=6
    //% buffer.shadow="btf_sendBuffer19"
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
    //% stop.shadow=sender_ButtonA_Switch
    // inlineInputMode=inline
    export function send10Spurfolger(buffer: Buffer, motor128: number, langsamfahren: number, servo16: number, lenkenProzent: number, stop: boolean, abstand: btf.e3Abstand) {

        btf.setBetriebsart(buffer, btf.e0Betriebsart.p1Lokal)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, motor128)
        btf.setByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor, langsamfahren)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo, servo16)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke, lenkenProzent)

        btf.setSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand, stop)
        btf.setAbstand(buffer, abstand)
    }



    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="10 Abstand ausweichen %buffer Fahren (1↓128↑255) %vMotor Lenken (1↖16↗31) %vServo rückwärts Fahren %rMotor rückwärts Lenken %rServo Pause ⅒s %pause_zs Abstand < %abstand" weight=4
    //% buffer.shadow="btf_sendBuffer19"
    //% vMotor.min=1 vMotor.max=255 vMotor.defl=255
    //% vServo.min=1 vServo.max=31 vServo.defl=16
    //% rMotor.min=1 rMotor.max=255 rMotor.defl=64
    //% rServo.min=1 rServo.max=31 rServo.defl=8
    //% pause_zs.shadow=cb2_zehntelsekunden
    export function send10AbstandAusweichen(buffer: Buffer, vMotor: number, vServo: number, rMotor: number, rServo: number, pause_zs: number, abstand: btf.e3Abstand) {

        btf.setBetriebsart(buffer, btf.e0Betriebsart.p1Lokal)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, vMotor)
        btf.setByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo, vServo)
        btf.setByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor, rMotor)
        btf.setByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b1_Servo, rServo)
        btf.setByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b2_Fahrstrecke, pause_zs)

       // btf.setSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand, stop)
        btf.setAbstand(buffer, abstand)
    }


} // s-fernsteuerung.ts

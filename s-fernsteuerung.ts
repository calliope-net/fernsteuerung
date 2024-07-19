
namespace sender { // s-fernsteuerung.ts


    // ========== group="Button A+B" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="%buffer M0 Fahren und Lenken" weight=5
    //% buffer.shadow="btf_sendBuffer19"
    export function sendM0(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, joystickValue(eJoystickValue.servo16))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m0, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="%buffer M0 Fahren M1 Gabelstapler || * %prozent \\%" weight=4
    //% buffer.shadow="btf_sendBuffer19"
    //% prozent.min=10 prozent.max=100 prozent.defl=100
    export function sendM01(buffer: Buffer, prozent = 100) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, btf.motorProzent(joystickValue(eJoystickValue.xmotor), prozent))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, n_ButtonAB_Counter)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m0, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m1, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="%buffer MA Seilrolle MB Drehkranz" weight=3
    //% buffer.shadow="btf_sendBuffer19"
    export function sendMAB(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.ma, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mb, true)
    }

    //% group="00 Fernsteuerung Motoren" subcategory="Fernsteuerung"
    //% block="%buffer MC Zahnstange MB Drehkranz" weight=2
    //% buffer.shadow="btf_sendBuffer19"
    export function sendMCB(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mc, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mb, true)
    }




    // ========== group="20 Programm 5 Strecken" subcategory="Fernsteuerung"

    //% group="20 Programm 5 Strecken" subcategory="Fernsteuerung"
    //% block="Programm 'Fahrplan' %buffer Schritt 1 %p1 Schritt 2 %p2 Schritt 3 %p3 Schritt 4 %p4 Schritt 5 %p5" weight=8
    //% buffer.shadow="btf_sendBuffer19"
    //% p1.shadow=btf_programmPicker
    //% p2.shadow=btf_programmPicker
    //% p3.shadow=btf_programmPicker
    //% p4.shadow=btf_programmPicker
    //% p5.shadow=btf_programmPicker
    export function programm5(buffer: Buffer, p1: Buffer, p2: Buffer, p3: Buffer, p4: Buffer, p5: Buffer,) {
       
        btf.setBetriebsart(buffer, btf.e0Betriebsart.p2Strecken)
    
        if (p1) buffer.write(btf.eBufferPointer.p1, p1) // 4-5-6
        if (p2) buffer.write(btf.eBufferPointer.p2, p2)
        if (p3) buffer.write(btf.eBufferPointer.p3, p3)
        if (p4) buffer.write(btf.eBufferPointer.p4, p4)
        if (p5) buffer.write(btf.eBufferPointer.p5, p5) // 16-17-18
      
    }



} // s-fernsteuerung.ts


namespace sender { // s-fernsteuerung.ts


    // ========== group="Button A+B" subcategory="Fernsteuerung"

    //% group="00 Sender" subcategory="Fernsteuerung"
    //% block="%buffer M0 Fahren und Lenken" weight=5
    //% buffer.shadow="btf_sendBuffer19"
    export function sendM0(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo, joystickValue(eJoystickValue.servo16))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.m0, true)
    }

    //% group="00 Sender" subcategory="Fernsteuerung"
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

    //% group="00 Sender" subcategory="Fernsteuerung"
    //% block="%buffer MA Seilrolle MB Drehkranz" weight=3
    //% buffer.shadow="btf_sendBuffer19"
    export function sendMAB(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.ma, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mb, true)
    }

    //% group="00 Sender" subcategory="Fernsteuerung"
    //% block="%buffer MC Zahnstange MB Drehkranz" weight=2
    //% buffer.shadow="btf_sendBuffer19"
    export function sendMCB(buffer: Buffer) {
        btf.setBetriebsart(btf.btf_sendBuffer19(), btf.e0Betriebsart.p0)
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.xmotor))
        btf.setByte(btf.btf_sendBuffer19(), btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor, joystickValue(eJoystickValue.ymotor))
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mc, true)
        btf.setaktiviert(btf.btf_sendBuffer19(), btf.e3aktiviert.mb, true)
    }

} // s-fernsteuerung.ts

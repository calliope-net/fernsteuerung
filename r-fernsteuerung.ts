
namespace receiver { // r-fernsteuerung.ts

    //% group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="Fahren und Lenken mit Joystick aus Datenpaket %buffer M:01ABCD S:0" weight=5
    //% buffer.shadow="btf_receivedBuffer19"
    export function sendM0(buffer: Buffer) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)) {
            // Motor M0+Servo M1
            receiver.dualMotor128(receiver.eDualMotor.M0, btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
            receiver.pinServo16(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo))
            receiver.dualMotor128(receiver.eDualMotor.M1, btf.getByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor))
            // Qwiic Motor A B
            receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, btf.getaktiviert(buffer, btf.e3aktiviert.ma) || btf.getaktiviert(buffer, btf.e3aktiviert.mb))
            receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
            // Qwiic Motor C D
            receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, btf.getaktiviert(buffer, btf.e3aktiviert.mc))
            receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))

            //receiver.ringTone(btf.getSchalter(receivedData, btf.e0Schalter.b0))
            //receiver.qwiicRelay(btf.getSchalter(receivedData, btf.e0Schalter.b1))
            //receiver.pinGPIO4(btf.getSchalter(receivedData, btf.e0Schalter.b2))
            //receiver.rgbLEDs(receiver.eRGBled.a, 0x0000ff, true)
        }

    }


} // r-fernsteuerung.ts


namespace receiver { // r-fernsteuerung.ts

    //% group="Betriebsart" subcategory="Fernsteuerung"
    //% block="%receivedData 00 Fernsteuerung Motoren" weight=5
    //% receivedData.shadow="btf_receivedBuffer19"
    export function sendM0(receivedData: Buffer) {

        if (btf.isBetriebsart(receivedData, btf.e0Betriebsart.p0)) {
            receiver.dualMotor128(receiver.eDualMotor.M0, btf.getByte(receivedData, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
            receiver.pinServo16(btf.getByte(receivedData, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo))
            receiver.dualMotor128(receiver.eDualMotor.M1, btf.getByte(receivedData, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, btf.getaktiviert(receivedData, btf.e3aktiviert.ma) || btf.getaktiviert(receivedData, btf.e3aktiviert.mb))
            receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(receivedData, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(receivedData, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, btf.getaktiviert(receivedData, btf.e3aktiviert.mc))
            receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(receivedData, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(receivedData, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))

            //receiver.ringTone(btf.getSchalter(receivedData, btf.e0Schalter.b0))
            //receiver.qwiicRelay(btf.getSchalter(receivedData, btf.e0Schalter.b1))
            //receiver.pinGPIO4(btf.getSchalter(receivedData, btf.e0Schalter.b2))
            //receiver.rgbLEDs(receiver.eRGBled.a, 0x0000ff, true)
        }

    }


} // r-fernsteuerung.ts

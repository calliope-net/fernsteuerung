
namespace receiver  // r-qwiic.ts
/*
SparkFun Qwiic Ultrasonic Distance Sensor (HC-SR04)
    https://learn.sparkfun.com/tutorials/qwiic-ultrasonic-distance-sensor-hc-sr04-hookup-guide
    
    https://github.com/sparkfun/Zio-Qwiic-Ultrasonic-Distance-Sensor
    https://github.com/sparkfun/Zio-Qwiic-Ultrasonic-Distance-Sensor/blob/master/Arduino/Zio_Ultrasonic_Distance_Sensor_IIC_Test%20(1)/Zio_Ultrasonic_Distance_Sensor_IIC_Test.ino
    
    
*/ {
    // I²C Adressen Qwiic
    const i2cQwiicRelay = 0x19 // SparkFun Qwiic Single Relay (Kran Elektromagnet)
    // const i2cQwiicUltrasonic_x00 = 0x00 
    export enum eI2CQwiicUltrasonic { x00 = 0x00 } // SLAVE_BROADCAST_ADDR 0x00  //default address

    // ========== group="SparkFun Qwiic Single Relay 0x19" subcategory="Aktoren"

    let n_QwiicRelayConnected = true // Qwiic Modul ist angesteckt

    //% group="SparkFun Qwiic Single Relay (I²C: 0x19)" subcategory="Qwiic"
    //% block="Q Relay (Kran Elektromagnet) %pOn"
    //% pOn.shadow="toggleOnOff"
    export function writeQwiicRelay(pOn: boolean) {
        //  const SINGLE_OFF = 0x00
        //  const SINGLE_ON = 0x01
        if (n_QwiicRelayConnected)
            n_QwiicRelayConnected = pins.i2cWriteBuffer(i2cQwiicRelay, Buffer.fromArray([pOn ? 0x01 : 0x00])) == 0
    }



    // ========== group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" 

    let n_QwiicUltrasonicConnected = true // Qwiic Modul ist angesteckt
    let n_QwiicUltrasonic_mm = 0


    //% group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic"
    //% block="Q Ultraschall Sensor einlesen || i2c %i2c " weight=8
    //% i2c.defl=receiver.eI2CQwiicUltrasonic.x00
    export function readQwiicUltrasonic(i2c = eI2CQwiicUltrasonic.x00) { // SLAVE_BROADCAST_ADDR 0x00  //default address
        //  const measure_command = 0x01
        if (n_QwiicUltrasonicConnected) {
            n_QwiicUltrasonicConnected = pins.i2cWriteBuffer(i2c, Buffer.fromArray([0x01]), true) == 0

            if (!n_QwiicUltrasonicConnected)
                basic.showNumber(i2c)

            if (n_QwiicUltrasonicConnected) {
                n_QwiicUltrasonic_mm = pins.i2cReadBuffer(i2c, 2).getNumber(NumberFormat.UInt16BE, 0)
            }
        }
        return n_QwiicUltrasonicConnected
    }

    // export enum eDist { cm, mm }

    //% group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic"
    //% block="Q Ultraschall Entfernung cm || I²C %i2c" weight=3
    // mm.shadow="toggleYesNo"
    export function getQwiicUltrasonic(i2c?: eI2CQwiicUltrasonic) {
        if (i2c != undefined)
            readQwiicUltrasonic(i2c)
        return n_QwiicUltrasonic_mm / 10
        //if (mm)
        //    return n_Ultrasonic_mm
        //else
        //    return Math.idiv(n_Ultrasonic_mm, 10)
    }



} // r-qwiic.ts

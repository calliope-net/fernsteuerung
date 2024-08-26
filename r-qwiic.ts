
namespace receiver  // r-qwiic.ts
/* 008F3F
SparkFun Qwiic Ultrasonic Distance Sensor (HC-SR04)
    https://learn.sparkfun.com/tutorials/qwiic-ultrasonic-distance-sensor-hc-sr04-hookup-guide
    
    https://github.com/sparkfun/Zio-Qwiic-Ultrasonic-Distance-Sensor
    https://github.com/sparkfun/Zio-Qwiic-Ultrasonic-Distance-Sensor/blob/master/Arduino/Zio_Ultrasonic_Distance_Sensor_IIC_Test%20(1)/Zio_Ultrasonic_Distance_Sensor_IIC_Test.ino
    
    
*/ {
    // I²C Adressen Qwiic
    export enum ei2cQwiicRelay { x19 = 0x19 } // SparkFun Qwiic Single Relay (Kran Elektromagnet)
    export enum eI2CQwiicUltrasonic { x00 = 0x00 } // SLAVE_BROADCAST_ADDR 0x00  //default address



    // ========== group="SparkFun Qwiic Single Relay (I²C: 0x19)" subcategory="Qwiic" color=#5FA38F

    let n_QwiicRelayConnected = true // Qwiic Modul ist angesteckt
    let n_QwiicRelayOn = false

    //% group="SparkFun Qwiic Single Relay (I²C: 0x19)" subcategory="Qwiic" color=#5FA38F
    //% block="Q Relay (Kran Elektromagnet) %pOn || i2c %i2c"
    //% pOn.shadow="toggleOnOff"
    export function writeQwiicRelay(on: boolean, i2c = ei2cQwiicRelay.x19) {
        //  const SINGLE_OFF = 0x00
        //  const SINGLE_ON = 0x01
        if (n_QwiicRelayConnected && (n_QwiicRelayOn !== on)) { // XOR
            n_QwiicRelayOn = on
            n_QwiicRelayConnected = pins.i2cWriteBuffer(i2c, Buffer.fromArray([on ? 0x01 : 0x00])) == 0
        }
    }



    // ========== group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" 

    let n_QwiicUltrasonicConnected: boolean = undefined // Qwiic Modul ist angesteckt
    let n_QwiicUltrasonic_mm = 0


    //% group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" color=#5FA38F
    //% block="Q Ultraschall Sensor angeschlossen" weight=9
    export function qwiicUltrasonicConnected() {
        if (n_QwiicUltrasonicConnected == undefined){
            readQwiicUltrasonic()
            basic.pause(100) // nach dem ersten lesen warten
        }
        return n_QwiicUltrasonicConnected
    }

    //% group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" color=#5FA38F
    //% block="Q Ultraschall Sensor • einlesen || i2c %i2c" weight=8
    export function readQwiicUltrasonic(i2c = eI2CQwiicUltrasonic.x00) { // SLAVE_BROADCAST_ADDR 0x00  //default address
        const measure_command = 0x01
        if (n_QwiicUltrasonicConnected || n_QwiicUltrasonicConnected == undefined) {
            n_QwiicUltrasonicConnected = pins.i2cWriteBuffer(i2c, Buffer.fromArray([measure_command]), true) == 0

            if (n_QwiicUltrasonicConnected)
                n_QwiicUltrasonic_mm = pins.i2cReadBuffer(i2c, 2).getNumber(NumberFormat.UInt16BE, 0)
            //else
            //    btf.zeigeHexFehler(i2c)
        }
        return n_QwiicUltrasonicConnected
    }

    //% group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" color=#5FA38F
    //% block="Q Abstand cm • einlesen %read" weight=6
    //% read.shadow="toggleYesNo"
    export function getQwiicUltrasonic(read: boolean) {
        if (read) {
            if (n_QwiicUltrasonic_mm == 0) {
                readQwiicUltrasonic()
                basic.pause(100) // nach dem ersten lesen warten und noch mal lesen
            }
            readQwiicUltrasonic()
        }
        return n_QwiicUltrasonic_mm / 10
    }


} // r-qwiic.ts

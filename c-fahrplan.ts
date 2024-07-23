
namespace cb2 { // c-fahrplan.ts



    // ========== group="20 Fahrplan empfangen" subcategory="Fahrplan"

    let n_fahreBuffer19_gestartet = false

    //% group="20 Fahrplan empfangen" subcategory="Fahrplan"
    //% block="fahre Strecke 1-5 aus Datenpaket %buffer Start Bit %motorBit" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% motorBit.defl=btf.e3aktiviert.f1
    export function fahreBuffer19(buffer: Buffer, startBit: btf.e3aktiviert) {

        if (!n_fahreBuffer19_gestartet && btf.getaktiviert(buffer, startBit)) { // m1 true
            n_fahreBuffer19_gestartet = true
            btf.zeigeBIN(0, btf.ePlot.bin, 2)

            for (let iBufferPointer: btf.eBufferPointer = btf.eBufferPointer.p1; iBufferPointer < 19; iBufferPointer += 3) { // 4, 7, 10, 13, 16
                //  fahreStrecke(buffer.slice(iBufferPointer, 3))

                if (btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor) != 0
                    &&
                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo) != 0
                    &&
                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke) != 0) {


                    btf.zeigeBINx234Fahrplan(buffer, iBufferPointer) // anzeigen im 5x5 Display

                    fahreStrecke(
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand),
                        btf.getAbstand(buffer),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse)
                    )

                    /* fahreStreckeAbstand(buffer.slice(iBufferPointer, 3),
                        btf.getSensor(
                            buffer,
                            iBufferPointer,
                            btf.eSensor.b6Abstand
                        ),
                        btf.getAbstand(buffer)
                    ) */
                }
            }
        }
        else if (n_fahreBuffer19_gestartet && !btf.getaktiviert(buffer, startBit)) { // m1 false
            n_fahreBuffer19_gestartet = false
            btf.zeigeBIN(0, btf.ePlot.bin, 2)
            btf.zeigeBIN(0, btf.ePlot.bin, 3)
            btf.zeigeBIN(0, btf.ePlot.bin, 4)
        }

    }



    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Fahrplan"

    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Fahrplan"
    //% block="Fahren %motor Lenken %servo Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Lenken %lenkenProzent \\% Encoder %checkEncoder" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStreckePicker(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, lenkenProzent = 50, checkEncoder = true) {
        fahreStrecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, abstand, spurSensor, impulse, lenkenProzent, checkEncoder)
    }



    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Fahrplan"

    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Fahrplan"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Lenken %lenkenProzent \\% Encoder %checkEncoder" weight=5
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, lenkenProzent = 50, checkEncoder = true) {

        writeMotorenStop()

        if (motor != 0 && servo != 0 && strecke != 0) {
            let sensor_color = Colors.Off
            let timeout_Encoder: number// = 200 // 20 s Timeout wenn Encoder nicht zählt
            let hasEncoder = false
            if (checkEncoder)
                hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

            writeMotor128Servo16(motor, servo & 0b00011111, lenkenProzent) //, prozent

            if (hasEncoder) {
                let encoderImpulse = impulse ? strecke : strecke * n_EncoderFaktor

                timeout_Encoder = 200 // 20 s Timeout wenn Encoder nicht zählt

                while (getEncoderMittelwert() < encoderImpulse) // strecke * n_EncoderFaktor 31.25
                {
                    if (timeout_Encoder-- <= 0) {
                        sensor_color = Colors.Red
                        break
                    }
                    if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                        sensor_color = Colors.Yellow
                        break
                    }
                    if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                        sensor_color = Colors.White
                        break
                    }
                    // Pause eventuell bei hoher Geschwindigkeit motor verringern
                    // oder langsamer fahren wenn Rest strecke kleiner wird
                    basic.pause(100) // 200
                }
            }
            else {
                //  basic.pause(buffer[2] * 100)
                timeout_Encoder = strecke // Zehntelsekunden
                while (timeout_Encoder-- > 0) //
                {
                    if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                        sensor_color = Colors.Orange
                        break
                    }
                    if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                        sensor_color = Colors.White
                        break
                    }

                    basic.pause(100) // 1 Zehntelsekunde
                }
            }

            writeMotorenStop()

            if (sensor_color != Colors.Off) {
                writeRgbLeds(sensor_color, true)
                basic.pause(1000)
                writeRgbLeds(sensor_color, false)
            }
        }

    }



    // ========== group="Zehntelsekunden ⅒s" subcategory="Fahrplan"

    //% blockId=cb2_zehntelsekunden
    //% group="Zehntelsekunden ⅒s" subcategory="Fahrplan"
    //% block="%pause" weight=4
    export function cb2_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }



    // ========== deprecated=1


    // ========== group="Strecke fahren (Stop nach • ⅒s)" subcategory="Fahrplan"

    //% group="Strecke fahren (Stop nach • ⅒s)" subcategory="Fahrplan"
    //% block="Strecke %buffer ⅒s" weight=6 deprecated=1
    // block="fahre Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Zeit %zehntelsekunden" weight=4
    // motor.min=1 motor.max=255 motor.defl=128
    // motor.shadow=btf_speedPicker
    // servo.min=1 servo.max=31 servo.defl=16
    // servo.shadow=btf_protractorPicker
    // zehntelsekunden.shadow=cb2_zehntelsekunden
    //% buffer.shadow=btf_programmPicker
    /*  export function fahreZeit(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, lenkenProzent = 50) {
         fahreStrecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, abstand, spurSensor, impulse, lenkenProzent, false)
 
         writeMotorenStop()
 
         if (motor != 0 && servo != 0 && strecke != 0) {
 
 
             let timeout_Encoder = strecke // Zehntelsekunden
             let sensor_color = Colors.Off
             //  basic.pause(buffer[2] * 100)
 
             writeMotor128Servo16(motor, servo & 0b00011111, lenkenProzent) //, prozent
 
 
             while (timeout_Encoder-- > 0) //
             {
                 if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                     sensor_color = Colors.Orange
                     break
                 }
 
                 basic.pause(100) // 1 Zehntelsekunde
             }
             writeMotorenStop()
 
             if (sensor_color != Colors.Off) {
                 writeRgbLeds(sensor_color, true)
                 basic.pause(1000)
                 writeRgbLeds(sensor_color, false)
             }
         }
     } */

    //export function fahreZeit(buffer: Buffer) {
    //    if (buffer.length == 3) {
    //        writeMotor128Servo16(buffer[0], buffer[1] & 0b00011111)
    //        basic.pause(buffer[2] * 100)
    //        writeMotorenStop() //   writeMotor128Servo16(c_MotorStop, 16)
    //    }
    //}



    // ========== group="Strecke fahren (Stop nach • cm oder • ⅒s)" subcategory="Fahrplan"


    //% group="Strecke fahren (Stop nach • cm oder • ⅒s)" subcategory="Fahrplan"
    //% block="Strecke %buffer || lenken %prozent \\%" weight=4
    //% buffer.shadow=btf_programmSchritt
    //% prozent.min=10 prozent.max=90 prozent.defl=50
    // inlineInputMode=inline
    /* export function fahreStrecke(buffer3: Buffer, prozent = 50) { // cm oder zehntelsekunden

        writeMotorenStop()

        if (buffer3.length == 3 && buffer3[0] != 0 && buffer3[1] != 0 && buffer3[2] != 0) {
            let hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

            writeMotor128Servo16(buffer3[0], buffer3[1] & 0b00011111, prozent)

            if (hasEncoder) {
                let timeout_Encoder = 200 // 20 s Timeout wenn Encoder nicht zählt

                while ((getEncoderMittelwert() < buffer3[2] * n_EncoderFaktor) // 31.25
                    &&
                    timeout_Encoder-- > 0) {

                    // Pause eventuell bei hoher Geschwindigkeit motor verringern
                    // oder langsamer fahren wenn Rest strecke kleiner wird
                    basic.pause(100) // 200
                }
            }
            else {
                basic.pause(buffer3[2] * 100)
            }

            writeMotorenStop() // cb2.writeMotor128Servo16(c_MotorStop, 16)
        }
    } */



    //% group="Strecke fahren (Stop nach • cm oder • ⅒s)" subcategory="Fahrplan"
    //% block="Strecke %buffer Stop %stop bei Abstand < (cm) %abstand || lenken %prozent \\%" weight=3 deprecated=1
    //% buffer.shadow=btf_programmSchritt
    //% stop.shadow="toggleYesNo" stop.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% prozent.min=10 prozent.max=90 prozent.defl=50
    //% inlineInputMode=inline
    /*    export function fahreStreckeAbstand(buffer3: Buffer, stop: boolean, abstand: number, prozent = 50) { // cm oder zehntelsekunden
   
           writeMotorenStop()
   
           if (buffer3.length == 3 && buffer3[0] != 0 && buffer3[1] != 0 && buffer3[2] != 0) {
               let hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder
               let timeout_Encoder: number// = 200 // 20 s Timeout wenn Encoder nicht zählt
               let abstand_color = Colors.Off
   
               writeMotor128Servo16(buffer3[0], buffer3[1] & 0b00011111, prozent)
   
               if (hasEncoder) {
                   timeout_Encoder = 200 // 20 s Timeout wenn Encoder nicht zählt
                   while (getEncoderMittelwert() < buffer3[2] * n_EncoderFaktor) // 31.25
                   {
                       if (timeout_Encoder-- <= 0) {
                           abstand_color = Colors.Red
                           break
                       }
                       if (stop && buffer3[0] > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                           abstand_color = Colors.Yellow
                           break
                       }
   
                       // Pause eventuell bei hoher Geschwindigkeit motor verringern
                       // oder langsamer fahren wenn Rest strecke kleiner wird
                       basic.pause(100) // 200
                   }
               }
               else {
                   //  basic.pause(buffer[2] * 100)
                   timeout_Encoder = buffer3[2] // Zehntelsekunden
                   while (timeout_Encoder-- > 0) //
                   {
                       if (stop && buffer3[0] > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                           abstand_color = Colors.Orange
                           break
                       }
   
                       basic.pause(100) // 1 Zehntelsekunde
                   }
               }
   
               writeMotorenStop()
   
               if (abstand_color != Colors.Off) {
                   writeRgbLeds(abstand_color, true)
                   basic.pause(1000)
                   writeRgbLeds(abstand_color, false)
               }
           }
       } */



} // c-fahrplan.ts

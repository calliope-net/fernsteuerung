
namespace receiver { // r-zweimotoren.ts



    //% group="Fahren und Lenken" subcategory="2 Motoren" deprecated=1
    //% block="Fahren %motor \\% • Lenken %servo ° || • Lenken %lenkenProzent \\%" weight=5
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=30
    export function dual2MotorenLenkenPicker_(motor: number, servo: number, lenkenProzent = 30) {
        dual2Motoren0Lenken16(motor, btf.protractorPicker(servo), lenkenProzent)
    }


    //% group="Fahren und Lenken" subcategory="2 Motoren" deprecated=1
    //% block="Fahren (1↓128↑255) %x_1_128_255 • Lenken (1↖16↗31) %y_1_16_31 || • Lenken %lenkenProzent \\%" weight=4
    //% x_1_128_255.min=1 x_1_128_255.max=255 x_1_128_255.defl=128
    //% y_1_16_31.min=1 y_1_16_31.max=31 y_1_16_31.defl=16
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=30
    export function dual2MotorenLenken(x_1_128_255: number, y_1_16_31: number, lenkenProzent = 30) {
        dual2Motoren0Lenken16(btf.mapInt32(x_1_128_255, 1, 255, -100, 100), y_1_16_31, lenkenProzent)
    }

    function dual2Motoren0Lenken16(m_100_0_100: number, y_1_16_31: number, lenkenProzent = 30) {

        let l_percent = m_100_0_100
        let r_percent = m_100_0_100

        // lenken (ein Motor wird langsamer)
        if (btf.between(y_1_16_31, 1, 15)) { // links
            // l_percent *= Math.map(servo, 0, 90, lenkenProzent / 100, 1) // 0=linkslenken50% // 90=nichtlenken=100%
            l_percent *= Math.map(y_1_16_31, 0, 16, lenkenProzent / 100, 1) // 0=linkslenken50% // 16=nichtlenken=100%
        }
        else if (btf.between(y_1_16_31, 17, 31)) { // rechts
            //  r_percent *= Math.map(servo, 90, 180, 1, lenkenProzent / 100) // 90=nichtlenken=100% // 180=rechtslenken50%
            r_percent *= Math.map(y_1_16_31, 16, 32, 1, lenkenProzent / 100) // 16=nichtlenken=100% // 32=rechtslenken50%
        }

        if (l_percent == r_percent) {
            dualMotorPower_percent(eDualMotor.M0_M1, l_percent)// v3 Ereignis Block auslösen, nur wenn benutzt
        }
        else {
            dualMotorPower_percent(eDualMotor.M0, l_percent)
            dualMotorPower_percent(eDualMotor.M1, r_percent)
        }

    }



    // aktuelle Werte 
    let n_m1_1_128_255: number
    let n_m2_1_128_255: number

    //% group="Fahren mit 2 Motoren (0: keine Änderung)" subcategory="2 Motoren"
    //% block="2 Motoren (1↓128↑255) links %m1_1_128_255 • rechts %m2_1_128_255" weight=3
    //% m1_1_128_255.min=0 m1_1_128_255.max=255 m1_1_128_255.defl=0
    //% m2_1_128_255.min=0 m2_1_128_255.max=255 m2_1_128_255.defl=0
    export function dual2Motoren128(m1_1_128_255: number, m2_1_128_255: number) {
        //n_x1_128_255 = undefined
        //n_y1_16_31 = undefined // die anderen zwischengespeicherten Werte ungültig machen

        // ist ein Parameter 0, wird der Motor nicht angesteuert: keine Änderung
        // ist ein Parameter gleich dem letzten Wert, wird der Motor ebenfalls nicht geändert

        if (btf.between(m1_1_128_255, 1, 255) && n_m1_1_128_255 != m1_1_128_255) {
            n_m1_1_128_255 = m1_1_128_255 // letzten Wert merken
            dualMotorPower_percent(eDualMotor.M0, btf.mapInt32(m1_1_128_255, 1, 255, 100, 100))
        }

        if (btf.between(m2_1_128_255, 1, 255) && n_m2_1_128_255 != m2_1_128_255) {
            n_m2_1_128_255 = m2_1_128_255 // letzten Wert merken
            dualMotorPower_percent(eDualMotor.M1, btf.mapInt32(m2_1_128_255, 1, 255, 100, 100))
        }


        /* 
                let motorBuffer: Buffer // undefined
                let offset = 0
                if (m1 && m2) {
                    motorBuffer = Buffer.create(6)
                    motorBuffer[offset++] = eRegister.SET_MOTOR
                    motorBuffer[offset++] = 3 // 3 beide Motoren
                } else if (m1) {
                    motorBuffer = Buffer.create(4)
                    motorBuffer[offset++] = eRegister.SET_MOTOR
                    motorBuffer[offset++] = 1
                } else if (m2) {
                    motorBuffer = Buffer.create(4)
                    motorBuffer[offset++] = eRegister.SET_MOTOR
                    motorBuffer[offset++] = 2
                }
        
                // M1 offset 2:Richtung, 3:PWM
                if (m1 && (m1_1_128_255 & 0x80) == 0x80) { // 128..255 M1 vorwärts
                    n_m1_1_128_255 = m1_1_128_255 // letzten Wert merken
                    motorBuffer[offset++] = 0
                    motorBuffer[offset++] = (m1_1_128_255 << 1)
                } else if (m1) { // 1..127 M1 rückwärts
                    n_m1_1_128_255 = m1_1_128_255
                    motorBuffer[offset++] = 1
                    motorBuffer[offset++] = ~(m1_1_128_255 << 1)
                }
        
                // M2 wenn !m1 offset 2:Richtung, 3:PWM sonst offset 4:Richtung, 5:PWM
                if (m2 && (m2_1_128_255 & 0x80) == 0x80) { // 128..255 M2 vorwärts
                    n_m2_1_128_255 = m2_1_128_255 // letzten Wert merken
                    motorBuffer[offset++] = 0
                    motorBuffer[offset++] = (m2_1_128_255 << 1)
                } else if (m2) { // 1..127 M2 rückwärts
                    n_m2_1_128_255 = m2_1_128_255
                    motorBuffer[offset++] = 1
                    motorBuffer[offset++] = ~(m2_1_128_255 << 1)
                }
        
                if (motorBuffer) // wenn beide false, ist motorBuffer undefined
                    i2cWriteBuffer(motorBuffer)
                //  } */
    }


} // r-zweimotoren.ts


namespace receiver { // r-zweimotoren.ts



    //% group="Fahren und Lenken" subcategory="2 Motoren"
    //% block="Fahren %motor \\% • Lenken %servo ° || • Lenken %lenkenProzent \\%" weight=5
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=30
    export function dual2MotorenLenkenPicker(motor: number, servo: number, lenkenProzent = 30) {
        dual2Motoren0Lenken16(motor, btf.protractorPicker(servo), lenkenProzent)
    }


    //% group="Fahren und Lenken" subcategory="2 Motoren"
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


} // r-zweimotoren.ts

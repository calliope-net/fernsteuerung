
namespace receiver { // r-zweimotoren.ts

    //% group="Fahren und Lenken" subcategory="2 Motoren"
    //% block="Fahren %motor \\% • Lenken %servo ° || • Lenken %lenkenProzent \\%" weight=5
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function writeMotorServoPicker(motor: number, servo: number, lenkenProzent = 50) {
        //writeMotor128Servo16(btf.speedPicker(motor), btf.protractorPicker(servo), lenkenProzent)

        dualMotorPower(eDualMotor.M0, 50)

    }


} // r-zweimotoren.ts

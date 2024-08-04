
namespace sender { // s-qwiicjoystick.ts

    const i2cqwiicJoystick_x20 = 0x20
    let n_qwiicJoystickConnected = true // Antwort von i2cWriteBuffer == 0 wenn angeschlossen
    // let n_max = 0 // Korrektur Joystick Endstellung nur beim Servo

    // speichert die vom Joystick gelesenen Werte
    let n_x: number // Current Horizontal Position (MSB)
    let n_y: number // Current Vertical Position (MSB)
    let n_xNull = 0 // Position beim Start
    let n_yNull = 0
    let n_ButtonPosition = false // Button ist gedrückt Current Button Position
    let n_ButtonOnOff = false    // wechselt bei jedem Drücken

    // ========== group="Joystick"


    export enum eJoystickValue {
        //% block="x 0..128..255 (Joystick)"
        x,
        //% block="y 0..128..255 (Joystick)"
        y,
        //% block="x Motor (1 ↓ 128 ↑ 255)"
        xmotor,
        //% block="y Motor (1 ↓ 128 ↑ 255)"
        ymotor,
        //% block="y Servo (45° ↖ 90° ↗ 135°)"
        servo90,
        //% block="y Servo (1 ↖ 16 ↗ 31)"
        servo16,
        //% block="x Motor (-100 ↓ 0 ↑ +100)"
        xmotor100,
        //% block="y Motor (-100 ↓ 0 ↑ +100)"
        ymotor100
    }


    //% group="Qwiic Joystick 0x20"
    //% block="Joystick einlesen || zeige I²C Fehler %zeigeFehler" weight=9
    //% zeigeFehler.shadow=toggleYesNo
    // pmax.min=0 pmax.max=20
    export function joystickQwiic(zeigeFehler = false) {
        if (n_qwiicJoystickConnected) {
            n_qwiicJoystickConnected = pins.i2cWriteBuffer(i2cqwiicJoystick_x20, Buffer.fromArray([3]), true) == 0

            if (n_qwiicJoystickConnected) {
                // n_128 = btf.between(p128, 0, 8) ? p128 : 0
                // n_max = btf.between(pmax, 0, 20) ? pmax : 0

                let bu = pins.i2cReadBuffer(i2cqwiicJoystick_x20, 6)
                n_x = bu[0] // X_MSB = 0x03,       // Current Horizontal Position (MSB First)
                n_y = bu[2] // Y_MSB = 0x05,       // Current Vertical Position (MSB First)
                n_ButtonPosition = (bu[4] == 0)    // Current Button Position BUTTON 0:ist gedrückt

                if (n_xNull == 0) {
                    // einmalig kalibrieren, wenn Joystick wahrscheinlich in Mittelstellung
                    if (btf.between(n_x, 120, 136) && btf.between(n_y, 120, 136)) {
                        n_xNull = n_x
                        n_yNull = n_y
                    }
                    else
                        return false // ungültige Werte gleich am Anfang ignorieren
                }

                if (bu[5] == 1) {// STATUS = 0x08, // Button Status: Indicates if button was pressed since last read of button state. Clears after read.
                    n_ButtonOnOff = !n_ButtonOnOff // OnOff umschalten
                    pins.i2cWriteBuffer(i2cqwiicJoystick_x20, Buffer.fromArray([8, 0])) // (8) Status 'Button war gedrückt' löschen
                }

            }
            else if (zeigeFehler)
                btf.zeigeHexFehler(i2cqwiicJoystick_x20)
        }
        return n_qwiicJoystickConnected
    }


    //% group="Qwiic Joystick 0x20"
    //% block="Joystick %pJoystickValue" weight=8
    export function joystickValue(pJoystickValue: eJoystickValue): number {

        switch (pJoystickValue) {
            case eJoystickValue.x: return n_x
            case eJoystickValue.y: return n_y
            case eJoystickValue.xmotor: {
                let xMotor = n_x
                if (n_x == 0)
                    xMotor = 1
                //else if (btf.between(n_x, 128 - n_128, 128 + n_128)) // Joystick Ruhestellung (p128=4) 124..132 -> 128
                //    xMotor = 128
                else if (btf.between(n_x, n_xNull - 2, n_xNull + 2)) // Joystick Ruhestellung (n_xNull=125) 123..127 -> 128
                    xMotor = 128

                return xMotor
            }
            case eJoystickValue.ymotor: {
                let yMotor = n_y
                if (n_y == 0)
                    yMotor = 1
                //else if (btf.between(n_y, 128 - n_128, 128 + n_128)) // Joystick Ruhestellung (p128=4) 124..132 -> 128
                //    yMotor = 128
                else if (btf.between(n_y, n_yNull - 2, n_yNull + 2)) // Joystick Ruhestellung (n_yNull=126) 124..128 -> 128
                    yMotor = 128

                return yMotor
            }

            case eJoystickValue.servo90: {
                let yServo = 90

                if (btf.between(n_y, n_yNull - 2, n_yNull + 2)) // Joystick Ruhestellung (n_yNull=126) 124..128 -> 128
                    yServo = 90 // geradeaus 90°
                else
                    yServo = btf.mapInt32(n_y, 0, 255, 45, 135)
                /* 
                  else if (n_y < (0 + n_max)) // Werte < 0 + pmax wie 0 behandeln (max links)
                      yServo = 45
                  else if (n_y > (255 - n_max)) // Werte > 235 wie 255 behandeln (max rechts)
                      yServo = 135
                  else {
                      yServo = btf.mapInt32(n_y, 0 + n_max, 255 - n_max, 45, 135)
                  } 
                */
                return yServo // (45° ↖ 90° ↗ 135°)
            }
            case eJoystickValue.servo16: {
                return Math.idiv(joystickValue(eJoystickValue.servo90), 3) - 14
            }
            case eJoystickValue.xmotor100: {
                return btf.mapInt32(joystickValue(eJoystickValue.xmotor), 1, 255, -100, 100)
            }
            case eJoystickValue.ymotor100: {
                return btf.mapInt32(joystickValue(eJoystickValue.ymotor), 1, 255, -100, 100)
            }

            default:
                return 0
        }

    }


    //% group="Qwiic Joystick 0x20"
    //% block="Joystick Button On\\|Off" weight=5
    export function joystickButtonOn() {
        return n_ButtonOnOff
    }

    //% group="Qwiic Joystick 0x20"
    //% block="Joystick Button ist gedrückt" weight=4
    export function joystickButtonPosition() {
        return n_ButtonPosition
    }


    // ========== blockHidden=true

    //% blockId=sender_xmotor blockHidden=true
    //% block="Joystick x (1↓128↑255)"
    export function sender_xmotor() {
        return joystickValue(eJoystickValue.xmotor)
    }

    //% blockId=sender_ymotor blockHidden=true
    //% block="Joystick y (1↓128↑255)"
    export function sender_ymotor() {
        return joystickValue(eJoystickValue.ymotor)
    }

    //% blockId=sender_servo16 blockHidden=true
    //% block="Joystick y (1↖16↗31)"
    export function sender_servo16() {
        return joystickValue(eJoystickValue.servo16)
    }


} // s-qwiicjoystick.ts


namespace cb2 { // c-beispiele.ts



    // ========== subcategory=Beispiele


    //% group="1 Spurfolger (1 ↓ 128 ↑ 255)" subcategory=Beispiele
    //% block="Spurfolger Motoren %motoren lenkender Motor %langsamer Stop %stopbeiabstand bei Abstand < (cm) %abstand" weight=2
    //% motoren.shadow=btf_speedPicker
    //% langsamer.shadow=btf_speedPicker
    //% stopbeiabstand.shadow=toggleYesNo
    //% abstand.min=0 abstand.max=50 abstand.defl=15
    //% inlineInputMode=inline
    export function beispielSpurfolger(motoren: number, langsamer: number, stopbeiabstand: boolean, abstand: number) {

        if (stopbeiabstand && (readUltraschallAbstand() < abstand)) { //  if (this.bitINPUT_US(eVergleich.lt, stop)) {
            writeMotorenStop()
            //return false
        } else {

            if (readSpursensor(eDH.dunkel, eDH.dunkel, eI2C.x21)) { //     if (this.bitINPUTS(calli2bot.eINPUTS.sp0)) {
                writeMotoren128(motoren, motoren)//         setMotoren0Prozent(pwm1, pwm1) // dunkel,dunkel
            } else if (readSpursensor(eDH.dunkel, eDH.hell)) { // if (this.bitINPUTS(calli2bot.eINPUTS.sp1r)) {
                writeMotoren128(c_MotorStop, langsamer)//      setMotoren0Prozent(0, pwm2)
            } else {
                writeMotoren128(langsamer, c_MotorStop)//      setMotoren0Prozent(pwm2, 0)
            }
            //return true
        }
    }


    //% group="1 Spurfolger (1 ↓ 128 ↑ 255)" subcategory=Beispiele
    //% block="Spurfolger Motor %motor128 Servo %servo16 || Stop bei Abstand < %abstand cm" weight=2
    //% motor128.shadow=btf_speedPicker
    //% servo16.shadow=btf_protractorPicker
    //% abstand.min=0 abstand.max=50
    //% inlineInputMode=inline
    export function beispielSpurfolger16(motor128: number, servo16: number, abstand?: number) {

        if (abstand && (readUltraschallAbstand() < abstand)) { // if (abstand) ist false bei 0
            writeMotorenStop()
            return false
        } else {
          //  writeLed(eLed.redl, false)
          //  writeLed(eLed.redr, false)

            let langsamfahren = btf.motorProzent(motor128, 50)
            let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

            if (readSpursensor(eDH.dunkel, eDH.dunkel, eI2C.x21)) {
                writeMotor128Servo16(motor128, 16) // nicht lenken

            } else if (readSpursensor(eDH.dunkel, eDH.hell)) { // 0% Rad steht bei voller Lenkung (1 oder 31)
                writeMotor128Servo16(langsamfahren, 16 - lenken, 0) // links lenken <16 = 1
                m_lenken = 16 + lenken
         //       writeLed(eLed.redr, true)

            }
            else if (readSpursensor(eDH.hell, eDH.dunkel)) { // 0% Rad steht bei voller Lenkung (1 oder 31)
                writeMotor128Servo16(langsamfahren, 16 + lenken, 0) // rechts lenken >16 = 31
                m_lenken = 16 - lenken
         //       writeLed(eLed.redl, true)
            }
            else if (m_lenken) {

                writeMotor128Servo16(langsamfahren, m_lenken, 0) // entgegen lenken
            }

            else {
                writeMotor128Servo16(langsamfahren, 16 + lenken, 0) // rechts lenken >16 = 31
          //      writeLed(eLed.redl, true)
          //      writeLed(eLed.redr, true)
            }

            return true
        }
    }

    let m_lenken: number


    // blockId=cb2_speedPicker block="%speed" blockHidden=true
    // speed.shadow="speedPicker"
    //export function cb2_speedPicker(speed: number) { // defl ist 50%
    //    return radio.speedPicker(speed)
    //}

    // blockId=cb2_protractorPicker block="%angle" blockHidden=true
    // angle.shadow="protractorPicker" angle.defl=90
    //export function cb2_protractorPicker(angle: number) { // defl ist 0°
    //    return radio.protractorPicker(angle)
    //}




    function setMotoren0Prozent(pwm1: number, pwm2: number) { // (-100% .. 0 .. +100%)
        writeMotoren128(btf.speedPicker(pwm1), btf.speedPicker(pwm2))
    }

    // ========== group="2 fahren und drehen" subcategory=Beispiele ⅒s • 

    //% group="2 fahren und drehen" subcategory=Beispiele
    //% block="Motoren fahren %sf s • drehen %sd s • nach %rl" weight=8
    // sf.min=0 sf.max=10 sf.defl=5
    // sd.min=0 sd.max=10 sd.defl=2.5
    //% sf.shadow=cb2_sekunden
    //% sd.shadow=cb2_sekunden
    export function seite2Motor(sf: number, sd: number, rl: eRL) {
        setMotoren0Prozent(100, 100)

        pauseSekunden(sf)
        if (rl == eRL.links)
            setMotoren0Prozent(-50, 50)
        else
            setMotoren0Prozent(50, -50)
        pauseSekunden(sd)
        setMotoren0Prozent(0, 0)
    }

    let n_StopandGoMotoran: boolean = false // für seite4StopandGo()


    //% group="4 Lautstärke, Stop and Go" subcategory=Beispiele
    //% block="Stop and Go Motoren l %pwm1 \\% r %pwm2 \\% Lautstärke > %soundLevel || Pause %sekunden" weight=1
    //% pwm1.shadow="speedPicker" pwm1.defl=80
    //% pwm2.shadow="speedPicker" pwm2.defl=-80
    //% soundLevel.min=0 soundLevel.max=255 soundLevel.defl=30
    //% sekunden.shadow=cb2_sekunden
    //% inlineInputMode=inline
    export function seite4StopandGoL(pwm1: number, pwm2: number, soundLevel: number, sekunden: number = 1) {
        let laut = input.soundLevel()

        // if (this.initLog(2)) {

        //  this.qLog[0] = format4r(soundLevel) + format4r(laut)

        // }

        if (laut > soundLevel) {
            n_StopandGoMotoran = !(n_StopandGoMotoran)

            // nur bei Änderung an i2c senden
            if (n_StopandGoMotoran)
                setMotoren0Prozent(pwm1, pwm2)
            else
                setMotoren0Prozent(0, 0)

            //if (this.initLog(2))
            //    this.qLog[1] = (this.qStopandGoMotoran ? "  Go" : "Stop") + format4r(laut)

            pauseSekunden(sekunden) // Sekunden nur nach Ereignis
        }



    }


    // ========== 



    //% group="9 Linienfolger" subcategory=Beispiele
    //% block="Linienfolger fahren %pwm1 \\% • drehen %pwm2 \\% • stop %stop cm" weight=2
    //% pwm1.shadow="speedPicker" pwm1.defl=100
    //% pwm2.shadow="speedPicker" pwm2.defl=50
    //% stop.min=0 stop.max=50 stop.defl=10
    export function seite9Linienfolger(pwm1: number, pwm2: number, stop: number) {
        //this.i2cReadINPUT_US()
        if (readUltraschallAbstand() < stop) { //  if (this.bitINPUT_US(eVergleich.lt, stop)) {
            setMotoren0Prozent(0, 0)
            return false
        } else {
            // this.i2cReadINPUTS()
            // readInputs()
            if (readSpursensor(eDH.dunkel, eDH.dunkel, eI2C.x21)) { //     if (this.bitINPUTS(calli2bot.eINPUTS.sp0)) {
                setMotoren0Prozent(pwm1, pwm1) // dunkel,dunkel
                writeLed(eLed.redb, false) // beide rote LED aus
            } else if (readSpursensor(eDH.dunkel, eDH.hell)) { // if (this.bitINPUTS(calli2bot.eINPUTS.sp1r)) {
                setMotoren0Prozent(0, pwm2)
                // writeLed(eLed.redl, false)
                writeLed(eLed.redr, true)
            } else {
                setMotoren0Prozent(pwm2, 0)
                //  writeLed(eLed.redl, false)
                writeLed(eLed.redr, false)
            }
            return true
        }
    }



    //% group="Pause" subcategory=Beispiele
    //% block="Pause %sekunden" weight=1
    //% sekunden.shadow=cb2_sekunden
    export function pauseSekunden(sekunden: number) {
        basic.pause(sekunden * 1000)
        // control.waitMicros(sekunden * 1000000)
    }

    export enum ePause {
        //% block="1 Sekunde"
        s1 = 10,
        //% block="0,5 Sekunden"
        s05 = 5,
        //% block="2 Sekunden"
        s2 = 20,
        //% block="5 Sekunden"
        s5 = 50,
        //% block="10 Sekunden"
        s10 = 100,
        //% block="15 Sekunden"
        s15 = 150,
        //% block="20 Sekunden"
        s20 = 200,
        //% block="25 Sekunden"
        s25 = 250
    }

    //% blockId=cb2_sekunden 
    //% block="%pause" blockHidden=true
    export function cb2_sekunden(pause: ePause): number { return pause / 10 }

    //% blockId=cb2_zehntelsekunden
    //% block="%pause" blockHidden=true
    export function cb2_zehntelsekunden(pause: ePause): number { return pause }



    export enum eRL { rechts = 0, links = 1 } // Index im Array


} // c-beispiele.ts

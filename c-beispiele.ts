
namespace cb2 { // c-beispiele.ts

    // ========== subcategory=Beispiele



    // ========== group="Abstand Sensor Ereignis" subcategory=Beispiele

    let a_AbstandAusweichen_gestartet: boolean[] = [false, false] // index 0=block, 1=buffer in c-fernsteuerung.ts


    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="Hindernis ausweichen: Calli:bot | gestartet %hindernis_ausweichen <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %vMotor Lenken (1↖16↗31) %vServo rückwärts Fahren %rMotor rückwärts Lenken %rServo rückwärts Lenken (0) = Zufall | Pause ⅒s %pause_zs" weight=6
    //% hindernis_ausweichen.shadow=toggleOnOff
    // abstand_Stop.shadow=toggleYesNo
    //% vMotor.min=1 vMotor.max=255 vMotor.defl=255
    //% vServo.min=1 vServo.max=31 vServo.defl=16
    //% rMotor.min=1 rMotor.max=255 rMotor.defl=64
    //% rServo.min=1 rServo.max=31 rServo.defl=0
    //% pause_zs.shadow=cb2_zehntelsekunden
    export function event_Hindernis_ausweichen(hindernis_ausweichen: boolean, abstand_Stop: boolean, vMotor: number, vServo: number, rMotor: number, rServo: number, pause_zs: number, index = 0) {
        // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
        // Parameter abstand_Knopf_A und Sensor Ereignis <abstand_Stop>
        if (hindernis_ausweichen) {

            btf.reset_timer()

            if (abstand_Stop) { // Sensor Ereignis Abstand zu klein - rückwärts
                writeMotor128Servo16(rMotor, (rServo == 0) ? zufallServo16(1, 5, 27, 31) : rServo)
            }
            else { // Sensor Ereignis Abstand wieder groß - vorwärts
                basic.pause(pause_zs * 100)
                writeMotor128Servo16(vMotor, (vServo == 0) ? 16 : vServo)
            }
            a_AbstandAusweichen_gestartet[index] = true
        }
        else if (a_AbstandAusweichen_gestartet[index]) {
            a_AbstandAusweichen_gestartet[index] = false
            writeMotorenStop() // ganz am Ende
        }
    }


    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="--Hindernis ausweichen: Calli:bot | gestartet %gestartet <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %vMotor Lenken (1↖16↗31) %vServo rückwärts Fahren %rMotor rückwärts Lenken %rServo rückwärts Lenken (0) = Zufall | Pause ⅒s %pause_zs" weight=6
    //% gestartet.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% vMotor.min=1 vMotor.max=255 vMotor.defl=255
    //% vServo.min=1 vServo.max=31 vServo.defl=16
    //% rMotor.min=1 rMotor.max=255 rMotor.defl=64
    //% rServo.min=1 rServo.max=31 rServo.defl=0
    //% pause_zs.shadow=cb2_zehntelsekunden
    /* export function eventAbstandAusweichen(gestartet: boolean, abstand_Stop: boolean, vMotor: number, vServo: number, rMotor: number, rServo: number, pause_zs: number, index = 0) {
        // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
        // Parameter abstand_Knopf_A und Sensor Ereignis <abstand_Stop>
        if (gestartet) {

            btf.reset_timer()

            if (abstand_Stop) { // Sensor Ereignis Abstand zu klein - rückwärts
                writeMotor128Servo16(rMotor, (rServo == 0) ? zufallServo16(1, 5, 27, 31) : rServo)
            }
            else { // Sensor Ereignis Abstand wieder groß - vorwärts
                basic.pause(pause_zs * 100)
                writeMotor128Servo16(vMotor, (vServo == 0) ? 16 : vServo)
            }
            a_AbstandAusweichen_gestartet[index] = true
        }
        else if (a_AbstandAusweichen_gestartet[index]) {
            a_AbstandAusweichen_gestartet[index] = false
            writeMotorenStop() // ganz am Ende
        }
    } */

    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="Zufall Lenken (1↖16↗31) links %lvon - %lbis • rechts %rvon - %rbis || • l-r %lr" weight=5
    //% lvon.min=1 lvon.max=15 lvon.defl=1
    //% lbis.min=1 lbis.max=15 lbis.defl=5
    //% rvon.min=17 rvon.max=31 rvon.defl=27
    //% rbis.min=17 rbis.max=31 rbis.defl=31
    //% lr.shadow=btf_randomBoolean
    //% inlineInputMode=inline
    export function zufallServo16(lvon = 1, lbis = 5, rvon = 27, rbis = 31, lr?: boolean) {
        if (lr == undefined)
            lr = Math.randomBoolean() // btf.btf_randomBoolean()
        if (lr)
            return randint(lvon, lbis)
        else
            return randint(rvon, rbis)
    }



    // ========== group="Spur Sensor Ereignis" subcategory=Beispiele

    let a_eventSpurfolger_gestartet: boolean[] = [false, false] // index 0=block, 1=buffer in c-fernsteuerung.ts

    let m_lenken: number
    let m_inSpur = false


    //% group="Spur Sensor Ereignis" subcategory=Beispiele
    //% block="Spur folgen: Calli:bot | gestartet %spur_folgen <links_hell> %links_hell <rechts_hell> %rechts_hell <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %motor128 langsam Fahren %motorLenken Lenken (1↖16↗31) %servo16 lenkender Motor \\% %lenkenProzent Abstand Sensor %abstandSensor %index" weight=6
    //% spur_folgen.shadow=toggleOnOff
    // links_hell.shadow=toggleYesNo
    // rechts_hell.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% motorLenken.min=1 motorLenken.max=255 motorLenken.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
    //% abstandSensor.shadow=toggleOnOff abstandSensor.defl=1
    // abstand.min=10 abstand.max=50 abstand.defl=30
    export function event_Spur_folgen(spur_folgen: boolean, links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean, motor128: number, motorLenken: number, servo16: number, lenkenProzent: number, abstandSensor: boolean, index = 0) {
        if (spur_folgen) {

            btf.reset_timer()

            if (!a_eventSpurfolger_gestartet[index]) { // ganz am Anfang
                m_lenken = undefined // gespeicherte Werte löschen
                m_inSpur = false     // beim ersten Durchlauf der Schleife
                writecb2RgbLeds(Colors.Off, false) // alle 4 aus
            }

            if (abstandSensor && abstand_Stop) {
                writeMotorenStop()
                writecb2RgbLed(eRgbLed.lh, Colors.Red, true)
                basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden warten bis es wieder los fährt
            }
            else {

                let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

                // readInputs(i2cSpur) // liest Spursensor ein

                if (!links_hell && !rechts_hell) { // dunkel dunkel
                    writeMotor128Servo16(motor128, 16) // nicht lenken
                    m_inSpur = true
                }
                else if (!links_hell && rechts_hell) { // dunkel hell
                    writeMotor128Servo16(motorLenken, 16 - lenken, lenkenProzent) // links lenken <16 = 1
                    if (m_inSpur)
                        m_lenken = 16 - lenken
                }
                else if (links_hell && !rechts_hell) { // hell dunkel
                    writeMotor128Servo16(motorLenken, 16 + lenken, lenkenProzent) // rechts lenken >16 = 31
                    if (m_inSpur)
                        m_lenken = 16 + lenken
                }
                else if (m_lenken) { // hell hell
                    writeMotor128Servo16(motorLenken, m_lenken, lenkenProzent) // lenken wie zuletzt gespeichert
                    m_inSpur = false // hell hell
                }
                else { // hell hell
                    writeMotor128Servo16(motor128, 16, 0) // geradeaus fahren bis zur schwarzen Linie
                    m_inSpur = false // hell hell
                }

                writecb2RgbLed(eRgbLed.lh, Colors.Yellow, abstandSensor)
            }
            a_eventSpurfolger_gestartet[index] = true
        }
        else if (a_eventSpurfolger_gestartet[index]) {
            a_eventSpurfolger_gestartet[index] = false
            writeMotorenStop() // ganz am Ende
            writecb2RgbLed(eRgbLed.lh, Colors.Yellow, false)
        }
    }


    //% group="Spur Sensor Ereignis" subcategory=Beispiele
    //% block="--Spur folgen: Calli:bot | gestartet %gestartet <links_hell> %links_hell <rechts_hell> %rechts_hell <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %motor128 langsam Fahren %motorLenken Lenken (1↖16↗31) %servo16 lenkender Motor \\% %lenkenProzent Abstand Sensor %abstandSensor bei Abstand < (cm) %abstand" weight=6
    //% gestartet.shadow=toggleYesNo
    // links_hell.shadow=toggleYesNo
    // rechts_hell.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% motorLenken.min=1 motorLenken.max=255 motorLenken.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
    //% abstandSensor.shadow=toggleOnOff abstandSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=30
    /* export function eventSpurfolger(gestartet: boolean, links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean, motor128: number, motorLenken: number, servo16: number, lenkenProzent: number, abstandSensor: boolean, abstand: number, index = 0) {
        if (gestartet) {

            btf.reset_timer()

            if (!a_eventSpurfolger_gestartet[index]) { // ganz am Anfang
                m_lenken = undefined // gespeicherte Werte löschen
                m_inSpur = false     // beim ersten Durchlauf der Schleife
                writecb2RgbLeds(Colors.Off, false) // alle 4 aus
            }

            if (abstandSensor && abstand > 0 && abstand_Stop) {
                writeMotorenStop()
                writecb2RgbLed(eRgbLed.lh, Colors.Red, true)
                basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden warten bis es wieder los fährt
            }
            else {

                let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

                // readInputs(i2cSpur) // liest Spursensor ein

                if (!links_hell && !rechts_hell) { // dunkel dunkel
                    writeMotor128Servo16(motor128, 16) // nicht lenken
                    m_inSpur = true
                }
                else if (!links_hell && rechts_hell) { // dunkel hell
                    writeMotor128Servo16(motorLenken, 16 - lenken, lenkenProzent) // links lenken <16 = 1
                    if (m_inSpur)
                        m_lenken = 16 - lenken
                }
                else if (links_hell && !rechts_hell) { // hell dunkel
                    writeMotor128Servo16(motorLenken, 16 + lenken, lenkenProzent) // rechts lenken >16 = 31
                    if (m_inSpur)
                        m_lenken = 16 + lenken
                }
                else if (m_lenken) { // hell hell
                    writeMotor128Servo16(motorLenken, m_lenken, lenkenProzent) // lenken wie zuletzt gespeichert
                    m_inSpur = false // hell hell
                }
                else { // hell hell
                    writeMotor128Servo16(motor128, 16, 0) // geradeaus fahren bis zur schwarzen Linie
                    m_inSpur = false // hell hell
                }

                writecb2RgbLed(eRgbLed.lh, Colors.Yellow, abstandSensor)
            }
            a_eventSpurfolger_gestartet[index] = true
        }
        else if (a_eventSpurfolger_gestartet[index]) {
            a_eventSpurfolger_gestartet[index] = false
            writeMotorenStop() // ganz am Ende
            writecb2RgbLed(eRgbLed.lh, Colors.Yellow, false)
        }
    } */


    //% group="Spurfolger" subcategory=Beispiele
    //% block="Spurfolger: Calli:bot | Fahren (1↓128↑255) %motor128 langsam Fahren %langsamfahren Lenken (1↖16↗31) %servo16 lenkender Motor \\% %lenkenProzent Wiederholung %repeat Abstandssensor %stop bei Abstand < (cm) %abstand I²C Spursensor %i2c" weight=2
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
    //% repeat.shadow="toggleYesNo" repeat.defl=1
    //% stop.shadow=toggleOnOff stop.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    // inlineInputMode=inline
    export function beispielSpurfolger16(motor128: number, langsamfahren: number, servo16: number, lenkenProzent: number, repeat: boolean, stop: boolean, abstand: number, i2cSpur: eI2C) {
        // repeat ist false beim ersten Durchlauf der Schleife, true bei Wiederholungen
        if (!repeat) {
            m_lenken = undefined // gespeicherte Werte löschen
            m_inSpur = false     // beim ersten Durchlauf der Schleife
            writecb2RgbLeds(Colors.Off, false) // alle 4 aus
        }

        if (stop && abstand > 0 && readUltraschallAbstand() < abstand) {
            writeMotorenStop()

            writecb2RgbLed(eRgbLed.lh, Colors.Red, true)

            basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden
        }
        else {

            let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

            readInputs(i2cSpur) // liest Spursensor ein

            if (readSpursensor(eDH.dunkel, eDH.dunkel, false)) {
                writeMotor128Servo16(motor128, 16) // nicht lenken
                m_inSpur = true
            }
            else if (readSpursensor(eDH.dunkel, eDH.hell, false)) { // 0% Rad steht bei voller Lenkung (1 oder 31)
                writeMotor128Servo16(langsamfahren, 16 - lenken, lenkenProzent) // links lenken <16 = 1
                if (m_inSpur)
                    m_lenken = 16 - lenken
            }
            else if (readSpursensor(eDH.hell, eDH.dunkel, false)) { // 0% Rad steht bei voller Lenkung (1 oder 31)
                writeMotor128Servo16(langsamfahren, 16 + lenken, lenkenProzent) // rechts lenken >16 = 31
                if (m_inSpur)
                    m_lenken = 16 + lenken
            }
            else if (m_lenken) {
                writeMotor128Servo16(langsamfahren, m_lenken, lenkenProzent) // lenken wie zuletzt gespeichert
                m_inSpur = false // hell hell
            }
            else {
                writeMotor128Servo16(motor128, 16, 0) // geradeaus fahren bis zur schwarzen Linie
                m_inSpur = false // hell hell
            }

            writecb2RgbLed(eRgbLed.lh, Colors.Yellow, stop)
        }
    }



    // ========== group="Abstand Sensor Ereignis" subcategory=Beispiele

    //   let a_AbstandAusweichen_gestartet: boolean[] = [false, false] // index 0=block, 1=buffer in c-fernsteuerung.ts

    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="--Hindernis ausweichen: Calli:bot | gestartet %gestartet <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %vMotor Lenken (1↖16↗31) %vServo rückwärts Fahren %rMotor rückwärts Lenken %rServo rückwärts Lenken (0) = Zufall | Pause ⅒s %pause_zs" weight=3
    //% gestartet.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% vMotor.min=1 vMotor.max=255 vMotor.defl=255
    //% vServo.min=1 vServo.max=31 vServo.defl=16
    //% rMotor.min=1 rMotor.max=255 rMotor.defl=64
    //% rServo.min=1 rServo.max=31 rServo.defl=0
    //% pause_zs.shadow=cb2_zehntelsekunden
    /*   export function lokalAbstandAusweichen(gestartet: boolean, abstand_Stop: boolean, vMotor: number, vServo: number, rMotor: number, rServo: number, pause_zs: number, index = 0) {
          // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
          // Parameter abstand_Knopf_A und Sensor Ereignis <abstand_Stop>
          if (gestartet) {
  
  
  
              //beispielAbstandAusweichen(
              //    n_AbstandAusweichen_gestartet, abstand_Stop,
              //    vMotor, vServo, rMotor, rServo, pause_zs
              //)
              btf.reset_timer()
  
              //if (!n_AbstandAusweichen_gestartet) { // ganz am Anfang
              //    n_AbstandAusweichen_gestartet[index] = true
              //    writeMotor128Servo16(vMotor, (vServo == 0) ? 16 : vServo)
              //}
              if (abstand_Stop) { // Sensor Ereignis Abstand zu klein - rückwärts
                  writeMotor128Servo16(rMotor, (rServo == 0) ? zufallServo16(1, 5, 27, 31) : rServo)
              }
              else { // Sensor Ereignis Abstand wieder groß - vorwärts
                  basic.pause(pause_zs * 100)
                  writeMotor128Servo16(vMotor, (vServo == 0) ? 16 : vServo)
              }
              a_AbstandAusweichen_gestartet[index] = true
          }
          else if (a_AbstandAusweichen_gestartet[index]) {
              a_AbstandAusweichen_gestartet[index] = false
              writeMotorenStop() // ganz am Ende
          }
      } */


    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="--Hindernis ausweichen: Calli:bot | gestartet %gestartet <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %vMotor Lenken (1↖16↗31) %vServo rückwärts Fahren %rMotor rückwärts Lenken %rServo Pause ⅒s %pause_zs" weight=6
    //% gestartet.shadow=toggleYesNo
    //% abstand_Stop.shadow=toggleYesNo
    //% vMotor.min=1 vMotor.max=255 vMotor.defl=255
    //% vServo.min=1 vServo.max=31 vServo.defl=16
    //% rMotor.min=1 rMotor.max=255 rMotor.defl=64
    //% rServo.min=1 rServo.max=31 rServo.defl=8
    //% pause_zs.shadow=cb2_zehntelsekunden
    /* export function beispielAbstandAusweichen(gestartet: boolean, abstand_Stop: boolean, vMotor: number, vServo: number, rMotor: number, rServo: number, pause_zs: number) {
        // aufgerufen von c-fernsteuerung.ts mit Parametern aus buffer
        // oder im Abstand Sensor Ereignis direkt mit Parametern
        if (!gestartet)
            writeMotor128Servo16(vMotor, vServo)

        //if (dauerhaft_Ausweichen) {
        btf.reset_timer()
        if (abstand_Stop) {
            writeMotor128Servo16(rMotor, rServo)
            //if (Math.randomBoolean()) 
            //    cb2.writeMotor128Servo16(64, randint(1, 9))
            // else 
            //    cb2.writeMotor128Servo16(64, randint(23, 31))
        }
        else {
            basic.pause(pause_zs * 100)
            writeMotor128Servo16(vMotor, vServo)
        }
        //}

    } */


    /* // ========== ARCHIV aus der Anleitung
    
        // ========== group="2 fahren und drehen" subcategory=Beispiele ⅒s • 
    
        function setMotoren0Prozent(pwm1: number, pwm2: number) { // (-100% .. 0 .. +100%)
            writeMotoren128(btf.speedPicker(pwm1), btf.speedPicker(pwm2))
        }
    
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
    
    
    
        // ========== group="4 Lautstärke, Stop and Go" subcategory=Beispiele
    
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
    
    
    
        // ========== group="9 Linienfolger" subcategory=Beispiele
    
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
                if (readSpursensor(eDH.dunkel, eDH.dunkel, true, eI2C.x21)) { //     if (this.bitINPUTS(calli2bot.eINPUTS.sp0)) {
                    setMotoren0Prozent(pwm1, pwm1) // dunkel,dunkel
                    writeLed(eLed.redb, false) // beide rote LED aus
                } else if (readSpursensor(eDH.dunkel, eDH.hell, false)) { // if (this.bitINPUTS(calli2bot.eINPUTS.sp1r)) {
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
    
    
    
        // ========== group="Pause" subcategory=Beispiele
    
        //% group="Pause" subcategory=Beispiele
        //% block="Pause %sekunden" weight=1
        //% sekunden.shadow=cb2_sekunden
        export function pauseSekunden(sekunden: number) {
            basic.pause(sekunden * 1000)
            // control.waitMicros(sekunden * 1000000)
        }
    
    
    
        // ========== Calli:bot ENUMs
    
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
    
    
    
        export enum eRL { rechts = 0, links = 1 } // Index im Array
     */

} // c-beispiele.ts

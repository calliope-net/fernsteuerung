
namespace receiver { // r-fahrplan.ts



    // ========== group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fahrplan"

    let n_fahrplanBuffer5Strecken_gestartet = false

    //% group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fahrplan"
    //% block="fahre Strecke 1-5 aus Datenpaket %buffer Start Bit %startBit" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.m1
     function fahrplanBuffer5Strecken(buffer: Buffer, startBit: btf.e3aktiviert) {

        if (!n_fahrplanBuffer5Strecken_gestartet && btf.getaktiviert(buffer, startBit)) { // m1 true
            n_fahrplanBuffer5Strecken_gestartet = true
            btf.zeigeBIN(0, btf.ePlot.bin, 2)

            let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt
            if (i == 0)
                i = 1 // 0=1x 1=1x 2=2x 3=3x ...

            for (i; i > 0; i--) {

                for (let iBufferPointer = btf.eBufferPointer.m1; iBufferPointer < 19; iBufferPointer += 3) { // 4, 7, 10, 13, 16
                    //  fahreStrecke(buffer.slice(iBufferPointer, 3))

                    /*  if (btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor) != 0
                         &&
                         btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo) != 0
                         &&
                         btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke) != 0) { */


                    btf.zeigeBINx234Fahrplan5Strecken(buffer, iBufferPointer) // anzeigen im 5x5 Display

                    fahreStrecke(
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand),
                        btf.getAbstand(buffer),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse)
                    )
                    // }
                } // for iBufferPointer
            }
        }
        else if (n_fahrplanBuffer5Strecken_gestartet && !btf.getaktiviert(buffer, startBit)) { // m1 false
            n_fahrplanBuffer5Strecken_gestartet = false
            btf.zeigeBIN(0, btf.ePlot.bin, 2)
            btf.zeigeBIN(0, btf.ePlot.bin, 3)
            btf.zeigeBIN(0, btf.ePlot.bin, 4)
        }

    }

} // r-fahrplan.ts
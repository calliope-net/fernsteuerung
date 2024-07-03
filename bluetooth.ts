
namespace radio { // bluetooth.ts

    let a_StorageBuffer = Buffer.create(4) // lokaler Speicher 4 Byte NumberFormat.UInt32LE
    enum eStorageBuffer { funkgruppe, modell /* , c, d */ } // Index im Buffer

    let n_start = false

    export let n_lastconnectedTime = input.runningTime()  // ms seit Start
    let n_programm = false // autonomes fahren nach Programm, kein Bluetooth timeout

    export let n_sendReset = false

    //% group="calliope-net.github.io/fernsteuerung" subcategory="Bluetooth"
    //% block="beim Start Funkgruppe / Flash %storagei32" weight=9
    //% storagei32.min=160 storagei32.max=191 storagei32.defl=175
    export function beimStart(storagei32: number) {
        storageBufferSet(storagei32)
        beimStartintern()
    }

    export function beimStartintern() {

        radio.setGroup(getFunkgruppe())// a_StorageBuffer[eStorageBuffer.funkgruppe])
        radio.setTransmitPower(7)
        radio.setTransmitSerialNumber(true)

        n_start = true
    }



    export enum eFunkgruppeButton {
        //% block="lesen"
        // lesen,
        //% block="lesen und anzeigen"
        //  anzeigen,
        //% block="-1 und anzeigen"
        minus,
        //% block="+1 und anzeigen"
        plus,
        //% block="175 0xAF und anzeigen"
        reset
    }



    //% group="calliope-net.github.io/fernsteuerung" subcategory="Bluetooth" 
    //% block="Funkgruppe ändern %e" weight=7
    export function setFunkgruppeButton(e: eFunkgruppeButton) {

        if (e == eFunkgruppeButton.minus && a_StorageBuffer[eStorageBuffer.funkgruppe] > 0xA0)
            a_StorageBuffer[eStorageBuffer.funkgruppe]--
        else if (e == eFunkgruppeButton.plus && a_StorageBuffer[eStorageBuffer.funkgruppe] < 0xBF)
            a_StorageBuffer[eStorageBuffer.funkgruppe]++
        else if (e == eFunkgruppeButton.reset)
            a_StorageBuffer[eStorageBuffer.funkgruppe] = 0xAF

        radio.setGroup(a_StorageBuffer[eStorageBuffer.funkgruppe])

        zeigeFunkgruppe()

    }




    //% group="Flash Speicher (Storage)" subcategory="Bluetooth" color=#FFBB00 deprecated=true
    //% block="Flash einlesen %i32" weight=3
    //% zeigeFunkgruppe.shadow="toggleYesNo"
    export function storageBufferSet(i32: number) {
        // i32.shadow=storage_get_number
        a_StorageBuffer.setNumber(NumberFormat.UInt32LE, 0, i32)

        // Gültigkeit: Funkgruppe muss 0xA .. 0xBF sein
        if (!between(a_StorageBuffer[eStorageBuffer.funkgruppe], 0xA0, 0xBF))
            a_StorageBuffer[eStorageBuffer.funkgruppe] = 0xAF

    }

    //% group="Flash Speicher (Storage)" subcategory="Bluetooth" color=#FFBB00 deprecated=true
    //% block="Flash speichern" weight=2
    export function storageBufferGet() {
        return a_StorageBuffer.getNumber(NumberFormat.UInt32LE, 0)
    }



    // ========== group="Bluetooth senden" subcategory="Bluetooth"

    let a_sendBuffer19 = Buffer.create(19) // wird gesendet mit radio.sendBuffer

    //% blockId=radio_sendBuffer19
    //% group="Bluetooth senden (19 Byte)" subcategory="Bluetooth"
    //% block="sendData" color="#7E84F7" weight=5
    export function radio_sendBuffer19(): Buffer { return a_sendBuffer19 }

    //% group="Bluetooth senden (19 Byte)" subcategory="Bluetooth"
    //% block="sendData löschen" weight=3
    export function fill_sendBuffer19() { a_sendBuffer19.fill(0) }

    //% group="Bluetooth senden (19 Byte)" subcategory="Bluetooth"
    //% block="Buffer senden %sendBuffer" weight=1
    //% sendBuffer.shadow="radio_sendBuffer19"
    export function sendData(sendBuffer: Buffer) {
        if (n_sendReset) {
            setSchalter(sendBuffer, e0Schalter.b7, true)
            n_sendReset = false
        }
        radio.sendBuffer(sendBuffer)
    }



    // ========== Bluetooth Event radio.onReceivedBuffer behandeln ==========

    // deklariert die Variable mit dem Delegat-Typ '(receivedBuffer: Buffer) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    let onReceivedDataHandler: (receivedData: Buffer) => void


    // Event-Handler (aus radio) wenn Buffer empfangen (Event Block ist dort hidden und soll hiermit wieder sichtbar werden)
    // die function 'radio.onReceivedBuffer(cb)' hat einen Parameter 'cb' (das heißt callback)
    // der Parameter 'cb' hat den Typ '(receivedBuffer: Buffer) => void'
    // als Parabeter 'cb' übergeben wird die function 'function (receivedBuffer) {}'
    // was in den Klammern {} steht, wird bei dem Ereignis 'radio.onReceivedBuffer' abgearbeitet (callback = Rückruf)
    radio.onReceivedBuffer(function (receivedBuffer: Buffer) {

        if (n_start && receivedBuffer.length == 19) { // beim ersten Mal warten bis Motor bereit

            a_receivedBuffer19 = receivedBuffer // lokal speichern

            if ((receivedBuffer[0] & 0x80) == 0x80) // Bit 7 reset
                control.reset() // Soft-Reset, Calliope zurücksetzen

            n_programm = (receivedBuffer[0] & 0x20) == 0x20 // Bit 5 Programm=1 / Fernsteuerung=0

            //if (!n_connected) {
            //licht(false, false) //  Licht aus und Blinken beenden
            //   n_MotorChipReady = false
            //    n_connected = true // wenn Start und Motor bereit, setze auch Bluetooth connected
            //}
            n_lastconnectedTime = input.runningTime() // Connection-Timeout Zähler zurück setzen


            // die Variable 'onReceivedDataHandler' ist normalerweise undefined, dann passiert nichts
            // die Variable erhält einen Wert, wenn der folgende Ereignis Block 'onReceivedData' einmal im Code vorkommt
            // der Wert der Variable 'onReceivedDataHandler' ist die function, die bei true zurück gerufen wird
            // die function ruft mit dem Parameter vom Typ Buffer die Blöcke auf, die im Ereignis-Block stehen
            if (onReceivedDataHandler)
                onReceivedDataHandler(receivedBuffer) // Ereignis Block auslösen, nur wenn benutzt
        }
    })

    // ========== group="Bluetooth empfangen" subcategory="Buffer"

    let a_receivedBuffer19: Buffer


    // sichtbarer Event-Block

    //% group="Bluetooth empfangen (19 Byte)" subcategory="Bluetooth"
    //% block="wenn Buffer empfangen" weight=9
    //% draggableParameters=reporter
    export function onReceivedData(cb: (receivedData: Buffer) => void) {
        // das ist der sichtbare Ereignis Block 'wenn Buffer empfangen (receivedData)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onReceivedDataHandler = cb
        // aufgerufen wird beim Ereignis 'radio.onReceivedBuffer' die der Variable 'onReceivedDataHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'wenn Buffer empfangen (receivedData)' enthalten sind
    }


    //% blockId=radio_receivedBuffer19
    //% group="Bluetooth empfangen (19 Byte)" subcategory="Bluetooth"
    //% block="receivedData" weight=8
    export function radio_receivedBuffer19() { return a_receivedBuffer19 }


    //% group="Bluetooth empfangen (19 Byte)" subcategory="Bluetooth"
    //% block="timeout > %ms ms || abschalten %abschalten" weight=7
    //% abschalten.shadow="toggleYesNo"
    //% ms.defl=1000
    export function timeout(ms: number, abschalten = false) {
        if (!abschalten) // kurzes Fernsteuerung-timeout (1s) nur bei Joystick, nicht auslösen wenn n_programm=true
            return !n_programm && ((input.runningTime() - n_lastconnectedTime) > ms)
        else // längeres Programm-timeout (60s) immer auslösen falls Programm hängt (zum aus schalten)
            return ((input.runningTime() - n_lastconnectedTime) > ms)
    }





    // ========== group="Storage (Flash)" color=#FFBB00

    export function getFunkgruppe() {
        return a_StorageBuffer[eStorageBuffer.funkgruppe]
    }

    export function getModell() {
        // gibt den Enum Wert zurück
        return a_StorageBuffer[eStorageBuffer.modell]
    }
    export function setModell(pModell: number) {
        a_StorageBuffer[eStorageBuffer.modell] = pModell
    }


} // bluetooth.ts

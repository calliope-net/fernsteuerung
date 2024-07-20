//% color=#E3008C weight=95 icon="\uf012" block="Fernsteuerung"
namespace btf { // b-fernsteuerung.ts

    let a_StorageBuffer = Buffer.create(4) // lokaler Speicher 4 Byte NumberFormat.UInt32LE
    enum eStorageBuffer { funkgruppe, modell /* , c, d */ } // Index im Buffer

    let n_start = false

    export let n_lastConnectedTime = input.runningTime()  // ms seit Start
    let n_lastErrorBufferTime = input.runningTime()
    let n_localProgram = false // autonomes fahren nach Programm, kein Bluetooth timeout

    export let n_sendReset = false // true sendet zurücksetzen zum Empfänger wenn connected

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start || Funkgruppe %modellFunkgruppe" weight=9
    //% modellFunkgruppe.min=160 modellFunkgruppe.max=191
    export function beimStart(modellFunkgruppe?: number) {
        setStorageBuffer(modellFunkgruppe)
        //  storage.putBuffer(a_StorageBuffer)
        beimStartintern()
    }

    export function beimStartintern() {

        radio.setGroup(getStorageFunkgruppe())// a_StorageBuffer[eStorageBuffer.funkgruppe])
        radio.setTransmitPower(7)
        radio.setTransmitSerialNumber(true)

        n_start = true
    }



    export enum eFunkgruppeButton {
        //% block="-1 und anzeigen"
        minus,
        //% block="+1 und anzeigen"
        plus,
        // block="175 0xAF und anzeigen"
        //reset
    }

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Funkgruppe ändern %e" weight=7
    export function setFunkgruppeButton(e: eFunkgruppeButton) {

        if (e == eFunkgruppeButton.minus && a_StorageBuffer[eStorageBuffer.funkgruppe] > 0xA0)
            a_StorageBuffer[eStorageBuffer.funkgruppe]--
        else if (e == eFunkgruppeButton.plus && a_StorageBuffer[eStorageBuffer.funkgruppe] < 0xBF)
            a_StorageBuffer[eStorageBuffer.funkgruppe]++
        //else if (e == eFunkgruppeButton.reset)
        //    a_StorageBuffer[eStorageBuffer.funkgruppe] = 0xAF

        radio.setGroup(a_StorageBuffer[eStorageBuffer.funkgruppe])

        storage.putBuffer(a_StorageBuffer)

        zeigeFunkgruppe()

    }


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="%id" color="#7E84F7" weight=5
    //% id.defl=ButtonEvent.Hold
    export function buttonEventValue(id: ButtonEvent): number {
        return id
    }


    // ========== group="Bluetooth senden" subcategory="Bluetooth"

    let a_sendBuffer19 = Buffer.create(19) // wird gesendet mit radio.sendBuffer

    //% group="Bluetooth senden (19 Byte)"
    //% block="sendData löschen" weight=7
    export function fill_sendBuffer19() { a_sendBuffer19.fill(0) }

    //% group="Bluetooth senden (19 Byte)"
    //% block="Buffer senden %sendBuffer" weight=5
    //% sendBuffer.shadow="btf_sendBuffer19"
    export function sendData(sendBuffer: Buffer) {
        if (n_sendReset) {
            setSchalter(sendBuffer, e0Schalter.b7, true)
            n_sendReset = false
        }
        radio.sendBuffer(sendBuffer)
    }

    //% blockId=btf_sendBuffer19
    //% group="Bluetooth senden (19 Byte)"
    //% block="sendData" color="#7E84F7" weight=3
    export function btf_sendBuffer19(): Buffer { return a_sendBuffer19 }



    // ========== Bluetooth Event radio.onReceivedBuffer behandeln ==========

    // deklariert die Variable mit dem Delegat-Typ '(receivedBuffer: Buffer) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    let onReceivedDataHandler: (receivedData: Buffer) => void
    // let onReceivedErrorHandler: (receivedData: Buffer) => void

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

            //  n_programm = (receivedBuffer[0] & 0x20) == 0x20 // Bit 5 Programm=1 / Fernsteuerung=0

            n_localProgram = ((receivedBuffer[0] & 0x20) == 0x20) // Bit 5 Programm=1 / Betriebsart ..10.... oder ..11....
                || (((receivedBuffer[0] & 0x30) == 0x10) && ((receivedBuffer[3] & 0x01) == 0x00)) // Betriebsart 01 und Joystick nicht aktiv ([3]Bit 0=0)

            //if (!n_connected) {
            //licht(false, false) //  Licht aus und Blinken beenden
            //   n_MotorChipReady = false
            //    n_connected = true // wenn Start und Motor bereit, setze auch Bluetooth connected
            //}
            n_lastConnectedTime = input.runningTime() // Connection-Timeout Zähler zurück setzen


            // die Variable 'onReceivedDataHandler' ist normalerweise undefined, dann passiert nichts
            // die Variable erhält einen Wert, wenn der folgende Ereignis Block 'onReceivedData' einmal im Code vorkommt
            // der Wert der Variable 'onReceivedDataHandler' ist die function, die bei true zurück gerufen wird
            // die function ruft mit dem Parameter vom Typ Buffer die Blöcke auf, die im Ereignis-Block stehen
            if (onReceivedDataHandler)
                onReceivedDataHandler(receivedBuffer) // Ereignis Block auslösen, nur wenn benutzt
        }
        else
            n_lastErrorBufferTime = input.runningTime()
        //if (n_start && onReceivedErrorHandler)
        //    onReceivedErrorHandler(receivedBuffer) // Ereignis Block auslösen, nur wenn benutzt
        // falsche Buffer Länge empfangen

    })



    // ========== group="Bluetooth empfangen" subcategory="Buffer"

    let a_receivedBuffer19: Buffer


    // sichtbarer Event-Block

    //% group="Bluetooth empfangen (19 Byte)"
    //% block="wenn Datenpaket empfangen" weight=9
    //% draggableParameters=reporter
    export function onReceivedData(cb: (receivedData: Buffer) => void) {
        // das ist der sichtbare Ereignis Block 'wenn Buffer empfangen (receivedData)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onReceivedDataHandler = cb
        // aufgerufen wird beim Ereignis 'radio.onReceivedBuffer' die der Variable 'onReceivedDataHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'wenn Buffer empfangen (receivedData)' enthalten sind
    }


    //% blockId=btf_receivedBuffer19
    //% group="Bluetooth empfangen (19 Byte)"
    //% block="receivedData" weight=4
    export function btf_receivedBuffer19() { return a_receivedBuffer19 }


    //% group="Bluetooth empfangen (19 Byte)"
    //% block="timeout > %ms ms || abschalten %abschalten" weight=3
    //% abschalten.shadow="toggleYesNo"
    //% ms.defl=1000
    export function timeout(ms: number, abschalten = false) {
        if (!abschalten) // kurzes Fernsteuerung-timeout (1s) nur bei Joystick, nicht auslösen wenn n_programm=true
            return !n_localProgram && ((input.runningTime() - n_lastConnectedTime) > ms)
        else // längeres Programm-timeout (60s) immer auslösen falls Programm hängt (zum aus schalten)
            return ((input.runningTime() - n_lastConnectedTime) > ms)
    }


    //% group="Bluetooth empfangen (19 Byte)"
    //% block="ungültige Daten empfangen || < %ms ms" weight=1
    //% ms.defl=2000
    export function getReceivedBufferError(ms = 2000) {
        return ((input.runningTime() - n_lastErrorBufferTime) < ms)
    }
    // sichtbarer Event-Block
    // draggableParameters=reporter
    //export function onReceivedError(cb: (receivedError: Buffer) => void) {
    //    onReceivedErrorHandler = cb
    //}



    // ========== group="lokales Programm (kein Bluetooth Timeout)"

    //% group="lokales Programm (kein Bluetooth Timeout)"
    //% block="Timeout deaktivieren %localProgram"
    //% localProgram.shadow="toggleYesNo"
    export function set_localProgram(localProgram: boolean) {
        n_localProgram = localProgram
        n_lastConnectedTime = input.runningTime()  // ms seit Start
    }



    // ========== group="Storage (Flash)" color=#FFBB00

    // group="Flash Speicher (Storage)" deprecated=true
    // block="Flash einlesen %i32" weight=3
    // zeigeFunkgruppe.shadow="toggleYesNo"

    export function setStorageBuffer(modellFunkgruppe: number) {
        // i32 aus Storage enthält 4 Byte, Funkgruppe und Modell (nur beim Sender), + 2 Byte unbenutzt
        // ist i32 undefined, kommt der Wert nicht aus Storage und es wird der Standardwert modellFunkgruppe genommen
        // der Standardwert hängt beim Empfänger von der gewählten Hardware ab
        // basic.showNumber(i32)
        a_StorageBuffer = storage.getBuffer()
        //if (i32) {
        //    a_StorageBuffer.setNumber(NumberFormat.UInt32LE, 0, i32)
        // wenn angegeben, muss Funkgruppe (am offset 0) 0xA0 .. 0xBF sein
        if (!between(a_StorageBuffer[eStorageBuffer.funkgruppe], 0xA0, 0xBF))
            a_StorageBuffer[eStorageBuffer.funkgruppe] = (modellFunkgruppe) ? modellFunkgruppe : 0xAE
        //}
        //else {
        //    // optionaler Parameter (aus Storage) nicht angegeben, Standardwert nehmen
        //    a_StorageBuffer.fill(0)
        //    a_StorageBuffer[eStorageBuffer.funkgruppe] = modellFunkgruppe
        //}
    }


    // ========== StorageFunkgruppe offset 0

    export function getStorageFunkgruppe() {
        return a_StorageBuffer[eStorageBuffer.funkgruppe]
    }


    // ========== StorageModell offset 1

    export function setStorageModell(pModell: number) {
        //n_StorageModell = pModell
        a_StorageBuffer[eStorageBuffer.modell] = pModell
        storage.putBuffer(a_StorageBuffer)
    }

    //let n_StorageModell: number // lokaler Speicher, um nicht immer aus Storage zu lesen

    export function getStorageModell() {
        //if (n_StorageModell == undefined)
        return a_StorageBuffer[eStorageBuffer.modell] // liest 8 Bit aus dem Buffer, nicht aus dem Flash
        //return n_StorageModell
    }


} // b-fernsteuerung.ts

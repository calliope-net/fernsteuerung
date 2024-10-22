//% color=#E3008C weight=95 icon="\uf012" block="Fernsteuerung"
namespace btf { // b-fernsteuerung.ts

    // export const c_funkgruppe_min = 0xB0 // nur 8 mögliche Funkgruppen als index im StatusBuffer beim Sender
    // export const c_funkgruppe_max = 0xB7

    // Storage im Flash
    let a_StorageBuffer = Buffer.create(4) // lokaler Speicher 4 Byte NumberFormat.UInt32LE
    export enum eStorageBuffer { funkgruppe, modell, servoKorrektur /* , d */ } // Index im Buffer
    export let n_StorageChange = eStorageBuffer.funkgruppe
    let onStorageChanged: (pStorageChange: eStorageBuffer, buttonB: boolean) => void

    // nur Sender
    export let n_sendReset = false // true sendet zurücksetzen zum Empfänger wenn connected

    // nur Empfänger
    //let n_startReceivedBuffer = false // nur bei true wird Ereignis 'wenn Datenpaket empfangen' ausgelöst

    // onReceivedBuffer
    let n_timeoutDisbled = false // autonomes fahren nach Programm, kein Bluetooth timeout
    let n_lastConnectedTime = input.runningTime()  // ms seit Start
    let n_lastBetriebsart: e0Betriebsart // für DataChanged Erkennung
    let n_last6Motoren: number // für DataChanged Erkennung

    // group="calliope-net.github.io/fernsteuerung"
    // block="beim Start || Funkgruppe %modellFunkgruppe" weight=9
    /* export function beimStart(modellFunkgruppe?: number) {
        setStorageBuffer(modellFunkgruppe)
        beimStartintern(eNamespace.btf)
    } */

    export enum eNamespace { btf, sender, receiver, cb2 }
    export let m_Namespace: eNamespace


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Knopf A halten, Funkgruppe -1 und anzeigen" weight=6
    export function buttonAhold() {
        if (!(input.buttonIsPressed(Button.B))) {

            if (n_StorageChange == eStorageBuffer.funkgruppe) {
                if (a_StorageBuffer[eStorageBuffer.funkgruppe] > eFunkgruppe.b0) {
                    radio.setGroup(--a_StorageBuffer[eStorageBuffer.funkgruppe]) // erst -1, dann zurück lesen
                }
                setClearScreen()
                zeigeFunkgruppe()
                basic.pause(1000)
            }

            if (onStorageChanged)
                onStorageChanged(n_StorageChange, false)

            storage.putBuffer(a_StorageBuffer) // im Flash speichern
        }
    }

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Knopf B halten, Funkgruppe +1 und anzeigen" weight=5
    export function buttonBhold() {
        if (!(input.buttonIsPressed(Button.A))) {

            if (n_StorageChange == eStorageBuffer.funkgruppe) {
                if (a_StorageBuffer[eStorageBuffer.funkgruppe] < eFunkgruppe.b7) {
                    radio.setGroup(++a_StorageBuffer[eStorageBuffer.funkgruppe]) // erst +1, dann zurück lesen
                }
                setClearScreen()
                zeigeFunkgruppe()
                basic.pause(1000)
            }

            if (onStorageChanged)
                onStorageChanged(n_StorageChange, true)

            storage.putBuffer(a_StorageBuffer) // im Flash speichern
        }
    }

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="%id" color="#7E84F7" weight=2
    //% id.defl=ButtonEvent.Hold
    export function buttonEventValue(id: ButtonEvent): number {
        return id
    }


    // ========== group="Bluetooth senden" subcategory="Bluetooth"

    export function beimStartSender(e: eNamespace, callbackStorageChanged?: (pStorageChange: eStorageBuffer, buttonB: boolean) => void) {
        m_Namespace = e
        onStorageChanged = callbackStorageChanged
        radio.setGroup(getStorageFunkgruppe())
        radio.setTransmitPower(7)
        radio.setTransmitSerialNumber(true)

        //if (m_Namespace == eNamespace.receiver || m_Namespace == eNamespace.cb2)
        //    n_startReceivedBuffer = true // nur beim Empfänger relevant
    }

    let a_sendBuffer19 = Buffer.create(19) // wird gesendet mit radio.sendBuffer

    //% group="Bluetooth senden (19 Byte)"
    //% block="sendData löschen" weight=7
    export function fill_sendBuffer19() {
        a_sendBuffer19.fill(0)
    }

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
    export function btf_sendBuffer19(): Buffer {
        return a_sendBuffer19
    }



    // ========== Bluetooth Event radio.onReceivedBuffer behandeln ==========

    let a_receivedPacketSerialNumber = 0
    let a_receivedBuffer19: Buffer

    // deklariert die Variable mit dem Delegat-Typ '(receivedBuffer: Buffer) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    //let onReceivedDataHandler: (receivedData: Buffer) => void
    let onReceivedDataChangedHandler: (receivedData: Buffer, changed: boolean) => void

    export function beimStartReceiver(e: eNamespace, callbackStorageChanged?: (pStorageChange: eStorageBuffer, buttonB: boolean) => void) {
        m_Namespace = e
        onStorageChanged = callbackStorageChanged
        radio.setGroup(getStorageFunkgruppe())
        radio.setTransmitPower(7)
        radio.setTransmitSerialNumber(true)
        // n_startReceivedBuffer = true // nur beim Empfänger relevant

        // Event-Handler (aus radio) wenn Buffer empfangen (Event Block ist dort hidden und soll hiermit wieder sichtbar werden)
        // die function 'radio.onReceivedBuffer(cb)' hat einen Parameter 'cb' (das heißt callback)
        // der Parameter 'cb' hat den Typ '(receivedBuffer: Buffer) => void'
        // als Parabeter 'cb' übergeben wird die function 'function (receivedBuffer) {}'
        // was in den Klammern {} steht, wird bei dem Ereignis 'radio.onReceivedBuffer' abgearbeitet (callback = Rückruf)
        radio.onReceivedBuffer(function (receivedBuffer: Buffer) {
            // n_startReceivedBuffer && 
            if (receivedBuffer.length == 19
                //  && (a_receivedPacketSerialNumber == 0 || a_receivedPacketSerialNumber == radio.receivedPacket(RadioPacketProperty.SerialNumber))
            ) {
                let isBetriebsart00Fahren = (receivedBuffer[0] & 0b00110000) == e0Betriebsart.p0Fahren && (receivedBuffer[3] & 0b00111111) != 0
                // leerer Buffer (bei Fahrplan) soll nicht als Betriebsart 00 erkannt werden; zusätzlich muss Motor aktiviert sein
                
                if ( // ODER ||
                    !isBetriebsart00Fahren // 01 10 11 in den Betriebsarten immer true, SerialNumber ignorieren
                    ||
                    a_receivedPacketSerialNumber == 0 // nur wenn 00 Fahren, dann auch gleiche receivedPacketSerialNumber
                    ||
                    a_receivedPacketSerialNumber == radio.receivedPacket(RadioPacketProperty.SerialNumber)
                ) {
                    a_receivedBuffer19 = receivedBuffer // lokal speichern

                    if ((receivedBuffer[0] & 0x80) == 0x80) // Bit 7 reset
                        control.reset() // Soft-Reset, Calliope zurücksetzen

                    if (isBetriebsart00Fahren) // SerialNumber nur bei Joystick speichern und später beachten
                        a_receivedPacketSerialNumber = radio.receivedPacket(RadioPacketProperty.SerialNumber)

                    n_timeoutDisbled =
                        ((receivedBuffer[0] & 0x20) == 0x20) // Bit 5 Programm=1 / Betriebsart ..10.... oder ..11....
                        ||
                        (((receivedBuffer[0] & 0x30) == 0x10) && ((receivedBuffer[3] & 0x01) == 0x00)) // Betriebsart 01 und Joystick nicht aktiv ([3]Bit 0=0) M0 Power

                    n_lastConnectedTime = input.runningTime() // Connection-Timeout Zähler zurück setzen

                    // die Variable 'onReceivedDataHandler' ist normalerweise undefined, dann passiert nichts
                    // die Variable erhält einen Wert, wenn der folgende Ereignis Block 'onReceivedData' einmal im Code vorkommt
                    // der Wert der Variable 'onReceivedDataHandler' ist die function, die bei true zurück gerufen wird
                    // die function ruft mit dem Parameter vom Typ Buffer die Blöcke auf, die im Ereignis-Block stehen
                    //if (onReceivedDataHandler)
                    //    onReceivedDataHandler(receivedBuffer) // Ereignis Block auslösen, nur wenn benutzt

                    if (onReceivedDataChangedHandler) // Änderung Betriebsart[0] ODER aktivierte Motoren[3]
                        onReceivedDataChangedHandler(receivedBuffer, n_lastBetriebsart != (receivedBuffer[0] & 0b00110000) || n_last6Motoren != (receivedBuffer[3] & 0b00111111))

                    n_lastBetriebsart = receivedBuffer[0] & 0b00110000 // getBetriebsart(receivedBuffer)
                    n_last6Motoren = receivedBuffer[3] & 0b00111111
                }
            }
        })

    }

    // ========== group="Bluetooth empfangen" subcategory="Buffer"

    // sichtbarer Event-Block

    //% group="Bluetooth empfangen (19 Byte)"
    //% block="wenn Datenpaket empfangen" weight=8
    //% draggableParameters=reporter
    export function onReceivedDataChanged(cb: (receivedData: Buffer, changed: boolean) => void) {
        // das ist der sichtbare Ereignis Block 'wenn Buffer empfangen (receivedData)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onReceivedDataChangedHandler = cb
        // aufgerufen wird beim Ereignis 'radio.onReceivedBuffer' die der Variable 'onReceivedDataChangedHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'wenn Buffer empfangen (receivedData, changed)' enthalten sind
    }


    //% blockId=btf_receivedBuffer19
    //% group="Bluetooth empfangen (19 Byte)"
    //% block="receivedData" weight=4
    export function btf_receivedBuffer19() { return a_receivedBuffer19 }


    //% group="Bluetooth empfangen (19 Byte)"
    //% block="Timeout > %ms ms || und deaktiviert %timeoutDisbled" weight=3
    //% timeoutDisbled.shadow="toggleYesNo"
    //% ms.defl=1000
    export function timeout(ms: number, timeoutDisbled = false) {
        if (!timeoutDisbled) // kurzes Fernsteuerung-timeout (1s) nur bei Joystick, nicht auslösen wenn n_timeoutDisbled=true
            return !n_timeoutDisbled && ((input.runningTime() - n_lastConnectedTime) > ms)
        else // längeres Programm-timeout (60s) immer auslösen falls Programm hängt (zum aus schalten)
            return ((input.runningTime() - n_lastConnectedTime) > ms)
    }



    // ========== group="Bluetooth Einstellungen"

    //% group="Bluetooth Einstellungen"
    //% block="setze Funkgruppe auf %funkgruppe" weight=5
    export function setFunkgruppe(funkgruppe: eFunkgruppe) {
        if (between(funkgruppe, eFunkgruppe.b0, eFunkgruppe.b7)) {
            a_StorageBuffer[eStorageBuffer.funkgruppe] = funkgruppe
            radio.setGroup(funkgruppe)
            storage.putBuffer(a_StorageBuffer) // im Flash speichern
        }
    }

    //% group="Bluetooth Einstellungen"
    //% block="Timeout deaktivieren %timeoutDisbled" weight=3
    //% timeoutDisbled.shadow="toggleYesNo"
    export function set_timeoutDisbled(timeoutDisbled: boolean) {
        n_timeoutDisbled = timeoutDisbled
        n_lastConnectedTime = input.runningTime()  // startet das lange timeout (abschalten) neu
    }

    //% group="Bluetooth Einstellungen"
    //% block="Timeout deaktiviert" weight=2
    export function get_timeoutDisbled() {
        return n_timeoutDisbled
    }

    //% group="Bluetooth Einstellungen"
    //% block="Reset Timeout Timer" weight=1
    export function resetTimer() {
        if ((input.runningTime() - n_lastConnectedTime) > 2500)
            n_lastConnectedTime = input.runningTime()
    }

    // ========== "Storage (Flash)"

    export function loadStorageBuffer4FromFlash(funkgruppe?: number, servoKorrektur?: number) {
        // Storage enthält 4 Byte, Funkgruppe und Modell (nur beim Sender), + 2 Byte unbenutzt
        // modellFunkgruppe kann undefined sein, dann Standardwert c_funkgruppe_min nehmen
        // wenn ein gültiger Wert im Flash ist, nicht ändern (Parameter modellFunkgruppe ignorieren)

        a_StorageBuffer = storage.getBuffer()

        if (between(funkgruppe, eFunkgruppe.b0, eFunkgruppe.b7))
            a_StorageBuffer[eStorageBuffer.funkgruppe] = funkgruppe

        // Funkgruppe (am offset 0) muss c_funkgruppe_min .. c_funkgruppe_max sein
        if (!between(a_StorageBuffer[eStorageBuffer.funkgruppe], eFunkgruppe.b0, eFunkgruppe.b7))
            a_StorageBuffer[eStorageBuffer.funkgruppe] = eFunkgruppe.b0
        // a_StorageBuffer[eStorageBuffer.funkgruppe] = (funkgruppe) ? funkgruppe : c_funkgruppe_min

        if (!between(a_StorageBuffer[eStorageBuffer.servoKorrektur], 82, 98))
            a_StorageBuffer[eStorageBuffer.servoKorrektur] = (servoKorrektur) ? servoKorrektur : 90

    }


    // ========== StorageFunkgruppe offset 0

    export function getStorageFunkgruppe() {
        return a_StorageBuffer[eStorageBuffer.funkgruppe]
    }


    // ========== StorageModell offset 1 (nur einmal in s-sender.ts aufgerufen)

    export function setStorageModell(pModell: number) {
        a_StorageBuffer[eStorageBuffer.modell] = pModell
        storage.putBuffer(a_StorageBuffer)
    }
    export function getStorageModell() {
        return a_StorageBuffer[eStorageBuffer.modell] // liest 8 Bit aus dem Buffer, nicht aus dem Flash
    }

    export function setStorageServoKorrektur(servoKorrektur: number) {
        a_StorageBuffer[eStorageBuffer.servoKorrektur] = servoKorrektur
        storage.putBuffer(a_StorageBuffer)
    }
    export function getStorageServoKorrektur() {
        return a_StorageBuffer[eStorageBuffer.servoKorrektur] // liest 8 Bit aus dem Buffer, nicht aus dem Flash
    }

} // b-fernsteuerung.ts

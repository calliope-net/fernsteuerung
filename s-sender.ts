
//% color=#008CE3 icon="\uf012" block="Sender" weight=94
namespace sender { // s-sender.ts
    //btf: color=#E3008C weight=96 icon="\uf012" groups='["Group", "Broadcast", "Send", "Receive"]'
    // BF3F7F


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Sender || Modell und Funkgruppe anzeigen %zf %modellFunkgruppe" weight=8
    //% zf.shadow="toggleYesNo" zf.defl=1
    // modellFunkgruppe.min=160 modellFunkgruppe.max=191
    // inlineInputMode=external
    export function beimStart(zf = true, modellFunkgruppe?: number) {
        if (!btf.simulator()) {
            btf.setStorageBuffer(modellFunkgruppe) // prüft und speichert in a_StorageBuffer


            if (!btf.between(btf.getStorageModell(), 0, c_ModellCount - 1))
                // wenn ungültig, Standardwert setzen
                btf.setStorageModell(eModell.cb2e)

            if (zf) {
                // Bild anzeigen mit Pause 1500ms, Image-Array in s-auswahl.ts
                zeigeImage(btf.getStorageModell())
                //   btf.zeigeImage(a_ModellImages[btf.getStorageModell()])
                basic.pause(1500)
                btf.zeigeFunkgruppe()
            }
            btf.beimStartintern(btf.eNamespace.sender) // setzt auch n_start true, startet Bluetooth Empfang
        }
    }

    // PRIVATE
    enum eStatusBuffer { modell, funktion, buttons }
    const c_sbl = 3 // Buffer size
    let a_StatusBuffer: Buffer[] = [
        Buffer.create(c_sbl), Buffer.create(c_sbl), Buffer.create(c_sbl), Buffer.create(c_sbl),
        Buffer.create(c_sbl), Buffer.create(c_sbl), Buffer.create(c_sbl), Buffer.create(c_sbl)
    ]
    function getCurrentStatusBuffer(): Buffer {
        return a_StatusBuffer[btf.getStorageFunkgruppe() & 0b00000111] // Bitmaske für Index 0..7
    }
    // PRIVATE


    export function setStatusModell(pModell: eModell) {
        getCurrentStatusBuffer()[eStatusBuffer.modell] = pModell
    }
    export function getStatusModell(): eModell {
        return getCurrentStatusBuffer()[eStatusBuffer.modell]
    }

    export function setStatusFunktion(pFunktion: eFunktion) {
        getCurrentStatusBuffer()[eStatusBuffer.funktion] = pFunktion
    }
    export function getStatusFunktion(): eFunktion {
        return getCurrentStatusBuffer()[eStatusBuffer.funktion]
    }

    export function setStatusButtonA(bit: boolean) {
        if (bit)
            getCurrentStatusBuffer()[eStatusBuffer.buttons] |= 0b10000000 // OR Nullen bleiben, nur 1 wird gesetzt
        else
            getCurrentStatusBuffer()[eStatusBuffer.buttons] &= 0b01111111 // AND Einsen bleiben, nur 0 wird gesetzt
    }
    export function getStatusButtonA(): boolean {
        return (getCurrentStatusBuffer()[eStatusBuffer.buttons] & 0b10000000) == 0b10000000
    }

    export function setStatusButtonB(bit: boolean) {
        if (bit)
            getCurrentStatusBuffer()[eStatusBuffer.buttons] |= 0b01000000 // OR Nullen bleiben, nur 1 wird gesetzt
        else
            getCurrentStatusBuffer()[eStatusBuffer.buttons] &= 0b10111111 // AND Einsen bleiben, nur 0 wird gesetzt
    }
    export function getStatusButtonB(): boolean {
        return (getCurrentStatusBuffer()[eStatusBuffer.buttons] & 0b01000000) == 0b01000000
    }

    export function addStatusButtonCounter(add: number, min: number, max: number) {
        let counter = getStatusButtonCounter()
        if ((add < 0 && counter > min) || (add > 0 && counter < max))
            setStatusButtonCounter(counter + add)
    }
    export function setStatusButtonCounter(counter6Bit: number) {
        getCurrentStatusBuffer()[eStatusBuffer.buttons] &= 0b11000000 // AND Bit 7-6 bleiben; 5-4-3-2-1-0 auf 0 setzen
        getCurrentStatusBuffer()[eStatusBuffer.buttons] |= (counter6Bit & 0b00111111) // OR Bit 7-6 bleiben; 5-4-3-2-1-0 auf counter6Bit setzen
    }
    export function getStatusButtonCounter(): number {
        return (getCurrentStatusBuffer()[eStatusBuffer.buttons] & 0b00111111)
    }

} // s-sender.ts

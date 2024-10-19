
//% color=#008CE3 icon="\uf012" block="Sender" weight=94
namespace sender { // s-sender.ts
    //btf: color=#E3008C weight=96 icon="\uf012" groups='["Group", "Broadcast", "Send", "Receive"]'
    // BF3F7F


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Sender || • Modell anzeigen %zf • Funkgruppe %funkgruppe" weight=8
    //% zf.shadow="toggleYesNo" zf.defl=1
    export function beimStart(zf = true, funkgruppe?: btf.eFunkgruppe) { // funkgruppe ist undefined wenn im Block nicht angezeigt
        if (!btf.simulator()) {
            btf.loadStorageBuffer4FromFlash(funkgruppe) // prüft und speichert in a_StorageBuffer

            setStatusModell(btf.getStorageModell(), zf, 1500) // zeigt Modell an und schreibt auch in Flash

            if (zf || funkgruppe != undefined)
                btf.zeigeFunkgruppe()

            btf.beimStartSender(btf.eNamespace.sender, // setzt auch n_start true, startet Bluetooth Empfang
                function (pStorageChange: btf.eStorageBuffer, buttonB: boolean) {
                    // nur nach Funkgruppe ändern mit buttonAhold oder buttonBhold
                    if (pStorageChange == btf.eStorageBuffer.funkgruppe) {
                        btf.setStorageModell(getStatusModell()) // mit Funkgruppe ändert sich StatusModell, neues aktuelles Modell in Flash sichern
                        if (!isFunktion(eFunktion.ng))  // und nur wenn (neue Funktion) nicht gestertet
                            zeigeModellImagePause(1500) // Bild anzeigen mit Pause 1500ms
                    }
                }
            )
        }
    }



    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Knopf A+B halten, Reset senden %reset" weight=2
    //% reset.shadow="toggleYesNo"
    export function setSendReset(reset: boolean) {
        // if (isFunktion(sender.eFunktion.ng)) { // nicht nicht gestartet
        if (getStatusFunktion() != eFunktion.ng) { // nur wenn !=0 (gestartet) wird Bluetooth gesendet
            btf.n_sendReset = reset

            basic.pause(600) // warten bis gesendet (aller 400ms) und wieder false
            if (!btf.n_sendReset) {
                setStatusFunktion(eFunktion.ng) // nach dem Empfänger auch den Sender zurück setzen, sendet dann nicht mehr
                zeigeModellImagePause(1500)
            }
        }
    }



    // solange der Sender (Calliope) an geschaltet ist, 
    // wird beim Wechsel der Funkgruppe der Status der alten Funkgruppe gespeichert
    // und bei Rückkehr (zur Funkgruppe und dem damit verbundenen Modell) wieder hergestellt

    // im Flash wird nur die aktuelle Funkgruppe und Modell gespeichert
    // und beim Einschalten wieder hergestellt
    // funktion und buttons beginnt bei 0
    // alle anderen StatusBuffer beginnen bei 0=Calli:bot
    // solange funktion=nicht gestartet, kann das Modell geändert werden

    // PRIVATE ===
    enum eStatusBuffer { modell, funktion, buttons } // offset 0 1 2 in jedem Buffer
    // im Array sind so viele Buffer wie benutzte Funkgruppen
    // zu jeder Funkgruppe=ferngesteuertes Modell sind die 3 Variablen getrennt gespeichert
    // beim Wechsel wird so der letzte Status wieder hergestellt
    let a_StatusBuffer: Buffer[] = []

    function getCurrentStatusBuffer(): Buffer {
        let index = btf.getStorageFunkgruppe() & 0b00000111 // Bitmaske für Index 0..7
        while (a_StatusBuffer.length <= index) {
            a_StatusBuffer.push(Buffer.create(3)) // fügt nur bei Bedarf Buffer zum Array hinzu
        }
        return a_StatusBuffer.get(index)
    }
    // PRIVATE ===

    // folgende Funktionen bieten (im namespace sender) Zugriff auf die 3 Variablen modell, funktion, buttons

    export function setStatusModell(pModell: eModell, zeigeModell: boolean, pause: number) {
        if (!btf.between(pModell, 0, c_ModellCount - 1)) {
            pModell = eModell.cb2e
            // flash = true
        }
        getCurrentStatusBuffer()[eStatusBuffer.modell] = pModell
        if (zeigeModell)
            zeigeModellImagePause(pause)
        // if (flash)
        btf.setStorageModell(pModell) // geändertes Modell wird auch im Flash gespeichert
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

    // Button A Bit 7 / Button B Bit 6 / ButtonCounter Bit 5-4-3-2-1-0 = 0..63
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
        let newCounter = getStatusButtonCounter() + add
        if (btf.between(newCounter, min, max))
            setStatusButtonCounter(newCounter)
    }
    export function setStatusButtonCounter(counter6Bit: number) {
        getCurrentStatusBuffer()[eStatusBuffer.buttons] &= 0b11000000 // AND Bit 7-6 bleiben; 5-4-3-2-1-0 auf 0 setzen
        getCurrentStatusBuffer()[eStatusBuffer.buttons] |= (counter6Bit & 0b00111111) // OR Bit 7-6 bleiben; 5-4-3-2-1-0 auf counter6Bit setzen
    }
    export function getStatusButtonCounter(): number {
        return (getCurrentStatusBuffer()[eStatusBuffer.buttons] & 0b00111111)
    }

} // s-sender.ts

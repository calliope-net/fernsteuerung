
//% color=#008CE3 icon="\uf012" block="Sender" weight=94
namespace sender { // s-sender.ts
    //radio: color=#E3008C weight=96 icon="\uf012" groups='["Group", "Broadcast", "Send", "Receive"]'
    // BF3F7F


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Sender | zeige Modell und Funkgruppe | %zf Funkgruppe (aus Flash lesen) | %storagei32" weight=8
    //% zf.shadow="toggleYesNo" zf.defl=1
    //% storagei32.min=160 storagei32.max=191 storagei32.defl=175
    //% inlineInputMode=external
    export function beimStart(zf: boolean, storagei32: number) {
        if (!radio.simulator()) {
            radio.setStorageBuffer(storagei32, 175) // prüft und speichert in a_StorageBuffer


            if (!radio.between(radio.getStorageModell(), 0, a_ModellImages.length - 1))
                // wenn ungültig, Standardwert setzen
                radio.setStorageModell(eModell.cb2e)

            if (zf) {
                // Bild anzeigen mit Pause 1500ms, Image-Array in s-auswahl.ts
                radio.zeigeImage(a_ModellImages[radio.getStorageModell()])
                basic.pause(1500)
                radio.zeigeFunkgruppe()
            }
            radio.beimStartintern() // setzt auch n_start true, startet Bluetooth Empfang
        }
    }

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Flash speichern" weight=7
    export function storageBufferGet() {
        return radio.storageBufferGet()
    }



} // s-sender.ts

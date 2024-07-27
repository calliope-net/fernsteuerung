
namespace sender { // s-advanced.ts



    //% group="Empfänger zurücksetzen" advanced=true
    //% block="Reset senden %reset" weight=2
    //% reset.shadow="toggleYesNo"
    export function setSendReset(reset = false) {
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


    // ========== wenn Text empfangen (Bluetooth Status zurück senden)

    let n_receivedString = ""
    let n_receivedStringChanged = false


    //% group="Bluetooth empfangen (Text)" advanced=true
    //% block="Status empfangen aktivieren" weight=5
    function receivedStringRegisterEvent() {

        radio.onReceivedString(function (receivedString) {
            n_receivedStringChanged = n_receivedString != receivedString
            if (n_receivedStringChanged) {
                n_receivedString = receivedString
            }
        })

    }

    //% group="Bluetooth empfangen (Text)" advanced=true
    //% block="Status empfangen Änderung" weight=4
    export function receivedStringChanged() { return n_receivedStringChanged }

    //% group="Bluetooth empfangen (Text)" advanced=true
    //% block="Status empfangen Text" weight=3
    export function receivedStringText() { return n_receivedString.substr(2) }


} // s-advanced.ts


namespace sender { // s-advanced.ts


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

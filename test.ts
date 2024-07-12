// Hier kann man Tests durchführen; diese Datei wird nicht kompiliert, wenn dieses Paket als Erweiterung verwendet wird.

namespace radio {

    export function setGroup(id: number): void {
    }

    export function setTransmitPower(power: number): void {
    }

    export function setFrequencyBand(band: number): void {
    }

    export function setTransmitSerialNumber(transmit: boolean): void {
        // transmittingSerial = transmit;
    }

    export function sendBuffer(msg: Buffer) {
        // const packet = RadioPacket.mkPacket(PACKET_TYPE_BUFFER);
        // packet.bufferPayload = msg;
        // sendPacket(packet);
    }

    export function onReceivedBuffer(cb: (receivedBuffer: Buffer) => void) {
        // init();
        // onReceivedBufferHandler = cb;
    }

    export function onReceivedString(cb: (receivedString: string) => void) {
        // init();
        // onReceivedStringHandler = cb;
    }

}
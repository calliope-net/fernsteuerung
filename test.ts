// Hier kann man Tests durchführen; diese Datei wird nicht kompiliert, wenn dieses Paket als Erweiterung verwendet wird.
/* 
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
 */
// Hier kann man Tests durchführen; diese Datei wird nicht kompiliert, wenn dieses Paket als Erweiterung verwendet wird.
/* 
namespace storage {

    //% block
    export function putBuffer(buffer: Buffer): void {
        // let managedValue = Math.floor(value * 100);
        // storage.putValueInt(storagesInt[key], managedValue);
        storage.putValueInt("i2", buffer.getNumber(NumberFormat.UInt32LE, 0))
    }

    //% block
    export function getBuffer(): Buffer {
        // let value = getValueInt(storagesInt[key]);
        // return value / 100;
        let buffer = Buffer.create(4)
        buffer.setNumber(NumberFormat.UInt32LE, 0, storage.getValueInt("i2"))
        return buffer
    }

}
 */
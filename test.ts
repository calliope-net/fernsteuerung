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


    export function putNumber(key: StorageSlots, value: number): void {
        let managedValue = Math.floor(value * 100);
        storage.putValueInt(storagesInt[key], managedValue);
    }

    let storagesInt = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7']

    export enum StorageSlots {
        //% block="Slot 1"
        s1 = 0,
        //% block="Slot 2"
        s2 = 1,
        //% block="Slot 3"
        s3 = 2,
        //% block="Slot 4"
        s4 = 3,
        //% block="Slot 5"
        s5 = 4,
        //% block="Slot 6"
        s6 = 5,
        //% block="Slot 7"
        s7 = 6,
    }
}

namespace storage {

    export function putBuffer(value: Buffer): void {
        // let managedValue = Math.floor(value * 100);
        // storage.putValueInt(storagesInt[key], managedValue);
    }

    export function getBuffer(): Buffer {
       // let value = getValueInt(storagesInt[key]);
       // return value / 100;
       return Buffer.create(4)
    }

}

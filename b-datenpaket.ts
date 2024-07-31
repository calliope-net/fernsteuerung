
namespace btf
/*
Calliope Bluetooth Erweiterung für 19 Byte Buffer und CaR Fernsteuerung
für CalliBot, MakerKitCar, CaR4
240601 Lutz Elßner
*/ { // b-datenpaket.ts


    // ========== group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"


    // ========== Steuer-Byte 0

    //% group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"
    //% block="%buffer [0] Betriebsart %betriebsart" weight=6
    //% buffer.shadow="btf_sendBuffer19"
    export function setBetriebsart(buffer: Buffer, betriebsart: e0Betriebsart) {
        buffer[0] &= 0b11001111 // AND Bit 7-6-3-2-1-0 bleiben; 5-4 auf 0 setzen
        buffer[0] |= (betriebsart & 0b00110000) // OR Bit 7-6-3-2-1-0 bleiben; 5-4 auf pByte setzen
    }

    // group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    // block="%buffer [0] Betriebsart" weight=6
    export function getBetriebsart(buffer: Buffer): e0Betriebsart {
        return (buffer[0] & 0b00110000)
    }

    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    //% block="%buffer [0] Betriebsart == %betriebsart" weight=6
    export function isBetriebsart(buffer: Buffer, betriebsart: e0Betriebsart): boolean {
        if (buffer)
            return (buffer[0] & 0b00110000) == betriebsart
        else
            return false
    }



    //% group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"
    //% block="%buffer [0] Schalter %schalter %bit" weight=5
    //% buffer.shadow="btf_sendBuffer19"
    //% bit.shadow="toggleOnOff"
    export function setSchalter(buffer: Buffer, schalter: e0Schalter, bit: boolean) {
        if (bit)
            buffer[0] |= schalter // OR Nullen bleiben, nur 1 wird gesetzt
        else
            buffer[0] &= ~schalter // AND Einsen bleiben, nur 0 wird gesetzt
    }

    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    //% block="%buffer [0] Schalter %schalter" weight=5
    export function getSchalter(buffer: Buffer, schalter: e0Schalter): boolean {
        return (buffer[0] & schalter) == schalter
    }



    // ========== Steuer-Byte 3

    //% group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"
    //% block="%buffer [3] %motorBit aktiviert %bit" weight=4
    //% buffer.shadow="btf_sendBuffer19"
    //% bit.shadow="toggleOnOff"
    export function setaktiviert(buffer: Buffer, motorBit: e3aktiviert, bit: boolean) {
        if (bit)
            buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] |= motorBit // OR Nullen bleiben, nur 1 wird gesetzt
        else
            buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] &= ~motorBit // AND Einsen bleiben, nur 0 wird gesetzt
    }

    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    //% block="%buffer [3] %motorBit aktiviert" weight=4
    export function getaktiviert(buffer: Buffer, motorBit: e3aktiviert) {
        //return (buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] & motorBit) != 0
        return (buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] & motorBit) == motorBit
    }


    //% group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"
    //% block="%buffer [3] Ultraschall Abstand %e" weight=3
    //% buffer.shadow="btf_sendBuffer19"
    export function setAbstand(buffer: Buffer, e: e3Abstand) {
        buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] &= 0b00111111 // AND Bit 5-4-3-2-1-0 bleiben; 7-6 auf 0 setzen
        buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] |= (e & 0b11000000) // OR Bit 5-4-3-2-1-0 bleiben; 7-6 auf e setzen
    }

    //% blockId=btf_getAbstand
    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    //% block="%buffer [3] Ultraschall Abstand in cm" weight=3
    export function getAbstand(buffer: Buffer) {
        return a_Abstand[buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] >>> 6]
        // return (buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] & 0b11000000)
    }

    //export function getAbstand(buffer: Buffer): e3Abstand {// blockHidden=true
    //    return (buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] & 0b11000000)
    //}

    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket" deprecated=true
    //% block="%buffer [3] Ultraschall Abstand == %abstand" weight=3
    export function isAbstand(buffer: Buffer, abstand: e3Abstand): boolean {
        return (buffer[eBufferPointer.m0 + eBufferOffset.b2_Fahrstrecke] & 0b11000000) == abstand
    }



    // ========== Servo Byte (3 Bit) Sensor Ereignis aktiviert

    //% group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"
    //% block="%buffer %bufferPointer %sensor %bit" weight=2
    //% buffer.shadow="btf_sendBuffer19"
    //% bit.shadow="toggleOnOff"
    //% inlineInputMode=inline 
    export function setSensor(buffer: Buffer, bufferPointer: eBufferPointer, sensor: eSensor, bit: boolean) {
        //if (!bufferPointer) bufferPointer = eBufferPointer.p0  // wenn nicht angegeben

        if (bit)
            buffer[bufferPointer + eBufferOffset.b1_Servo] |= sensor // OR Nullen bleiben, nur 1 wird gesetzt
        else
            buffer[bufferPointer + eBufferOffset.b1_Servo] &= ~sensor // AND Einsen bleiben, nur 0 wird gesetzt
    }

    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    //% block="%buffer %bufferPointer %sensor" weight=2
    export function getSensor(buffer: Buffer, bufferPointer: eBufferPointer, sensor: eSensor): boolean {
        //if (!bufferPointer) bufferPointer = eBufferPointer.p0  // wenn nicht angegeben

        return (buffer[bufferPointer + eBufferOffset.b1_Servo] & sensor) == sensor
    }


    // ========== 3 Byte (Motor, Servo, Strecke)

    //% group="Datenpaket zum Senden vorbereiten" subcategory="Datenpaket"
    //% block="%buffer %bufferPointer %bufferOffset Byte %byte" weight=1
    //% buffer.shadow="btf_sendBuffer19"
    //% byte.min=0 byte.max=255
    //% inlineInputMode=inline 
    export function setByte(buffer: Buffer, bufferPointer: eBufferPointer, bufferOffset: eBufferOffset, byte: number) {
        //if (!bufferPointer) bufferPointer = eBufferPointer.p0  // wenn nicht angegeben

        if (bufferOffset == eBufferOffset.b1_Servo) {
            buffer[bufferPointer + bufferOffset] &= 0b11100000 // AND Bit 7-6-5 bleiben; 4-3-2-1-0 auf 0 setzen
            buffer[bufferPointer + bufferOffset] |= (byte & 0b00011111) // OR Bit 7-6-5 bleiben; 4-3-2-1-0 auf pByte setzen
        } else {
            buffer.setUint8(bufferPointer + bufferOffset, byte)
        }
    }

    //% group="Datenpaket auslesen (receivedData oder sendData)" subcategory="Datenpaket"
    //% block="%buffer %bufferPointer %bufferOffset Byte" weight=1
    export function getByte(buffer: Buffer, bufferPointer: eBufferPointer, bufferOffset: eBufferOffset) {
        //if (!bufferPointer) bufferPointer = eBufferPointer.p0  // wenn nicht angegeben

        if (bufferOffset == eBufferOffset.b1_Servo) {
            return buffer[bufferPointer + eBufferOffset.b1_Servo] & 0b00011111 // AND Bit 7-6-5 löschen
        } else {
            return buffer.getUint8(bufferPointer + bufferOffset)
        }
    }


}
// b-datenpaket.ts

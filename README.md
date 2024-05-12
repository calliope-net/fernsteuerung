
> Diese Seite bei [https://calliope-net.github.io/fernsteuerung/](https://calliope-net.github.io/fernsteuerung/) öffnen

## Als Erweiterung verwenden

Dieses Repository kann als **Erweiterung** in MakeCode hinzugefügt werden.

* öffne [https://makecode.calliope.cc/](https://makecode.calliope.cc/)
* klicke auf **Neues Projekt**
* klicke auf **Erweiterungen** unter dem Zahnrad-Menü
* nach **https://github.com/calliope-net/fernsteuerung** suchen und importieren

### Bluetooth Buffer STruktur (19 Byte)

* 3 Byte (Motor, Servo, Entfernung) wiederholen sich 6 Mal im Buffer

offset|Funktion|Beschreibung
---|---|---
0|Steuer-Byte 0|Betriebsart, Schalter
1|M0 Motor|0..128..255
2|M0 Servo (6 Bit)|1..16..31 \| 0x20 Liniensensor \| 0x40 Ultraschall \| 0x80 Encoder
2|Events 0x20|5 Stop bei schwarzer Linie
2|Events 0x40|6 Stop bei Ultraschall
2|Events 0x80|7 Encoder Impulse
3|Steuer-Byte 3|
4|M1 Motor|0..128..255


### Steuer Byte 0

* das erste Byte im Buffer (**receivedData** oder **sendData**)
* die 2 Bit 5-4 steuern die Betriebsart:
* 0x00 die 6 Bereiche je 3 Byte können an bis 6 Motoren (und Servos) gleichzeitig Daten senden, vom Joystick
* 0x10 mit der Fernsteuerung fahren bis zu einem Sensor-Ereignis, dann autonom weiter
* 0x20 die 6 Bereiche je 3 Byte enthalten Teil-Strecken, die als Fahrplan autonom abgefahren werden
* 0x30 die 6 Bereiche je 3 Byte enthalten Fahr-Strecken, um auf ein Ereignis zu reagieren
* ist beim letzten empfangenen Buffer Bit 5 0x20 Programm gesetzt, wird kurzes timeout (1s) unterdrückt
* danach sollen keine Buffer mehr gesendet werden, bis das Programm abgefahren ist

hex|bit|Funktion
---|---|---
0x80|7|7 Soft-Reset
0x40|6|6 Status Buffer zurück senden
0x00|5-4|00 Fernsteuerung Motoren
0x10|5-4|10 Fernsteuerung Motor M0 bis Sensor
0x20|5-4|20 Programm 5 Strecken
0x30|5-4|30 Programm Sensoren
0x08|3|3 Schalter
0x04|2|2 Schalter
0x02|1|1 Schalter
0x01|0|0 Hupe

### Steuer Byte 3 Motor Power und Ultraschall Entfernung

* aktiviert die entsprechenden 3 Byte (Motor, Servo, Entfernung) im Buffer
* sind Motoren angeschlossen '00 Fernsteuerung Motoren', wird damit Motor Power geschaltet
* bei Strecken oder Sensor wird geschaltet, ob die Strecke bzw. das Ereignis abgearbeitet werden
* d.h. die Gültigkeit der 3 Bytes im Buffer wird an oder aus geschaltet

hex|bit|Funktion|aktiviert offset|Beschreibung
---|---|---|---|---
0x01|0|M0 \| Fernsteuerung|1-2|2 Byte (Motor, Servo) für Fernsteuerung mit Joystick
0x02|1|M1 \| Ultraschall|4-5-6|wird gefahren nachdem die Entfernung unterschritten wurde
0x04|2|MA \| Spursensor hell hell|7-8-9|wird gefahren nach 'Stop bei schwarzer Linie'
0x08|3|MB \| Spursensor hell dunkel|10-11-12|wird gefahren nach 'Stop bei schwarzer Linie'
0x10|4|MC \| Spursensor dunkel hell|13-14-15|wird gefahren nach 'Stop bei schwarzer Linie'
0x20|5|MD \| Spursensor dunkel dunkel|16-17-18|wird gefahren nach 'Stop bei schwarzer Linie'
0x00|7-6|Ultraschall Entferung||Stop bei 5 cm
0x40|7-6|Ultraschall Entferung||Stop bei 10 cm
0x80|7-6|Ultraschall Entferung||Stop bei 15 cm
0xC0|7-6|Ultraschall Entferung||Stop bei 20 cm





## Blocks preview

This image shows the blocks code from the last commit in master.
This image may take a few minutes to refresh.

![A rendered view of the blocks](https://github.com/calliope-net/fernsteuerung/raw/master/.github/makecode/blocks.png)

#### Metadaten (verwendet für Suche, Rendering)

* for PXT/calliopemini
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>

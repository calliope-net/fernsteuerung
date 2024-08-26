
namespace receiver // r-qwiiclaser.ts
/*
SparkFun Distance Sensor - 1.3 Meter, VL53L4CD (Qwiic)
https://www.sparkfun.com/products/18993
https://cdn.sparkfun.com/r/455-455/assets/parts/1/8/5/7/2/18993-SparkFun_Distance_Sensor_-_1.3_Meter__VL53L4CD__Qwiic_-01.jpg

Qwiic Distance Sensor (VL53L1X, VL53L4CD) Hookup Guide
https://learn.sparkfun.com/tutorials/qwiic-distance-sensor-vl53l1x-vl53l4cd-hookup-guide


https://github.com/sparkfun/Qwiic_VL53L1X_Py
https://github.com/sparkfun/Qwiic_VL53L1X_Py/blob/master/README.md
https://github.com/sparkfun/Qwiic_VL53L1X_Py/blob/master/examples/Example1_ReadDistance.py


https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library
https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/SparkFun_VL53L1X.h
https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/SparkFun_VL53L1X.cpp
https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/st_src/vl53l1x_class.h
https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/st_src/vl53l1x_class.cpp
https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/examples/Example1_ReadDistance/Example1_ReadDistance.ino

*/ {
    const i2cQwiicDistanceSensor_x29 = 0x29 // default address 0x52 >> 1
    let n_QwiicDistanceSensorConnected: boolean

    let n_InterruptPolarity = 0x01 // * 1 = active high (**default**) * 0 = active low

    // ========== group="Laser Distance Sensor" subcategory="Sensoren"
    // https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/st_src/vl53l1x_class.cpp

    // const VL53L1_ERROR_TIME_OUT = -7

    // group="Laser Distance Sensor" subcategory="Sensoren"
    // block="Laser Sensor Init" weight=9
    function laserSensorInit() {
        // This function loads the 135 bytes default values to initialize the sensor.
        // :return:	* 0:success * != 0:failed
        if (n_QwiicDistanceSensorConnected == undefined) {
            n_QwiicDistanceSensorConnected = true
            //for (let index = 0x2D; index <= 0x87; index++) {
            //    wrByte(index, vL51L1X_DEFAULT_CONFIGURATION()[index - 0x2D]);
            //}
            let buffer = Buffer.create(2)
            buffer.setNumber(NumberFormat.UInt16BE, 0, 0x2D)
            i2cWriteBuffer(Buffer.concat([buffer, vL51L1X_DEFAULT_CONFIGURATION()]))

            if (n_QwiicDistanceSensorConnected) { // wird bei i2cWriteBuffer true oder false gesetzt

                n_InterruptPolarity = getInterruptPolarity() // ändert sich nicht

                laserRanging(eSYSTEM__MODE_START.startRanging)

                // We need to wait at least the default intermeasurement period of 103ms before dataready will occur
                // But if a unit has already been powered and polling, it may happen much faster

                let timeout = 0

                while (!checkForDataReady()) {// (dataReady == 0) {
                    // dataReady = checkForDataReady() //  status = VL53L1X_CheckForDataReady(& dataReady);
                    if (timeout++ > 150)
                        return false // VL53L1_ERROR_TIME_OUT = -7
                    basic.pause(10) // delay(1) ms
                }
                clearInterrupt()
                laserRanging(eSYSTEM__MODE_START.stopRanging)
                // https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/st_src/vl53l1x_class.cpp
                // Zeile 188-189
                wrByte(eRegisterByte.VL53L1_VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND, 0x09); // two bounds VHV
                wrByte(0x0B, 0)	// start VHV from the previous temperature
            }
        }
        return n_QwiicDistanceSensorConnected
    }



    // ========== group="Laser Distance Sensor" subcategory="Sensoren"

    //% group="Laser Distance Sensor" subcategory="Sensoren"
    //% block="Laser Sensor angeschlossen" weight=9
    export function laserSensorConnected() {
        return laserSensorInit()
    }

    //% group="Laser Distance Sensor" subcategory="Sensoren"
    //% block="Laser Abstand (cm) || CheckForDataReady %check" weight=8
    //% check.shadow=toggleYesNo check.defl=1
    export function laserAbstand(check = true) {
        if (laserSensorConnected()) {
            if (n_SYSTEM__MODE_START != eSYSTEM__MODE_START.startRanging) { // wenn nicht gestartet
                laserRanging(eSYSTEM__MODE_START.startOneshotRanging) // einmalige Messung
            }
            while (check && !checkForDataReady()) {
                basic.pause(1) // ms
            }
            return rdWord(eRegisterWord.VL53L1_RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0) / 10 // mm / 10
        }
        else
            return 0
    }





    export enum eSYSTEM__MODE_START {
        startRanging = 0x40, // Enable VL53L1X
        stopRanging = 0x00,
        startOneshotRanging = 0x10 // Enable VL53L1X one-shot ranging
    }

    let n_SYSTEM__MODE_START = eSYSTEM__MODE_START.stopRanging

    //% group="Laser Distance Sensor" subcategory="Sensoren"
    //% block="Ranging Mode %mode || ClearInterrupt %clearInterrupt" weight=5
    //% clearInterrupt.shadow=toggleYesNo
    export function laserRanging(mode: eSYSTEM__MODE_START, clearInterrupt = false) {
        if (laserSensorConnected()) {
            if (clearInterrupt)
                wrByte(eRegisterByte.SYSTEM__INTERRUPT_CLEAR, 0x01)
            if (n_SYSTEM__MODE_START != mode) {
                n_SYSTEM__MODE_START = mode
                wrByte(eRegisterByte.SYSTEM__MODE_START, mode)
            }
        }
    }


    //% group="Laser Distance Sensor" subcategory="Sensoren"
    //% block="CheckForDataReady" weight=4
    export function checkForDataReady() {
        // This function checks if the new ranging data is available by polling the dedicated register.
        // 0 -> not ready = false
        // 1 -> ready = true isDataReady
        return (rdByte(eRegisterByte.GPIO__TIO_HV_STATUS) & 1) == n_InterruptPolarity
        // 0x31=49 GPIO__TIO_HV_STATUS ist 2 und wird bei ready kurz 3 // n_InterruptPolarity ist (immer) 1
        // Wert 0x02, Register 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() 
        // Definition wäre falsch, weil sich bit 0 ändert und ausgewertet wird, nicht bit 1
    }

    //% group="Laser Distance Sensor" subcategory="Sensoren"
    //% block="ClearInterrupt" weight=3
    export function clearInterrupt() {
        wrByte(eRegisterByte.SYSTEM__INTERRUPT_CLEAR, 0x01)
    }

    //% group="Laser Distance Sensor" subcategory="Sensoren"
    //% block="GetInterruptPolarity (0 oder 1 active high=default)" weight=2
    export function getInterruptPolarity() {
        // 0x30=48 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity()
        // This function returns the current interrupt polarity
        // * 1 = active high (**default**) * 0 = active low
        return ((rdByte(eRegisterByte.GPIO_HV_MUX__CTRL) & 0x10) == 0x10) ? 0 : 1
    }


    /* 
        //% group="Laser Distance Sensor" subcategory="Sensoren"
        //% block="Laser Abstand (cm) mit Pause 5ms" weight=7
        function laserAbstand5() {
            laserRanging(eSYSTEM__MODE_START.startRanging) //    startRanging()
            basic.pause(5)
            let distance = getDistance()
            basic.pause(5)
            laserRanging(eSYSTEM__MODE_START.stopRanging) //   stopRanging()
    
            return distance / 10
        }
    
        //% group="Laser Distance Sensor" subcategory="Sensoren"
        //% block="Laser Abstand (cm) mit checkForDataReady" weight=6
        function laserAbstandR() {
            laserRanging(eSYSTEM__MODE_START.startRanging) // startRanging()
            while (!checkForDataReady()) {// (checkForDataReady() == 0) {
                basic.pause(1) // ms
            }
            let distance = getDistance() //Get the result of the measurement from the sensor
            clearInterrupt()
            laserRanging(eSYSTEM__MODE_START.stopRanging) // stopRanging()
    
            return distance / 10
        }
    
        //% group="Laser Distance Sensor" subcategory="Sensoren"
        //% block="Laser Sensor Id" weight=4
        function getSensorId() { // 60330 0xEBAA
            return rdWord(eRegisterWord.VL53L1_IDENTIFICATION__MODEL_ID)
        }
    
        //% group="Laser Distance Sensor" subcategory="Sensoren"
        //% block="Laser GetDistance (mm)" weight=3
        function getDistance() {
            return rdWord(eRegisterWord.VL53L1_RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0)
        }
     */

    // ========== private

    // ========== group="VL53L1X" subcategory="Sensoren"


    /* 
        //% group="VL53L1X" subcategory="Sensoren"
        //% block="StartRanging (ClearInterrupt + Start 0x40)" weight=5
        function startRanging() {
            wrByte(eRegister.SYSTEM__INTERRUPT_CLEAR, 0x01) // clear interrupt trigger
            wrByte(eRegister.SYSTEM__MODE_START, 0x40) // Enable VL53L1X
        }
    
        //% group="VL53L1X" subcategory="Sensoren"
        //% block="StartOneshotRanging (ClearInterrupt + Start 0x10)" weight=4
        function startOneshotRanging() {
            wrByte(eRegister.SYSTEM__INTERRUPT_CLEAR, 0x01)
            wrByte(eRegister.SYSTEM__MODE_START, 0x10) // Enable VL53L1X one-shot ranging
        }
    
        //% group="VL53L1X" subcategory="Sensoren"
        //% block="StopRanging" weight=3
        function stopRanging() {
            wrByte(eRegister.SYSTEM__MODE_START, 0x00) // Enable VL53L1X
        }
     */


    //% group="Laser I²C Register" subcategory="Sensoren"
    //% block="write Byte %register Byte %byte" weight=6
    function wrByte(register: eRegisterByte, byte: number) {
        let buffer = Buffer.create(3)
        buffer.setNumber(NumberFormat.UInt16BE, 0, register)
        buffer.setUint8(2, byte)
        i2cWriteBuffer(buffer)
    }

    //% group="Laser I²C Register" subcategory="Sensoren"
    //% block="Register lesen (Byte) %register" weight=6
    export function rdByte(register: eRegisterByte) {
        let buffer = Buffer.create(2)
        buffer.setNumber(NumberFormat.UInt16BE, 0, register)
        i2cWriteBuffer(buffer, true)
        return i2cReadBuffer(1).getUint8(0)
    }

    //% group="Laser I²C Register" subcategory="Sensoren"
    //% block="write Word %register UInt16 %data" weight=6
    function wrWord(register: eRegisterWord, data: number) {
        let buffer = Buffer.create(4)
        buffer.setNumber(NumberFormat.UInt16BE, 0, register)
        buffer.setNumber(NumberFormat.UInt16BE, 2, data)
        i2cWriteBuffer(buffer)
    }


    //% group="Laser I²C Register" subcategory="Sensoren"
    //% block="Register lesen (UInt16BE) %register" weight=8
    export function rdWord(register: eRegisterWord) {
        let buffer = Buffer.create(2)
        buffer.setNumber(NumberFormat.UInt16BE, 0, register)
        i2cWriteBuffer(buffer, true)
        return i2cReadBuffer(2).getNumber(NumberFormat.UInt16BE, 0)
    }

    function i2cWriteBuffer(buffer: Buffer, repeat = false) {
        if (n_QwiicDistanceSensorConnected == undefined)
            laserSensorInit()
        else if (n_QwiicDistanceSensorConnected)
            n_QwiicDistanceSensorConnected = pins.i2cWriteBuffer(i2cQwiicDistanceSensor_x29, buffer, repeat) == 0
    }

    function i2cReadBuffer(size: number): Buffer {
        if (n_QwiicDistanceSensorConnected)
            return pins.i2cReadBuffer(i2cQwiicDistanceSensor_x29, size)
        else
            return Buffer.create(size)
    }

    function vL51L1X_DEFAULT_CONFIGURATION(): Buffer {
        // https://github.com/sparkfun/SparkFun_VL53L1X_Arduino_Library/blob/master/src/st_src/vl53l1x_class.cpp
        // let VL51L1X_DEFAULT_CONFIGURATION =
        return Buffer.fromArray([
            0x00, /* 0x2d : set bit 2 and 5 to 1 for fast plus mode (1MHz I2C), else don't touch */
            0x01, /* 0x2e : bit 0 if I2C pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
            0x01, /* 0x2f : bit 0 if GPIO pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
            0x01, /* 0x30 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity() */
            0x02, /* 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() */
            0x00, /* 0x32 : not user-modifiable */
            0x02, /* 0x33 : not user-modifiable */
            0x08, /* 0x34 : not user-modifiable */
            0x00, /* 0x35 : not user-modifiable */
            0x08, /* 0x36 : not user-modifiable */
            0x10, /* 0x37 : not user-modifiable */
            0x01, /* 0x38 : not user-modifiable */
            0x01, /* 0x39 : not user-modifiable */
            0x00, /* 0x3a : not user-modifiable */
            0x00, /* 0x3b : not user-modifiable */
            0x00, /* 0x3c : not user-modifiable */
            0x00, /* 0x3d : not user-modifiable */
            0xff, /* 0x3e : not user-modifiable */
            0x00, /* 0x3f : not user-modifiable */
            0x0F, /* 0x40 : not user-modifiable */
            0x00, /* 0x41 : not user-modifiable */
            0x00, /* 0x42 : not user-modifiable */
            0x00, /* 0x43 : not user-modifiable */
            0x00, /* 0x44 : not user-modifiable */
            0x00, /* 0x45 : not user-modifiable */
            0x20, /* 0x46 : interrupt configuration 0->level low detection, 1-> level high, 2-> Out of window, 3->In window, 0x20-> New sample ready , TBC */
            0x0b, /* 0x47 : not user-modifiable */
            0x00, /* 0x48 : not user-modifiable */
            0x00, /* 0x49 : not user-modifiable */
            0x02, /* 0x4a : not user-modifiable */
            0x0a, /* 0x4b : not user-modifiable */
            0x21, /* 0x4c : not user-modifiable */
            0x00, /* 0x4d : not user-modifiable */
            0x00, /* 0x4e : not user-modifiable */
            0x05, /* 0x4f : not user-modifiable */
            0x00, /* 0x50 : not user-modifiable */
            0x00, /* 0x51 : not user-modifiable */
            0x00, /* 0x52 : not user-modifiable */
            0x00, /* 0x53 : not user-modifiable */
            0xc8, /* 0x54 : not user-modifiable */
            0x00, /* 0x55 : not user-modifiable */
            0x00, /* 0x56 : not user-modifiable */
            0x38, /* 0x57 : not user-modifiable */
            0xff, /* 0x58 : not user-modifiable */
            0x01, /* 0x59 : not user-modifiable */
            0x00, /* 0x5a : not user-modifiable */
            0x08, /* 0x5b : not user-modifiable */
            0x00, /* 0x5c : not user-modifiable */
            0x00, /* 0x5d : not user-modifiable */
            0x01, /* 0x5e : not user-modifiable */
            0xdb, /* 0x5f : not user-modifiable */
            0x0f, /* 0x60 : not user-modifiable */
            0x01, /* 0x61 : not user-modifiable */
            0xf1, /* 0x62 : not user-modifiable */
            0x0d, /* 0x63 : not user-modifiable */
            0x01, /* 0x64 : Sigma threshold MSB (mm in 14.2 format for MSB+LSB), use SetSigmaThreshold(), default value 90 mm  */
            0x68, /* 0x65 : Sigma threshold LSB */
            0x00, /* 0x66 : Min count Rate MSB (MCPS in 9.7 format for MSB+LSB), use SetSignalThreshold() */
            0x80, /* 0x67 : Min count Rate LSB */
            0x08, /* 0x68 : not user-modifiable */
            0xb8, /* 0x69 : not user-modifiable */
            0x00, /* 0x6a : not user-modifiable */
            0x00, /* 0x6b : not user-modifiable */
            0x00, /* 0x6c : Intermeasurement period MSB, 32 bits register, use SetIntermeasurementInMs() */
            0x00, /* 0x6d : Intermeasurement period */
            0x0f, /* 0x6e : Intermeasurement period */
            0x89, /* 0x6f : Intermeasurement period LSB */
            0x00, /* 0x70 : not user-modifiable */
            0x00, /* 0x71 : not user-modifiable */
            0x00, /* 0x72 : distance threshold high MSB (in mm, MSB+LSB), use SetD:tanceThreshold() */
            0x00, /* 0x73 : distance threshold high LSB */
            0x00, /* 0x74 : distance threshold low MSB ( in mm, MSB+LSB), use SetD:tanceThreshold() */
            0x00, /* 0x75 : distance threshold low LSB */
            0x00, /* 0x76 : not user-modifiable */
            0x01, /* 0x77 : not user-modifiable */
            0x0f, /* 0x78 : not user-modifiable */
            0x0d, /* 0x79 : not user-modifiable */
            0x0e, /* 0x7a : not user-modifiable */
            0x0e, /* 0x7b : not user-modifiable */
            0x00, /* 0x7c : not user-modifiable */
            0x00, /* 0x7d : not user-modifiable */
            0x02, /* 0x7e : not user-modifiable */
            0xc7, /* 0x7f : ROI center, use SetROI() */
            0xff, /* 0x80 : XY ROI (X=Width, Y=Height), use SetROI() */
            0x9B, /* 0x81 : not user-modifiable */
            0x00, /* 0x82 : not user-modifiable */
            0x00, /* 0x83 : not user-modifiable */
            0x00, /* 0x84 : not user-modifiable */
            0x01, /* 0x85 : not user-modifiable */
            0x00, /* 0x86 : clear interrupt, use ClearInterrupt() */
            0x00  /* 0x87 : start ranging, use StartRanging() or StopRanging(), If you want an automatic start after VL53L1X_init() call, put 0x40 in location 0x87 */
        ])
    }

    export enum eRegisterByte { // Register Nummer 2 Byte, Value 1 Byte UInt8
        VL53L1_VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND = 0x0008,
        // 0x2D
        GPIO_HV_MUX__CTRL = 0x0030,     // 0x01, /* 0x30 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity() */
        GPIO__TIO_HV_STATUS = 0x0031,   // 0x02, /* 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() */
        SYSTEM__INTERRUPT_CONFIG_GPIO = 0x0046,
        SYSTEM__THRESH_HIGH = 0x0072,
        SYSTEM__THRESH_LOW = 0x0074,
        SYSTEM__INTERRUPT_CLEAR = 0x0086,
        SYSTEM__MODE_START = 0x0087,
        // 0x87
    }
    export enum eRegisterWord { // Register Nummer 2 Byte, Value 2 Byte UInt16BE
        VL53L1_RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0 = 0x0096,
        VL53L1_IDENTIFICATION__MODEL_ID = 0x010F

    }

    /*

    #define SOFT_RESET											0x0000
    #define VL53L1_I2C_SLAVE__DEVICE_ADDRESS					0x0001
    #define VL53L1_VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND        0x0008
    #define ALGO__CROSSTALK_COMPENSATION_PLANE_OFFSET_KCPS 		0x0016
    #define ALGO__CROSSTALK_COMPENSATION_X_PLANE_GRADIENT_KCPS 	0x0018
    #define ALGO__CROSSTALK_COMPENSATION_Y_PLANE_GRADIENT_KCPS 	0x001A
    #define ALGO__PART_TO_PART_RANGE_OFFSET_MM					0x001E
    #define MM_CONFIG__INNER_OFFSET_MM							0x0020
    #define MM_CONFIG__OUTER_OFFSET_MM 							0x0022

    #define GPIO_HV_MUX__CTRL									0x0030
    #define GPIO__TIO_HV_STATUS       							0x0031
    #define SYSTEM__INTERRUPT_CONFIG_GPIO 						0x0046
    #define PHASECAL_CONFIG__TIMEOUT_MACROP     				0x004B
    #define RANGE_CONFIG__TIMEOUT_MACROP_A_HI   				0x005E
    #define RANGE_CONFIG__VCSEL_PERIOD_A        				0x0060
    #define RANGE_CONFIG__VCSEL_PERIOD_B						0x0063
    #define RANGE_CONFIG__TIMEOUT_MACROP_B_HI  					0x0061
    #define RANGE_CONFIG__TIMEOUT_MACROP_B_LO  					0x0062
    #define RANGE_CONFIG__SIGMA_THRESH 							0x0064
    #define RANGE_CONFIG__MIN_COUNT_RATE_RTN_LIMIT_MCPS			0x0066
    #define RANGE_CONFIG__VALID_PHASE_HIGH      				0x0069
    #define VL53L1_SYSTEM__INTERMEASUREMENT_PERIOD				0x006C
    #define SYSTEM__THRESH_HIGH 								0x0072
    #define SYSTEM__THRESH_LOW 									0x0074
    #define SD_CONFIG__WOI_SD0                  				0x0078
    #define SD_CONFIG__INITIAL_PHASE_SD0        				0x007A
    #define ROI_CONFIG__USER_ROI_CENTRE_SPAD					0x007F
    #define ROI_CONFIG__USER_ROI_REQUESTED_GLOBAL_XY_SIZE		0x0080
    #define SYSTEM__SEQUENCE_CONFIG								0x0081
    #define VL53L1_SYSTEM__GROUPED_PARAMETER_HOLD 				0x0082
    #define SYSTEM__INTERRUPT_CLEAR       						0x0086
    #define SYSTEM__MODE_START                 					0x0087

    #define VL53L1_RESULT__RANGE_STATUS							0x0089
    #define VL53L1_RESULT__DSS_ACTUAL_EFFECTIVE_SPADS_SD0		0x008C
    #define RESULT__AMBIENT_COUNT_RATE_MCPS_SD					0x0090
    #define VL53L1_RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0				0x0096
    #define VL53L1_RESULT__PEAK_SIGNAL_COUNT_RATE_CROSSTALK_CORRECTED_MCPS_SD0 	0x0098
    #define VL53L1_RESULT__OSC_CALIBRATE_VAL					0x00DE
    #define VL53L1_FIRMWARE__SYSTEM_STATUS                      0x00E5
    #define VL53L1_IDENTIFICATION__MODEL_ID                     0x010F
    #define VL53L1_ROI_CONFIG__MODE_ROI_CENTRE_SPAD				0x013E

    #define VL53L1X_DEFAULT_DEVICE_ADDRESS						0x52

    */


} // r-qwiiclaser.ts
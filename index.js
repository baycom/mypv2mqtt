var util=require('util');
var mqtt=require('mqtt');
var ModbusRTU = require("modbus-serial");
var Parser = require('binary-parser').Parser;
const commandLineArgs = require('command-line-args')
var errorCounter = 0;

const optionDefinitions = [
	{ name: 'mqtthost', alias: 'm', type: String, defaultValue: "localhost" },
	{ name: 'mqttclientid', alias: 'c', type: String, defaultValue: "mypv1Client" },
	{ name: 'inverterhost', alias: 'i', type: String, defaultValue: "10.0.0.31"},
	{ name: 'inverterport', alias: 'p', type: String, defaultValue: "502"},
        { name: 'address',      alias: 'a', type: Number, multiple:true, defaultValue: [1] },
        { name: 'wait',         alias: 'w', type: Number, defaultValue: 10000 },
        { name: 'debug',        alias: 'd', type: Boolean, defaultValue: false },
  ];

const options = commandLineArgs(optionDefinitions)

var modbusClient = new ModbusRTU();

modbusClient.setTimeout(1000);

if(options.inverterhost) {
	modbusClient.connectTCP(options.inverterhost, { port: parseInt(options.inverterport),  debug: true }).catch((error) => {
		console.error(error);
		process.exit(-1);
	});
} else if(options.inverterport) {
	modbusClient.connectRTUBuffered(options.inverterport, { baudRate: 9600, parity: 'none' }).catch((error) => {
		console.error(error);
		process.exit(-1);
	});
}

console.log("MQTT Host         : " + options.mqtthost);
console.log("MQTT Client ID    : " + options.mqttclientid);
console.log("MyPv MODBUS addr: " + options.address);

if(options.inverterhost) {
	console.log("MyPv host       : " + options.inverterhost + ":" + options.inverterport);
} else {
	console.log("MyPv serial port: " + options.inverterport);
}

var MQTTclient = mqtt.connect("mqtt://"+options.mqtthost,{clientId: options.mqttclientid});
	MQTTclient.on("connect",function(){
	console.log("MQTT connected");
})

MQTTclient.on("error",function(error){
		console.log("Can't connect" + error);
		process.exit(1)
	});

function sendMqtt(id, data) {
        if(options.debug) {
	        console.log("publish: "+'myPV/' + id, JSON.stringify(data));
	}
        MQTTclient.publish('myPV/' + id, JSON.stringify(data));        
}

const MyPVPayloadParser_1000 = new Parser()
	.uint16be('Power') //1000
	.uint16be('Temp1', { formatter: (x) => {return x/10.0;}}) //1001
	.uint16be('WW1_Temp_max', { formatter: (x) => {return x/10.0;}}) //1002
	.uint16be('Status') //1003
	.uint16be('Power_timout') //1004
	.uint16be('Boost_mode') //1005
	.uint16be('WW1_min', { formatter: (x) => {return x/10.0;}}) //1006
	.uint16be('Boost_time_1_start') //1007
	.uint16be('Boost_time_1_stop') //1008
	.uint16be('Hour') //1009
	.uint16be('Minute') //1010
	.uint16be('Second') //1011
	.uint16be('Boost_activate') //1012
	.uint16be('ACTHOR_Number') //1013
	.uint16be('max_Power') //1014
	.uint16be('tempchip', { formatter: (x) => {return x/10.0;}}) //1015
	.uint16be('Control_Firmware_Version') //1016
	.uint16be('PS_firmware_version') //1017
	.string('ACTHOR_serial_number', {"length":16, encoding: "iso-8859-15", stripNull: true}) //1018-2025
	.uint16be('Boost_time_2_start') //1026
	.uint16be('Boost_time_2_stop') //1027
	.uint16be('Control_Firmware_sub_Version') //1028
	.uint16be('Control_Firmware_Update_Available') //1029
	.uint16be('Temp_2', { formatter: (x) => {return x/10.0;}}) //1030
	.uint16be('Temp_3', { formatter: (x) => {return x/10.0;}}) //1031
	.uint16be('Temp_4', { formatter: (x) => {return x/10.0;}}) //1032
	.uint16be('Temp_5', { formatter: (x) => {return x/10.0;}}) //1033
	.uint16be('Temp_6', { formatter: (x) => {return x/10.0;}}) //1034
	.uint16be('Temp_7', { formatter: (x) => {return x/10.0;}}) //1035
	.uint16be('Temp_8', { formatter: (x) => {return x/10.0;}}) //1036
	.uint16be('WW_2_max', { formatter: (x) => {return x/10.0;}}) //1037
	.uint16be('WW_3_max', { formatter: (x) => {return x/10.0;}}) //1038
	.uint16be('WW_2_min', { formatter: (x) => {return x/10.0;}}) //1039
	.uint16be('WW_3_min', { formatter: (x) => {return x/10.0;}}) //1040
	.uint16be('RH1_max', { formatter: (x) => {return x/10.0;}}) //1041
	.uint16be('RH2_max', { formatter: (x) => {return x/10.0;}}) //1042
	.uint16be('RH3_max', { formatter: (x) => {return x/10.0;}}) //1043
	.uint16be('RH1_day_min', { formatter: (x) => {return x/10.0;}}) //1044
	.uint16be('RH2_day_min', { formatter: (x) => {return x/10.0;}}) //1045
	.uint16be('RH3_day_min', { formatter: (x) => {return x/10.0;}}) //1046
	.uint16be('RH1_night_min', { formatter: (x) => {return x/10.0;}}) //1047
	.uint16be('RH2_night_min', { formatter: (x) => {return x/10.0;}}) //1048
	.uint16be('RH3_night_min', { formatter: (x) => {return x/10.0;}}) //1049
	.uint16be('Night_flag') //1050
	.uint16be('UTC_correction') //1051
	.uint16be('DST_correction') //1052
	.uint16be('Legionella_interval') //1053
	.uint16be('Legionella_start') //1054
	.uint16be('Legionella_temp', { formatter: (x) => {return x/10.0;}}) //1055
	.uint16be('Legionella_mode') //1056
	.uint16be('Stratification_flag') //1057
	.uint16be('Relay_1_status') //1058
	.uint16be('load_state') //1059
	.uint16be('load_nominal_power') //1060
	.uint16be('UL1') //1061
	.uint16be('IL1', { formatter: (x) => {return x/10.0;}}) //1062
	.uint16be('U_Out') //1063
	.uint16be('Freq', { formatter: (x) => {return x/1000.0;}}) //1064
	.uint16be('Operation_mode') //1065
	.uint16be('Access_Level') //1066
	.uint16be('reserved1_for_ACTHOR_9s') //1067
	.uint16be('reserved2_for_ACTHOR_9s') //1068
	.uint16be('Meter_Power') //1069
	.uint16be('Control_type') //1070
	.uint16be('Pmax_abs') //1071
	;

const getMyPVRegisters = async (address) => {
	try {
		modbusClient.setID(address);
                let data = await modbusClient.readHoldingRegisters(1000, 72);
                let state = MyPVPayloadParser_1000.parse(data.buffer);

		if(options.debug) {
			console.log(util.inspect(state));
		}
		sendMqtt(state.ACTHOR_serial_number, state);
		errorCounter = 0;
	} catch (e) {
		if(options.debug) {
			console.log(e);
		}
		errorCounter++;
		return null;
	}
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMetersValue = async (meters) => {
    try{
        var pos=0;
        // get value of all meters
        for(let meter of meters) {
                if(options.debug) {
                        console.log("query: " + meter);
                }
		await getMyPVRegisters(meter);
		pos++;
        }
        if(errorCounter>30) {
        	console.log("too many errors - exiting");
        	process.exit(-1);
        }
	await sleep(options.wait);
    } catch(e){
        // if error, handle them here (it should not)
        console.log(e)
    } finally {
        // after get all data from salve repeate it again
        setImmediate(() => {
            getMetersValue(meters);
        })
    }
}

// start get value
getMetersValue(options.address);


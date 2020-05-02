import * as dgram from 'dgram';

import { PoaInput, PoaOutput } from 'pa-opus-audio';
import Rtp = require('./rtp');

let rtpClients = new Map<string, PoaOutput>();

class LocalMonitor {
    constructor() {
        this.contentCount = 0;
        this.emptyCount = 0;
        this.totalLength = 0;
        this.logStats = false;

        this.localInput = new PoaInput();
        this.localOutput = new PoaOutput();

        /** this is for recording mic and playback on own output device so you can hear what you say */
        this.localInput.setEncodedFrameAvailableCallback(this.encodedFrameAvailable);
    };

    initInOutput() {
        this.localOutput.initStartPlayback();
        this.localInput.initStartRecord();
    }

    encodedFrameAvailable = (b: Buffer) => {
        if (b) {
            this.contentCount++;
            this.totalLength += b.byteLength;

            this.localOutput.decodeAndPlay(b);

            if (this.logStats) {
                if (this.contentCount % 100 == 0) {
                    console.log(`contentCount: ${this.contentCount}, totalLength: ${this.totalLength}`);
                }
            }
        }
        else {
            this.emptyCount++;

            if (this.logStats) {
                if (this.contentCount % 100 == 0) {
                    console.log(`emptyCount: ${this.emptyCount}`);
                }
            }
        }
    }

    contentCount : number;
    emptyCount : number;
    totalLength : number;
    logStats : boolean;

    localInput: PoaInput;
    localOutput: PoaOutput;
}

class RtpServer {
    constructor() {
        // creating a udp server
        this.server = dgram.createSocket('udp4');
        console.log(this.server);

        this.monitor = new LocalMonitor();

        // emits on new datagram msg
        this.server.on('message', this.onClientMessage);

        //emits when socket is ready and listening for datagram msgs
        this.server.on('listening', this.onListening);

        //emits after the socket is closed using socket.close();
        this.server.on('close', this.onClose);

        // emits when any error occurs
        this.server.on('error', this.onError);
    }

    onClientMessage(msg: Buffer, info: dgram.RemoteInfo) {
        let clientKey = `${info.address}:${info.port}`;
        let payload = Rtp.payload(msg);

        //console.log(`'${clientKey}' send msg with length ${msg.length}`);
        if (!rtpClients.has(clientKey)) {
            console.log(`NEW client detected at: ${clientKey}`);
            let rtpClient = new PoaOutput();
            let x = rtpClient.initStartPlayback();
            console.log(`OutputInitAndStartStream: ${x}`);
            rtpClients.set(clientKey, rtpClient);
        }
        let currentClient = rtpClients.get(clientKey);
        if (currentClient) {
            let status = currentClient.decodeAndPlay(payload);
        }

        /*
        console.log(`version        : ${Rtp.version(msg)}`);
        console.log(`extension      : ${Rtp.extension(msg)}`);
        console.log(`payloadType    : ${Rtp.payloadType(msg)}`);
        console.log(`sequenceNumber : ${Rtp.sequenceNumber(msg)}`);
        console.log(`timestamp      : ${Rtp.timestamp(msg)}`);
        console.log(`sSrc           : ${Rtp.sSrc(msg)}`);
        console.log(`payload.length : ${payload.byteLength}`);
        */
        //console.log(`status: ${status}`);
    }

    onListening = () => {
        console.log(this);
        console.log(this.server);
        var address = this.server.address();
        var port = address.port;
        var family = address.family;
        var ipaddr = address.address;
        console.log('Server is listening at port:' + port);
        console.log('Server ip :' + ipaddr);
        console.log('Server is IP4/IP6 :' + family);
    }

    onClose = () => {
        console.log('Socket is closed !');
    }

    start(port: number) {
        console.log("monitor.initInOutput");
        this.monitor.initInOutput();
        console.log("server.bind");
        this.server.bind(port);
    }

    onError = (error: string) => {
        console.log('Error: ' + error);
        this.server.close();
    }

    monitor: LocalMonitor;
    server: dgram.Socket;
}

console.log("Welcome at this rehearse20 experiment....");
const rtpServer = new RtpServer();

rtpServer.start(50050);


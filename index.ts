import * as dgram from 'dgram';

import { PoaInput, PoaOutput } from 'pa-opus-audio';
import Rtp = require('./rtp');
import { createBrotliCompress } from 'zlib';

/* RtpSession parts based on https://github.com/MayamaTakeshi/rtp-session/blob/master/index.js MIT License
 * Copyright (c) 2020 MayamaTakeshi
 */
class RtpSessionInfo {
    payload_type: number = 0;
    ssrc: number = (Math.random() * 4294967296) >>> 0; // random ssrc: TODO, should server hand these out?
    seq_num: number = 1;
    time_stamp: number = 0;
}
class RtpSession {

    constructor(socket: dgram.Socket, remote: dgram.RemoteInfo) {

        let version = 2;
        let padding = 0;
        let extension = 0;
        let csrc_count = 0;
        let marker = 0;
        this._hdr = Buffer.alloc(12);
        this._info = new RtpSessionInfo();
        this._remote = remote;
        this._socket = socket;

        this.output = new PoaOutput();
        this.output.initStartPlayback();

        this._hdr[0] = (version << 6 | padding << 5 | extension << 4 | csrc_count)
        this._hdr[1] = (marker << 7 | this._info.payload_type)
        this._hdr[2] = 0   // seq_num MSB
        this._hdr[3] = 0   // seq_num LSB
        this._hdr[4] = 0   // timestamp MSB
        this._hdr[5] = 0   // timestamp 
        this._hdr[6] = 0   // timestamp
        this._hdr[7] = 1   // timestamp LSB
        this._hdr[8] = this._info.ssrc >>> 24
        this._hdr[9] = this._info.ssrc >>> 16 & 0xFF
        this._hdr[10] = this._info.ssrc >>> 8 & 0xFF
        this._hdr[11] = this._info.ssrc & 0xFF
    }

    sendPayload(payload: Buffer) {
        const buf = Buffer.concat([this._hdr, payload]);

        buf[1] = (this._info.seq_num ? 1 : 0) << 7 | (this._info.payload_type)

        var seq_num = this._info.seq_num
        buf[2] = seq_num >>> 8
        buf[3] = seq_num & 0xFF
        this._info.seq_num++

        var time_stamp = this._info.time_stamp
        this._info.time_stamp += 160; // 48kHz/2.5ms? frames per payload? //payload.length

        buf[4] = time_stamp >>> 24
        buf[5] = time_stamp >>> 16 & 0xFF
        buf[6] = time_stamp >>> 8 & 0xFF
        buf[7] = time_stamp & 0xFF

        this._socket.send(buf, 0, buf.length, this._remote.port, this._remote.address)
    }

    receivePayload(payload: Buffer) {
        this.output.decodeAndPlay(payload);
    }

    _hdr: Buffer;
    _info: RtpSessionInfo;
    _remote: dgram.RemoteInfo;
    _socket: dgram.Socket;
    output: PoaOutput;
}

class LocalMonitor {
    constructor(cb: Function) {
        this.contentCount = 0;
        this.emptyCount = 0;
        this.totalLength = 0;
        this.logStats = false;

        this.localInput = new PoaInput();
        this.localOutput = new PoaOutput();

        /** this is for recording mic and playback on own output device so you can hear what you say */
        this.localInput.setEncodedFrameAvailableCallback(this.encodedFrameAvailable);
        this.encodedFrameAvailableCb = cb;
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
                    console.log(`local: contentCount: ${this.contentCount}, totalLength: ${this.totalLength}`);
                }
            }
        }
        else {
            this.emptyCount++;

            if (this.logStats) {
                if (this.contentCount % 100 == 0) {
                    console.log(`local: emptyCount: ${this.emptyCount}`);
                }
            }
        }
        this.encodedFrameAvailableCb(b);
    }

    contentCount: number;
    emptyCount: number;
    totalLength: number;
    logStats: boolean;

    localInput: PoaInput;
    localOutput: PoaOutput;
    encodedFrameAvailableCb: Function;
}

class RtpServer {
    constructor() {
        // creating a udp server
        this.server = dgram.createSocket('udp4');
        console.log(this.server);

        this.clients = new Map<string, RtpSession>()

        this.monitor = new LocalMonitor(this.onLocalMonitorEncodedFrameAvailable);

        // emits on new datagram msg
        this.server.on('message', this.onClientMessage);

        //emits when socket is ready and listening for datagram msgs
        this.server.on('listening', this.onListening);

        //emits after the socket is closed using socket.close();
        this.server.on('close', this.onClose);

        // emits when any error occurs
        this.server.on('error', this.onError);
    }

    onLocalMonitorEncodedFrameAvailable = (frame:Buffer) => {
        
        this.clients.forEach(function (session:RtpSession) {
            session.sendPayload(frame);
        })
    }

    onClientMessage = (msg: Buffer, info: dgram.RemoteInfo) => {
        let clientKey = `${info.address}:${info.port}`;
        let payload = Rtp.payload(msg);

        //console.log(`'${clientKey}' send msg with length ${msg.length}`);
        if (!this.clients.has(clientKey)) {
            console.log(`NEW client detected at: ${clientKey}`);
            let rtpClient = new RtpSession(this.server, info);
            this.clients.set(clientKey, rtpClient);
        }
        let currentClient = this.clients.get(clientKey);
        if (currentClient) {
            let status = currentClient.receivePayload(payload);
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

    clients: Map<string, RtpSession>;
}

console.log("Welcome at this rehearse20 experiment....");
const rtpServer = new RtpServer();

rtpServer.start(50050);


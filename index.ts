import { PoaInput, PoaOutput } from 'pa-opus-audio';

const input = new PoaInput();
const output = new PoaOutput();

input.setEncodedFrameAvailableCallback(function (b: Buffer) {
    if (b) {
        output.decodeAndPlay(b);
    }
});

output.initStartPlayback();
input.initStartRecord();

console.log('Recording and Playback from default OS devices');
setTimeout(function () {
    input.stopRecord();
    output.stopPlayback();
    console.log('... long wait for exiting this program');
    process.exit(0);
}, 5000);
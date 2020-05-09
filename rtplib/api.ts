import { TypedEmitter } from 'tiny-typed-emitter';

/*
  Ideas:
  - event:
    - unknown connection detectedc (host/port, SSRS if rtp)
  - add peer/participant = whitelist connection
    - host/port/SSRS
  - remove peer
  - announce media to destination (send 5x rtp packets? )
    - host/port, e.g. to server for getting network info
    - perhaps server is non-participating in RTP session? (treat as a normal peer but only send RTCP?)
  - get SSRS
  - set SSRS => reset complete session (only Session Object construction?)
  - list current peers
  - set encryption key (for secure rtp/rtcp)
  - rtp and rtcp multiplexed on the same port
  - assume eventual udp/rtp implementation in C++ due to audio processing directly in C++, but still need js api for control/monitoring
 */



/*

 - event: 'SSRS changed'
   - due to initial generation of SSRS
   - due to collision resolution and loop detection

 -

*/

interface P2PSessionEvents {
  'SSRS changed': (newSSRS: string, oldSSRS: string) => void;
}


class MyClass extends TypedEmitter<P2PSessionEvents> {
  constructor() {
    super();
  }

  doit() {
    this.emit('SSRS changed', "foo", "bar");
  }

  getSSRS(): string {
    return "";
  }
}

export { MyClass };
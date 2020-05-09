import { TypedEmitter } from 'tiny-typed-emitter';

/*
  Ideas:
  - event:
    - unknown connection detected (host/port, SSRS if rtp)
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

interface P2PConnection {
  host: string;
  port: number;
  SSRS: string;
}

function SSRSChanged(newSSRS: string, oldSSRS: string): void { }

/**
 * an SSRS changed event can occur when the initial SSRS is generated or when a collision is detected
 * @param newSSRS the newly generated SSRS
 * @param oldSSRS the previous SSRS (can be empty if this the initial SSRS generation)
 */
type SSRSChangedFunction = (newSSRS: string, oldSSRS: string) => void;

interface P2PSessionEvents {

  'SSRS changed': SSRSChangedFunction;
  'unknown connection detected': (peer: P2PConnection) => void;
  'peer connection added': (peer: P2PConnection) => void;
  'peer connection removed': (peer: P2PConnection) => void;
}


class MyClass extends TypedEmitter<P2PSessionEvents> {
  constructor() {
    super();
  }


  /**
   * @returns the current SSRS
   */
  getSSRS(): string {
    return "";
  }

  addPeer(peer: P2PConnection) {
  }

  removePeer(peer: P2PConnection) {
  }

  getPeers(): Array<P2PConnection> {
    return [];
  }


  // just to check the typed emitter api
  private doit() {
    this.emit('SSRS changed', "foo", "bar");
  }
}

export { MyClass };
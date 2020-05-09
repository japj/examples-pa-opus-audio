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

class P2PConnection {
  /**
   * The host ip address in IPV4 syntax
   */
  host: string = "";
  /**
   * The socket port in IPV4 syntax
   */
  port: number = 0;
  /**
   * The SSRS according to the RTP specification
   */
  SSRS: string = "";
}

interface P2PSessionEvents {
  /**
   * Notifies that an SSRS change has occured
   * 
   * @remarks a change can occur due to initial SSRS calculation or due to a collision detection
   * 
   * @param newSSRS The newly generated SSRS
   * @param oldSSRS The previous SSRS (can be empty if this the initial SSRS generation)
   */
  'SSRS changed': (newSSRS: string, oldSSRS: string) => void;
  'unknown connection detected': (peer: P2PConnection) => void;
  'peer connection added': (peer: P2PConnection) => void;
  'peer connection removed': (peer: P2PConnection) => void;
}

class P2PSession extends TypedEmitter<P2PSessionEvents> {
  constructor() {
    super();
  }

  /**
   * Returns the current SSRS
   * @returns The current SSRS
   */
  getSSRS(): string {
    return "";
  }

  /**
   * Adds a peer to the session
   * 
   * @remarks This whitelists incoming RTP/RTCP data from this peer
   * @param peer The peer connection information
   */
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

export { P2PSession, P2PConnection };
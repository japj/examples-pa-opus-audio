# RTP

[RTP Data Transfer Protocol](https://tools.ietf.org/html/rfc3550#section-5)

The RTP header has the following format:

```c
    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |V=2|P|X|  CC   |M|     PT      |       sequence number         |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                           timestamp                           |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           synchronization source (SSRC) identifier            |
   +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
   |            contributing source (CSRC) identifiers             |
   |                             ....                              |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- version (V): 2 bits
- padding (P): 1 bit
- extension (X): 1 bit
- CSRC count (CC): 4 bits
- marker (M): 1 bit
- payload type (PT): 7 bits
- sequence number: 16 bits
- timestamp: 32 bits
- SSRC: 32 bits
- CSRC list: 0 to 15 items, 32 bits each

## SSRC

[Identifier Allocation and Use](https://tools.ietf.org/html/rfc3550#section-8)

[Generating a Random 32-bit Identifier](https://tools.ietf.org/html/rfc3550#appendix-A.6)

## Algorithms

[RTP Algorithms](https://tools.ietf.org/html/rfc3550#page-75)
(this contains structs/enums/etc for rtp_hdr_t, rtcp_common_t, Per-source state information)
[RTP Data Header Validity Checks](https://tools.ietf.org/html/rfc3550#appendix-A.1)

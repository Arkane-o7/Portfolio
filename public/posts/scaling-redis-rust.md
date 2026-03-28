When latency spikes and CPU usage climbs, incremental tuning eventually hits a wall.

## Where Rust helped

We moved a hot middleware path into a native Rust extension and kept the surrounding architecture intact. That gave us:

- Lower per-request overhead
- Better memory locality
- More predictable throughput under burst traffic

## Migration pattern

Start with one critical path, benchmark aggressively, and avoid rewriting everything at once. Hybrid systems are often the fastest path to production gains.

## Result

The combined pipeline handled sustained load far more smoothly, and tail latency dropped enough to materially improve end-user experience.

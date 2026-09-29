# Champion's Choice — short-rest capture (future setting)

The normal app continues to enforce its existing per-set cooldown. Athlete-ID 0001 (Roman Dossenbach) is currently exempt for world-record training; the existing exemption for Athlete-ID 0003 remains.

For a later Champion's Choice setting, let a **server-verified** athlete opt into a performance session with shorter or zero capture cooldown. The server must check the athlete's verification and selected session mode for every write; a client-side switch alone cannot grant an exemption. Keep unique request IDs and prevent accidental double taps while allowing genuinely separate consecutive sets. Record actual performance timestamps independently of network/save timestamps so delayed touch or upload does not lengthen the measured rest period. Preserve the ordinary cooldown as the default outside the performance session.

This is a product requirement, not an implemented user setting. Define verification, revocation, audit records, and timing semantics before release.

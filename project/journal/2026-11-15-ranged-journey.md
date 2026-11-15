# Earn the rifle through the cabin door

> Written by: Codex
> State: implemented, 2026-11-15.

The Pine rider now retains its opened world so a door press follows the
same interaction route as a room player. The journey refuses a remote
door press, both unowned weapon selections and the porch pickup, then
opens the cabin, walks to the rifle and earns it. It fires both the
crossbow and rifle by free aim and checks real ammunition expenditure;
the crossbow also leaves a physical projectile in flight. The reward
bow stays locked. This runs explicitly in both Ring 2 jobs.

The shared combat rider retains only player inputs and reads the
weapon owners' saves. It grants no flags, ammunition or actor state.
The den and remaining Warden legs can reuse it.

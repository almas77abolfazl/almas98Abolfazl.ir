## 2026-07-21 - Caching Global Configs
**Learning:** Config and user profile details fetched early (like `getSettings()` and `getAboutMe()`) are heavily requested by various parts of the application architecture. These duplicate calls create a major frontend bottleneck and increase initial network latency if not cached on the client side.
**Action:** When a service provides app-wide configuration data, apply RxJS `shareReplay(1)` early in development to ensure only one HTTP request is executed and subsequent subscribers immediately get the cached value.

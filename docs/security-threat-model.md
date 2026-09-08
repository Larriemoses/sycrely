# Sycrely Security Threat Model

## Scope

This threat model covers the local privacy classifier, its model supply chain, browser runtime, and application network boundary. It distinguishes the synthetic `/model-lab` experiment from the production Private Mode contract.

## Security invariants

1. Original prompts and alias maps remain inside the encrypted browser vault.
2. The external answer provider receives only the protected capsule.
3. The local classifier has no automatic cloud fallback.
4. Production model files are self-hosted, revision-pinned and SHA-256 verified before use.
5. Model-load failure, unsupported language or uncertain classification fails into review—not automatic delivery.
6. Prompt and model-output telemetry is prohibited.
7. Cached browser models are treated as public artifacts, never as protected intellectual property.

## Model supply chain

The experimental model manifest pins repository revision `c2a4dbf593c57f47004c5bc2d3770d311aee9c43` and records the size and SHA-256 of all six required files. The provisioning script downloads that exact revision, writes to temporary files, verifies every artifact, and only then activates them under `public/models`. The browser loads the resulting copy from Sycrely's own origin with remote model resolution disabled.

The model bytes are intentionally ignored by Git: GitHub stores the manifest and reproducible provisioning script, not a 135 MB binary. Production should publish the same reviewed artifacts to Sycrely-controlled object storage/CDN, keep immutable filenames, verify digests during deployment, and maintain a signed release manifest. ONNX avoids Python pickle deserialization but is still complex untrusted input for the runtime.

A poisoned classifier can manipulate labels or construct unusual outputs. It cannot transmit data by weights alone: exfiltration also requires an outbound channel such as telemetry, logging, an API fallback or a permissive network request. Sycrely therefore controls both provenance and network egress.

## Runtime

Production inference must run in a dedicated Web Worker. Worker isolation is defense in depth and protects interface responsiveness; it is not a complete security boundary against a browser-engine vulnerability. The runtime and direct dependencies remain exactly pinned, build scripts are denied unless individually reviewed, and dependency/security scans should run in CI.

## Application leakage

The main application and laboratory CSPs restrict browser connections to their own origin. The script policy permits browser-created `blob:` modules because ONNX Runtime Web requires one for its WebAssembly backend; it does not grant a network origin. Camera, microphone and geolocation are disabled; framing is denied; referrer information is suppressed. Automated source tests reject remote model resolution, common analytics and error-tracking clients in the private conversation UI, and assert its only browser fetch target is the same-origin inference route.

This static check complements—not replaces—a browser network audit. Production release testing must record all requests during vault unlock, prompt analysis, model inference, provider delivery, response restoration, error handling and session deletion.

## Remaining work

- Move model execution from the lab page into a dedicated Worker.
- Add browser-side digest verification before first parse as an additional production safeguard.
- Add a CI dependency audit and software bill of materials.
- Add automated browser network-boundary tests.
- Define incident response, key rotation and model rollback procedures.
- Perform an independent penetration test before handling production secrets.

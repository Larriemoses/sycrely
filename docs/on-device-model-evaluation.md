# On-device Privacy Model Evaluation

## Decision

Sycrely will evaluate a browser-local multilingual entity model, but no available candidate is accepted as the production privacy engine yet. The deterministic detector remains active before and after any model result, and uncertain or high-risk prompts must stop for review.

## Runtime boundary

The model is downloaded as an application asset and executes in the browser. The prompt is passed from JavaScript memory to the local runtime; it is not sent to a model API. Model assets may be cached for offline use. Production will disable remote model resolution and serve a reviewed, version-pinned artifact from Sycrely-controlled static hosting.

ONNX Runtime Web supports browser inference through WebAssembly and selected GPU backends. WASM provides the broad compatibility fallback; WebGPU can accelerate supported devices. Transformers.js supports quantized model variants and a token-classification pipeline, but an advertised browser conversion does not establish privacy accuracy or acceptable mobile performance.

## Candidate screen

| Candidate | Approximate weight | Position | Reason |
|---|---:|---|---|
| `Xenova/distilbert-base-multilingual-cased-ner-hrl` | 135 MB quantized | First technical benchmark | Browser-ready and multilingual, but only PER/ORG/LOC/DATE and much larger than target |
| `Xenova/bert-base-multilingual-cased-ner-hrl` | 178 MB int8/quantized | Reference only | Browser-ready but larger, with the same narrow label limitation |
| `urchade/gliner_multi-v2.1` | 1.16 GB safetensors | Rejected for web MVP | Flexible labels and Apache-2.0 metadata, but not viable for mobile download or memory |
| Custom distilled Sycrely encoder | Target ≤25 MB | Planned production path | Can learn the full privacy vocabulary, but requires proper data, training and validation |

The published DistilBERT repository totals more than its model weight because it also contains tokenizer and support files. Size numbers are planning approximations and must be measured from the exact pinned artifacts we ship.

## Evaluation stages

1. Run the DistilBERT candidate only against synthetic benchmark prompts.
2. Measure exact-span recall for PER, ORG, LOC and DATE before considering integration.
3. Measure first-load download, warm latency and peak memory on desktop and Android-class devices.
4. Record Nigerian English, Pidgin and mixed-language errors separately.
5. Use the findings to select a smaller commercially compatible base encoder.
6. Fine-tune with training data kept separate from validation and the untouched challenge set.
7. Export, quantize and sign the chosen ONNX artifact.
8. Require rules → local model → leak verifier → review policy before provider delivery.

## Non-negotiable gate

- at least 90% exact-category recall and precision on the expanded held-out benchmark;
- no regression in deterministic identifier tests;
- no raw prompt telemetry;
- offline operation after cache;
- target no more than 25 MB compressed download;
- target no more than 150 MB additional peak memory;
- target under 100 ms median warm inference;
- explicit per-language results rather than a single global accuracy number.

Passing these gates still does not justify a promise of perfect detection. Low confidence, unsupported language, very long inputs, model-load failure and disagreement between layers must all force a visible review.

## Sources checked

- ONNX Runtime Web documentation: https://onnxruntime.ai/docs/tutorials/web/
- Transformers.js quantization documentation: https://huggingface.co/docs/transformers.js/guides/dtypes
- DistilBERT multilingual NER browser export: https://huggingface.co/Xenova/distilbert-base-multilingual-cased-ner-hrl
- BERT multilingual NER browser export: https://huggingface.co/Xenova/bert-base-multilingual-cased-ner-hrl
- GLiNER multilingual model card: https://huggingface.co/urchade/gliner_multi-v2.1


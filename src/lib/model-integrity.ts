export const EXPERIMENTAL_MODEL_MANIFEST = {
  sourceRepository: "Xenova/distilbert-base-multilingual-cased-ner-hrl",
  revision: "c2a4dbf593c57f47004c5bc2d3770d311aee9c43",
  localModelId: "sycrely/privacy-encoder",
  localBasePath: "/models/",
  artifact: "onnx/model_quantized.onnx",
  bytes: 135_359_829,
  files: [
    { path: "config.json", bytes: 927, sha256: "38847be4dc6699b1218a749ed69f888c2ccc7b4deba98e3c4a1cac8cb34d54c8" },
    { path: "onnx/model_quantized.onnx", bytes: 135_359_829, sha256: "24a0b98f4dd4cd92842f5a541272f86f760225a64a29928eddef14bdb2edb986" },
    { path: "special_tokens_map.json", bytes: 125, sha256: "b6d346be366a7d1d48332dbc9fdf3bf8960b5d879522b7799ddba59e76237ee3" },
    { path: "tokenizer.json", bytes: 2_919_362, sha256: "bf1b59b7b11c95f194f51708d918eea378e09d05f84c0e1656dc5180e8117088" },
    { path: "tokenizer_config.json", bytes: 373, sha256: "2d61ce6c7646881e0e7ef08e3b5dd655a19553ab85c41b1a3c27090a63ff6f49" },
    { path: "vocab.txt", bytes: 995_526, sha256: "fe0fda7c425b48c516fc8f160d594c8022a0808447475c1a7c6d6479763f310c" },
  ],
  purpose: "synthetic browser-lab evaluation only",
} as const;

export const PRODUCTION_MODEL_POLICY = {
  selfHostedOnly: true,
  allowRemoteResolution: false,
  requireSha256Verification: true,
  allowCloudFallback: false,
  allowPromptTelemetry: false,
  runInWorker: true,
} as const;

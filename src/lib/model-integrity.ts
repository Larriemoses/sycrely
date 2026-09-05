export const EXPERIMENTAL_MODEL_MANIFEST = {
  repository: "Xenova/distilbert-base-multilingual-cased-ner-hrl",
  revision: "c2a4dbf593c57f47004c5bc2d3770d311aee9c43",
  artifact: "onnx/model_quantized.onnx",
  sha256: "24a0b98f4dd4cd92842f5a541272f86f760225a64a29928eddef14bdb2edb986",
  bytes: 135_359_829,
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


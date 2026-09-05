export type CandidateStatus = "benchmark" | "reference-only" | "rejected" | "planned";

export type LocalModelCandidate = {
  id: string;
  status: CandidateStatus;
  runtime: "transformers-js" | "onnx-runtime-web" | "pytorch";
  license: string;
  approximateModelMb: number | null;
  openLabels: boolean;
  strengths: readonly string[];
  blockers: readonly string[];
};

/** Research snapshot for reproducible candidate selection. Model files are not
 * bundled or loaded here, and no user text is transmitted by this catalogue. */
export const LOCAL_MODEL_CANDIDATES = [
  {
    id: "Xenova/distilbert-base-multilingual-cased-ner-hrl",
    status: "benchmark",
    runtime: "transformers-js",
    license: "afl-3.0 (inherited candidate; legal review required)",
    approximateModelMb: 135,
    openLabels: false,
    strengths: ["Browser-ready ONNX export", "Multilingual named-entity baseline", "PER/ORG/LOC/DATE spans"],
    blockers: ["Exceeds the 25 MB target", "Does not detect most Sycrely privacy labels", "Needs Nigerian-language evaluation"],
  },
  {
    id: "Xenova/bert-base-multilingual-cased-ner-hrl",
    status: "reference-only",
    runtime: "transformers-js",
    license: "afl-3.0 (inherited candidate; legal review required)",
    approximateModelMb: 178,
    openLabels: false,
    strengths: ["Browser-ready ONNX export", "PER/ORG/LOC/DATE spans"],
    blockers: ["Larger than DistilBERT", "Fixed entity vocabulary", "Not a complete privacy classifier"],
  },
  {
    id: "urchade/gliner_multi-v2.1",
    status: "rejected",
    runtime: "pytorch",
    license: "apache-2.0",
    approximateModelMb: 1160,
    openLabels: true,
    strengths: ["Multilingual", "Can receive custom entity labels", "Permissive model-card licence"],
    blockers: ["Far too large for the web MVP", "Published artifact is not browser-ready", "Would exceed mobile memory and download budgets"],
  },
  {
    id: "sycrely/privacy-encoder-small",
    status: "planned",
    runtime: "onnx-runtime-web",
    license: "to be selected from a commercially compatible base model",
    approximateModelMb: null,
    openLabels: false,
    strengths: ["Will use Sycrely's 19-label vocabulary", "Designed for local-only inference", "Can be distilled and quantized for mobile"],
    blockers: ["Requires licensed training data", "Requires training, ONNX export, calibration and device testing"],
  },
] as const satisfies readonly LocalModelCandidate[];

export const PRODUCTION_MODEL_GATE = {
  minimumRecall: 0.9,
  minimumPrecision: 0.9,
  maximumDownloadMb: 25,
  maximumPeakMemoryMb: 150,
  maximumMedianWarmLatencyMs: 100,
  requiresOfflineAfterCache: true,
  permitsPromptTelemetry: false,
} as const;


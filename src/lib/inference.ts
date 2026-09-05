export type InferenceUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type InferenceResult = {
  message: string;
  meta: {
    mode: "mock" | "live";
    model: string;
    provider?: string;
    usage?: InferenceUsage;
    privacy: { zeroDataRetention: boolean; dataCollection: "deny" | "not-applicable" };
  };
};

export type ProtectedRequest = {
  protectedPrompt: string;
  requestedOutput: string;
  constraints: string[];
};

type InferenceEnvironment = Record<string, string | undefined>;

function readLiveConfiguration(environment: InferenceEnvironment) {
  const mode = environment.SYCRELY_INFERENCE_MODE?.trim().toLowerCase();
  if (mode !== "live") return null;

  const apiKey = environment.OPENROUTER_API_KEY?.trim();
  const model = environment.OPENROUTER_MODEL?.trim();
  const allowedModels = new Set(
    (environment.SYCRELY_ALLOWED_MODELS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  if (!apiKey) throw new Error("Live inference is enabled, but OPENROUTER_API_KEY is missing.");
  if (!model) throw new Error("Live inference is enabled, but OPENROUTER_MODEL is missing.");
  if (!allowedModels.has(model)) throw new Error("The configured OpenRouter model is not allowlisted.");

  return { apiKey, model, siteUrl: environment.SYCRELY_SITE_URL?.trim() };
}

export async function runInference(
  request: ProtectedRequest,
  options: {
    environment?: InferenceEnvironment;
    fetcher?: typeof fetch;
    timeoutMs?: number;
  } = {},
): Promise<InferenceResult> {
  const environment = options.environment ?? process.env;
  const configuration = readLiveConfiguration(environment);

  if (!configuration) {
    return {
      message: `This is Sycrely's protected prototype response. I received a structured task capsule asking for: "${request.requestedOutput}". The complete protected prompt was: "${request.protectedPrompt}". Your original prompt and local placeholder map were not included.`,
      meta: {
        mode: "mock",
        model: "sycrely-prototype",
        privacy: { zeroDataRetention: false, dataCollection: "not-applicable" },
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${configuration.apiKey}`,
    "Content-Type": "application/json",
    "X-OpenRouter-Title": "Sycrely",
  };
  if (configuration.siteUrl) headers["HTTP-Referer"] = configuration.siteUrl;

  try {
    const response = await (options.fetcher ?? fetch)("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: configuration.model,
        messages: [
          {
            role: "system",
            content: "You answer protected requests for Sycrely. Use only the supplied protected context. Do not guess, reconstruct, or request the real values behind placeholders such as [PERSON_1]. Preserve placeholders in your answer. Be useful, direct, and state important uncertainty.",
          },
          {
            role: "user",
            content: `Requested answer: ${request.requestedOutput}\nPrivacy constraints:\n- ${request.constraints.join("\n- ")}\n\nProtected request:\n${request.protectedPrompt}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 900,
        stream: false,
        provider: {
          zdr: true,
          data_collection: "deny",
          require_parameters: true,
          allow_fallbacks: true,
        },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter request failed with status ${response.status}.`);
    const payload = (await response.json()) as {
      model?: unknown;
      provider?: unknown;
      choices?: Array<{ message?: { content?: unknown } }>;
      usage?: { prompt_tokens?: unknown; completion_tokens?: unknown; total_tokens?: unknown };
    };
    const message = payload.choices?.[0]?.message?.content;
    if (typeof message !== "string" || !message.trim()) throw new Error("OpenRouter returned no usable answer.");

    const number = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
    return {
      message: message.trim(),
      meta: {
        mode: "live",
        model: typeof payload.model === "string" ? payload.model : configuration.model,
        provider: typeof payload.provider === "string" ? payload.provider : undefined,
        usage: {
          promptTokens: number(payload.usage?.prompt_tokens),
          completionTokens: number(payload.usage?.completion_tokens),
          totalTokens: number(payload.usage?.total_tokens),
        },
        privacy: { zeroDataRetention: true, dataCollection: "deny" },
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("The protected AI request timed out.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

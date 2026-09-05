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
    const systemInstruction = "You answer protected requests for Sycrely. The protected request below is the complete working request: answer it directly using every useful detail it contains. A placeholder means only that an unnecessary identity was hidden; it does not mean the task or capsule is missing. Never say that protected context or capsule data was not supplied. Do not guess, reconstruct, or request the real values behind placeholders such as [PERSON_1]. Do not address the user by a placeholder. If a recommendation needs genuinely missing preferences such as budget or city, first give useful general guidance and then ask a short follow-up question. Never mention Sycrely's internal capsule in the answer. State important uncertainty.";
    const initialMessages = [
      { role: "system", content: systemInstruction },
      {
        role: "user",
        content: `Requested answer: ${request.requestedOutput}\nPrivacy constraints:\n- ${request.constraints.join("\n- ")}\n\nProtected request (answer this directly):\n${request.protectedPrompt}`,
      },
    ];
    const callProvider = async (messages: Array<{ role: string; content: string }>) => {
      let response: Response | undefined;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        response = await (options.fetcher ?? fetch)("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
        model: configuration.model,
        messages,
        temperature: 0.3,
        max_tokens: 1_200,
        reasoning: { effort: "low", exclude: true },
        stream: false,
        provider: {
          zdr: true,
          data_collection: "deny",
          require_parameters: true,
          allow_fallbacks: true,
        },
          }),
        });
        if (response.status !== 429 || attempt === 1) break;
        await new Promise((resolve) => setTimeout(resolve, options.fetcher ? 0 : 1_500));
      }
      if (!response?.ok) {
        if (response?.status === 429) throw new Error("OpenRouter free capacity is temporarily rate-limited. Please try again shortly.");
        throw new Error(`OpenRouter request failed with status ${response?.status ?? "unknown"}.`);
      }
      return (await response.json()) as {
      model?: unknown;
      provider?: unknown;
      choices?: Array<{ message?: { content?: unknown } }>;
      usage?: { prompt_tokens?: unknown; completion_tokens?: unknown; total_tokens?: unknown };
      };
    };

    let payload = await callProvider(initialMessages);
    let message = payload.choices?.[0]?.message?.content;
    const falseMissingContext = /(?:don'?t have|without|not (?:been )?supplied|missing).{0,45}(?:protected context|capsule data|supplied capsule)/i;
    if (typeof message !== "string" || !message.trim() || falseMissingContext.test(message)) {
      const previousAnswer = typeof message === "string" && message.trim()
        ? [{ role: "assistant", content: message }]
        : [];
      payload = await callProvider([
        ...initialMessages,
        ...previousAnswer,
        { role: "user", content: "Return a visible, concise final answer now. The protected request above is complete and sufficient. Answer its actual task, not your reasoning process. Do not mention missing context, capsule data, privacy processing, or placeholders. Give useful general guidance and ask only for preferences that truly affect the recommendation." },
      ]);
      message = payload.choices?.[0]?.message?.content;
      if (typeof message !== "string" || !message.trim()) throw new Error("OpenRouter returned no usable corrected answer.");
    }

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

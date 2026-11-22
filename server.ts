import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PRIMARY_GEMINI_MODEL = 'gemini-4-hydrogen';
const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

function parseGeminiUpstreamError(err: unknown): {
  status: number;
  errorCode: 'GEMINI_QUOTA_EXCEEDED' | 'GEMINI_HIGH_DEMAND' | 'GEMINI_TIMEOUT' | 'GEMINI_REQUEST_FAILED';
  isRetryableOrQuota: boolean;
  summary: string;
} {
  const rawMessage = err instanceof Error ? err.message : String(err || '');
  const numericStatus =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : undefined;

  if (
    numericStatus === 429 ||
    rawMessage.includes('"code":429') ||
    rawMessage.includes('RESOURCE_EXHAUSTED')
  ) {
    return {
      status: 429,
      errorCode: 'GEMINI_QUOTA_EXCEEDED',
      isRetryableOrQuota: true,
      summary:
        'Daily Gemini API request quota has been reached. Please try again later or upgrade your API plan.',
    };
  }

  if (
    numericStatus === 503 ||
    rawMessage.includes('"code":503') ||
    rawMessage.includes('UNAVAILABLE') ||
    rawMessage.includes('high demand')
  ) {
    return {
      status: 503,
      errorCode: 'GEMINI_HIGH_DEMAND',
      isRetryableOrQuota: true,
      summary:
        'Gemini AI model is temporarily experiencing high demand. Please retry in a moment.',
    };
  }

  if (rawMessage.toLowerCase().includes('timed out')) {
    return {
      status: 504,
      errorCode: 'GEMINI_TIMEOUT',
      isRetryableOrQuota: true,
      summary: 'Gemini AI response timed out. Retrying with fast fallback model.',
    };
  }

  return {
    status: 502,
    errorCode: 'GEMINI_REQUEST_FAILED',
    isRetryableOrQuota: false,
    summary: rawMessage || 'Unable to complete Gemini AI request right now.',
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function generateContentWithFallback(
  ai: GoogleGenAI,
  buildParams: (model: string) => Parameters<typeof ai.models.generateContent>[0],
  timeoutMs: number,
  label: string
) {
  try {
    return await withTimeout(
      ai.models.generateContent(buildParams(PRIMARY_GEMINI_MODEL)),
      timeoutMs,
      label
    );
  } catch (primaryErr) {
    const info = parseGeminiUpstreamError(primaryErr);
    if (!info.isRetryableOrQuota) {
      throw primaryErr;
    }
    console.warn(
      `[${label}] ${PRIMARY_GEMINI_MODEL} returned ${info.status} (${info.errorCode}); falling back to ${FALLBACK_GEMINI_MODEL}.`
    );
    return await withTimeout(
      ai.models.generateContent(buildParams(FALLBACK_GEMINI_MODEL)),
      timeoutMs,
      `${label} (fallback)`
    );
  }
}

function extractInteractionText(interaction: unknown): string {
  const obj = interaction as {
    output_text?: string | null;
    steps?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };
  if (obj?.output_text) return obj.output_text;
  if (Array.isArray(obj?.steps)) {
    const parts: string[] = [];
    for (const step of obj.steps) {
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        for (const c of step.content) {
          if (c.type === 'text' && c.text) parts.push(c.text);
        }
      }
    }
    return parts.join('\n').trim();
  }
  return '';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.get('/api/health', (_req, res) => {
    const ai = getGeminiClient();
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(ai),
      interactionsApiEnabled: true,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * NEW: Gemini Interactions API Chat Endpoint (/api/ai/chat)
   * Uses ai.interactions.create() with function tool calling over live KisanSetu context
   * and multi-turn previous_interaction_id chaining.
   */
  app.post('/api/ai/chat', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_UNAVAILABLE',
        message: 'Gemini API key is not configured in environment.',
      });
    }

    try {
      const { message, language, previousInteractionId, kisansetuSnapshot } = req.body as {
        message: string;
        language: string;
        previousInteractionId?: string;
        kisansetuSnapshot?: {
          farmerProfile?: unknown;
          farmData?: unknown;
          cropData?: unknown;
          latestCropScan?: unknown;
          marketData?: unknown;
          buyerRequirements?: unknown;
          weatherData?: unknown;
        };
      };

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'MISSING_MESSAGE', message: 'Chat message is required.' });
      }

      const langLabel =
        language === 'gu'
          ? 'Gujarati (respond strictly in clear, simple, natural Gujarati script for farmers. Even if the user asks in English, Hinglish, or Roman Gujarati like "Mara tomato na patta par daag che", always answer in Gujarati script.)'
          : language === 'hi'
          ? 'Hindi (respond strictly in clear, simple, natural Devanagari Hindi for farmers. Even if the user asks in English or Hinglish like "Tamatar ke patte par daag hai kya karu", always answer in Devanagari Hindi.)'
          : 'English (respond strictly in clear, warm, practical English for Indian farmers, even if the user writes Hinglish or mixed terms.)';

      const systemInstruction = `You are KisanSetu AI Farm Assistant, an agronomy and market-connect advisor.
Reply strictly in ${langLabel}.

TOOLS AVAILABLE:
You have access to structured KisanSetu context tools (getFarmerProfile, getFarmData, getCropData, getLatestCropScan, getMarketData, getBuyerRequirements, getWeatherData). Call the relevant tools whenever the farmer asks about their farm, crops, leaf spots/scans, market prices, buyers, or weather so your advice is grounded in their real data.

STRICT SAFETY & REALISM RULES:
1. Keep responses structured, concise, and immediately actionable using headings in the target language.
2. NEVER invent pesticide brand names, specific chemical dosages, or unsafe prescriptions. Always separate AI screening from verified agricultural guidance and tell the farmer to verify diagnosis and treatment with a qualified agricultural expert or KVK before applying chemicals.
3. Never guarantee future market prices, crop yields, or profits.`;

      const tools = [
        {
          type: 'function' as const,
          name: 'getFarmerProfile',
          description: 'Returns farmer profile details including name, village, district, state, and experience.',
          parameters: { type: 'object', properties: {} },
        },
        {
          type: 'function' as const,
          name: 'getFarmData',
          description: 'Returns farm size in acres, soil type, irrigation system, water availability, and overall health score.',
          parameters: { type: 'object', properties: {} },
        },
        {
          type: 'function' as const,
          name: 'getCropData',
          description: 'Returns active crop plots, varieties, growth stages, and plot health scores.',
          parameters: { type: 'object', properties: {} },
        },
        {
          type: 'function' as const,
          name: 'getLatestCropScan',
          description: 'Returns the most recent AI crop scan including quality score, suggested grade, detected symptoms, and severity.',
          parameters: { type: 'object', properties: {} },
        },
        {
          type: 'function' as const,
          name: 'getMarketData',
          description: 'Returns current demo mandi price ranges, nearby markets, demand, and trend direction.',
          parameters: { type: 'object', properties: {} },
        },
        {
          type: 'function' as const,
          name: 'getBuyerRequirements',
          description: 'Returns active B2B buyer crop requirements and quantities needed.',
          parameters: { type: 'object', properties: {} },
        },
        {
          type: 'function' as const,
          name: 'getWeatherData',
          description: 'Returns current weather, humidity, rain probability forecast, and field spraying alerts.',
          parameters: { type: 'object', properties: {} },
        },
      ];

      const snap = kisansetuSnapshot || {};
      const resolveTool = (name: string) => {
        switch (name) {
          case 'getFarmerProfile':
            return snap.farmerProfile || { note: 'Profile unavailable' };
          case 'getFarmData':
            return snap.farmData || { note: 'Farm data unavailable' };
          case 'getCropData':
            return snap.cropData || [];
          case 'getLatestCropScan':
            return snap.latestCropScan || { note: 'No recent scans recorded' };
          case 'getMarketData':
            return snap.marketData || [];
          case 'getBuyerRequirements':
            return snap.buyerRequirements || [];
          case 'getWeatherData':
            return snap.weatherData || { note: 'Weather data unavailable' };
          default:
            return { note: 'Unknown tool' };
        }
      };

      const usedTools: string[] = [];

      // Primary Interactions API flow with fast single-turn generateContent fallback on timeout/429/503
      try {
        let interaction: Awaited<ReturnType<typeof ai.interactions.create>> = await withTimeout(
          ai.interactions.create({
            model: PRIMARY_GEMINI_MODEL,
            input: message,
            system_instruction: systemInstruction,
            tools,
            generation_config: { thinking_level: 'low' },
            ...(previousInteractionId ? { previous_interaction_id: previousInteractionId } : {}),
          }),
          12000,
          'Gemini Interactions API'
        );

        type InteractionStep = { type?: string; id?: string; name?: string; arguments?: unknown };
        for (let round = 0; round < 3; round++) {
          const steps: InteractionStep[] =
            (interaction as unknown as { steps?: InteractionStep[] }).steps || [];

          const toolCalls: InteractionStep[] = steps.filter((s) => s.type === 'function_call');
          if (toolCalls.length === 0) break;

          const toolResultContent = toolCalls.map((call) => {
            const toolName = call.name || 'unknown';
            if (!usedTools.includes(toolName)) usedTools.push(toolName);
            return {
              type: 'function_result' as const,
              call_id: call.id || toolName,
              name: toolName,
              result: JSON.stringify(resolveTool(toolName)),
            };
          });

          interaction = await withTimeout(
            ai.interactions.create({
              model: PRIMARY_GEMINI_MODEL,
              previous_interaction_id: interaction.id,
              system_instruction: systemInstruction,
              tools,
              generation_config: { thinking_level: 'low' },
              input: toolResultContent,
            }),
            12000,
            'Gemini Interactions API'
          );
        }

        const replyText = extractInteractionText(interaction);
        return res.json({
          source: 'gemini-interactions',
          interactionId: interaction.id,
          usedTools,
          reply: replyText || 'I could not generate a response right now. Please try again.',
        });
      } catch (primaryErr) {
        const info = parseGeminiUpstreamError(primaryErr);
        if (!info.isRetryableOrQuota) throw primaryErr;

        console.warn(
          `[Gemini Chat] ${PRIMARY_GEMINI_MODEL} (${info.errorCode}); falling back to ${FALLBACK_GEMINI_MODEL} generateContent.`
        );

        const contextTools = [
          'getFarmerProfile',
          'getFarmData',
          'getCropData',
          'getLatestCropScan',
          'getMarketData',
          'getBuyerRequirements',
          'getWeatherData',
        ];
        const fallbackResponse = await withTimeout(
          ai.models.generateContent({
            model: FALLBACK_GEMINI_MODEL,
            contents: `Farmer Question: ${message}

KisanSetu Farm & Market Context:
${JSON.stringify({
  farmerProfile: snap.farmerProfile,
  farmData: snap.farmData,
  cropData: snap.cropData,
  latestCropScan: snap.latestCropScan,
  marketData: Array.isArray(snap.marketData) ? snap.marketData.slice(0, 4) : [],
  buyerRequirements: Array.isArray(snap.buyerRequirements) ? snap.buyerRequirements.slice(0, 4) : [],
  weatherData: snap.weatherData,
})}`,
            config: {
              systemInstruction,
            },
          }),
          12000,
          'Gemini Chat Fallback'
        );

        return res.json({
          source: 'gemini-fallback',
          usedTools: contextTools,
          reply:
            fallbackResponse.text?.trim() ||
            'I could not generate a response right now. Please try again.',
        });
      }
    } catch (err) {
      const info = parseGeminiUpstreamError(err);
      console.warn(`Gemini /api/ai/chat handled failure (${info.status} ${info.errorCode}): ${info.summary}`);
      return res.status(info.status).json({
        error: info.errorCode,
        message: info.summary,
      });
    }
  });

  app.post('/api/ai/scan-crop', async (req, res) => {
    try {
      const { imageBase64, mimeType, cropHint, language } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        cropHint?: string;
        language?: string;
      };

      if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.trim()) {
        return res.status(400).json({ error: 'MISSING_IMAGE', message: 'Image payload is required.' });
      }

      const dataUrlMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/i);
      const rawMime = (mimeType || dataUrlMatch?.[1] || '').toLowerCase().trim();
      const resolvedMimeType = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;

      const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
      if (!ALLOWED_MIME_TYPES.has(resolvedMimeType)) {
        return res.status(400).json({
          error: 'INVALID_IMAGE_FORMAT',
          message: 'Unsupported image format. Only JPG, JPEG, PNG, and WEBP are supported.',
        });
      }

      const cleanBase64 = (imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64).trim();
      if (!cleanBase64 || cleanBase64.length < 16) {
        return res.status(400).json({
          error: 'INVALID_IMAGE_FORMAT',
          message: 'Image data is empty or corrupted.',
        });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_UNAVAILABLE',
          message: 'Gemini API key is not configured in environment.',
        });
      }

      const targetLang =
        language === 'hi'
          ? 'simple, natural Devanagari Hindi for every descriptive text field (keep only suggestedGrade as A/B/C and severity as None/Low/Medium/High)'
          : language === 'gu'
          ? 'simple, natural Gujarati script for every descriptive text field (keep only suggestedGrade as A/B/C and severity as None/Low/Medium/High)'
          : 'clear, practical English';

      const promptText = `You are KisanSetu's senior agronomy screening engine. Analyze this crop or plant photo carefully.
Write all descriptive JSON fields in ${targetLang}.
${cropHint ? `Farmer note / crop hint: ${cropHint}` : ''}

STRICT AGRONOMY SAFETY & REALISM RULES:
- Treat image-based disease detection and visual quality assessment strictly as an AI screening aid, NOT a laboratory or guaranteed diagnosis.
- Never prescribe specific commercial pesticide brands or exact chemical dosages. For chemical categories, state the active ingredient class only, safety precautions, and pre-harvest interval caution, while advising verification from a local Krishi Vigyan Kendra (KVK) or licensed agronomist.
- Provide realistic, grounded scores (0-100) based on visible leaf vigor, lesions, fruit uniformity, surface blemishes, and color.`;

      const response = await generateContentWithFallback(
        ai,
        (model) => ({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: resolvedMimeType,
                  data: cleanBase64,
                },
              },
              { text: promptText },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                cropName: { type: Type.STRING },
                varietyGuess: { type: Type.STRING },
                growthStage: { type: Type.STRING },
                healthScore: { type: Type.INTEGER },
                qualityScore: { type: Type.INTEGER },
                suggestedGrade: { type: Type.STRING, enum: ['A', 'B', 'C'] },
                visualCharacteristics: {
                  type: Type.OBJECT,
                  properties: {
                    color: { type: Type.STRING },
                    apparentMaturity: { type: Type.STRING },
                    visibleDamage: { type: Type.STRING },
                    spots: { type: Type.STRING },
                    sizeAppearance: { type: Type.STRING },
                    freshnessIndicator: { type: Type.STRING },
                  },
                },
                visibleIssuesSummary: { type: Type.STRING },
                diseaseDetected: { type: Type.BOOLEAN },
                possibleDisease: { type: Type.STRING },
                confidence: { type: Type.INTEGER },
                severity: { type: Type.STRING, enum: ['None', 'Low', 'Medium', 'High'] },
                symptomsObserved: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                immediateActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                preventiveMeasures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                treatmentGuidance: {
                  type: Type.OBJECT,
                  properties: {
                    approachSummary: { type: Type.STRING },
                    activeIngredientCategory: { type: Type.STRING },
                    safetyPrecautions: { type: Type.STRING },
                    preHarvestCaution: { type: Type.STRING },
                    expertConfirmationNote: { type: Type.STRING },
                  },
                },
                marketInsightNote: { type: Type.STRING },
              },
            },
          },
        }),
        25000,
        'Gemini Crop Scan'
      );

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(response.text || '{}') as Record<string, unknown>;
      } catch {
        return res.status(502).json({
          error: 'UNEXPECTED_AI_RESPONSE',
          message: 'Gemini returned malformed JSON for crop analysis.',
        });
      }

      if (!parsed || typeof parsed.cropName !== 'string' || !parsed.cropName.trim()) {
        return res.status(502).json({
          error: 'UNEXPECTED_AI_RESPONSE',
          message: 'Gemini analysis response was missing required crop identification fields.',
        });
      }

      return res.json({ source: 'gemini', result: parsed });
    } catch (err) {
      const info = parseGeminiUpstreamError(err);
      console.warn(`Gemini /api/ai/scan-crop handled failure (${info.status} ${info.errorCode}): ${info.summary}`);
      return res.status(info.status).json({
        error: info.errorCode,
        message: info.summary,
      });
    }
  });

  app.post('/api/ai/decision', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_UNAVAILABLE',
        message: 'Gemini API key is not configured in environment.',
      });
    }

    try {
      const { location, landSizeAcres, soilType, waterAvailability, season, budgetInr, preferredType, language } = req.body;
      const targetLang =
        language === 'hi'
          ? 'simple, natural Devanagari Hindi for all descriptive fields (keep riskLevel enum as Low/Medium/High)'
          : language === 'gu'
          ? 'simple, natural Gujarati script for all descriptive fields (keep riskLevel enum as Low/Medium/High)'
          : 'clear, practical English';

      const response = await generateContentWithFallback(
        ai,
        (model) => ({
          model,
          contents: `You are an agricultural planning advisor for Indian farms.
Evaluate the following farm conditions and compare 4 realistic crop choices in ${targetLang}:
- Location: ${location}
- Land Size: ${landSizeAcres} acres
- Soil Type: ${soilType}
- Water Availability: ${waterAvailability}
- Season: ${season}
- Working Capital Budget: ₹${budgetInr}
- Farmer Preference: ${preferredType}

RULES:
- Never promise guaranteed yield, guaranteed profit, or guaranteed market price.
- Express potential qualitatively and explain practical agronomic reasoning.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summaryAdvice: { type: Type.STRING },
                topRecommendationCrop: { type: Type.STRING },
                comparisons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      crop: { type: Type.STRING },
                      investmentBand: { type: Type.STRING },
                      waterRequirement: { type: Type.STRING },
                      marketDemand: { type: Type.STRING },
                      riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                      potentialOutlook: { type: Type.STRING },
                      harvestCycleDays: { type: Type.STRING },
                      suitabilityScore: { type: Type.INTEGER },
                      whyRecommended: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        }),
        18000,
        'Gemini Decision'
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ source: 'gemini', result: parsed });
    } catch (err) {
      const info = parseGeminiUpstreamError(err);
      console.warn(`Gemini /api/ai/decision handled failure (${info.status} ${info.errorCode}): ${info.summary}`);
      return res.status(info.status).json({
        error: info.errorCode,
        message: info.summary,
      });
    }
  });

  app.post('/api/ai/treatment-guidance', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_UNAVAILABLE',
        message: 'Gemini API key is not configured in environment.',
      });
    }

    try {
      const { cropName, diseaseName, severity, location, language } = req.body;
      const targetLang =
        language === 'hi'
          ? 'simple, natural Devanagari Hindi'
          : language === 'gu'
          ? 'simple, natural Gujarati script'
          : 'clear, practical English';
      const response = await generateContentWithFallback(
        ai,
        (model) => ({
          model,
          contents: `Respond strictly in ${targetLang}. Provide structured Integrated Pest Management (IPM) verification guidance for ${cropName} showing signs of ${diseaseName} (Severity: ${severity}) in ${location}.
Never prescribe exact brand names or commercial dosages. Focus on IPM steps, active-ingredient class to discuss with a KVK/agronomy officer, safety gear, weather precautions before spraying, and pre-harvest interval awareness.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verificationSourceNote: { type: Type.STRING },
                culturalAndMechanicalSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                biologicalOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                chemicalClassToDiscussWithExpert: { type: Type.STRING },
                workerAndCropSafety: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedLocalAuthority: { type: Type.STRING },
              },
            },
          },
        }),
        18000,
        'Gemini Treatment Guidance'
      );

      return res.json({ source: 'gemini', guidance: JSON.parse(response.text || '{}') });
    } catch (err) {
      const info = parseGeminiUpstreamError(err);
      console.warn(
        `Gemini /api/ai/treatment-guidance handled failure (${info.status} ${info.errorCode}): ${info.summary}`
      );
      return res.status(info.status).json({
        error: info.errorCode,
        message: info.summary,
      });
    }
  });

  // Explicit error handler for large payloads or invalid JSON requests
  app.use(
    (
      err: { type?: string; status?: number; message?: string },
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err?.type === 'entity.too.large' || err?.status === 413) {
        return res.status(413).json({
          error: 'PAYLOAD_TOO_LARGE',
          message: 'Uploaded image payload exceeds the 10 MB upload limit.',
        });
      }
      if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({
          error: 'INVALID_JSON',
          message: 'Malformed JSON request payload.',
        });
      }
      return next(err);
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KisanSetu server listening on http://localhost:${PORT}`);
  });
}

startServer();

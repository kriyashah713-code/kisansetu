import {
  BuyerRequirement,
  Crop,
  CropDecisionResult,
  CropGrade,
  CropScan,
  DiseaseDetection,
  Farm,
  FarmerProfile,
  Language,
  MarketPrice,
  QualityAssessment,
  VerifiedGuidanceDetail,
  WeatherData,
} from '../types/kisansetu';
import { ASSETS } from './mockData';
import { marketService } from './marketService';

export type CropScanErrorCode =
  | 'GEMINI_UNAVAILABLE'
  | 'GEMINI_QUOTA_EXCEEDED'
  | 'GEMINI_HIGH_DEMAND'
  | 'INVALID_IMAGE_FORMAT'
  | 'PAYLOAD_TOO_LARGE'
  | 'GEMINI_FAILED'
  | 'NETWORK_ERROR'
  | 'UNEXPECTED_RESPONSE'
  | 'CANCELLED';

export class CropScanError extends Error {
  code: CropScanErrorCode;
  status?: number;

  constructor(code: CropScanErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'CropScanError';
    this.code = code;
    this.status = status;
  }
}

export interface ScanAnalysisInput {
  imageDataUrl: string;
  thumbnailDataUrl?: string;
  mimeType: string;
  cropHint?: string;
  language: Language;
  sampleId?: 'tomato-blight' | 'tomato-healthy' | 'wheat-healthy';
  signal?: AbortSignal;
}

export interface DecisionInput {
  location: string;
  landSizeAcres: number;
  soilType: string;
  waterAvailability: string;
  season: string;
  budgetInr: number;
  preferredType: string;
  language: Language;
}

export interface KisanSetuAssistantToolsSnapshot {
  getFarmerProfile: () => FarmerProfile;
  getFarmData: () => Farm;
  getCropData: () => Crop[];
  getLatestCropScan: () => CropScan | null;
  getMarketData: () => MarketPrice[];
  getBuyerRequirements: () => BuyerRequirement[];
  getWeatherData: () => WeatherData;
}

function buildDemoScanFallback(input: ScanAnalysisInput, farmId: string): CropScan {
  const lang = input.language || 'en';
  const hintLower = (input.cropHint || '').toLowerCase();
  const isWheat = input.sampleId === 'wheat-healthy' || hintLower.includes('wheat') || hintLower.includes('गेहूँ') || hintLower.includes('ઘઉં');
  const isHealthyTomato =
    input.sampleId === 'tomato-healthy' ||
    (hintLower.includes('tomato') && hintLower.includes('healthy'));

  if (isWheat) {
    if (lang === 'gu') {
      return {
        id: `scan-${Date.now()}`,
        farmId,
        cropName: 'ઘઉં',
        varietyGuess: 'GW-496 / લોકવન',
        growthStage: 'દાણા ભરાવાની અવસ્થા',
        healthScore: 91,
        imageUrl: input.imageDataUrl || ASSETS.wheatGolden,
        scannedAt: 'હમણાં જ',
        sourceLabel: 'ડેમો સ્ક્રીનિંગ રિપોર્ટ',
        isDemoAnalysis: true,
        reviewStatus: 'Normal',
        quality: {
          qualityScore: 90,
          suggestedGrade: 'A',
          visibleIssuesSummary: 'સુંદર સોનેરી-લીલા ડૂંડા, એકસરખો દાણાનો વિકાસ અને ગેરુના કોઈ લક્ષણ નથી.',
          characteristics: {
            color: 'એકસરખો તંદુરસ્ત લીલો-સોનેરી રંગ',
            apparentMaturity: 'દાણા ભરાવાનો મધ્ય તબક્કો',
            visibleDamage: 'ફોટામાં કોઈ નુકસાન દેખાતું નથી',
            spots: 'કોઈ ગેરુ કે કાળા ડાઘ દેખાતા નથી',
            sizeAppearance: 'એકસરખા મજબૂત ડૂંડા',
            freshnessIndicator: 'મજબૂત થડ અને સારી ભેજ સ્થિતિ',
          },
        },
        disease: {
          detected: false,
          possibleDisease: 'કોઈ રોગના લક્ષણો મળ્યા નથી',
          confidence: 92,
          severity: 'None',
          symptomsObserved: ['સાફ પાંદડા અને તંદુરસ્ત ડૂંડા'],
          immediateActions: ['પાક પાકે ત્યાં સુધી સંતુલિત પિયત જાળવો; કાપણી નજીક વધુ પાણી ટાળો.'],
          preventiveMeasures: ['સવારના ઝાકળમાં ખેતરની ધારે ગેરુ કે મોલોમશીની તપાસ કરતા રહો.'],
          treatmentGuidance: {
            approachSummary: 'કોઈ દવાની જરૂર નથી; નિયમિત સંભાળ ચાલુ રાખો.',
            activeIngredientCategory: 'જરૂર નથી',
            safetyPrecautions: 'કાપણી પહેલાં સંગ્રહ માટે સાફ અને સૂકા કોથળા તૈયાર રાખો.',
            preHarvestCaution: 'ભેજ 12% થી ઓછો થાય પછી જ અનાજ ભરો.',
            expertConfirmationNote: 'નિયમિત સાપ્તાહિક નિરીક્ષણ ચાલુ રાખો.',
          },
        },
        marketInsightNote: 'તમારો ઘઉંનો પાક ગ્રેડ-A ગુણવત્તા માટે યોગ્ય જણાય છે. નજીકની APMC મંડીના ભાવ તપાસો.',
      };
    }
    if (lang === 'hi') {
      return {
        id: `scan-${Date.now()}`,
        farmId,
        cropName: 'गेहूँ',
        varietyGuess: 'GW-496 / लोकवन',
        growthStage: 'दाना भरने की अवस्था',
        healthScore: 91,
        imageUrl: input.imageDataUrl || ASSETS.wheatGolden,
        scannedAt: 'अभी-अभी',
        sourceLabel: 'डेमो स्क्रीनिंग रिपोर्ट',
        isDemoAnalysis: true,
        reviewStatus: 'Normal',
        quality: {
          qualityScore: 90,
          suggestedGrade: 'A',
          visibleIssuesSummary: 'साफ़ सुनहरी-हरी बालियाँ, एकसमान दाना भराव और रतुआ का कोई लक्षण नहीं।',
          characteristics: {
            color: 'एकसमान स्वस्थ हरा-सुनहरा रंग',
            apparentMaturity: 'दाना भरने का मध्य चरण',
            visibleDamage: 'कोई नुकसान नहीं दिखा',
            spots: 'कोई रतुआ या धब्बे नहीं',
            sizeAppearance: 'मज़बूत और एकसमान बालियाँ',
            freshnessIndicator: 'अच्छी तना मज़बूती और नमी',
          },
        },
        disease: {
          detected: false,
          possibleDisease: 'कोई रोग लक्षण नहीं मिला',
          confidence: 92,
          severity: 'None',
          symptomsObserved: ['साफ़ झंडा पत्ती और स्वस्थ बालियाँ'],
          immediateActions: ['दाने पकने तक संतुलित सिंचाई बनाए रखें; कटाई के करीब अधिक पानी से बचें।'],
          preventiveMeasures: ['सुबह की ओस में मेड़ों के पास माहू या रतुआ की नियमित जांच करें।'],
          treatmentGuidance: {
            approachSummary: 'किसी रसायन की आवश्यकता नहीं; सामान्य देखभाल जारी रखें।',
            activeIngredientCategory: 'आवश्यक नहीं',
            safetyPrecautions: 'कटाई से पहले साफ़ और सूखे बोरे तैयार रखें।',
            preHarvestCaution: '12% से कम नमी होने पर ही भंडारण करें।',
            expertConfirmationNote: 'नियमित साप्ताहिक खेत निरीक्षण जारी रखें।',
          },
        },
        marketInsightNote: 'आपकी गेहूँ की फसल ग्रेड-A मंडी बिक्री के लिए उपयुक्त दिख रही है। नज़दीकी APMC भाव देखें।',
      };
    }

    return {
      id: `scan-${Date.now()}`,
      farmId,
      cropName: 'Wheat',
      varietyGuess: 'GW-496 / Lokwan',
      growthStage: 'Heading / Grain Filling',
      healthScore: 91,
      imageUrl: input.imageDataUrl || ASSETS.wheatGolden,
      scannedAt: 'Just now',
      sourceLabel: 'Demo Screening Fallback (AI Key Offline)',
      isDemoAnalysis: true,
      reviewStatus: 'Normal',
      quality: {
        qualityScore: 90,
        suggestedGrade: 'A',
        visibleIssuesSummary: 'Clean golden-green spikelets with uniform grain fill and zero visible rust.',
        characteristics: {
          color: 'Uniform healthy pale green transitioning to golden maturity',
          apparentMaturity: 'Mid grain-filling stage',
          visibleDamage: 'None detected in frame',
          spots: 'No rust pustules or smut lesions observed',
          sizeAppearance: 'Well-formed, uniform awns and ear heads',
          freshnessIndicator: 'Strong stalk rigidity and healthy hydration',
        },
      },
      disease: {
        detected: false,
        possibleDisease: 'No Disease Symptoms Detected',
        confidence: 92,
        severity: 'None',
        symptomsObserved: ['Clean flag leaves and intact spikelet glumes'],
        immediateActions: ['Maintain moisture balance until physiological maturity; avoid over-irrigation near harvest.'],
        preventiveMeasures: ['Inspect field edges weekly for aphids or late leaf rust during morning dew.'],
        treatmentGuidance: {
          approachSummary: 'No corrective treatment needed; continue standard crop care.',
          activeIngredientCategory: 'None required',
          safetyPrecautions: 'Keep grain storage bags clean and dry prior to threshing.',
          preHarvestCaution: 'Ensure grain moisture drops below 12% before bagging.',
          expertConfirmationNote: 'Continue routine visual field monitoring.',
        },
      },
      marketInsightNote:
        'Your wheat crop appears on track for Grade-A milling positioning. Track nearby APMC rates ahead of harvest.',
    };
  }

  if (isHealthyTomato) {
    if (lang === 'gu') {
      return {
        id: `scan-${Date.now()}`,
        farmId,
        cropName: 'ટામેટા',
        varietyGuess: 'હાઇબ્રિડ વેલા ટામેટા',
        growthStage: 'ફળ અને પાકવાની અવસ્થા',
        healthScore: 92,
        imageUrl: input.imageDataUrl || ASSETS.tomatoHealthy,
        scannedAt: 'હમણાં જ',
        sourceLabel: 'ડેમો સ્ક્રીનિંગ રિપોર્ટ',
        isDemoAnalysis: true,
        reviewStatus: 'Normal',
        quality: {
          qualityScore: 91,
          suggestedGrade: 'A',
          visibleIssuesSummary: 'મજબૂત ચમકદાર ટામેટા, એકસરખું કદ અને તંદુરસ્ત લીલા પાંદડા.',
          characteristics: {
            color: 'ઘેરો એકસરખો લાલ રંગ અને તાજા લીલા પાન',
            apparentMaturity: 'રિટેલ વેચાણ માટે શ્રેષ્ઠ તબક્કો',
            visibleDamage: 'કોઈ તિરાડ કે ડાઘ દેખાતા નથી',
            spots: 'ફળ અને પાંદડાની સપાટી સાફ છે',
            sizeAppearance: 'એકસરખા મધ્યમ-મોટા ફળોના ઝૂમખાં',
            freshnessIndicator: 'મજબૂત ડીંટા અને સારી તાજગી',
          },
        },
        disease: {
          detected: false,
          possibleDisease: 'કોઈ મુખ્ય રોગના લક્ષણો નથી',
          confidence: 93,
          severity: 'None',
          symptomsObserved: ['તંદુરસ્ત પાંદડા અને ડાઘા વગરના મજબૂત ફળ'],
          immediateActions: ['પરિવહનમાં વધુ ટકાઉપણા માટે સવારના સમયે કાપણી કરો.'],
          preventiveMeasures: ['ફળ ફાટતા અટકાવવા ડ્રિપ પિયત નિયમિત રાખો.'],
          treatmentGuidance: {
            approachSummary: 'પાક તંદુરસ્ત છે. કોઈ રાસાયણિક છંટકાવની જરૂર નથી.',
            activeIngredientCategory: 'જરૂર નથી',
            safetyPrecautions: 'હવાદાર સાફ પ્લાસ્ટિક ક્રેટમાં જ ભરો.',
            preHarvestCaution: 'વધુ પાકેલા ફળ અલગ તારવી લો.',
            expertConfirmationNote: 'નીચેના ભાગના પાંદડાઓની નિયમિત તપાસ કરતા રહો.',
          },
        },
        marketInsightNote: 'તમારો પાક ગ્રેડ-A બજાર માટે ઉત્તમ છે. વેચાણ પહેલાં ખરીદદારોના ભાવ સરખાવો.',
      };
    }
    if (lang === 'hi') {
      return {
        id: `scan-${Date.now()}`,
        farmId,
        cropName: 'टमाटर',
        varietyGuess: 'हाइब्रिड टमाटर',
        growthStage: 'फल और पकने की अवस्था',
        healthScore: 92,
        imageUrl: input.imageDataUrl || ASSETS.tomatoHealthy,
        scannedAt: 'अभी-अभी',
        sourceLabel: 'डेमो स्क्रीनिंग रिपोर्ट',
        isDemoAnalysis: true,
        reviewStatus: 'Normal',
        quality: {
          qualityScore: 91,
          suggestedGrade: 'A',
          visibleIssuesSummary: 'चमकदार ठोस फल, एकसमान आकार और स्वस्थ हरी पत्तियाँ।',
          characteristics: {
            color: 'गहरा एकसमान लाल रंग और ताज़ा हरे पत्ते',
            apparentMaturity: 'रिटेल बिक्री के लिए उपयुक्त अवस्था',
            visibleDamage: 'कोई दरार या दाग नहीं दिखा',
            spots: 'फल और पत्ते की सतह साफ़',
            sizeAppearance: 'एकसमान मध्यम-बड़े गुच्छे',
            freshnessIndicator: 'मज़बूत डंठल और अच्छी ताज़गी',
          },
        },
        disease: {
          detected: false,
          possibleDisease: 'कोई प्रमुख रोग लक्षण नहीं दिखा',
          confidence: 93,
          severity: 'None',
          symptomsObserved: ['स्वस्थ पत्तियाँ और दाग-रहित ठोस फल'],
          immediateActions: ['बेहतर शेल्फ-लाइफ के लिए सुबह के समय तुड़ाई करें।'],
          preventiveMeasures: ['फल फटने से रोकने के लिए ड्रिप सिंचाई नियमित रखें।'],
          treatmentGuidance: {
            approachSummary: 'फसल स्वस्थ है। किसी रसायन की आवश्यकता नहीं।',
            activeIngredientCategory: 'आवश्यक नहीं',
            safetyPrecautions: 'हवादार साफ़ प्लास्टिक क्रेट में पैक करें।',
            preHarvestCaution: 'अधिक पके फलों को छांटकर अलग रखें।',
            expertConfirmationNote: 'निचली पत्तियों की नियमित जांच जारी रखें।',
          },
        },
        marketInsightNote: 'आपका टमाटर ग्रेड-A बिक्री के लिए उपयुक्त है। बेचने से पहले मंडी व खरीदार भाव तुलना करें।',
      };
    }

    return {
      id: `scan-${Date.now()}`,
      farmId,
      cropName: 'Tomato',
      varietyGuess: 'Hybrid Vine / Trellis Tomato',
      growthStage: 'Fruiting / Ripening',
      healthScore: 92,
      imageUrl: input.imageDataUrl || ASSETS.tomatoHealthy,
      scannedAt: 'Just now',
      sourceLabel: 'Demo Screening Fallback (AI Key Offline)',
      isDemoAnalysis: true,
      reviewStatus: 'Normal',
      quality: {
        qualityScore: 91,
        suggestedGrade: 'A',
        visibleIssuesSummary: 'Firm glossy skin, uniform cluster sizing, and vibrant foliage with no obvious lesions.',
        characteristics: {
          color: 'Deep uniform red ripening with rich green calyx and leaves',
          apparentMaturity: 'Optimal breaker-to-ripe retail stage',
          visibleDamage: 'Zero visible cracking, sunscald, or bruising',
          spots: 'Clean fruit skin and foliage surface',
          sizeAppearance: 'Uniform medium-large truss development',
          freshnessIndicator: 'High stem turgor and glossy cuticle finish',
        },
      },
      disease: {
        detected: false,
        possibleDisease: 'No Significant Disease Symptoms Detected',
        confidence: 93,
        severity: 'None',
        symptomsObserved: ['Healthy serrated foliage and firm blemish-free fruit clusters'],
        immediateActions: ['Pick breaker-stage tomatoes early morning for better transit shelf-life.'],
        preventiveMeasures: ['Maintain drip schedule evenly to prevent blossom-end rot or fruit cracking.'],
        treatmentGuidance: {
          approachSummary: 'Crop canopy appears clean. No chemical intervention indicated.',
          activeIngredientCategory: 'None required',
          safetyPrecautions: 'Use clean ventilated plastic crates during harvest.',
          preHarvestCaution: 'Sort out any overripe fruit before packhouse dispatch.',
          expertConfirmationNote: 'Visual screening reflects visible surface only; check lower interior stems regularly.',
        },
      },
      marketInsightNote:
        'Your crop appears suitable for Grade-A market positioning. Compare nearby buyers and packhouse hubs before selling.',
    };
  }

  // Spotted tomato (Early Blight-like)
  if (lang === 'gu') {
    return {
      id: `scan-${Date.now()}`,
      farmId,
      cropName: 'ટામેટા',
      varietyGuess: 'ખેતર ટામેટા પાક',
      growthStage: 'ફૂલ અને ફળ અવસ્થા',
      healthScore: 82,
      imageUrl: input.imageDataUrl || ASSETS.tomatoBlight,
      scannedAt: 'હમણાં જ',
      sourceLabel: 'ડેમો સ્ક્રીનિંગ રિપોર્ટ',
      isDemoAnalysis: true,
      reviewStatus: 'Normal',
      quality: {
        qualityScore: 84,
        suggestedGrade: 'A',
        visibleIssuesSummary: 'નીચેના પાંદડા પર ફૂગના હળવા લક્ષણો છે; વહેલી સંભાળ લેવાય તો ફળ ગ્રેડ-A જળવાઈ રહેશે.',
        characteristics: {
          color: 'ઉપરના પાન લીલા; નીચેના ડાઘાની આસપાસ પીળો ઘેરાવો',
          apparentMaturity: 'ફૂલ અને પ્રારંભિક ફળ વિકાસ',
          visibleDamage: 'નીચેના જૂના પાંદડા પર ડાઘા',
          spots: 'ઘેરા કથ્થઈ ગોળાકાર ડાઘ (Early Blight જેવા)',
          sizeAppearance: 'છોડની વૃદ્ધિ સારી છે; વહેલી સંભાળ જરૂરી',
          freshnessIndicator: 'ઉપરના પાંદડામાં સારી તાજગી',
        },
      },
      disease: {
        detected: true,
        possibleDisease: 'ફૂગના લક્ષણો (Possible Early Blight)',
        confidence: 87,
        severity: 'Medium',
        symptomsObserved: [
          'નીચેના જૂના પાંદડા પર ઘેરા કથ્થઈ ગોળ ડાઘા',
          'ડાઘાની આસપાસ હળવો પીળો ઘેરાવો',
          'નીચેના છાંયડાવાળા પાંદડા પર વધુ અસર',
        ],
        immediateActions: [
          'વધુ ડાઘાવાળા નીચેના પાંદડા કાપીને ખેતરથી દૂર કરો.',
          'સાંજે પાંદડા ભીના થાય તેવું પિયત ટાળો; સવારે મૂળ પાસે ડ્રિપ આપો.',
          'આગામી 48 કલાક સુધી બાજુના છોડની નજીકથી તપાસ કરો.',
        ],
        preventiveMeasures: [
          'વેલાને ટેકો આપી હવાની અવરજવર વધારો.',
          'માટીના છાંટા ઉડતા અટકાવવા મલ્ચિંગનો ઉપયોગ કરો.',
          'દૂષિત વાંસ કે દોરી સાફ કર્યા વગર ફરી ન વાપરો.',
        ],
        treatmentGuidance: {
          approachSummary: 'પહેલા ખેતરની સ્વચ્છતા અને ભેજ નિયંત્રણ પર ધ્યાન આપો; કોઈ પણ છંટકાવ માટે નિષ્ણાતની સલાહ લો.',
          activeIngredientCategory: 'પ્રોટેક્ટન્ટ ફૂગનાશક શ્રેણી — યોગ્ય દવા અને માપ KVK અથવા કૃષિ અધિકારી પાસેથી ખાતરી કરો.',
          safetyPrecautions: 'છંટકાવ વખતે હાથમોજા, માસ્ક અને આંખના ચશ્મા અવશ્ય પહેરો.',
          preHarvestCaution: 'બજારમાં માલ ઉતારતા પહેલા લેબલ મુજબ રાહ સમયમર્યાદા (PHI) નું પાલન કરો.',
          expertConfirmationNote: 'AI ફોટો તપાસ પ્રારંભિક સંકેત છે, લેબ રિપોર્ટ નથી. KVK આણંદ કે કૃષિ નિષ્ણાત પાસેથી ખાતરી કરો.',
        },
      },
      marketInsightNote: 'વહેલી સંભાળ લેવાય તો તમારો પાક ગ્રેડ-A બજાર માટે યોગ્ય રહી શકે છે. વેચાણ પહેલાં ખરીદદારો સરખાવો.',
    };
  }

  if (lang === 'hi') {
    return {
      id: `scan-${Date.now()}`,
      farmId,
      cropName: 'टमाटर',
      varietyGuess: 'खेत टमाटर फसल',
      growthStage: 'फूल और फल अवस्था',
      healthScore: 82,
      imageUrl: input.imageDataUrl || ASSETS.tomatoBlight,
      scannedAt: 'अभी-अभी',
      sourceLabel: 'डेमो स्क्रीनिंग रिपोर्ट',
      isDemoAnalysis: true,
      reviewStatus: 'Normal',
      quality: {
        qualityScore: 84,
        suggestedGrade: 'A',
        visibleIssuesSummary: 'निचली पत्तियों पर फफूंद के शुरुआती धब्बे; समय पर रोकथाम से फल ग्रेड-A बने रह सकते हैं।',
        characteristics: {
          color: 'ऊपरी पत्तियाँ हरी; निचले धब्बों के आसपास पीला घेरा',
          apparentMaturity: 'फूल और शुरुआती फल अवस्था',
          visibleDamage: 'निचली पुरानी पत्तियों पर स्थानीय धब्बे',
          spots: 'गहरे भूरे गोल धब्बे (अर्ली ब्लाइट जैसे लक्षण)',
          sizeAppearance: 'तना संरचना अच्छी; शुरुआती देखभाल आवश्यक',
          freshnessIndicator: 'प्रभावित हिस्से के बाहर पत्तियों में अच्छी ताज़गी',
        },
      },
      disease: {
        detected: true,
        possibleDisease: 'अर्ली ब्लाइट जैसे फफूंद लक्षण',
        confidence: 87,
        severity: 'Medium',
        symptomsObserved: [
          'पुरानी निचली पत्तियों पर गहरे भूरे गोल छल्लेदार धब्बे',
          'धब्बों के चारों ओर हल्का पीलापन',
          'नीचे की छायादार पत्तियाँ पहले प्रभावित',
        ],
        immediateActions: [
          'अधिक धब्बों वाली निचली पत्तियों को तोड़कर खेत से दूर हटाएँ।',
          'शाम को पत्तियों पर छिड़काव/सिंचाई से बचें; सुबह जड़ क्षेत्र में ड्रिप दें।',
          'अगले 48 घंटों में पास के पौधों की नियमित निगरानी करें।',
        ],
        preventiveMeasures: [
          'पौधों को सहारा (स्टेकिंग) देकर हवा का प्रवाह बढ़ाएँ।',
          'मिट्टी के छींटे रोकने के लिए मल्चिंग का उपयोग करें।',
          'पुरानी खूंटियों को साफ़ किए बिना दोबारा उपयोग न करें।',
        ],
        treatmentGuidance: {
          approachSummary: 'पहले खेत की सफाई और नमी नियंत्रण करें; किसी भी स्प्रे के लिए कृषि विशेषज्ञ से पुष्टि करें।',
          activeIngredientCategory: 'प्रोटेक्टेंट फफूंदनाशक श्रेणी — सटीक उत्पाद और मात्रा KVK या कृषि अधिकारी से सत्यापित करें।',
          safetyPrecautions: 'छिड़काव के समय दस्ताने, मास्क और पूरी बांह के कपड़े पहनें; तेज हवा में स्प्रे न करें।',
          preHarvestCaution: 'टमाटर तोड़ने से पहले लेबल पर लिखी प्रतीक्षा अवधि (PHI) का पालन करें।',
          expertConfirmationNote: 'AI फोटो जांच केवल शुरुआती संकेत है, लैब जांच नहीं। KVK या कृषि विशेषज्ञ से पुष्टि करें।',
        },
      },
      marketInsightNote: 'यदि निचली पत्तियों का फैलाव समय पर रोका जाए तो फसल ग्रेड-A बिक्री के लिए उपयुक्त है।',
    };
  }

  return {
    id: `scan-${Date.now()}`,
    farmId,
    cropName: 'Tomato',
    varietyGuess: 'Field Tomato Foliage',
    growthStage: 'Flowering / Fruiting',
    healthScore: 82,
    imageUrl: input.imageDataUrl || ASSETS.tomatoBlight,
    scannedAt: 'Just now',
    sourceLabel: 'Demo Screening Fallback (AI Key Offline)',
    isDemoAnalysis: true,
    reviewStatus: 'Normal',
    quality: {
      qualityScore: 84,
      suggestedGrade: 'A',
      visibleIssuesSummary: 'Minor foliar spots on lower leaves; fruit potential remains Grade-A if spread is contained early.',
      characteristics: {
        color: 'Healthy upper canopy; localized yellowing halo around lower spots',
        apparentMaturity: 'Active flowering to early fruit set',
        visibleDamage: 'Localized foliar lesion rings on older lower leaves',
        spots: 'Dark brown concentric rings consistent with early foliar blight',
        sizeAppearance: 'Good stem structure; early intervention recommended',
        freshnessIndicator: 'Moderate leaf turgor outside affected patches',
      },
    },
    disease: {
      detected: true,
      possibleDisease: 'Possible Early Blight (Alternaria solani)',
      confidence: 87,
      severity: 'Medium',
      symptomsObserved: [
        'Concentric dark brown target-board rings on older leaves',
        'Yellowish chlorotic halo expanding around spots',
        'Lower shaded foliage affected first',
      ],
      immediateActions: [
        'Prune and remove heavily spotted lower leaves away from field rows.',
        'Irrigate at the root zone (drip/furrow) in morning hours; avoid wetting leaves at dusk.',
        'Monitor neighboring plants over the next 48 hours for new spots.',
      ],
      preventiveMeasures: [
        'Improve air circulation via staking and careful de-suckering.',
        'Apply clean organic mulch to reduce soil-borne spore splash.',
        'Avoid reusing contaminated stakes without sun-drying or sanitizing.',
      ],
      treatmentGuidance: {
        approachSummary: 'Prioritize leaf sanitation and moisture control; verify any protectant spray with a qualified local agronomist.',
        activeIngredientCategory: 'Broad-spectrum protectant fungicide class — exact product and dosage must be verified via KVK or licensed agri-officer.',
        safetyPrecautions: 'Wear waterproof gloves, face shield/mask, and long sleeves during application; avoid spraying in windy weather.',
        preHarvestCaution: 'Follow the label Pre-Harvest Interval (PHI) strictly before picking tomatoes for market.',
        expertConfirmationNote: 'Image-based detection is an AI screening aid, not a confirmed lab diagnosis. Confirm with KVK Anand or an agricultural officer.',
      },
    },
    marketInsightNote:
      'Your crop appears suitable for Grade-A market positioning if lower leaf spread is managed before fruiting peaks. Compare nearby buyers before selling.',
  };
}

function buildDemoDecisionFallback(input: DecisionInput): CropDecisionResult {
  const lang = input.language || 'en';
  const isLimitedWater = input.waterAvailability.toLowerCase().includes('limited');
  const isRabi = input.season.toLowerCase().includes('rabi') || input.season.toLowerCase().includes('winter');

  if (lang === 'gu') {
    return {
      summaryAdvice: `${input.location} માં ${input.landSizeAcres} એકર જમીન અને ${input.waterAvailability} પાણીની સ્થિતિ માટે સંતુલિત પાક આયોજન હવામાન અને ભાવના જોખમને ઘટાડે છે. કોઈ ઉપજ કે ભાવની ખાતરી નથી.`,
      topRecommendationCrop: isLimitedWater ? 'દેશી ચણા' : isRabi ? 'ઘઉં (GW-496) + ટામેટા' : 'હાઇબ્રિડ ટામેટા (ડ્રિપ)',
      sourceLabel: 'ડેમો નિર્ણય મોડેલ',
      isDemoResult: true,
      comparisons: [
        {
          crop: isLimitedWater ? 'દેશી ચણા' : 'હાઇબ્રિડ ટામેટા (ડ્રિપ)',
          investmentBand: isLimitedWater ? '₹14,000–₹18,000 / એકર' : '₹38,000–₹48,000 / એકર',
          waterRequirement: isLimitedWater ? 'ઓછું (1–2 પિયત)' : 'મધ્યમ (ડ્રિપ ઉત્તમ)',
          marketDemand: 'ઊંચી (રિટેલ અને FPO)',
          riskLevel: isLimitedWater ? 'Low' : 'Medium',
          potentialOutlook: isLimitedWater ? 'સ્થિર કઠોળ માંગ' : 'સારો ગ્રેડ-A ભાવ અંદાજ',
          harvestCycleDays: isLimitedWater ? '105–115 દિવસ' : '70–90 દિવસ',
          suitabilityScore: 91,
          whyRecommended: isLimitedWater
            ? 'ઓછા પાણીમાં સારી રીતે પાકે છે અને જમીનમાં નાઇટ્રોજન વધારે છે.'
            : 'તમારા ડ્રિપ પિયત અને અમદાવાદ/વડોદરા પેકહાઉસ માંગ સાથે સુસંગત છે.',
        },
        {
          crop: 'ઘઉં (GW-496 લોકવન)',
          investmentBand: '₹16,000–₹21,000 / એકર',
          waterRequirement: 'મધ્યમ (4–5 પિયત)',
          marketDemand: 'સ્થિર (APMC અને મિલ)',
          riskLevel: 'Low',
          potentialOutlook: 'સુરક્ષિત સ્થિર આવક',
          harvestCycleDays: '115–125 દિવસ',
          suitabilityScore: 87,
          whyRecommended: 'સંગ્રહ સરળ હોવાથી કાપણીના દિવસે તાત્કાલિક વેચવાનું દબાણ રહેતું નથી.',
        },
        {
          crop: 'લાલ ડુંગળી (રવી)',
          investmentBand: '₹28,000–₹35,000 / એકર',
          waterRequirement: 'મધ્યમ',
          marketDemand: 'ઊંચી (વધઘટવાળી)',
          riskLevel: 'Medium',
          potentialOutlook: 'મોસમી ઊંચા ભાવની તક',
          harvestCycleDays: '110–130 દિવસ',
          suitabilityScore: 81,
          whyRecommended: 'ગોરાડુ કાળી જમીનમાં સારો વિકાસ અને ટૂંકા સંગ્રહથી યોગ્ય સમયે વેચાણ.',
        },
        {
          crop: 'લીલા મરચા / કેપ્સિકમ',
          investmentBand: '₹42,000–₹54,000 / એકર',
          waterRequirement: 'મધ્યમ-ઊંચું',
          marketDemand: 'મધ્યમ-ઊંચી',
          riskLevel: 'High',
          potentialOutlook: 'વધુ મૂલ્ય, જીવાત સંવેદનશીલ',
          harvestCycleDays: '75–100 દિવસ',
          suitabilityScore: 74,
          whyRecommended: 'નિયમિત થ્રિપ્સ/કથીરી નિરીક્ષણ માટે બજેટ હોય તો એકર દીઠ સારું વળતર મળી શકે.',
        },
      ],
    };
  }

  if (lang === 'hi') {
    return {
      summaryAdvice: `${input.location} में ${input.landSizeAcres} एकड़ भूमि और ${input.waterAvailability} पानी की उपलब्धता के लिए संतुलित फसल चयन मौसम व भाव के जोखिम को कम करता है। किसी उपज या भाव की गारंटी नहीं है।`,
      topRecommendationCrop: isLimitedWater ? 'देसी चना' : isRabi ? 'गेहूँ (GW-496) + टमाटर' : 'हाइब्रिड टमाटर (ड्रिप)',
      sourceLabel: 'डेमो निर्णय मॉडल',
      isDemoResult: true,
      comparisons: [
        {
          crop: isLimitedWater ? 'देसी चना' : 'हाइब्रिड टमाटर (ड्रिप)',
          investmentBand: isLimitedWater ? '₹14,000–₹18,000 / एकड़' : '₹38,000–₹48,000 / एकड़',
          waterRequirement: isLimitedWater ? 'कम (1–2 सिंचाई)' : 'मध्यम (ड्रिप उपयुक्त)',
          marketDemand: 'उच्च (रिटेल व FPO)',
          riskLevel: isLimitedWater ? 'Low' : 'Medium',
          potentialOutlook: isLimitedWater ? 'स्थिर दलहन मांग' : 'मजबूत ग्रेड-A संभावना',
          harvestCycleDays: isLimitedWater ? '105–115 दिन' : '70–90 दिन',
          suitabilityScore: 91,
          whyRecommended: isLimitedWater
            ? 'कम पानी में अच्छी पैदावार देता है और मिट्टी में प्राकृतिक नाइट्रोजन बढ़ाता है।'
            : 'आपकी ड्रिप सिंचाई और अहमदाबाद/वडोदरा पैकहाउस की मांग के अनुकूल है।',
        },
        {
          crop: 'गेहूँ (GW-496 लोकवन)',
          investmentBand: '₹16,000–₹21,000 / एकड़',
          waterRequirement: 'मध्यम (4–5 सिंचाई)',
          marketDemand: 'स्थिर (APMC व मिल)',
          riskLevel: 'Low',
          potentialOutlook: 'सुरक्षित आधारभूत प्रतिफल',
          harvestCycleDays: '115–125 दिन',
          suitabilityScore: 87,
          whyRecommended: 'भंडारण आसान होने से कटाई के दिन तुरंत बेचने का दबाव नहीं रहता।',
        },
        {
          crop: 'लाल प्याज (रबी)',
          investmentBand: '₹28,000–₹35,000 / एकड़',
          waterRequirement: 'मध्यम',
          marketDemand: 'उच्च (अस्थिर)',
          riskLevel: 'Medium',
          potentialOutlook: 'मौसमी लाभ की संभावना',
          harvestCycleDays: '110–130 दिन',
          suitabilityScore: 81,
          whyRecommended: 'दोमट काली मिट्टी के अनुकूल और क्यूरिंग के बाद सही समय पर मंडी बिक्री संभव।',
        },
        {
          crop: 'हरी मिर्च / शिमला मिर्च',
          investmentBand: '₹42,000–₹54,000 / एकड़',
          waterRequirement: 'मध्यम-उच्च',
          marketDemand: 'मध्यम-उच्च',
          riskLevel: 'High',
          potentialOutlook: 'अधिक मूल्य, कीट संवेदनशील',
          harvestCycleDays: '75–100 दिन',
          suitabilityScore: 74,
          whyRecommended: 'यदि नियमित कीट निगरानी का बजट हो तो प्रति एकड़ अच्छा नकद प्रवाह मिल सकता है।',
        },
      ],
    };
  }

  return {
    summaryAdvice: `Based on ${input.landSizeAcres} acres of ${input.soilType} in ${input.location} with ${input.waterAvailability.toLowerCase()} water availability (${input.season} season), balanced multi-plot planning helps manage weather and price swings. No yield or market price is guaranteed.`,
    topRecommendationCrop: isLimitedWater ? 'Chickpea (Desi Chana)' : isRabi ? 'Wheat (GW-496) + Intercrop Tomato' : 'Hybrid Tomato (Drip)',
    sourceLabel: 'Demo Decision Model (AI Key Offline)',
    isDemoResult: true,
    comparisons: [
      {
        crop: isLimitedWater ? 'Chickpea (Desi Chana)' : 'Hybrid Tomato (Drip)',
        investmentBand: isLimitedWater ? '₹14,000–₹18,000 / acre' : '₹38,000–₹48,000 / acre',
        waterRequirement: isLimitedWater ? 'Low (1–2 irrigations)' : 'Moderate (Drip Ideal)',
        marketDemand: 'High (Retail & FPO)',
        riskLevel: isLimitedWater ? 'Low' : 'Medium',
        potentialOutlook: isLimitedWater ? 'Steady pulse demand' : 'Strong Grade-A upside',
        harvestCycleDays: isLimitedWater ? '105–115 days' : '70–90 days',
        suitabilityScore: 91,
        whyRecommended: isLimitedWater
          ? 'Conserves limited moisture well in loamy soil while improving soil nitrogen naturally.'
          : 'Matches your drip infrastructure and active corridor demand from Ahmedabad/Vadodara packhouses.',
      },
      {
        crop: 'Wheat (GW-496 Lokwan)',
        investmentBand: '₹16,000–₹21,000 / acre',
        waterRequirement: 'Moderate (4–5 irrigations)',
        marketDemand: 'Steady (APMC & Millers)',
        riskLevel: 'Low',
        potentialOutlook: 'Stable baseline return',
        harvestCycleDays: '115–125 days',
        suitabilityScore: 87,
        whyRecommended: 'Low perishability and reliable local storage flexibility reduce urgent harvest-day selling pressure.',
      },
      {
        crop: 'Red Onion (Rabi)',
        investmentBand: '₹28,000–₹35,000 / acre',
        waterRequirement: 'Moderate',
        marketDemand: 'High (Volatile)',
        riskLevel: 'Medium',
        potentialOutlook: 'High seasonal spread',
        harvestCycleDays: '110–130 days',
        suitabilityScore: 81,
        whyRecommended: 'Suits Goradu black-loamy soil well; curing and short storage help time mandi arrivals.',
      },
      {
        crop: 'Green Chilli / Capsicum',
        investmentBand: '₹42,000–₹54,000 / acre',
        waterRequirement: 'Moderate-High',
        marketDemand: 'Moderate-High',
        riskLevel: 'High',
        potentialOutlook: 'High value, pest-sensitive',
        harvestCycleDays: '75–100 days',
        suitabilityScore: 74,
        whyRecommended: 'Strong per-acre cashflow potential if budget permits tight thrips/mite monitoring and staking.',
      },
    ],
  };
}

function buildDemoAssistantFallback(
  message: string,
  language: Language,
  snapshot: KisanSetuAssistantToolsSnapshot
): { reply: string; toolsUsed: string[] } {
  const q = message.toLowerCase();
  const scan = snapshot.getLatestCropScan();
  const market = snapshot.getMarketData();
  const reqs = snapshot.getBuyerRequirements();
  const weather = snapshot.getWeatherData();
  const farm = snapshot.getFarmData();

  const isDiseaseQuery =
    q.includes('daag') ||
    q.includes('dag') ||
    q.includes('patta') ||
    q.includes('patte') ||
    q.includes('blight') ||
    q.includes('spot') ||
    q.includes('ધબ્બા') ||
    q.includes('ડાઘ') ||
    q.includes('પાન') ||
    q.includes('धब्ब') ||
    q.includes('पत्त') ||
    q.includes('रोग') ||
    q.includes('check my tomato');

  const isMarketQuery =
    q.includes('sell') ||
    q.includes('market') ||
    q.includes('mandi') ||
    q.includes('bhav') ||
    q.includes('price') ||
    q.includes('buyer') ||
    q.includes('bech') ||
    q.includes('વેચ') ||
    q.includes('ભાવ') ||
    q.includes('બજાર') ||
    q.includes('मंडी') ||
    q.includes('बेच') ||
    q.includes('भाव');

  const isWeatherSprayQuery =
    q.includes('rain') ||
    q.includes('spray') ||
    q.includes('weather') ||
    q.includes('varsad') ||
    q.includes('barish') ||
    q.includes('mausam') ||
    q.includes('વરસાદ') ||
    q.includes('છંટકાવ') ||
    q.includes('बारिश') ||
    q.includes('छिड़काव');

  const isQualityOrCropQuery =
    q.includes('grow') ||
    q.includes('crop') ||
    q.includes('soil') ||
    q.includes('quality') ||
    q.includes('grade') ||
    q.includes('fasal') ||
    q.includes('પાક') ||
    q.includes('ગુણવત્તા') ||
    q.includes('ફસલ') ||
    q.includes('फसल') ||
    q.includes('गुणवत्ता');

  if (isDiseaseQuery) {
    if (language === 'gu') {
      return {
        toolsUsed: ['getLatestCropScan', 'getWeatherData'],
        reply: `સંભવિત સમસ્યા: ફૂગના લક્ષણો (Early Blight જેવા, ${scan?.disease.confidence || 87}% AI સ્ક્રીનિંગ)\n\nમેં શું જોયું: નીચેના જૂના પાંદડા પર ઘેરા કથ્થઈ ડાઘા અને હળવો પીળો ઘેરાવો.\n\nતમે અત્યારે શું કરી શકો:\n1. અસરગ્રસ્ત નીચેના પાંદડા કાપીને ખેતરથી દૂર કરો.\n2. સાંજે પાંદડા ભીના થાય તેવું પિયત ટાળો (માત્ર સવારે મૂળ પાસે ડ્રિપ આપો).\n3. આવતીકાલે ${weather.forecast[1]?.rainProbability || 68}% વરસાદની શક્યતા હોવાથી નજીકના છોડની તપાસ કરતા રહો.\n\nસારવાર: કોઈપણ દવા કે માપ છાંટતા પહેલા કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) અથવા લાયકાત ધરાવતા કૃષિ નિષ્ણાતની ખાતરી અવશ્ય લો.`,
      };
    }
    if (language === 'hi') {
      return {
        toolsUsed: ['getLatestCropScan', 'getWeatherData'],
        reply: `संभावित समस्या: अर्ली ब्लाइट जैसे फफूंद लक्षण (${scan?.disease.confidence || 87}% AI स्क्रीनिंग)\n\nमैंने क्या देखा: निचली पुरानी पत्तियों पर गहरे भूरे गोल धब्बे और हल्का पीलापन।\n\nअभी क्या करें:\n1. संक्रमित निचली पत्तियों को तोड़कर खेत से दूर हटाएँ।\n2. शाम के समय पत्तियों को गीला करने वाली सिंचाई से बचें; सुबह ड्रिप से पानी दें।\n3. कल ${weather.forecast[1]?.rainProbability || 68}% बारिश की संभावना को देखते हुए जल निकासी और पास के पौधों की जांच करें।\n\nउपचार सलाह: किसी भी रसायन या मात्रा के उपयोग से पहले अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से पुष्टि जरूर करें।`,
      };
    }
    return {
      toolsUsed: ['getLatestCropScan', 'getWeatherData'],
      reply: `Possible issue: ${scan?.disease.possibleDisease || 'Early blight-like symptoms'}\n\nWhat I noticed: Dark concentric spots on older lower leaves (AI screening confidence ${scan?.disease.confidence || 87}%).\n\nWhat you can do now:\n1. Remove severely affected lower leaves away from the field.\n2. Avoid unnecessary overhead watering in the evening.\n3. Monitor neighboring plants closely (${weather.forecast[1]?.rainProbability || 68}% rain forecast tomorrow).\n\nTreatment: Please verify the diagnosis and treatment with a qualified agricultural expert or trusted KVK guidance before applying chemicals.`,
    };
  }

  if (isWeatherSprayQuery) {
    const rainPct = weather.forecast[1]?.rainProbability || 68;
    if (language === 'gu') {
      return {
        toolsUsed: ['getWeatherData', 'getFarmData'],
        reply: `હવામાન સલાહ (ડેમો આગાહી): આવતીકાલે ${rainPct}% વરસાદની શક્યતા છે.\n\n1. બિનજરૂરી છંટકાવ મોકૂફ રાખવો સારું રહેશે કારણ કે વરસાદથી દવા ધોવાઈ શકે છે.\n2. ટામેટાના ચાસમાં પાણી ભરાઈ ન રહે તે માટે નિકાલની વ્યવસ્થા આજે જ તપાસો.\n3. વરસાદ પછી ભેજ વધે ત્યારે નીચેના પાંદડાનું નિરીક્ષણ કરો.`,
      };
    }
    if (language === 'hi') {
      return {
        toolsUsed: ['getWeatherData', 'getFarmData'],
        reply: `मौसम सलाह (डेमो अनुमान): कल ${rainPct}% बारिश की संभावना है।\n\n1. अनावश्यक छिड़काव कल तक टालना बेहतर रहेगा ताकि दवा बारिश में न धुल जाए।\n2. टमाटर की क्यारियों में जलभराव न हो, इसके लिए नालियों की आज जांच कर लें।\n3. बारिश के बाद नमी बढ़ने पर निचली पत्तियों पर धब्बों की निगरानी रखें।`,
      };
    }
    return {
      toolsUsed: ['getWeatherData', 'getFarmData'],
      reply: `Weather Advisory (Demo Forecast): Tomorrow shows a ${rainPct}% chance of rain.\n\n1. Postpone avoidable foliar spraying so rain does not wash off treatment.\n2. Check drainage channels around raised tomato beds today.\n3. Inspect lower leaves once humidity peaks after rain.`,
    };
  }

  if (isMarketQuery) {
    const topMandi = market[0];
    const topBuyerReq = reqs[0];
    if (language === 'gu') {
      return {
        toolsUsed: ['getMarketData', 'getBuyerRequirements'],
        reply: `તાજેતરની બજાર માહિતી (ડેમો ડેટા): આણંદ APMC માં ગ્રેડ-A ટામેટાનો ભાવ ₹${topMandi?.minPricePerKg || 26}–₹${topMandi?.maxPricePerKg || 32}/કિગ્રા છે (વધતી માંગ).\n\nસીધા ખરીદદારની તક: ${topBuyerReq?.buyerName || 'GreenBasket Foods'} ને ${topBuyerReq?.requiredQtyKgPerWeek || 1000} કિગ્રા ગ્રેડ-A ટામેટાની જરૂર છે. વેચાણ પહેલાં મંડી અને ખરીદદારની ઓફર સરખાવો (ભવિષ્યના ભાવની કોઈ ગેરંટી નથી).`,
      };
    }
    if (language === 'hi') {
      return {
        toolsUsed: ['getMarketData', 'getBuyerRequirements'],
        reply: `ताज़ा बाज़ार जानकारी (डेमो डेटा): आणंद APMC मंडी में ग्रेड-A टमाटर का भाव ₹${topMandi?.minPricePerKg || 26}–₹${topMandi?.maxPricePerKg || 32}/किग्रा चल रहा है।\n\nसीधा खरीदार अवसर: ${topBuyerReq?.buyerName || 'GreenBasket Foods'} को ${topBuyerReq?.requiredQtyKgPerWeek || 1000} किग्रा ग्रेड-A टमाटर की आवश्यकता है। बेचने से पहले मंडी व खरीदार ऑफर की तुलना करें (भविष्य के भाव की गारंटी नहीं है)।`,
      };
    }
    return {
      toolsUsed: ['getMarketData', 'getBuyerRequirements'],
      reply: `Latest Market Insight (Demo Data): Anand APMC Grade-A Tomato ranges ₹${topMandi?.minPricePerKg || 26}–₹${topMandi?.maxPricePerKg || 32}/kg (${topMandi?.trend || 'Rising'} demand).\nBuyer Opportunity: ${topBuyerReq?.buyerName || 'GreenBasket Foods'} has an active requirement for ${topBuyerReq?.requiredQtyKgPerWeek || 1000} kg Grade-A Tomato (${topBuyerReq?.indicativePriceRange}). Compare mandi vs direct buyer offers before dispatching.`,
    };
  }

  if (isQualityOrCropQuery) {
    if (language === 'gu') {
      return {
        toolsUsed: ['getFarmData', 'getCropData'],
        reply: `તમારા ${farm.landSizeAcres} એકર ખેતર (${farm.irrigationType}) માટે સૂચન:\n1. ગ્રેડ-A ટામેટાની ગુણવત્તા જાળવવા ફૂલ અને ફળ અવસ્થામાં ડ્રિપ પિયત નિયમિત રાખો અને સવારના સમયે કાપણી કરો.\n2. આગામી મોસમ માટે "પાક સલાહ" ટૂલમાં તમે ઘઉં (GW-496), ડ્રિપ ટામેટા અને રવી ડુંગળીની સરખામણી કરી શકો છો.`,
      };
    }
    if (language === 'hi') {
      return {
        toolsUsed: ['getFarmData', 'getCropData'],
        reply: `आपके ${farm.landSizeAcres} एकड़ खेत (${farm.irrigationType}) के लिए सुझाव:\n1. ग्रेड-A गुणवत्ता बनाए रखने के लिए फूल व फल अवस्था में ड्रिप सिंचाई नियमित रखें और सुबह तुड़ाई करें।\n2. अगली बुवाई के लिए "फसल सलाह" पेज पर आप गेहूँ (GW-496), ड्रिप टमाटर और प्याज के विकल्पों की तुलना कर सकते हैं।`,
      };
    }
    return {
      toolsUsed: ['getFarmData', 'getCropData'],
      reply: `For your ${farm.landSizeAcres}-acre ${farm.soilType} plot with ${farm.irrigationType} irrigation: keep drip intervals steady during flowering to protect Grade-A fruit firmness, and use the Crop Decision tool to compare Rabi Wheat, Drip Tomato, and Onion options.`,
    };
  }

  if (language === 'gu') {
    return {
      toolsUsed: ['getFarmerProfile', 'getFarmData', 'getWeatherData'],
      reply: `તમારું ખેતર અત્યારે ${farm.overallHealthScore}% આરોગ્ય સ્કોર પર છે. આવતીકાલે ${weather.forecast[1]?.rainProbability || 68}% વરસાદની આગાહી છે — બિનજરૂરી છંટકાવ ટાળો અને "પાક વેચો" વિભાગમાં સક્રિય ${reqs.length} ખરીદદાર તકો જુઓ.`,
    };
  }
  if (language === 'hi') {
    return {
      toolsUsed: ['getFarmerProfile', 'getFarmData', 'getWeatherData'],
      reply: `आपका खेत इस समय ${farm.overallHealthScore}% स्वास्थ्य स्कोर पर है। कल ${weather.forecast[1]?.rainProbability || 68}% बारिश का अनुमान है — अनावश्यक छिड़काव टालें और मार्केटप्लेस में ${reqs.length} सक्रिय खरीदार अवसर देखें।`,
    };
  }

  return {
    toolsUsed: ['getFarmerProfile', 'getFarmData', 'getWeatherData'],
    reply: `Your ${farm.name} is at ${farm.overallHealthScore}% health. Tomorrow's weather forecast shows ${weather.forecast[1]?.rainProbability || 68}% rain probability—consider postponing foliar spraying and check your active ${reqs.length} buyer opportunities in the Marketplace.`,
  };
}

export const aiService = {
  async identifyCrop(input: ScanAnalysisInput, farmId: string): Promise<CropScan> {
    return this.analyzeCropHealth(input, farmId);
  },

  async analyzeCropHealth(input: ScanAnalysisInput, farmId: string): Promise<CropScan> {
    const isDemoSample = Boolean(input.sampleId);
    const storedImageUrl = input.thumbnailDataUrl || input.imageDataUrl;

    try {
      const response = await fetch('/api/ai/scan-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: input.signal,
        body: JSON.stringify({
          imageBase64: input.imageDataUrl,
          mimeType: input.mimeType,
          cropHint: input.cropHint,
          language: input.language,
        }),
      });

      if (!response.ok) {
        if (isDemoSample) {
          return buildDemoScanFallback(input, farmId);
        }

        let errCode = '';
        let errMessage = `Crop analysis request failed (${response.status}).`;
        try {
          const errJson = (await response.json()) as { error?: string; message?: string };
          errCode = errJson.error || '';
          if (errJson.message) errMessage = errJson.message;
        } catch {
          // non-JSON response body
        }

        if (response.status === 429 || errCode === 'GEMINI_QUOTA_EXCEEDED') {
          throw new CropScanError('GEMINI_QUOTA_EXCEEDED', errMessage, 429);
        }
        if (errCode === 'GEMINI_HIGH_DEMAND') {
          throw new CropScanError('GEMINI_HIGH_DEMAND', errMessage, 503);
        }
        if (response.status === 503 || errCode === 'GEMINI_UNAVAILABLE') {
          throw new CropScanError('GEMINI_UNAVAILABLE', errMessage, response.status);
        }
        if (response.status === 413 || errCode === 'PAYLOAD_TOO_LARGE') {
          throw new CropScanError('PAYLOAD_TOO_LARGE', errMessage, response.status);
        }
        if (
          response.status === 400 &&
          (errCode === 'INVALID_IMAGE_FORMAT' || errCode === 'MISSING_IMAGE')
        ) {
          throw new CropScanError('INVALID_IMAGE_FORMAT', errMessage, response.status);
        }
        if (errCode === 'UNEXPECTED_AI_RESPONSE') {
          throw new CropScanError('UNEXPECTED_RESPONSE', errMessage, response.status);
        }
        throw new CropScanError('GEMINI_FAILED', errMessage, response.status);
      }

      let data: { result?: Record<string, unknown> };
      try {
        data = (await response.json()) as { result?: Record<string, unknown> };
      } catch {
        if (isDemoSample) return buildDemoScanFallback(input, farmId);
        throw new CropScanError('UNEXPECTED_RESPONSE', 'Malformed response from AI service.');
      }

      const r = data?.result as
        | {
            cropName?: string;
            varietyGuess?: string;
            growthStage?: string;
            healthScore?: number;
            qualityScore?: number;
            suggestedGrade?: CropGrade;
            visibleIssuesSummary?: string;
            visualCharacteristics?: QualityAssessment['characteristics'];
            diseaseDetected?: boolean;
            possibleDisease?: string;
            confidence?: number;
            severity?: DiseaseDetection['severity'];
            symptomsObserved?: string[];
            immediateActions?: string[];
            preventiveMeasures?: string[];
            treatmentGuidance?: DiseaseDetection['treatmentGuidance'];
            marketInsightNote?: string;
          }
        | undefined;

      if (!r || typeof r.cropName !== 'string' || !r.cropName.trim()) {
        if (isDemoSample) {
          return buildDemoScanFallback(input, farmId);
        }
        throw new CropScanError('UNEXPECTED_RESPONSE', 'AI analysis response lacked crop details.');
      }

      const quality: QualityAssessment = {
        qualityScore: Number(r.qualityScore) || 80,
        suggestedGrade:
          r.suggestedGrade === 'A' || r.suggestedGrade === 'B' || r.suggestedGrade === 'C'
            ? r.suggestedGrade
            : 'B',
        visibleIssuesSummary: r.visibleIssuesSummary || 'Visual inspection completed.',
        characteristics: r.visualCharacteristics || {
          color: 'Consistent natural pigment',
          apparentMaturity: r.growthStage || 'Active growth stage',
          visibleDamage: 'Minor surface variation',
          spots: 'Screened visually',
          sizeAppearance: 'Representative canopy/fruit sample',
          freshnessIndicator: 'Normal hydration',
        },
      };

      const disease: DiseaseDetection = {
        detected: Boolean(r.diseaseDetected),
        possibleDisease: r.possibleDisease || 'No Disease Symptoms Detected',
        confidence: Number(r.confidence) || 80,
        severity:
          r.severity && ['None', 'Low', 'Medium', 'High'].includes(r.severity)
            ? r.severity
            : 'Low',
        symptomsObserved: Array.isArray(r.symptomsObserved) ? r.symptomsObserved : [],
        immediateActions: Array.isArray(r.immediateActions) ? r.immediateActions : [],
        preventiveMeasures: Array.isArray(r.preventiveMeasures) ? r.preventiveMeasures : [],
        treatmentGuidance: r.treatmentGuidance || {
          approachSummary: 'Inspect crop closely and consult a qualified local agricultural officer.',
          activeIngredientCategory: 'Verify approved category with local KVK before spraying.',
          safetyPrecautions: 'Wear protective gloves and mask during any field application.',
          preHarvestCaution: 'Follow standard Pre-Harvest Interval rules.',
          expertConfirmationNote: 'AI screening does not replace qualified agronomic verification.',
        },
      };

      return {
        id: `scan-${Date.now()}`,
        farmId,
        cropName: r.cropName,
        varietyGuess: r.varietyGuess || 'Field Cultivar',
        growthStage: r.growthStage || 'Vegetative / Fruiting',
        healthScore: Number(r.healthScore) || 80,
        imageUrl: storedImageUrl,
        scannedAt: 'Just now',
        sourceLabel: 'Gemini Vision AI Screening',
        isDemoAnalysis: false,
        reviewStatus: 'Normal',
        quality,
        disease,
        marketInsightNote:
          r.marketInsightNote ||
          `Your crop appears suitable for Grade-${quality.suggestedGrade} positioning. Compare nearby buyers and markets before selling.`,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new CropScanError('CANCELLED', 'Crop scan cancelled by user.');
      }
      if (err instanceof CropScanError) {
        throw err;
      }
      if (isDemoSample) {
        return buildDemoScanFallback(input, farmId);
      }
      throw new CropScanError(
        'NETWORK_ERROR',
        err instanceof Error ? err.message : 'Network failure while analyzing crop photo.'
      );
    }
  },

  assessVisualQuality(scan: CropScan): QualityAssessment {
    return scan.quality;
  },

  detectPossibleDisease(scan: CropScan): DiseaseDetection {
    return scan.disease;
  },

  async explainMarketInsight(cropName: string, grade: CropGrade) {
    return marketService.getRecommendationForCrop(cropName, grade);
  },

  async recommendCrops(input: DecisionInput): Promise<CropDecisionResult> {
    try {
      const response = await fetch('/api/ai/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        return buildDemoDecisionFallback(input);
      }

      const data = await response.json();
      if (!data.result || !Array.isArray(data.result.comparisons)) {
        return buildDemoDecisionFallback(input);
      }

      return {
        ...data.result,
        sourceLabel: 'Gemini Crop Decision Engine',
        isDemoResult: false,
      };
    } catch {
      return buildDemoDecisionFallback(input);
    }
  },

  async chatWithInteractionsApi(
    message: string,
    language: Language,
    snapshot: KisanSetuAssistantToolsSnapshot,
    previousInteractionId?: string
  ): Promise<{
    reply: string;
    sourceLabel: string;
    interactionId?: string;
    toolsUsed: string[];
  }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          language,
          previousInteractionId,
          kisansetuSnapshot: {
            farmerProfile: snapshot.getFarmerProfile(),
            farmData: snapshot.getFarmData(),
            cropData: snapshot.getCropData(),
            latestCropScan: snapshot.getLatestCropScan(),
            marketData: snapshot.getMarketData(),
            buyerRequirements: snapshot.getBuyerRequirements(),
            weatherData: snapshot.getWeatherData(),
          },
        }),
      });
      clearTimeout(timer);

      if (!response.ok) {
        const fb = buildDemoAssistantFallback(message, language, snapshot);
        return {
          reply: fb.reply,
          sourceLabel: 'Demo Assistant Fallback (AI Key Offline)',
          toolsUsed: fb.toolsUsed,
        };
      }

      const data = await response.json();
      return {
        reply: data.reply,
        sourceLabel: 'Gemini Interactions API',
        interactionId: data.interactionId,
        toolsUsed: Array.isArray(data.usedTools) ? data.usedTools : [],
      };
    } catch {
      clearTimeout(timer);
      const fb = buildDemoAssistantFallback(message, language, snapshot);
      return {
        reply: fb.reply,
        sourceLabel: 'Demo Assistant Fallback (AI Key Offline)',
        toolsUsed: fb.toolsUsed,
      };
    }
  },

  async findVerifiedTreatmentGuidance(
    cropName: string,
    diseaseName: string,
    severity: string,
    location: string,
    language: Language = 'en'
  ): Promise<VerifiedGuidanceDetail> {
    try {
      const response = await fetch('/api/ai/treatment-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropName, diseaseName, severity, location, language }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.guidance) {
          return {
            ...data.guidance,
            sourceType: 'ai_synthesized',
          };
        }
      }
    } catch {
      // Fall back cleanly to structured agronomy extension template
    }

    if (language === 'gu') {
      return {
        verificationSourceNote: 'ICAR / રાજ્ય KVK IPM માર્ગદર્શિકા આધારિત ચકાસણી યાદી (ડેમો માર્ગદર્શન).',
        culturalAndMechanicalSteps: [
          'રોગગ્રસ્ત નીચેના પાંદડા કાપીને બેગમાં ભરી ખેતરની બહાર નિકાલ કરો.',
          'રાત્રે પાંદડા ભીના ન થાય તે માટે સવારમાં ડ્રિપ પિયત આપો.',
          'એક હારથી બીજી હારમાં જતા પહેલા કાતર સાફ કરો.',
        ],
        biologicalOptions: [
          'તમારા નજીકના KVK સાથે ટ્રાઇકોડર્મા વિરિડી અથવા સ્યુડોમોનાસ વિશે ચર્ચા કરો.',
          'પાકના તબક્કાની ખાતરી કર્યા પછી જ લીમડાના અર્કનો ઉપયોગ કરો.',
        ],
        chemicalClassToDiscussWithExpert:
          'તમારી વર્તમાન ગંભીરતા મુજબ કઈ પ્રોટેક્ટન્ટ દવા અને માપ યોગ્ય છે તે KVK અથવા કૃષિ અધિકારી પાસેથી ખાતરી કરો.',
        workerAndCropSafety: [
          'મિશ્રણ અને છંટકાવ વખતે હાથમોજા, ચશ્મા અને માસ્ક પહેરો.',
          'વધુ પવન કે વરસાદ પહેલાં છંટકાવ ન કરો.',
          'કાપણી પહેલાં લેબલ મુજબ રાહ સમયમર્યાદા (PHI) નું પાલન કરો.',
        ],
        recommendedLocalAuthority: `કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) — ${location}`,
        sourceType: 'demo_extension_library',
      };
    }

    if (language === 'hi') {
      return {
        verificationSourceNote: 'ICAR / राज्य KVK एकीकृत कीट प्रबंधन (IPM) संदर्भ सूची (डेमो मार्गदर्शन)।',
        culturalAndMechanicalSteps: [
          'संक्रमित निचली पत्तियों को तोड़कर थैले में भरें और खेत से बाहर निस्तारित करें।',
          'रात भर पत्तियाँ गीली न रहें, इसके लिए सुबह के समय ड्रिप सिंचाई करें।',
          'एक कतार से दूसरी कतार में जाने से पहले कटाई उपकरण साफ़ करें।',
        ],
        biologicalOptions: [
          'अपने स्थानीय KVK से ट्राइकोडर्मा विरिडी या स्यूडोमोनास फ्लोरोसेंस जैविक विकल्पों पर चर्चा करें।',
          'फसल अवस्था की जांच के बाद ही नीम बीज अर्क (NSKE) का उपयोग करें।',
        ],
        chemicalClassToDiscussWithExpert:
          'मौजूदा गंभीरता स्तर पर कौन-सा फफूंदनाशक वर्ग व सटीक मात्रा उपयुक्त है, इसकी पुष्टि KVK या कृषि अधिकारी से करें।',
        workerAndCropSafety: [
          'दवा मिलाते और छिड़कते समय दस्ताने, चश्मा और मास्क अवश्य पहनें।',
          'तेज हवा (10 किमी/घंटा से अधिक) या बारिश से ठीक पहले छिड़काव न करें।',
          'कटाई से पहले लेबल पर लिखी प्रतीक्षा अवधि (PHI) का सख्ती से पालन करें।',
        ],
        recommendedLocalAuthority: `कृषि विज्ञान केंद्र (KVK) — ${location}`,
        sourceType: 'demo_extension_library',
      };
    }

    return {
      verificationSourceNote:
        'Structured from ICAR / State KVK Integrated Pest Management (IPM) reference checklist (Demo Guidance Layer — ready to connect to State Extension API).',
      culturalAndMechanicalSteps: [
        'Remove and bag visibly infected lower leaves; never leave pruned debris in irrigation furrows.',
        'Switch to morning drip/root-zone irrigation to reduce overnight leaf wetness duration.',
        'Sanitize pruning shears with diluted soap or clean water between field rows.',
      ],
      biologicalOptions: [
        'Discuss Trichoderma viride or Pseudomonas fluorescens preventive soil/foliar bio-agents with your local KVK.',
        'Use neem-seed kernel extract (NSKE) only after verifying crop stage compatibility.',
      ],
      chemicalClassToDiscussWithExpert:
        'Ask a licensed agronomist or KVK officer whether a contact protectant fungicide is warranted at your current severity level and obtain exact local dosage.',
      workerAndCropSafety: [
        'Always wear nitrile gloves, protective eyewear, and a breathing mask when mixing or spraying.',
        'Do not spray when wind speed exceeds 10 km/h or immediately before expected rain.',
        'Strictly observe the Pre-Harvest Interval (PHI) printed on any approved label before harvesting.',
      ],
      recommendedLocalAuthority: `Krishi Vigyan Kendra (KVK) — ${location} Agricultural Extension Desk`,
      sourceType: 'demo_extension_library',
    };
  },
};

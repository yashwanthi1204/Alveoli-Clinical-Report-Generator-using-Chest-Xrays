import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'sk-or-v1-demo'; // Use env variable
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AIReportParams {
  classification: string;
  confidence: number;
  userAge: number;
  userGender: string;
  symptoms?: string[];
  biologicalMarkers: {
    bloodPressure?: string;
    oxygenSaturation?: number;
    temperature?: number;
    heartRate?: number;
  };
}

export interface StructuredAIReport {
  summary: string;
  clinicalCorrelation: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  findings: string[];
  recommendations: string[];
  disclaimer: string;
}

export async function generateAIReport(params: AIReportParams): Promise<StructuredAIReport> {
  const symptomText = params.symptoms?.length
    ? `Patient reports the following symptoms: ${params.symptoms.join(', ')}.`
    : 'No specific symptoms reported.';

  const markersText = `
    Blood Pressure: ${params.biologicalMarkers.bloodPressure || 'Not recorded'}
    Oxygen Saturation: ${params.biologicalMarkers.oxygenSaturation ? `${params.biologicalMarkers.oxygenSaturation}%` : 'Not recorded'}
    Temperature: ${params.biologicalMarkers.temperature ? `${params.biologicalMarkers.temperature}°C` : 'Not recorded'}
    Heart Rate: ${params.biologicalMarkers.heartRate ? `${params.biologicalMarkers.heartRate} bpm` : 'Not recorded'}
  `;

  const prompt = `You are a medical AI assistant analyzing a chest X-ray result. Generate a detailed, professional medical report in VALID JSON format.

PATIENT DETAILS:
- Age: ${params.userAge} years
- Gender: ${params.userGender}
${symptomText}

VITAL SIGNS:
${markersText}

X-RAY ANALYSIS RESULT:
- Classification: ${params.classification.toUpperCase()}
- AI Confidence: ${(params.confidence * 100).toFixed(1)}%

Please provide a comprehensive medical analysis in purely JSON format with the following structure:
{
  "summary": "2-3 sentences summarizing the patient's condition based on the X-ray and vitals.",
  "clinicalCorrelation": "Detailed analysis (150-200 words) correlating the X-ray result with the specific vitals (BP, O2, Temp, HR) and symptoms provided. Explain if the vitals support the diagnosis or if there are discrepancies.",
  "riskLevel": "One of: 'Low', 'Moderate', 'High', 'Critical'",
  "findings": ["List of 3-5 specific key clinical observations or potential implications"],
  "recommendations": ["List of 4-6 actionable medical recommendations, including immediate steps and logic for them"],
  "disclaimer": "Standard medical disclaimer"
}

Do not include any markdown formatting or code blocks in the response, just the raw JSON object.
`;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI JSON response:', e);
      return generateFallbackReport(params.classification);
    }
  } catch (error) {
    console.error('AI Report generation failed:', error);
    return generateFallbackReport(params.classification);
  }
}

function generateFallbackReport(classification: string): StructuredAIReport {
  const baseReport: StructuredAIReport = {
    summary: `Analysis detected patterns consistent with ${classification}.`,
    clinicalCorrelation: "Unable to generate detailed correlation at this time due to service unavailability.",
    riskLevel: "Moderate",
    findings: [`Detection of ${classification} patterns`, "Requires professional verification"],
    recommendations: ["Consult a healthcare provider", "Monitor symptoms", "Follow standard medical advice"],
    disclaimer: "This is an automated fallback report. Always seek professional medical advice."
  };

  if (classification === 'covid' || classification === 'pneumonia') {
    baseReport.riskLevel = 'High';
    baseReport.findings = [
      "Ground-glass opacities detected",
      "Bilateral inconsistencies observed",
      "Viral pneumonia markers present"
    ];
    baseReport.recommendations = [
      "Immediate isolation",
      "Monitor O2 saturation closely",
      "Seek emergency care if breathing difficulty occurs"
    ];
  } else if (classification === 'tuberculosis') {
    baseReport.riskLevel = 'High';
    baseReport.recommendations = [
      "Seek immediate medical evaluation",
      "Get tested with sputum analysis",
      "Avoid close contact with others"
    ];
  } else {
    baseReport.riskLevel = 'Low';
    baseReport.summary = "Analysis indicates a normal chest X-ray.";
    baseReport.recommendations = ["Continue regular health check-ups", "Maintain good respiratory health"];
  }

  return baseReport;
}

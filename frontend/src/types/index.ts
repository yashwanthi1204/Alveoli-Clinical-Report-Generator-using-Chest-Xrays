// User Information Types
export interface UserInfo {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    email: string;
    phone?: string;
}

// Biological Markers Types
export interface BiologicalMarkers {
    bloodPressure?: string;
    oxygenSaturation?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
    symptoms?: string[];
    medicalHistory?: string;
    smokingStatus?: 'never' | 'former' | 'current';
    allergies?: string;
}

// Classification Types
export type DiseaseClassification = 'covid' | 'normal' | 'pneumonia' | 'tuberculosis';

// Prediction Result
export interface PredictionResult {
    classification: DiseaseClassification;
    confidence: number;
    probabilities: {
        covid: number;
        normal: number;
        pneumonia: number;
        tuberculosis: number;
    };
    timestamp: Date;
    inferenceTimeMs: number;
}

// Structured AI Report
export interface StructuredAIReport {
    summary: string;
    clinicalCorrelation: string;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
    findings: string[];
    recommendations: string[];
    disclaimer: string;
}

// Complete Analysis Report
export interface AnalysisReport {
    id: string;
    userInfo: UserInfo;
    biologicalMarkers: BiologicalMarkers;
    prediction: PredictionResult;
    imageData: string; // Base64
    aiAnalysis?: StructuredAIReport | string;
    createdAt: Date;
}

// Form Step Types
export type AnalysisStep = 'userInfo' | 'biologicalMarkers' | 'upload' | 'processing' | 'results';

// API Response Types
export interface AIReportResponse {
    success: boolean;
    report: string;
    error?: string;
}

// Model Loading State
export interface ModelState {
    isLoaded: boolean;
    isLoading: boolean;
    error?: string;
    xrayValidatorReady: boolean;
    classifierReady: boolean;
}

// Chart Data Types
export interface ConfidenceData {
    name: string;
    value: number;
    fill: string;
}

export interface PerformanceMetric {
    label: string;
    value: string | number;
    unit?: string;
    icon: string;
}

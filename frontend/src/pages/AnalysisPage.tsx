import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    User,
    Activity,
    Upload,
    Loader2,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Image as ImageIcon,
    Brain,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { LoadingSpinner, ModelLoading } from '../components/ui/LoadingSpinner';
import { useTensorFlowModels } from '../hooks/useTensorFlowModels';
import { generateAIReport } from '../services/aiReportService';
import { generatePDFReport, downloadPDF } from '../services/pdfService';
import type { UserInfo, BiologicalMarkers, AnalysisStep, PredictionResult, AnalysisReport, StructuredAIReport } from '../types';

const STEPS: { id: AnalysisStep; label: string; icon: any }[] = [
    { id: 'userInfo', label: 'Patient Info', icon: User },
    { id: 'biologicalMarkers', label: 'Vital Signs', icon: Activity },
    { id: 'upload', label: 'X-Ray Upload', icon: Upload },
    { id: 'processing', label: 'Analysis', icon: Loader2 },
    { id: 'results', label: 'Results', icon: CheckCircle2 },
];

const SYMPTOM_OPTIONS = [
    'Cough', 'Fever', 'Shortness of breath', 'Chest pain', 'Fatigue',
    'Loss of taste/smell', 'Body aches', 'Headache', 'Sore throat', 'Night sweats'
];

const DISEASE_COLORS: Record<string, string> = {
    covid: 'text-red-400 border-red-500 bg-red-500/10',
    normal: 'text-green-400 border-green-500 bg-green-500/10',
    pneumonia: 'text-amber-400 border-amber-500 bg-amber-500/10',
    tuberculosis: 'text-violet-400 border-violet-500 bg-violet-500/10',
};

const DISEASE_LABELS: Record<string, string> = {
    covid: 'COVID-19',
    normal: 'Normal',
    pneumonia: 'Pneumonia',
    tuberculosis: 'Tuberculosis',
};

const TEST_DATA_SCENARIOS = [
    {
        label: 'Critical Case',
        icon: '🔥',
        color: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
        data: {
            bloodPressure: '90/60',
            oxygenSaturation: 88,
            temperature: 39.5,
            heartRate: 115,
            respiratoryRate: 26,
            smokingStatus: 'current',
            symptoms: ['Cough', 'Fever', 'Shortness of breath', 'Fatigue'],
            medicalHistory: 'Chronic smoker, hypertension'
        }
    },
    {
        label: 'Moderate Case',
        icon: '⚠️',
        color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400',
        data: {
            bloodPressure: '110/75',
            oxygenSaturation: 93,
            temperature: 38.4,
            heartRate: 98,
            respiratoryRate: 20,
            smokingStatus: 'former',
            symptoms: ['Cough', 'Fever', 'Chest pain'],
            medicalHistory: 'History of asthma'
        }
    },
    {
        label: 'Chronic Case',
        icon: '⏳',
        color: 'from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-400',
        data: {
            bloodPressure: '115/80',
            oxygenSaturation: 95,
            temperature: 37.8,
            heartRate: 88,
            respiratoryRate: 18,
            smokingStatus: 'never',
            symptoms: ['Cough', 'Fatigue', 'Night sweats'],
            medicalHistory: 'Weight loss over last 3 months'
        }
    },
    {
        label: 'Healthy / Normal',
        icon: '✅',
        color: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
        data: {
            bloodPressure: '120/80',
            oxygenSaturation: 99,
            temperature: 36.6,
            heartRate: 72,
            respiratoryRate: 14,
            smokingStatus: 'never',
            symptoms: [],
            medicalHistory: 'No significant past medical history'
        }
    }
];

export default function AnalysisPage() {
    const navigate = useNavigate();
    const { modelState, validateXray, classifyDisease } = useTensorFlowModels();

    const [currentStep, setCurrentStep] = useState<AnalysisStep>('userInfo');
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        age: 0,
        gender: 'male',
        email: '',
        phone: '',
    });
    const [biologicalMarkers, setBiologicalMarkers] = useState<BiologicalMarkers>({
        symptoms: [],
    });
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<StructuredAIReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
        maxFiles: 1,
    });

    const handleSymptomToggle = (symptom: string) => {
        setBiologicalMarkers(prev => ({
            ...prev,
            symptoms: prev.symptoms?.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...(prev.symptoms || []), symptom],
        }));
    };

    const handleAnalyze = async () => {
        if (!uploadedImage || !modelState.isLoaded) return;

        setCurrentStep('processing');
        setError(null);

        try {
            const img = new Image();
            img.src = uploadedImage;
            await new Promise((resolve) => { img.onload = resolve; });

            // Step 1: Validate X-ray
            const isValidXray = await validateXray(img);
            if (!isValidXray) {
                setError('The uploaded image does not appear to be a valid chest X-ray. Please upload a proper chest X-ray image.');
                setCurrentStep('upload');
                return;
            }

            // Step 2: Classify disease
            const result = await classifyDisease(img);
            setPrediction(result);

            // Step 3: Generate AI report in background
            setIsGeneratingReport(true);
            try {
                const report = await generateAIReport({
                    classification: result.classification,
                    confidence: result.confidence,
                    userAge: userInfo.age,
                    userGender: userInfo.gender,
                    symptoms: biologicalMarkers.symptoms,
                    biologicalMarkers: {
                        bloodPressure: biologicalMarkers.bloodPressure,
                        oxygenSaturation: biologicalMarkers.oxygenSaturation,
                        temperature: biologicalMarkers.temperature,
                        heartRate: biologicalMarkers.heartRate,
                    },
                });
                setAiAnalysis(report);
            } catch (e) {
                console.error('AI report generation failed:', e);
            } finally {
                setIsGeneratingReport(false);
            }

            setCurrentStep('results');

        } catch (e) {
            console.error('Analysis failed:', e);
            setError('Analysis failed. Please try again.');
            setCurrentStep('upload');
        }
    };

    const handleDownloadPDF = async () => {
        if (!prediction || !uploadedImage) return;

        setIsGeneratingPDF(true);
        try {
            const report: AnalysisReport = {
                id: `ALV-${Date.now().toString(36).toUpperCase()}`,
                userInfo,
                biologicalMarkers,
                prediction,
                imageData: uploadedImage,
                aiAnalysis: aiAnalysis || undefined,
                createdAt: new Date(),
            };

            const pdfBlob = await generatePDFReport(report);
            downloadPDF(pdfBlob, `alveoli-report-${report.id}.pdf`);
        } catch (e) {
            console.error('PDF generation failed:', e);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const goToStep = (step: AnalysisStep) => {
        const currentIdx = STEPS.findIndex(s => s.id === currentStep);
        const targetIdx = STEPS.findIndex(s => s.id === step);
        if (targetIdx <= currentIdx && step !== 'processing') {
            setCurrentStep(step);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 'userInfo':
                return userInfo.name.trim() !== '' && userInfo.age > 0 && userInfo.email.trim() !== '';
            case 'biologicalMarkers':
                return true; // Optional fields
            case 'upload':
                return uploadedImage !== null && modelState.isLoaded;
            default:
                return false;
        }
    };

    // Show model loading if not ready
    if (!modelState.isLoaded && currentStep !== 'results') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <ModelLoading
                    xrayReady={modelState.xrayValidatorReady}
                    classifierReady={modelState.classifierReady}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-2">X-Ray Analysis</h1>
                    <p className="text-slate-400">Complete the following steps to receive your AI-powered diagnosis</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-12 relative">
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-800 -z-10" />
                    {STEPS.map((step, idx) => {
                        const stepIdx = STEPS.findIndex(s => s.id === currentStep);
                        const isCompleted = idx < stepIdx;
                        const isCurrent = step.id === currentStep;

                        return (
                            <button
                                key={step.id}
                                onClick={() => goToStep(step.id)}
                                className={`flex flex-col items-center gap-2 transition-all ${isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                    }`}
                                disabled={!isCompleted && !isCurrent}
                            >
                                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary-500 text-white ring-4 ring-primary-500/30' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-800 text-slate-500' : ''}
                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <step.icon className={`w-5 h-5 ${isCurrent && step.id === 'processing' ? 'animate-spin' : ''}`} />
                                    )}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? 'text-primary-400' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 font-medium">Error</p>
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <Card className="mb-8">
                    {/* Step 1: User Info */}
                    {currentStep === 'userInfo' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Patient Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name *"
                                    placeholder="Enter your full name"
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                />
                                <Input
                                    label="Age *"
                                    type="number"
                                    placeholder="Enter age"
                                    min={1}
                                    max={120}
                                    value={userInfo.age || ''}
                                    onChange={(e) => setUserInfo({ ...userInfo, age: parseInt(e.target.value) || 0 })}
                                />
                                <Select
                                    label="Gender *"
                                    value={userInfo.gender}
                                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value as 'male' | 'female' | 'other' })}
                                    options={[
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                        { value: 'other', label: 'Other' },
                                    ]}
                                />
                                <Input
                                    label="Email *"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                />
                                <Input
                                    label="Phone (Optional)"
                                    type="tel"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={userInfo.phone || ''}
                                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Biological Markers */}
                    {currentStep === 'biologicalMarkers' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <h2 className="text-xl font-semibold text-white">Vital Signs & Symptoms</h2>
                                <div className="flex flex-wrap gap-2">
                                    {TEST_DATA_SCENARIOS.map((scenario) => (
                                        <button
                                            key={scenario.label}
                                            type="button"
                                            onClick={() => setBiologicalMarkers(scenario.data as BiologicalMarkers)}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium 
                                                bg-gradient-to-br transition-all hover:scale-105 active:scale-95
                                                ${scenario.color}
                                            `}
                                        >
                                            <span>{scenario.icon}</span>
                                            {scenario.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <Input
                                    label="Blood Pressure"
                                    placeholder="120/80"
                                    value={biologicalMarkers.bloodPressure || ''}
                                    onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, bloodPressure: e.target.value })}
                                />
                                <Input
                                    label="Oxygen Saturation (%)"
                                    type="number"
                                    placeholder="98"
                                    min={0}
                                    max={100}
                                    value={biologicalMarkers.oxygenSaturation || ''}
                                    onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, oxygenSaturation: parseFloat(e.target.value) || undefined })}
                                />
                                <Input
                                    label="Temperature (°C)"
                                    type="number"
                                    step="0.1"
                                    placeholder="37.0"
                                    value={biologicalMarkers.temperature || ''}
                                    onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, temperature: parseFloat(e.target.value) || undefined })}
                                />
                                <Input
                                    label="Heart Rate (bpm)"
                                    type="number"
                                    placeholder="72"
                                    value={biologicalMarkers.heartRate || ''}
                                    onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, heartRate: parseInt(e.target.value) || undefined })}
                                />
                                <Input
                                    label="Respiratory Rate (/min)"
                                    type="number"
                                    placeholder="16"
                                    value={biologicalMarkers.respiratoryRate || ''}
                                    onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, respiratoryRate: parseInt(e.target.value) || undefined })}
                                />
                                <Select
                                    label="Smoking Status"
                                    value={biologicalMarkers.smokingStatus || ''}
                                    onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, smokingStatus: e.target.value as 'never' | 'former' | 'current' || undefined })}
                                    options={[
                                        { value: '', label: 'Select...' },
                                        { value: 'never', label: 'Never Smoked' },
                                        { value: 'former', label: 'Former Smoker' },
                                        { value: 'current', label: 'Current Smoker' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Current Symptoms (Select all that apply)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SYMPTOM_OPTIONS.map((symptom) => (
                                        <button
                                            key={symptom}
                                            type="button"
                                            onClick={() => handleSymptomToggle(symptom)}
                                            className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${biologicalMarkers.symptoms?.includes(symptom)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }
                      `}
                                        >
                                            {symptom}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                label="Medical History / Notes (Optional)"
                                placeholder="Any relevant medical history, allergies, or additional notes..."
                                value={biologicalMarkers.medicalHistory || ''}
                                onChange={(e) => setBiologicalMarkers({ ...biologicalMarkers, medicalHistory: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Step 3: Upload */}
                    {currentStep === 'upload' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Upload Chest X-Ray</h2>

                            <div
                                {...getRootProps()}
                                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                  ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 hover:border-slate-600'}
                  ${uploadedImage ? 'border-green-500/50' : ''}
                `}
                            >
                                <input {...getInputProps()} />
                                {uploadedImage ? (
                                    <div className="space-y-4">
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded X-Ray"
                                            className="max-h-64 mx-auto rounded-lg"
                                        />
                                        <p className="text-green-400 font-medium">Image uploaded successfully</p>
                                        <p className="text-slate-500 text-sm">Click or drag to replace</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium mb-2">
                                                {isDragActive ? 'Drop the image here' : 'Drag & drop your chest X-ray'}
                                            </p>
                                            <p className="text-slate-500 text-sm">or click to browse (JPEG, PNG)</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-amber-400 text-sm">
                                    <strong>Note:</strong> Please ensure you upload a valid frontal chest X-ray (PA or AP view).
                                    The AI will validate the image before proceeding with analysis.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Processing */}
                    {currentStep === 'processing' && (
                        <div className="py-12 text-center">
                            <LoadingSpinner size="lg" text="Analyzing X-Ray..." />
                            <div className="mt-8 space-y-3 text-slate-400 text-sm">
                                <p>🔍 Validating X-ray image...</p>
                                <p>🧠 Running disease classification model...</p>
                                <p>📊 Calculating confidence scores...</p>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Results */}
                    {currentStep === 'results' && prediction && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-semibold text-white mb-6">Analysis Results</h2>

                            {/* Main Result */}
                            <div className={`border-2 rounded-2xl p-8 text-center ${DISEASE_COLORS[prediction.classification]}`}>
                                <p className="text-sm uppercase tracking-wider mb-2 opacity-80">Diagnosis</p>
                                <h3 className="text-4xl font-bold mb-4">{DISEASE_LABELS[prediction.classification]}</h3>
                                <p className="text-lg">Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
                                <p className="text-sm opacity-70 mt-2">Inference time: {prediction.inferenceTimeMs}ms</p>
                            </div>

                            {/* Probability Distribution */}
                            <div className="bg-slate-800/50 rounded-xl p-6">
                                <h4 className="text-white font-medium mb-4">Classification Probabilities</h4>
                                <div className="space-y-3">
                                    {Object.entries(prediction.probabilities).map(([disease, prob]) => (
                                        <div key={disease} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-300">{DISEASE_LABELS[disease]}</span>
                                                <span className="text-white font-medium">{(prob * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${disease === prediction.classification ? 'bg-primary-500' : 'bg-slate-500'
                                                        }`}
                                                    style={{ width: `${prob * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Analysis (Structured) */}
                            {isGeneratingReport ? (
                                <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                                    <LoadingSpinner size="sm" text="Generating detailed AI medical analysis..." />
                                </div>
                            ) : aiAnalysis ? (
                                <div className="space-y-6">
                                    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
                                        <div className="bg-gradient-to-r from-primary-900/40 to-slate-900/40 p-4 border-b border-slate-700/50 flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Brain className="w-5 h-5 text-primary-400" />
                                                AI Medical Analysis
                                            </h3>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${aiAnalysis.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    aiAnalysis.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                        aiAnalysis.riskLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                            'bg-green-500/20 text-green-400 border border-green-500/30'
                                                }`}>
                                                {aiAnalysis.riskLevel} Risk
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Clinical Summary</h4>
                                                <p className="text-slate-300 leading-relaxed">{aiAnalysis.summary}</p>
                                            </div>

                                            {/* Clinical Correlation */}
                                            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                                                <h4 className="text-sm font-medium text-primary-400 mb-2 flex items-center gap-2">
                                                    <Activity className="w-4 h-4" />
                                                    Vitals & Symptoms Correlation
                                                </h4>
                                                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-primary-500/30 pl-3">
                                                    "{aiAnalysis.clinicalCorrelation}"
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Key Findings */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Key Findings</h4>
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.findings.map((finding, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                                {finding}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Recommendations */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Recommendations</h4>
                                                    <ul className="space-y-2">
                                                        {aiAnalysis.recommendations.map((rec, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                {rec}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Disclaimer */}
                                            <div className="text-xs text-slate-500 pt-4 border-t border-slate-800 text-center">
                                                {aiAnalysis.disclaimer}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={handleDownloadPDF}
                                    isLoading={isGeneratingPDF}
                                    className="flex-1"
                                >
                                    Download PDF Report
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setCurrentStep('userInfo');
                                        setUploadedImage(null);
                                        setPrediction(null);
                                        setAiAnalysis(null);
                                    }}
                                    className="flex-1"
                                >
                                    Start New Analysis
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Navigation */}
                {currentStep !== 'processing' && currentStep !== 'results' && (
                    <div className="flex justify-between">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                const idx = STEPS.findIndex(s => s.id === currentStep);
                                if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
                                else navigate('/');
                            }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {currentStep === 'userInfo' ? 'Back to Home' : 'Previous'}
                        </Button>

                        {currentStep === 'upload' ? (
                            <Button
                                onClick={handleAnalyze}
                                disabled={!canProceed()}
                            >
                                Analyze X-Ray
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    const idx = STEPS.findIndex(s => s.id === currentStep);
                                    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
                                }}
                                disabled={!canProceed()}
                            >
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

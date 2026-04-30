import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import type { ModelState, DiseaseClassification, PredictionResult } from '../types';

const MODEL_URLS = {
    xrayValidator: '/XRAY/model.json',
    classifier: '/TFJS/model.json',
};

const CLASS_NAMES: DiseaseClassification[] = ['covid', 'normal', 'pneumonia', 'tuberculosis'];

export function useTensorFlowModels() {
    const [modelState, setModelState] = useState<ModelState>({
        isLoaded: false,
        isLoading: true,
        xrayValidatorReady: false,
        classifierReady: false,
    });

    const [xrayModel, setXrayModel] = useState<tf.LayersModel | null>(null);
    const [classifierModel, setClassifierModel] = useState<tf.LayersModel | null>(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await tf.ready();

                // Load X-Ray validation model
                const xModel = await tf.loadLayersModel(MODEL_URLS.xrayValidator);
                setXrayModel(xModel);
                setModelState(prev => ({ ...prev, xrayValidatorReady: true }));
                console.log('X-Ray validator model loaded');

                // Load disease classifier model
                const cModel = await tf.loadLayersModel(MODEL_URLS.classifier);
                setClassifierModel(cModel);
                setModelState(prev => ({
                    ...prev,
                    classifierReady: true,
                    isLoaded: true,
                    isLoading: false
                }));
                console.log('Disease classifier model loaded');

            } catch (error) {
                console.error('Error loading models:', error);
                setModelState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Failed to load ML models. Please refresh the page.',
                }));
            }
        };

        loadModels();

        return () => {
            xrayModel?.dispose();
            classifierModel?.dispose();
        };
    }, []);

    const preprocessImage = useCallback((imageElement: HTMLImageElement): tf.Tensor4D => {
        const tensor = tf.browser.fromPixels(imageElement)
            .resizeBilinear([224, 224])
            .toFloat()
            .div(tf.scalar(255.0))
            .expandDims(0) as tf.Tensor4D;
        return tensor;
    }, []);

    const validateXray = useCallback(async (imageElement: HTMLImageElement): Promise<boolean> => {
        if (!xrayModel) throw new Error('X-Ray validator not loaded');

        const tensor = preprocessImage(imageElement);
        const prediction = xrayModel.predict(tensor) as tf.Tensor;
        const predIndex = tf.argMax(prediction, 1).dataSync()[0];

        tensor.dispose();
        prediction.dispose();

        return predIndex === 1; // 1 = valid X-ray
    }, [xrayModel, preprocessImage]);

    const classifyDisease = useCallback(async (imageElement: HTMLImageElement): Promise<PredictionResult> => {
        if (!classifierModel) throw new Error('Classifier not loaded');

        const startTime = performance.now();
        const tensor = preprocessImage(imageElement);
        const prediction = classifierModel.predict(tensor) as tf.Tensor;
        const probabilities = prediction.dataSync() as Float32Array;
        const predIndex = tf.argMax(prediction, 1).dataSync()[0];
        const endTime = performance.now();

        tensor.dispose();
        prediction.dispose();

        return {
            classification: CLASS_NAMES[predIndex],
            confidence: probabilities[predIndex],
            probabilities: {
                covid: probabilities[0],
                normal: probabilities[1],
                pneumonia: probabilities[2],
                tuberculosis: probabilities[3],
            },
            timestamp: new Date(),
            inferenceTimeMs: Math.round(endTime - startTime),
        };
    }, [classifierModel, preprocessImage]);

    return {
        modelState,
        validateXray,
        classifyDisease,
    };
}

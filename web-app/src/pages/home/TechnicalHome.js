import React from 'react';
import { MDBContainer, MDBTypography, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const TechnicalHome = () => {
    return (
        <MDBContainer className="py-5">
            <div className="text-center mb-5">
                <h1 className="mb-3 display-4 fw-bold">Multimodal Deep Learning Framework</h1>
                <h2 className="text-muted h4">Generating Clinical Reports from Chest X-Ray Images</h2>
            </div>

            <MDBRow className="mb-5">
                <MDBCol md="12">
                    <MDBTypography tag='div' className='lead'>
                        <p>
                            <strong>Alveoli</strong> represents a paradigm shift in accessible medical diagnostics.
                            By leveraging state-of-the-art Computer Vision and Deep Learning techniques, specifically
                            utilizing lightweight Convolutional Neural Networks (CNN) like <strong>MobileNetV2</strong>,
                            we bring clinical-grade chest X-Ray analysis directly to the browser.
                        </p>
                    </MDBTypography>
                </MDBCol>
            </MDBRow>

            <MDBRow className="mb-5">
                <MDBCol md="6">
                    <h3 className="fw-bold mb-3">Abstract & Methodology</h3>
                    <p>
                        The core classification engine is built upon MobileNetV2, a vision architecture optimized for
                        mobile and embedded vision applications. Through <strong>Transfer Learning</strong>, the model
                        has been fine-tuned on a comprehensive dataset of Chest X-Rays to detect pathologies including:
                    </p>
                    <ul>
                        <li><strong>COVID-19</strong>: Detecting ground-glass opacities.</li>
                        <li><strong>Pneumonia</strong>: Identifying lobar and interstitial consolidation.</li>
                        <li><strong>Tuberculosis</strong>: Recognizing cavitation and nodules.</li>
                        <li><strong>Normal</strong>: Validating healthy lung fields.</li>
                    </ul>
                </MDBCol>
                <MDBCol md="6">
                    <h3 className="fw-bold mb-3">System Architecture</h3>
                    <p>
                        The system employs a decentralized architecture ensuring data privacy and rapid inference:
                    </p>
                    <ul>
                        <li><strong>Client-Side Inference</strong>: Utilizing TensorFlow.js to execute model predictions directly in the user's browser, minimizing latency and eliminating server-side bottlenecks.</li>
                        <li><strong>Zero-Latency Analysis</strong>: By removing the need to upload heavy DICOM/JPEG files to a central server for processing, results are delivered in milliseconds.</li>
                    </ul>
                </MDBCol>
            </MDBRow>

            <MDBRow>
                <MDBCol md="12">
                    <h3 className="fw-bold mb-3">Technical Implementation</h3>
                    <p>
                        The web application is engineered using <strong>React.js</strong> for a dynamic user interface.
                        The inference pipeline involves:
                    </p>
                    <ol>
                        <li><strong>Preprocessing</strong>: Input images are resized to 224x224 and normalized (pixel values scaled to 0-1 range) efficiently using WebGL-accelerated tensor operations.</li>
                        <li><strong>Model Loading</strong>: The pre-trained Keras model, converted to a web-friendly GraphModel format, is loaded asynchronously.</li>
                        <li><strong>Prediction</strong>: The <code>predict()</code> method outputs a probability distribution across the four classes, with the highest confidence score determining the final diagnosis.</li>
                    </ol>
                    <div className="alert alert-info mt-4" role="alert">
                        <h4 className="alert-heading">Conclusion</h4>
                        <p className="mb-0">
                            This project demonstrates the feasibility of deploying complex deep learning models on consumer hardware,
                            democratizing access to critical medical diagnostic tools and potentially aiding in early detection scenarios
                            where radiologist availability is limited.
                        </p>
                    </div>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default TechnicalHome;

import { Link } from 'react-router-dom';
import {
    Brain,
    Shield,
    Zap,
    FileText,
    Upload,
    Activity,
    Cpu,
    Lock,
    Server,
    Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent" />

                {/* Animated background orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

                <div className="relative container mx-auto px-6 py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full mb-8">
                            <Brain className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-primary-300">AI-Powered Medical Diagnostics</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="text-gradient">ALVEOLI</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 mb-4">
                            Multimodal Deep Learning Framework for Clinical Report Generation
                        </p>

                        <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
                            Real-time chest X-ray analysis using TensorFlow.js with client-side inference
                            for maximum privacy and zero-latency diagnostics.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/analysis">
                                <Button size="lg" className="w-full sm:w-auto">
                                    <Upload className="w-5 h-5 mr-2" />
                                    Start Analysis
                                </Button>
                            </Link>
                            <a href="#technical-overview">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Technical Documentation
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Core Capabilities</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Cutting-edge technology stack designed for medical-grade accuracy and privacy
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, title: 'Deep Learning', desc: 'MobileNetV2-based models with 4-class classification' },
                            { icon: Shield, title: 'Privacy First', desc: 'Client-side inference - images never leave your device' },
                            { icon: Zap, title: 'Real-time', desc: 'Sub-second inference with WebGL acceleration' },
                            { icon: FileText, title: 'AI Reports', desc: 'Comprehensive analysis powered by Gemini 2.5' },
                        ].map((feature, idx) => (
                            <Card key={idx} hoverable className="text-center">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                                    <feature.icon className="w-7 h-7 text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400">{feature.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Overview Section */}
            <section id="technical-overview" className="py-20 px-6 bg-slate-900/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Technical Architecture</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Enterprise-grade system design with focus on performance and reliability
                        </p>
                    </div>

                    {/* Architecture Diagram */}
                    <Card className="mb-12 p-8">
                        <pre className="text-xs md:text-sm text-slate-400 font-mono overflow-x-auto">
                            {`┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALVEOLI SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        CLIENT (Browser)                              │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────────┐  │    │
│  │  │  React 18.2   │  │ TensorFlow.js │  │   Pre-trained Models    │  │    │
│  │  │  + TypeScript │──│   Runtime     │──│   ├─ X-Ray Validator    │  │    │
│  │  │  + Tailwind   │  │   (WebGL)     │  │   └─ Disease Classifier │  │    │
│  │  └───────────────┘  └───────────────┘  └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        BACKEND (Node.js/Express)                     │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │    │
│  │  │ Auth Service  │  │  Report API   │  │  Security Middleware  │   │    │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────┐    ┌──────────────────────────────────────────┐   │
│  │   MongoDB Database  │    │      External Services                    │   │
│  └─────────────────────┘    │   └─ OpenRouter API (Gemini 2.5 Flash)   │   │
│                             └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘`}
                        </pre>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Model 1 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Eye className="w-6 h-6 text-accent-cyan" />
                                    Model 1: X-Ray Validation
                                </CardTitle>
                                <CardDescription>Binary classifier to validate chest X-ray images</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-primary-400 mb-3">Architecture</h4>
                                        <div className="space-y-2 text-sm text-slate-300">
                                            <div className="flex justify-between"><span>Base Model:</span><span className="text-white">MobileNetV2</span></div>
                                            <div className="flex justify-between"><span>Input Size:</span><span className="text-white">224 × 224 × 3</span></div>
                                            <div className="flex justify-between"><span>Dropout:</span><span className="text-white">0.5</span></div>
                                            <div className="flex justify-between"><span>Output:</span><span className="text-white">2 classes (sigmoid)</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-primary-400 mb-3">Training Config</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-slate-400">Optimizer: <span className="text-white">Adam</span></div>
                                            <div className="text-slate-400">Loss: <span className="text-white">Binary CE</span></div>
                                            <div className="text-slate-400">LR: <span className="text-white">1e-3</span></div>
                                            <div className="text-slate-400">Epochs: <span className="text-white">11</span></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Model 2 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-accent-emerald" />
                                    Model 2: Disease Classification
                                </CardTitle>
                                <CardDescription>Multi-class classifier for respiratory conditions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-primary-400 mb-3">Architecture</h4>
                                        <div className="space-y-2 text-sm text-slate-300">
                                            <div className="flex justify-between"><span>Base Model:</span><span className="text-white">MobileNetV2</span></div>
                                            <div className="flex justify-between"><span>Input Size:</span><span className="text-white">224 × 224 × 3</span></div>
                                            <div className="flex justify-between"><span>Dropout:</span><span className="text-white">0.2</span></div>
                                            <div className="flex justify-between"><span>Output:</span><span className="text-white">4 classes (softmax)</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-primary-400 mb-3">Classification Classes</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { name: 'COVID-19', color: 'bg-red-500' },
                                                { name: 'Normal', color: 'bg-green-500' },
                                                { name: 'Pneumonia', color: 'bg-amber-500' },
                                                { name: 'Tuberculosis', color: 'bg-violet-500' },
                                            ].map((cls, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <div className={`w-3 h-3 rounded-full ${cls.color}`} />
                                                    <span className="text-slate-300">{cls.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Technology Stack</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Modern, battle-tested technologies for production-grade performance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Cpu className="w-5 h-5 text-primary-400" />
                                    Frontend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: 'React', version: '18.2', desc: 'UI Framework' },
                                        { name: 'TypeScript', version: '5.3', desc: 'Type Safety' },
                                        { name: 'Vite', version: '5.0', desc: 'Build Tool' },
                                        { name: 'Tailwind CSS', version: '3.3', desc: 'Styling' },
                                        { name: 'TensorFlow.js', version: '4.x', desc: 'ML Runtime' },
                                    ].map((tech, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                            <div>
                                                <span className="text-white font-medium">{tech.name}</span>
                                                <span className="text-slate-500 text-sm ml-2">{tech.desc}</span>
                                            </div>
                                            <span className="text-primary-400 font-mono text-sm">{tech.version}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Server className="w-5 h-5 text-accent-cyan" />
                                    Backend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Node.js', version: '14.x', desc: 'Runtime' },
                                        { name: 'Express.js', version: '4.18', desc: 'Web Framework' },
                                        { name: 'MongoDB', version: 'Latest', desc: 'Database' },
                                        { name: 'JWT', version: '9.0', desc: 'Authentication' },
                                        { name: 'Helmet', version: '3.16', desc: 'Security' },
                                    ].map((tech, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                            <div>
                                                <span className="text-white font-medium">{tech.name}</span>
                                                <span className="text-slate-500 text-sm ml-2">{tech.desc}</span>
                                            </div>
                                            <span className="text-accent-cyan font-mono text-sm">{tech.version}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-accent-emerald" />
                                    Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Client-Side ML', desc: 'No image uploads' },
                                        { name: 'CORS', desc: 'Origin protection' },
                                        { name: 'Rate Limiting', desc: '10K req/hour' },
                                        { name: 'XSS Protection', desc: 'Input sanitization' },
                                        { name: 'Bcrypt', desc: 'Password hashing' },
                                    ].map((sec, idx) => (
                                        <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                                            <div className="w-2 h-2 rounded-full bg-accent-emerald" />
                                            <div>
                                                <span className="text-white font-medium">{sec.name}</span>
                                                <span className="text-slate-500 text-sm ml-2">— {sec.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Performance Metrics */}
            <section className="py-20 px-6 bg-slate-900/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Performance Metrics</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: '~9.3', unit: 'MB', label: 'Model 1 Size' },
                            { value: '~9.4', unit: 'MB', label: 'Model 2 Size' },
                            { value: '100-500', unit: 'ms', label: 'Inference Time' },
                            { value: '2-5', unit: 's', label: 'Cold Start' },
                        ].map((metric, idx) => (
                            <Card key={idx} className="text-center" hoverable>
                                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                                    {metric.value}<span className="text-lg text-slate-400">{metric.unit}</span>
                                </div>
                                <p className="text-slate-400 text-sm">{metric.label}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <Card className="text-center p-12 glow-border">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Analyze Your X-Ray?</h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            Get instant, AI-powered analysis with comprehensive PDF reports.
                            Your images never leave your device.
                        </p>
                        <Link to="/analysis">
                            <Button size="lg">
                                <Upload className="w-5 h-5 mr-2" />
                                Start Free Analysis
                            </Button>
                        </Link>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-800">
                <div className="container mx-auto text-center text-slate-500 text-sm">
                    <p>© 2026 Alveoli. AI-powered medical diagnostics for everyone.</p>
                    <p className="mt-2">
                        <span className="text-slate-600">Disclaimer:</span> This tool is for informational purposes only
                        and should not replace professional medical advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}

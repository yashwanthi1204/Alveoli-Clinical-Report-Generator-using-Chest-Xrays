import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className={`${sizes[size]} rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin`} />
                <div className={`absolute inset-0 ${sizes[size]} rounded-full border-4 border-transparent border-b-accent-cyan animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            {text && (
                <p className="text-slate-400 text-sm animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
}

interface ModelLoadingProps {
    xrayReady: boolean;
    classifierReady: boolean;
}

export function ModelLoading({ xrayReady, classifierReady }: ModelLoadingProps) {
    return (
        <div className="glass-card p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Loading AI Models</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    {xrayReady ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    )}
                    <span className={xrayReady ? 'text-green-400' : 'text-slate-400'}>
                        X-Ray Validator Model
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {classifierReady ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    )}
                    <span className={classifierReady ? 'text-green-400' : 'text-slate-400'}>
                        Disease Classifier Model
                    </span>
                </div>
            </div>
            <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-500"
                    style={{ width: `${(xrayReady ? 50 : 0) + (classifierReady ? 50 : 0)}%` }}
                />
            </div>
        </div>
    );
}

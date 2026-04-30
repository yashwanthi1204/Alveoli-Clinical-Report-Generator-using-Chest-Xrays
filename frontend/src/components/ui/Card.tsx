import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glowing?: boolean;
    hoverable?: boolean;
}

export function Card({ children, className = '', glowing = false, hoverable = false }: CardProps) {
    return (
        <div
            className={`
        glass-card 
        ${glowing ? 'glow-border' : ''} 
        ${hoverable ? 'card-hover' : ''} 
        ${className}
      `}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
    return (
        <h3 className={`text-xl font-bold text-white ${className}`}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return (
        <p className={`text-slate-400 text-sm mt-1 ${className}`}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

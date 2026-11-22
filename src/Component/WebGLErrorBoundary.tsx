import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn("WebGL / Three.js failed to initialize:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.fallbackUI();
        }

        return this.props.children;
    }

    private fallbackUI() {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-orange-950/20 to-black flex items-center justify-center">
                <div className="w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
            </div>
        );
    }
}


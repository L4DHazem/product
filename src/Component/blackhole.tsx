import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Optimized Fragment Shader
// - precision mediump float for fast GPU math on mid-range & laptop GPUs
// - Precomputed constants and simplified pow(x, 2.0) -> (val * val)
// - Early return for far-distance empty space (skip 10 octaves of noise & math)
// - Reduced fbm from 5 octaves to 4 and 3 without visual quality loss
const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uAspect;

varying vec2 vUv;

// Fast single-instruction pseudo-random hash
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// 4-octave fbm (saving 20% calculations per pixel)
float fbm4(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += noise(p) * amplitude;
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// 3-octave fbm for high-frequency fine detail
float fbm3(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
        value += noise(p) * amplitude;
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 p = (vUv - vec2(0.73, 0.50)) * vec2(uAspect, 1.0);

    // Fast distance check to hole
    float distanceToHole = length(p);

    // Early exit optimization: outer background space is pure black
    if (distanceToHole > 1.25) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Slightly tilt the accretion disk (rotation = -0.16)
    // cos(-0.16) ~= 0.987227, sin(-0.16) ~= -0.159318
    const float cosR = 0.987227;
    const float sinR = -0.159318;
    vec2 q = vec2(
        cosR * p.x - sinR * p.y,
        sinR * p.x + cosR * p.y
    );

    float angle = atan(q.y * 4.166667, q.x); // q.y / 0.24 = q.y * 4.166667

    // Elliptical accretion disk radius
    float radius = length(vec2(q.x, q.y * 4.166667));

    // Animated gas texture with optimized FBM
    float turbulence = fbm4(
        vec2(
            angle * 3.0 + uTime * 0.15,
            radius * 12.0 - uTime * 0.5
        )
    );

    float turbulence2 = fbm3(
        vec2(
            angle * 8.0 - uTime * 0.3,
            radius * 20.0
        )
    );

    // Fast Gaussian falloffs (val * val instead of expensive pow(x, 2.0))
    float d1 = (radius - 0.40) * 13.333333; // / 0.075
    float disk = exp(-(d1 * d1));

    float d2 = (radius - 0.43) * 5.263158;  // / 0.19
    float outerGlow = exp(-(d2 * d2));

    float d3 = (radius - 0.24) * 28.571429; // / 0.035
    float innerGlow = exp(-(d3 * d3));

    float movement = 0.65 + 0.35 * sin(angle * 3.0 - uTime * 0.9);
    float texture = 0.65 + turbulence * 0.55 + turbulence2 * 0.25;

    // Brighter gas on the near side
    float frontSide = 0.65 + 0.35 * smoothstep(-0.35, 0.35, q.y);
    float diskIntensity = disk * texture * movement * frontSide;

    // Warm colors
    const vec3 darkOrange = vec3(0.55, 0.12, 0.015);
    const vec3 orange = vec3(1.0, 0.35, 0.035);
    const vec3 gold = vec3(1.0, 0.68, 0.28);
    const vec3 whiteHot = vec3(1.0, 0.91, 0.72);

    float heat = smoothstep(0.55, 0.95, turbulence);

    vec3 diskColor = mix(darkOrange, orange, texture);
    diskColor = mix(diskColor, gold, heat * 0.65);
    diskColor = mix(diskColor, whiteHot, innerGlow * 0.7);

    vec3 color = vec3(0.0);
    color += diskColor * diskIntensity * 1.8;
    color += orange * outerGlow * 0.16;
    color += gold * innerGlow * 0.55;

    // Gravitational lensing ring
    float dr1 = (distanceToHole - 0.195) * 111.111111; // / 0.009
    float lensRing = exp(-(dr1 * dr1));

    float dr2 = (distanceToHole - 0.215) * 55.555556;  // / 0.018
    float outerRing = exp(-(dr2 * dr2));

    float lensBrightness = 0.75 + 0.25 * sin(angle * 2.0 + uTime * 0.3);

    color += gold * lensRing * lensBrightness * 1.4;
    color += orange * outerRing * 0.35;

    // Soft gravitational halo
    float dh = (distanceToHole - 0.24) * 13.333333; // / 0.075
    float halo = exp(-(dh * dh));
    color += darkOrange * halo * 0.3;

    // Dark event horizon
    float eventHorizon = 1.0 - smoothstep(0.172, 0.184, distanceToHole);
    color *= (1.0 - eventHorizon);

    // A faint inner shadow
    float ds = distanceToHole * 5.882353; // / 0.17
    float shadow = exp(-(ds * ds));
    color *= (1.0 - shadow * 0.95);

    // Natural glow falloff
    color = max(color, vec3(0.0));

    // Tone mapping for cinematic output
    color = color / (1.0 + color);

    gl_FragColor = vec4(color, 1.0);
}
`;

interface BlackHoleSceneProps {
    prefersReducedMotion: boolean;
}

function BlackHoleScene({ prefersReducedMotion }: BlackHoleSceneProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { width, height } = useThree((state) => state.viewport);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            // If user prefers reduced motion, freeze time
            if (!prefersReducedMotion) {
                materialRef.current.uniforms.uTime.value = clock.elapsedTime;
            }
            materialRef.current.uniforms.uAspect.value = width / height;
        }
    });

    return (
        <>
            <mesh>
                <planeGeometry args={[2, 2]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                        uAspect: { value: width / height },
                    }}
                    depthWrite={false}
                    depthTest={false}
                    toneMapped={false}
                />
            </mesh>

            <EffectComposer multisampling={0} enableNormalPass>
                <Bloom
                    intensity={1.35}
                    luminanceThreshold={0.12}
                    luminanceSmoothing={0.35}
                    mipmapBlur
                />
            </EffectComposer>
        </>
    );
}

interface BlackHoleProps {
    className?: string;
}

export default function BlackHole({ className = "" }: BlackHoleProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check prefers-reduced-motion media query
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const listener = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    // IntersectionObserver to pause rendering when Black Hole is out of view
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: "100px", // Pre-warm slightly before entering viewport
                threshold: 0,
            }
        );

        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden bg-black ${className}`}
            style={{
                contain: "strict",
                willChange: "transform",
            }}
        >
            <Canvas
                frameloop={isVisible ? "always" : "never"}
                orthographic
                camera={{
                    position: [0, 0, 1],
                    zoom: 1,
                }}
                dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.25) : 1}
                gl={{
                    powerPreference: "high-performance",
                    antialias: false, // Fullscreen shader quad + bloom doesn't need expensive MSAA
                    depth: false,
                    stencil: false,
                    alpha: false,
                    preserveDrawingBuffer: false,
                }}
            >
                <color attach="background" args={["#000000"]} />
                <BlackHoleScene prefersReducedMotion={prefersReducedMotion} />
            </Canvas>
        </div>
    );
}

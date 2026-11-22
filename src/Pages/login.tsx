import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../supabaseClient";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";

const schema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email"),

    password: z
        .string()
        .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof schema>;

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields, isSubmitted },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(schema),
        mode: "onBlur",
        reValidateMode: "onBlur",
    });

    function showError(fieldName: keyof LoginFormData) {
        return Boolean(
            errors[fieldName] && (touchedFields[fieldName] || isSubmitted)
        );
    }

    async function handleLogin(userData: LoginFormData) {
        setIsLoading(true);
        setApiError("");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: userData.email,
                password: userData.password,
            });

            if (error) {
                setApiError(error.message || "Invalid email or password");
                return;
            }

            alert("Login Successful!");
            navigate("/");
        } catch (error: any) {
            setApiError(
                error.message || "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-slate-700/60 bg-[#080e20]/80 px-4 py-3 text-slate-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15";

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#050916] px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
            {/* Ambient cosmic lighting */}
            <div className="pointer-events-none absolute -left-40 top-36 h-[28rem] w-[28rem] rounded-full bg-indigo-700/20 blur-[120px]" />
            <div className="pointer-events-none absolute -right-40 bottom-[-8rem] h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-[130px]" />
            <div className="pointer-events-none absolute left-[42%] top-[28%] h-72 w-72 rounded-full bg-blue-900/10 blur-[100px]" />

            {/* Star field */}
            <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true">
                <span className="absolute left-[8.5%] top-[27%] h-1 w-1 rounded-full bg-cyan-300" />
                <span className="absolute left-[19%] top-[6.5%] h-0.5 w-0.5 rounded-full bg-slate-300" />
                <span className="absolute left-[31%] top-[28%] h-1 w-1 rounded-full bg-slate-400" />
                <span className="absolute left-[39%] top-[7%] h-0.5 w-0.5 rounded-full bg-cyan-200" />
                <span className="absolute left-[45%] top-[70%] h-1 w-1 rounded-full bg-slate-300" />
                <span className="absolute left-[57%] top-[7%] h-0.5 w-0.5 rounded-full bg-slate-300" />
                <span className="absolute left-[68%] top-[28%] h-1 w-1 rounded-full bg-cyan-200" />
                <span className="absolute left-[76%] top-[7%] h-0.5 w-0.5 rounded-full bg-slate-300" />
                <span className="absolute left-[88%] top-[41%] h-1 w-1 rounded-full bg-cyan-300" />
                <span className="absolute left-[95%] top-[8%] h-0.5 w-0.5 rounded-full bg-slate-300" />
                <span className="absolute left-[12%] top-[76%] h-0.5 w-0.5 rounded-full bg-cyan-300" />
                <span className="absolute left-[59%] top-[82%] h-1 w-1 rounded-full bg-slate-400" />
            </div>

            {/* Top navigation */}
            <header className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600/70 bg-slate-800/80 text-cyan-200 shadow-lg shadow-cyan-950/30">
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
                            <path d="M12 3.5 13.6 9l5.4 1.7-5.4 1.6-1.6 5.5-1.7-5.5L5 10.7 10.3 9 12 3.5Z" />
                            <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold tracking-[0.28em] text-slate-100">ASTRA</span>
                </div>
                <span className="text-[9px] font-medium tracking-[0.32em] text-slate-500">SECURE ACCESS / 01</span>
            </header>

            <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[1035px] items-center gap-12 py-12 lg:grid-cols-[1fr_378px] lg:gap-20 lg:py-8">
                {/* Hero copy */}
                <div className="max-w-[510px] lg:-mt-2">
                    <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-300">
                        A quiet place to begin
                    </p>

                    <h1 className="max-w-[500px] text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[54px]">
                        Find your way
                        <br className="hidden sm:block" /> back to the stars.
                    </h1>

                    <p className="mt-6 max-w-[390px] text-[13px] leading-7 text-slate-400">
                        Your personal space for ideas, plans, and everything worth
                        carrying into the next orbit.
                    </p>

                    <div className="mt-12 flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="h-px w-9 bg-cyan-300/60" />
                        <span>North star protocol active</span>
                    </div>
                </div>

                {/* Login card */}
                <form
                    onSubmit={handleSubmit(handleLogin)}
                    noValidate
                    className="w-full rounded-[28px] border border-slate-700/80 bg-gradient-to-b from-[#101a32]/95 to-[#080f20]/95 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-9"
                >
                    <div className="mb-5 flex h-[43px] w-[43px] items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-200 shadow-inner shadow-cyan-100/5">
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
                            <rect x="5" y="10" width="14" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            <path d="M12 14v2" />
                        </svg>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/70">
                        Welcome back
                    </p>

                    <h2 className="mt-3 text-[27px] font-semibold tracking-[-0.04em] text-white">
                        Sign in to Astra
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        Continue your journey across the cosmos.
                    </p>

                    {apiError && (
                        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-xs font-medium text-red-200">
                            {apiError}
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-5">
                        <TextField
                            isInvalid={showError("email")}
                            className="flex flex-col gap-2"
                        >
                            <Label className="text-xs font-medium text-slate-300">
                                Email address
                            </Label>

                            <Input
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className={inputClass}
                            />

                            <FieldError className="text-xs font-medium text-red-300">
                                {errors.email?.message}
                            </FieldError>
                        </TextField>

                        <TextField
                            isInvalid={showError("password")}
                            className="flex flex-col gap-2"
                        >
                            <Label className="text-xs font-medium text-slate-300">
                                Password
                            </Label>

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password")}
                                    className={`${inputClass} pr-12`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-200"
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
                                            <path d="m3 3 18 18" />
                                            <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                                            <path d="M9.9 5.2A11 11 0 0 1 12 5c5.5 0 9 7 9 7a17 17 0 0 1-3.1 3.8M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7c1 0 1.9-.2 2.7-.5" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
                                            <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
                                            <circle cx="12" cy="12" r="2.5" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <FieldError className="text-xs font-medium text-red-300">
                                {errors.password?.message}
                            </FieldError>
                        </TextField>
                    </div>

                    <Button
                        type="submit"
                        isDisabled={isLoading}
                        className="mt-7 min-h-[45px] w-full rounded-xl bg-gradient-to-r from-cyan-300 to-cyan-200 text-xs font-bold text-[#071326] shadow-[0_10px_30px_rgba(34,211,238,0.12)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="flex items-center justify-center gap-3">
                            {isLoading ? "Entering..." : "Enter your orbit"}
                            {!isLoading && (
                                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            )}
                        </span>
                    </Button>

                    <div className="mt-7 border-t border-slate-700/60 pt-5 text-center">
                        <p className="text-xs text-slate-500">
                            New to Astra?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-cyan-200 transition hover:text-cyan-100"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </form>
            </section>
        </main>
    );
}

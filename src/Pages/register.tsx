import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../supabaseClient";
import { Button, FieldError, Input, Label, ListBox, Select, TextField } from "@heroui/react";

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d ]).{8,15}$/;

const schema = z
    .object({
        name: z
            .string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(20, "Name must be at most 20 characters")
            .regex(/^[A-Za-z ]+$/, "Name can contain letters and spaces only"),

        email: z
            .string()
            .trim()
            .email("Please enter a valid email"),

        password: z
            .string()
            .regex(
                passwordRegex,
                "Password must contain uppercase, lowercase, number, symbol, and be 8-15 characters"
            ),

        rePassword: z
            .string()
            .min(1, "Please confirm your password"),

        dateOfBirth: z
            .string()
            .min(1, "Date of birth is required")
            .refine((dob) => {
                const date = new Date(dob);
                if (isNaN(date.getTime())) return false;

                const today = new Date();
                let age = today.getFullYear() - date.getFullYear();
                const monthDiff = today.getMonth() - date.getMonth();

                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < date.getDate())
                ) {
                    age -= 1;
                }

                return age >= 18;
            }, "User must be at least 18 years old"),

        gender: z
            .string()
            .trim()
            .min(1, "Gender is required"),
    })
    .refine((data) => data.password === data.rePassword, {
        path: ["rePassword"],
        message: "Password and Confirm Password do not match",
    });

type RegisterFormData = z.infer<typeof schema>;

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, touchedFields, isSubmitted },
    } = useForm<RegisterFormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            rePassword: "",
            dateOfBirth: "",
            gender: "",
        },
        resolver: zodResolver(schema),
        mode: "onBlur",
        reValidateMode: "onBlur",
    });

    function showError(fieldName: keyof RegisterFormData) {
        return Boolean(
            errors[fieldName] && (touchedFields[fieldName] || isSubmitted)
        );
    }

    async function signup(userData: RegisterFormData) {
        setIsLoading(true);
        setApiError("");

        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        display_name: userData.name,
                        date_of_birth: userData.dateOfBirth,
                        gender: userData.gender,
                    },
                },
            });

            if (error) {
                setApiError(error.message);
                return;
            }

            alert(
                "Registration successful! Please check your email to verify your account or proceed to login."
            );

            navigate("/login");
        } catch (err: any) {
            setApiError(
                err.message || "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

    const inputClass =
        "w-full min-h-[44px] rounded-xl border border-indigo-300/25 bg-[#080b1b] px-4 py-3 text-sm text-slate-100 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080b18] px-4 py-8 text-slate-100 sm:py-10">
            {/* Ambient background lighting and decorative stars */}
            <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-violet-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -right-24 top-[34%] h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-[-180px] left-[30%] h-96 w-96 rounded-full bg-violet-700/20 blur-[110px]" />
            <span className="pointer-events-none absolute left-[8%] top-[5.5%] h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="pointer-events-none absolute right-[12%] top-[7%] h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="pointer-events-none absolute left-[18%] top-[25%] h-1 w-1 rounded-full bg-white" />
            <span className="pointer-events-none absolute right-[23%] top-[42%] h-1 w-1 rounded-full bg-white" />
            <span className="pointer-events-none absolute bottom-[7%] left-[13%] h-1 w-1 rounded-full bg-cyan-400" />

            <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
                <form
                    onSubmit={handleSubmit(signup)}
                    noValidate
                    className="w-full max-w-[632px] overflow-hidden rounded-xl border border-indigo-400/30 bg-[#101329]/95 shadow-2xl shadow-black/40"
                >
                    {/* Header */}
                    <div className="border-b border-indigo-300/20 bg-gradient-to-br from-[#11152c] via-[#151832] to-[#242044] px-6 py-7 sm:px-[38px] sm:py-[30px]">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-950/30">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                >
                                    <path d="M9 7.5a4.5 4.5 0 1 0 0 9h2.2a2.3 2.3 0 1 0 0-4.6H10" />
                                    <path d="M15 16.5a4.5 4.5 0 1 0 0-9h-2.2a2.3 2.3 0 1 0 0 4.6H14" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                                    ShopFlow
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Your cart, in a new universe
                                </p>
                            </div>
                        </div>

                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                                <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
                                <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
                            </svg>
                            Account Access
                        </div>
                        <h1 className="max-w-lg text-[30px] font-bold leading-[1.22] tracking-tight text-slate-100 sm:text-[32px]">
                            Create your
                            <br />
                            ShopFlow account
                        </h1>
                        <p className="mt-3 max-w-[480px] text-sm leading-[1.65] text-slate-400">
                            Start shopping across a universe of finds with an account that keeps every order close at hand.
                        </p>
                    </div>

                    <div className="px-6 py-7 sm:px-[38px] sm:py-[37px]">
                        {apiError && (
                            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-950/50 p-4 text-sm font-medium text-red-200">
                                {apiError}
                            </div>
                        )}

                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] px-4 py-4 text-xs leading-5 text-slate-300">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden="true">
                                <path d="M12 3 5 6v5c0 4.5 2.8 8.1 7 10 4.2-1.9 7-5.5 7-10V6l-7-3Z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span>
                                Your details help us secure your account and tailor your ShopFlow experience.
                            </span>
                        </div>

                        <div className="flex flex-col gap-5">
                            <TextField isInvalid={showError("name")} className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-slate-200">Name</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter your name"
                                    {...register("name")}
                                    className={inputClass}
                                />
                                <FieldError className="text-xs font-medium text-red-300">
                                    {errors.name?.message}
                                </FieldError>
                            </TextField>

                            <TextField isInvalid={showError("email")} className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-slate-200">Email</Label>
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

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <TextField isInvalid={showError("password")} className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold text-slate-200">Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create password"
                                            {...register("password")}
                                            className={`${inputClass} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-400"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]" aria-hidden="true">
                                                {showPassword ? (
                                                    <>
                                                        <path d="m3 3 18 18" />
                                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.2 0 9.5 7 9.5 7a16 16 0 0 1-2.3 3.1M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.3 7 9.5 7c1.1 0 2.1-.2 3-.6" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
                                                        <circle cx="12" cy="12" r="2.5" />
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                    <FieldError className="text-xs font-medium text-red-300">
                                        {errors.password?.message}
                                    </FieldError>
                                </TextField>

                                <TextField isInvalid={showError("rePassword")} className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold text-slate-200">Confirm password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm password"
                                            {...register("rePassword")}
                                            className={`${inputClass} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((value) => !value)}
                                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-400"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]" aria-hidden="true">
                                                {showConfirmPassword ? (
                                                    <>
                                                        <path d="m3 3 18 18" />
                                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.2 0 9.5 7 9.5 7a16 16 0 0 1-2.3 3.1M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.3 7 9.5 7c1.1 0 2.1-.2 3-.6" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
                                                        <circle cx="12" cy="12" r="2.5" />
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                    <FieldError className="text-xs font-medium text-red-300">
                                        {errors.rePassword?.message}
                                    </FieldError>
                                </TextField>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <TextField isInvalid={showError("dateOfBirth")} className="flex flex-col gap-2">
                                    <Label className="text-sm font-semibold text-slate-200">Date of birth</Label>
                                    <Input
                                        type="date"
                                        {...register("dateOfBirth")}
                                        className={inputClass}
                                    />
                                    <FieldError className="text-xs font-medium text-red-300">
                                        {errors.dateOfBirth?.message}
                                    </FieldError>
                                </TextField>

                                <Select
                                    placeholder="Select your gender"
                                    isInvalid={showError("gender")}
                                    selectedKey={watch("gender") || null}
                                    onSelectionChange={(key) =>
                                        setValue("gender", String(key), {
                                            shouldValidate: true,
                                            shouldTouch: true,
                                        })
                                    }
                                    className="flex flex-col gap-2"
                                >
                                    <Label className="text-sm font-semibold text-slate-200">Gender</Label>
                                    <Select.Trigger className="min-h-[44px] rounded-xl border border-indigo-300/25 bg-[#080b1b] px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20">
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover className="rounded-xl border border-indigo-300/25 bg-[#151932] text-slate-100 shadow-xl shadow-black/50">
                                        <ListBox>
                                            <ListBox.Item id="male" textValue="Male" className="cursor-pointer px-4 py-3 text-sm text-slate-100 outline-none hover:bg-cyan-400/10">
                                                Male
                                            </ListBox.Item>
                                            <ListBox.Item id="female" textValue="Female" className="cursor-pointer px-4 py-3 text-sm text-slate-100 outline-none hover:bg-cyan-400/10">
                                                Female
                                            </ListBox.Item>
                                        </ListBox>
                                    </Select.Popover>
                                    <FieldError className="text-xs font-medium text-red-300">
                                        {errors.gender?.message}
                                    </FieldError>
                                </Select>
                            </div>

                            <p className="flex items-center gap-2 rounded-xl bg-[#171a35]/70 px-4 py-3 text-xs leading-5 text-slate-400">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true">
                                    <circle cx="8" cy="15" r="4" />
                                    <path d="m11 12 8-8 3 3-8 8M17 6l2 2" />
                                </svg>
                                Password must contain uppercase, lowercase, a number, a symbol, and be 8–15 characters.
                            </p>

                            <Button
                                type="submit"
                                isDisabled={isLoading}
                                className="mt-1 flex min-h-[46px] w-full items-center justify-center gap-3 rounded-xl bg-[#42c9ed] text-base font-bold text-[#061321] shadow-lg shadow-cyan-950/30 transition hover:bg-[#60d8f5] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? "Signing up..." : "Create my account"}
                                {!isLoading && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                                        <path d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                )}
                            </Button>

                            <div className="mt-0.5 flex items-center justify-center gap-1 text-sm text-slate-400">
                                <span>Already have an account?</span>
                                <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
                                    Sign in
                                </Link>
                            </div>

                            <p className="text-center text-xs leading-5 text-slate-400">
                                By registering, you confirm that you are at least 18 years old and agree to receive account verification by email.
                            </p>
                        </div>
                    </div>
                </form>

                <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-violet-400" aria-hidden="true">
                        <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
                        <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
                    </svg>
                    Secure account creation, wherever your shopping takes you.
                </p>
            </div>
        </div>
    );
}

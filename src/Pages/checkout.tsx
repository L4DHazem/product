import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Navbar from "../Component/navbar";
import { ShoppingCart, ArrowLeft, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { Button, Card, CardContent, Input, Label, TextField } from "@heroui/react";

interface ProductItem {
    id: string | number;
    name: string;
    price: number;
    description?: string | null;
    image_url?: string | null;
}

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const productId = searchParams.get("productId");

    const [user, setUser] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    // Form fields for shipping and checkout
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");

    useEffect(() => {
        // 1. Get current logged-in user
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.display_name || "");
            }
        });

        // 2. If a specific product ID is in query params, fetch its details
        if (productId) {
            supabase
                .from("Product")
                .select("*")
                .eq("id", productId)
                .single()
                .then(({ data, error }) => {
                    if (data && !error) {
                        setSelectedProduct(data);
                    }
                });
        }
    }, [productId]);

    async function handleCheckout(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!fullName.trim() || !address.trim() || !city.trim()) {
            setError("Please fill in all required shipping details.");
            return;
        }

        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in to complete checkout.");
                setIsLoading(false);
                return;
            }

            // When purchasing this product, remove it from the market so it is no longer available
            if (productId) {
                const { error: deleteError } = await supabase
                    .from("Product")
                    .delete()
                    .eq("id", productId);

                if (deleteError) {
                    console.error("Error updating inventory:", deleteError);
                }
            }

            setIsSuccess(true);
        } catch (err: any) {
            console.error("Checkout error:", err);
            setError(err.message || "An error occurred during checkout. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const inputClasses =
        "w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition";

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-8 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Storefront
                </button>

                {isSuccess ? (
                    <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-2xl">
                        <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-light tracking-tight text-white mb-3">
                            Order Confirmed!
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Thank you for your purchase. We have sent a confirmation email to{" "}
                            <span className="text-white font-medium">{user?.email}</span>.
                        </p>
                        <Button
                            onPress={() => navigate("/")}
                            className="w-full rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors py-3"
                        >
                            Return to Storefront
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* Shipping Form */}
                        <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <CreditCard className="w-5 h-5 text-orange-400" />
                                <h2 className="text-2xl font-light">Shipping & Payment</h2>
                            </div>

                            <form onSubmit={handleCheckout} className="flex flex-col gap-5">
                                <TextField isRequired className="flex flex-col gap-2">
                                    <Label className="text-xs text-gray-300 font-medium">Full Name</Label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={inputClasses}
                                    />
                                </TextField>

                                <TextField isRequired className="flex flex-col gap-2">
                                    <Label className="text-xs text-gray-300 font-medium">Street Address</Label>
                                    <Input
                                        type="text"
                                        placeholder="123 Cosmic Way"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={inputClasses}
                                    />
                                </TextField>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextField isRequired className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-300 font-medium">City</Label>
                                        <Input
                                            type="text"
                                            placeholder="San Francisco"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </TextField>

                                    <TextField className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-300 font-medium">Postal Code</Label>
                                        <Input
                                            type="text"
                                            placeholder="94103"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </TextField>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full mt-4 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors py-3.5 cursor-pointer text-sm"
                                    isDisabled={isLoading}
                                >
                                    {isLoading ? "Processing Order..." : "Confirm & Pay Now"}
                                </Button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col gap-5 sticky top-24">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-orange-400" />
                                <h3 className="text-lg font-light">Order Summary</h3>
                            </div>

                            {selectedProduct ? (
                                <div className="flex flex-col gap-4 border-t border-b border-white/10 py-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                                            {selectedProduct.image_url ? (
                                                <img
                                                    src={selectedProduct.image_url}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-gray-500">No Image</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-white truncate">
                                                {selectedProduct.name}
                                            </h4>
                                            <p className="text-xs text-orange-400 font-semibold mt-0.5">
                                                ${typeof selectedProduct.price === "number" ? selectedProduct.price.toFixed(2) : Number(selectedProduct.price || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-b border-white/10 py-5 text-gray-500 text-xs text-center">
                                    No item selected. You can select items directly from the storefront.
                                </div>
                            )}

                            <div className="flex flex-col gap-2.5 text-xs">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-medium">
                                        ${selectedProduct ? Number(selectedProduct.price).toFixed(2) : "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-400 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold text-white border-t border-white/10 pt-3">
                                    <span>Total</span>
                                    <span className="text-orange-400">
                                        ${selectedProduct ? Number(selectedProduct.price).toFixed(2) : "0.00"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-black/40 p-3 rounded-xl border border-white/5 mt-2">
                                <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>Encrypted 256-bit secure checkout</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

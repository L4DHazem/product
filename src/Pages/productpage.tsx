import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Navbar from "../Component/navbar";
import BlackHole from "../Component/blackhole";
import { WebGLErrorBoundary } from "../Component/WebGLErrorBoundary";

import {
    Button,
    Card,
    CardContent,
    Input,
    Label,
    TextArea,
    TextField,
} from "@heroui/react";

interface ProductItem {
    id: string | number;
    name: string;
    price: number;
    description?: string | null;
    image_url?: string | null;
    user_id?: string | null;
    created_at?: string;
}

export default function Productpage() {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // ================= AUTH & INITIAL DATA =================

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (isMounted) {
                setUser(user);
            }
        });

        fetchProducts();

        // Listen for realtime product changes (such as when an item is bought/deleted)
        const productChannel = supabase
            .channel("realtime-products")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "Product" },
                () => {
                    fetchProducts();
                }
            )
            .subscribe();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setUser(session?.user || null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            supabase.removeChannel(productChannel);
        };
    }, []);

    // ================= FETCH PRODUCTS =================

    async function fetchProducts() {
        try {
            const { data, error } = await supabase
                .from("Product")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Fetch products error:", error);
                setError(error.message);
            } else if (data) {
                setProducts(data);
            }
        } catch (err: any) {
            console.error("Fetch products exception:", err);
            setError(err.message || "Failed to fetch products");
        }
    }

    // ================= UPLOAD IMAGE =================

    async function uploadProductImage(file: File) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("productimage")
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from("productimage")
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    // ================= CREATE PRODUCT =================

    async function createProduct(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!name.trim() || !price.trim()) {
            setError("Product name and price are required.");
            return;
        }

        setIsLoading(true);

        try {
            let uploadedImageUrl: string | null = null;

            if (imageFile) {
                try {
                    uploadedImageUrl = await uploadProductImage(imageFile);
                } catch (imgErr: any) {
                    console.error("Storage upload error:", imgErr);
                    setError(
                        `Image upload error: ${imgErr.message ||
                        "Failed to upload image. Please verify bucket upload policies in Supabase Storage."
                        }`
                    );
                    setIsLoading(false);
                    return;
                }
            }

            const { error: insertError } = await supabase
                .from("Product")
                .insert([
                    {
                        name: name.trim(),
                        price: parseFloat(price),
                        description: description.trim() || null,
                        image_url: uploadedImageUrl,
                        user_id: user?.id ?? null,
                    },
                ]);

            if (insertError) {
                console.error("Error creating product:", insertError);
                setError(`Database insert error: ${insertError.message}`);
            } else {
                setName("");
                setPrice("");
                setDescription("");
                setImageFile(null);

                const fileInput = document.getElementById(
                    "productImageInput"
                ) as HTMLInputElement | null;

                if (fileInput) {
                    fileInput.value = "";
                }

                await fetchProducts();
            }
        } catch (err: any) {
            console.error("Unexpected error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    // ================= LOGOUT =================

    async function handleLogout() {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
        } finally {
            setUser(null);
            navigate("/login", { replace: true });
        }
    }

    // ================= HERO BUTTONS =================

    function handleGetStarted() {
        if (!user) {
            navigate("/login");
            return;
        }

        document.getElementById("add-product")?.scrollIntoView({
            behavior: "smooth",
        });
    }

    function scrollToProducts() {
        document.getElementById("products")?.scrollIntoView({
            behavior: "smooth",
        });
    }

    const inputClasses =
        "w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition";

    // ================= UI =================

    return (
        <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-black">
            <Navbar />

            {/* ================= HERO SECTION ================= */}
            <section className="relative min-h-[720px] h-[calc(100vh-64px)] overflow-hidden bg-black flex items-center">
                {/* 3D Black Hole with Error Boundary Fallback */}
                <WebGLErrorBoundary>
                    <BlackHole className="z-0 pointer-events-none" />
                </WebGLErrorBoundary>

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-black via-transparent to-black/30" />

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20">
                    <div className="max-w-[560px]">
                        <p className="text-orange-400 text-xs tracking-[0.4em] uppercase mb-6 font-semibold">
                            Explore the universe
                        </p>

                        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-light leading-[1.08] tracking-[-3px]">
                            Light does not
                            <br />
                            leave here
                        </h1>

                        <p className="mt-8 max-w-[480px] text-gray-400 text-sm md:text-base leading-8">
                            The ring above the shadow is the far side of the disc, bent over the top.
                            Nothing put it there but gravity.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-10">
                            <button
                                type="button"
                                onClick={handleGetStarted}
                                className="cursor-pointer rounded-full bg-white text-black px-8 py-4 text-sm font-semibold hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
                            >
                                Get started
                            </button>

                            <button
                                type="button"
                                onClick={scrollToProducts}
                                className="cursor-pointer rounded-full border border-white/25 px-8 py-4 text-sm text-white hover:bg-white/10 transition-all"
                            >
                                Explore products
                            </button>
                        </div>

                        {/* User Status */}
                        {user && (
                            <div className="mt-8 flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-gray-400">
                                    Logged in as <strong className="text-gray-200">{user.email}</strong>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="cursor-pointer text-xs text-orange-400 hover:text-orange-300 underline ml-1"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom smooth fade to next section */}
                <div className="absolute bottom-0 left-0 w-full h-32 z-[2] bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </section>

            {/* ================= INTRO SECTION ================= */}
            <section
                id="maths"
                className="bg-black px-6 md:px-16 py-24 border-t border-white/5"
            >
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-orange-400 text-xs tracking-[0.35em] uppercase mb-5 font-semibold">
                        Discover the collection
                    </p>

                    <h2 className="text-3xl md:text-5xl font-light tracking-tight">
                        Beyond the ordinary.
                    </h2>

                    <p className="mt-6 text-gray-400 max-w-2xl mx-auto leading-8 text-sm md:text-base">
                        Explore our collection of products and discover something made for you.
                        Browse the storefront or share your own products with the community.
                    </p>
                </div>
            </section>

            {/* ================= STORE SECTION ================= */}
            <section
                id="products"
                className="bg-[#080808] px-6 md:px-16 py-20 border-t border-white/5"
            >
                <div className="max-w-7xl mx-auto">
                    {/* Store Heading */}
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-5 mb-12 border-b border-white/10 pb-8">
                        <div>
                            <p className="text-orange-400 text-xs tracking-[0.3em] uppercase mb-4 font-semibold">
                                Our collection
                            </p>

                            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                                Storefront
                            </h2>

                            <p className="text-gray-400 text-sm mt-4">
                                Browse our collection or list your items.
                            </p>
                        </div>

                        <span className="text-sm text-gray-400 font-medium">
                            {products.length} {products.length === 1 ? "Product" : "Products"} available
                        </span>
                    </div>

                    {/* Form and Products Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* ================= PRODUCT FORM ================= */}
                        <div id="add-product" className="lg:col-span-1 sticky top-24">
                            {user ? (
                                <form
                                    onSubmit={createProduct}
                                    className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col gap-5 shadow-2xl"
                                >
                                    <div className="mb-2">
                                        <p className="text-orange-400 text-xs tracking-[0.25em] uppercase font-semibold">
                                            Vendor dashboard
                                        </p>

                                        <h3 className="text-2xl font-light mt-2 text-white">
                                            Add New Product
                                        </h3>

                                        <p className="text-gray-400 text-xs mt-1">
                                            Share your product with the world.
                                        </p>
                                    </div>

                                    <TextField isRequired className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-300 font-medium">
                                            Product Name
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Wireless Headphones"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </TextField>

                                    <TextField isRequired className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-300 font-medium">
                                            Price (USD)
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </TextField>

                                    <TextField className="flex flex-col gap-2">
                                        <Label className="text-xs text-gray-300 font-medium">
                                            Description
                                        </Label>
                                        <TextArea
                                            placeholder="Enter product details..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </TextField>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-gray-300 font-medium">
                                            Product Image
                                        </label>
                                        <input
                                            id="productImageInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setImageFile(e.target.files?.[0] || null)
                                            }
                                            className="w-full text-xs text-gray-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-orange-500/10 file:text-orange-400 file:font-semibold hover:file:bg-orange-500/20 cursor-pointer"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs leading-5">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full mt-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors py-3"
                                        isDisabled={isLoading}
                                    >
                                        {isLoading ? "Saving Product..." : "List Product"}
                                    </Button>
                                </form>
                            ) : (
                                <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 text-center shadow-xl">
                                    <div className="w-14 h-14 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center mb-5">
                                        <span className="text-2xl text-orange-400">✦</span>
                                    </div>

                                    <h3 className="text-xl font-light text-white">
                                        Want to sell something?
                                    </h3>

                                    <p className="text-gray-400 text-sm leading-7 mt-3">
                                        Register an account as a vendor to list your products and track store statistics.
                                    </p>

                                    <Button
                                        onPress={() => navigate("/login")}
                                        className="w-full mt-6 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors py-3"
                                    >
                                        Sign In as Vendor
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* ================= PRODUCTS GRID ================= */}
                        <div className="lg:col-span-2">
                            {error && !user && (
                                <div className="p-4 mb-6 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            {products.length === 0 ? (
                                <div className="min-h-[350px] bg-[#111111] border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                                    <div className="text-5xl mb-5 text-gray-600">◈</div>
                                    <h3 className="text-xl font-light text-white">
                                        No products available
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-3">
                                        There are no products in the market yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {products.map((item) => (
                                        <Card
                                            key={item.id}
                                            className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-none hover:border-orange-500/40 transition-all duration-300"
                                        >
                                            <div className="w-full h-52 bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                    />
                                                ) : (
                                                    <span className="text-gray-600 text-xs font-medium">
                                                        No Image Available
                                                    </span>
                                                )}
                                            </div>

                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start gap-3">
                                                    <h3 className="font-medium text-white text-base truncate flex-1">
                                                        {item.name}
                                                    </h3>
                                                    <span className="text-orange-400 font-semibold whitespace-nowrap">
                                                        $
                                                        {typeof item.price === "number"
                                                            ? item.price.toFixed(2)
                                                            : Number(item.price || 0).toFixed(2)}
                                                    </span>
                                                </div>

                                                <p className="text-gray-400 text-xs leading-6 mt-3 line-clamp-2">
                                                    {item.description || "No product description provided."}
                                                </p>

                                                <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        Available now
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/checkout?productId=${item.id}`)}
                                                        className="cursor-pointer text-xs font-medium text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 transition-colors"
                                                    >
                                                        Buy Now &rarr;
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-black border-t border-white/10 px-6 py-8 text-center">
                <p className="text-gray-500 text-xs tracking-widest uppercase">
                    ShopFlow Marketplace — Explore Beyond The Ordinary
                </p>
            </footer>
        </div>
    );
}

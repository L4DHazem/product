import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { ShoppingBag, ShoppingCart, LogIn, LogOut, User as UserIcon, PlusCircle } from "lucide-react";
import { Button } from "@heroui/react";

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fetch current authenticated user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Listen for authentication changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function handleLogout() {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            navigate("/login", { replace: true });
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand / Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white leading-none">
                            Shop<span className="text-blue-600">Flow</span>
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">Marketplace</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden sm:flex items-center gap-1 md:gap-2">
                    <Link
                        to="/"
                        className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800/60"
                    >
                        Storefront
                    </Link>
                    <Link
                        to="/checkout"
                        className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800/60 flex items-center gap-1.5"
                    >
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <span>Checkout</span>
                    </Link>
                </nav>

                {/* Right Action buttons */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* User details badge */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-600 dark:text-gray-300">
                                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                                <span className="font-medium max-w-[140px] truncate">{user.email}</span>
                            </div>

                            {/* Logout Button */}
                            <Button
                                onPress={handleLogout}
                                className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 font-semibold rounded-xl text-sm px-4 py-2 flex items-center gap-1.5 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                onPress={() => navigate("/login")}
                                className="bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl text-sm px-4 py-2 flex items-center gap-1.5 transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Sign In</span>
                            </Button>

                            <Button
                                onPress={() => navigate("/register")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm px-4 py-2 shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Register</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

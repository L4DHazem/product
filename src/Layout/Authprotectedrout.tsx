import React, { useEffect, useState, ReactNode } from "react";
import { supabase } from "../../supabaseClient";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

interface AuthProtectedRouteProps {
    children: ReactNode;
}

export default function Authprotectedrout({ children }: AuthProtectedRouteProps) {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        // Fetch current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (isMounted) {
                setSession(session);
            }
        });

        // Listen for auth changes (login, logout, token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setSession(session);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // While checking initial authentication state
    if (session === undefined) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
            </div>
        );
    }

    // If already authenticated, redirect away from auth pages (login/register)
    // If they were redirected here from another page, return them there; otherwise to "/"
    if (session) {
        const from = (location.state as any)?.from?.pathname || "/";
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
}

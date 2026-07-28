// components/common/ProtectedRoute.jsx
// Next.js App Router doesn't wrap routes the way React Router did, so this is
// a client component you wrap around a page's content instead of around
// <Route>. For a stronger server-side guard, add a `middleware.js` at the
// project root that checks the JWT cookie before the page renders — this
// component is the client-side fallback and handles the redirect UX.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size={32} />
      </div>
    );
  }

  return children;
}
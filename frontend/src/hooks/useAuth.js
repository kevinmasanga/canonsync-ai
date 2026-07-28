// hooks/useAuth.js

import { useAuthContext } from "@/context/AuthContext";

// Thin convenience wrapper so components can `import { useAuth } from "@/hooks/useAuth"`
// instead of reaching into the context directly.
export function useAuth() {
  return useAuthContext();
}
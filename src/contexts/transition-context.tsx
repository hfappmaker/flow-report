"use client";

import React, {
  createContext,
  useContext,
  useTransition,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

import { Spinner } from "@/components/ui/loading/spinner";
import { useIsClient } from "@/hooks/use-is-client";

interface TransitionContextType {
  startTransition: (callback: () => void) => void;
  isPending: boolean;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

// LoadingSpinner コンポーネントを分離
function LoadingSpinner() {
  return (
    <div className="flex size-full min-h-[200px] items-center justify-center">
      <Spinner />
    </div>
  );
}

function LoadingOverlay() {
  const context = useContext(TransitionContext);

  useEffect(() => {
    if (context?.isPending) {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const popovers = document.querySelectorAll('[role="popover"]');
      const menus = document.querySelectorAll('[role="menu"]');
      const otherPortals = document.querySelectorAll("[data-portal]");

      const setInert = (element: Element) => {
        element.setAttribute("inert", "");
      };

      dialogs.forEach(setInert);
      popovers.forEach(setInert);
      menus.forEach(setInert);
      otherPortals.forEach(setInert);

      return () => {
        const removeInert = (element: Element) => {
          element.removeAttribute("inert");
        };

        dialogs.forEach(removeInert);
        popovers.forEach(removeInert);
        menus.forEach(removeInert);
        otherPortals.forEach(removeInert);
      };
    }
  }, [context?.isPending]);

  if (!context) return null;
  const { isPending } = context;
  if (!isPending) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      // bg-black/50が効かないので、styleで指定
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <Spinner />
    </div>,
    document.body,
  );
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const isClient = useIsClient();

  return (
    <TransitionContext.Provider value={{ isPending, startTransition }}>
      {isClient ? children : <LoadingSpinner />}
      <LoadingOverlay />
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error(
      "useTransitionContext must be used within TransitionProvider",
    );
  }
  return context;
}

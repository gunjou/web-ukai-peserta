// component/tryout/fullscreen-guard.tsx
"use client";

import { useEffect } from "react";

export default function FullscreenGuard() {
  useEffect(() => {
    async function enterFullscreen() {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    }

    enterFullscreen();

    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return null;
}

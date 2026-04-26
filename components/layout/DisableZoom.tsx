"use client";

import { useEffect } from "react";

export function DisableZoom() {
  useEffect(() => {
    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const options: AddEventListenerOptions = {
      passive: false,
      capture: true,
    };

    document.addEventListener("gesturestart", preventDefault, options);
    document.addEventListener("gesturechange", preventDefault, options);
    document.addEventListener("gestureend", preventDefault, options);
    document.addEventListener("touchstart", preventMultiTouch, options);
    document.addEventListener("touchmove", preventMultiTouch, options);
    document.addEventListener("dblclick", preventDefault, options);

    return () => {
      document.removeEventListener("gesturestart", preventDefault, true);
      document.removeEventListener("gesturechange", preventDefault, true);
      document.removeEventListener("gestureend", preventDefault, true);
      document.removeEventListener("touchstart", preventMultiTouch, true);
      document.removeEventListener("touchmove", preventMultiTouch, true);
      document.removeEventListener("dblclick", preventDefault, true);
    };
  }, []);

  return null;
}

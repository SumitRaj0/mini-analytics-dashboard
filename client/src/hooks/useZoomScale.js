import { useState, useEffect } from 'react';

export const useZoomScale = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const detectZoom = () => {
      // Detect zoom level using multiple methods for accuracy
      const visualViewport = window.visualViewport;
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Use visual viewport scale if available, otherwise use device pixel ratio
      const zoom = visualViewport ? visualViewport.scale : devicePixelRatio;
      setZoomLevel(zoom);
      
      // Only apply scaling when needed - be more conservative
      if (zoom >= 2.0) {
        // At 200%+ zoom, scale down significantly
        setScaleFactor(0.5);
      } else if (zoom >= 1.5) {
        // At 150% zoom, scale down moderately
        setScaleFactor(0.75);
      } else if (zoom >= 1.2) {
        // At 120% zoom, scale down slightly
        setScaleFactor(0.9);
      } else if (zoom >= 1.0) {
        // At 100% zoom, no scaling needed
        setScaleFactor(1.0);
      } else {
        // For zoom levels below 100%, minimal scaling
        setScaleFactor(1.0);
      }
    };

    // Initial detection
    detectZoom();

    // Listen for zoom changes
    window.addEventListener('resize', detectZoom);
    
    // Use ResizeObserver for more accurate zoom detection
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(detectZoom);
      resizeObserver.observe(document.body);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', detectZoom);
      };
    }

    return () => {
      window.removeEventListener('resize', detectZoom);
    };
  }, []);

  return { zoomLevel, scaleFactor };
}; 
'use client';

import { useState, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg';
  quality: 'low' | 'medium' | 'high';
  width: number;
  height: number;
  includeAttribution: boolean;
  includeWatermark: boolean;
  overlayText?: string;
  overlayPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface MapExportToolProps {
  map: mapboxgl.Map | null;
  visible: boolean;
  onToggle: (visible: boolean) => void;
  className?: string;
}

/**
 * MapExportTool - Export map visualizations for social media and advocacy
 * 
 * Features:
 * - High-quality map image export
 * - Multiple format support (PNG, JPEG, SVG)
 * - Customizable overlay text for advocacy messaging
 * - Social media optimized dimensions
 * - Watermark and attribution options
 * - One-click social sharing integration
 */
export default function MapExportTool({
  map,
  visible,
  onToggle,
  className = ''
}: MapExportToolProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 'high',
    width: 1200,
    height: 630, // Optimal for social media
    includeAttribution: true,
    includeWatermark: true,
    overlayText: 'Join the night train revolution! 🚂✨',
    overlayPosition: 'bottom-left'
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trackEvent } = useAnalytics();

  // Preset export sizes for different platforms
  const EXPORT_PRESETS = {
    'Twitter Post': { width: 1200, height: 675 },
    'Instagram Post': { width: 1080, height: 1080 },
    'Instagram Story': { width: 1080, height: 1920 },
    'Facebook Post': { width: 1200, height: 630 },
    'LinkedIn Post': { width: 1200, height: 627 },
    'Presentation Slide': { width: 1920, height: 1080 },
    'A4 Print': { width: 2480, height: 3508 }, // 300 DPI
    'Custom': { width: 1200, height: 630 }
  };

  // Advocacy text templates
  const ADVOCACY_TEMPLATES = [
    'Join the night train revolution! 🚂✨',
    'Europe needs more night trains! Check this demand map 🌍',
    'Sustainable travel starts with night trains 🌱🚂',
    'Dream routes becoming reality - support night trains! ✨',
    'Every dot represents someone dreaming of night trains 💭',
    'Policy makers: Look at this demand for night trains! 📊',
    'Night trains = climate action in motion 🌍🚂',
    'Custom message...'
  ];

  // Generate map screenshot
  const captureMapImage = useCallback(async (): Promise<string> => {
    if (!map) throw new Error('Map not available');

    return new Promise((resolve, reject) => {
      try {
        // Wait for map to finish rendering
        map.once('idle', () => {
          const canvas = map.getCanvas();
          const dataUrl = canvas.toDataURL(`image/${exportOptions.format}`, 
            exportOptions.quality === 'high' ? 0.95 : 
            exportOptions.quality === 'medium' ? 0.8 : 0.6
          );
          resolve(dataUrl);
        });

        // Trigger map render
        map.resize();
      } catch (error) {
        reject(error);
      }
    });
  }, [map, exportOptions]);

  // Add overlay text and branding to image
  const addOverlayToImage = useCallback(async (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve(imageDataUrl);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = exportOptions.width;
        canvas.height = exportOptions.height;

        // Draw the map image
        ctx.drawImage(img, 0, 0, exportOptions.width, exportOptions.height);

        // Add overlay text if specified
        if (exportOptions.overlayText && exportOptions.overlayText !== 'Custom message...') {
          const fontSize = Math.max(20, Math.floor(exportOptions.width / 40));
          const padding = Math.floor(fontSize * 0.8);

          ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;

          // Calculate text position
          const textMetrics = ctx.measureText(exportOptions.overlayText);
          const textWidth = textMetrics.width;
          const textHeight = fontSize;

          let x = padding;
          let y = exportOptions.height - padding;

          switch (exportOptions.overlayPosition) {
            case 'top-left':
              x = padding;
              y = padding + textHeight;
              break;
            case 'top-right':
              x = exportOptions.width - textWidth - padding;
              y = padding + textHeight;
              break;
            case 'bottom-right':
              x = exportOptions.width - textWidth - padding;
              y = exportOptions.height - padding;
              break;
            case 'bottom-left':
            default:
              x = padding;
              y = exportOptions.height - padding;
              break;
          }

          // Draw text with outline
          ctx.strokeText(exportOptions.overlayText, x, y);
          ctx.fillText(exportOptions.overlayText, x, y);
        }

        // Add watermark if enabled
        if (exportOptions.includeWatermark) {
          const watermarkText = 'pajama-party.eu';
          const watermarkSize = Math.max(14, Math.floor(exportOptions.width / 80));
          
          ctx.font = `${watermarkSize}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 1;

          const watermarkMetrics = ctx.measureText(watermarkText);
          const watermarkX = exportOptions.width - watermarkMetrics.width - 10;
          const watermarkY = exportOptions.height - 10;

          ctx.strokeText(watermarkText, watermarkX, watermarkY);
          ctx.fillText(watermarkText, watermarkX, watermarkY);
        }

        // Add attribution if enabled
        if (exportOptions.includeAttribution) {
          const attributionText = '© Mapbox © OpenStreetMap';
          const attributionSize = Math.max(10, Math.floor(exportOptions.width / 100));
          
          ctx.font = `${attributionSize}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';

          const attributionMetrics = ctx.measureText(attributionText);
          const attributionX = 10;
          const attributionY = exportOptions.height - 5;

          ctx.fillText(attributionText, attributionX, attributionY);
        }

        // Convert to data URL
        const finalDataUrl = canvas.toDataURL(`image/${exportOptions.format}`, 
          exportOptions.quality === 'high' ? 0.95 : 
          exportOptions.quality === 'medium' ? 0.8 : 0.6
        );
        
        resolve(finalDataUrl);
      };

      img.src = imageDataUrl;
    });
  }, [exportOptions]);

  // Export map with current settings
  const handleExport = useCallback(async () => {
    if (!map) return;

    try {
      setIsExporting(true);
      
      // Capture map image
      const mapImage = await captureMapImage();
      
      // Add overlays
      const finalImage = await addOverlayToImage(mapImage);
      
      // Set preview
      setPreviewUrl(finalImage);

      // Download image
      const link = document.createElement('a');
      link.download = `night-train-map-${Date.now()}.${exportOptions.format}`;
      link.href = finalImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track analytics
      trackEvent('map_exported', {
        format: exportOptions.format,
        width: exportOptions.width,
        height: exportOptions.height,
        has_overlay: !!exportOptions.overlayText,
        quality: exportOptions.quality
      });

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [map, captureMapImage, addOverlayToImage, exportOptions, trackEvent]);

  // Share to social media with pre-filled content
  const handleSocialShare = useCallback((platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram') => {
    if (!previewUrl) {
      alert('Please export an image first');
      return;
    }

    const shareText = exportOptions.overlayText || 'Check out this amazing night train demand map from Europe!';
    const shareUrl = 'https://pajama-party.eu';
    const hashtags = 'NightTrains,SustainableTravel,Europe,RailRevolution';

    let socialUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, copy text to clipboard
        navigator.clipboard?.writeText(`${shareText}\n\n${shareUrl}\n\n#${hashtags.replace(/,/g, ' #')}`);
        alert('Caption copied to clipboard! Open Instagram and paste when uploading your exported image.');
        return;
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
      
      trackEvent('map_shared_social', {
        platform,
        has_custom_text: exportOptions.overlayText !== ADVOCACY_TEMPLATES[0]
      });
    }
  }, [previewUrl, exportOptions.overlayText, trackEvent]);

  // Update export options
  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  }, []);

  // Apply preset dimensions
  const applyPreset = useCallback((presetName: string) => {
    const preset = EXPORT_PRESETS[presetName as keyof typeof EXPORT_PRESETS];
    if (preset) {
      updateOptions(preset);
    }
  }, [updateOptions]);

  if (!visible) return null;

  return (
    <div className={`absolute top-20 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 p-4 w-80 max-h-96 overflow-y-auto z-20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">🖼️ Export Map</h3>
        <button 
          onClick={() => onToggle(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Preset Sizes */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Size Preset</label>
        <select 
          className="w-full text-xs p-2 border border-gray-300 rounded"
          onChange={(e) => applyPreset(e.target.value)}
          defaultValue="Twitter Post"
        >
          {Object.keys(EXPORT_PRESETS).map(preset => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
      </div>

      {/* Custom Dimensions */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
          <input
            type="number"
            value={exportOptions.width}
            onChange={(e) => updateOptions({ width: parseInt(e.target.value) })}
            className="w-full text-xs p-2 border border-gray-300 rounded"
            min="100"
            max="4000"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
          <input
            type="number"
            value={exportOptions.height}
            onChange={(e) => updateOptions({ height: parseInt(e.target.value) })}
            className="w-full text-xs p-2 border border-gray-300 rounded"
            min="100"
            max="4000"
          />
        </div>
      </div>

      {/* Format & Quality */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
          <select 
            value={exportOptions.format}
            onChange={(e) => updateOptions({ format: e.target.value as 'png' | 'jpeg' })}
            className="w-full text-xs p-2 border border-gray-300 rounded"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
          <select 
            value={exportOptions.quality}
            onChange={(e) => updateOptions({ quality: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full text-xs p-2 border border-gray-300 rounded"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Overlay Text */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Overlay Text</label>
        <select 
          value={exportOptions.overlayText}
          onChange={(e) => updateOptions({ overlayText: e.target.value })}
          className="w-full text-xs p-2 border border-gray-300 rounded mb-2"
        >
          {ADVOCACY_TEMPLATES.map(template => (
            <option key={template} value={template}>{template}</option>
          ))}
        </select>
        
        {exportOptions.overlayText === 'Custom message...' && (
          <input
            type="text"
            placeholder="Enter custom message"
            onChange={(e) => updateOptions({ overlayText: e.target.value })}
            className="w-full text-xs p-2 border border-gray-300 rounded"
          />
        )}
      </div>

      {/* Overlay Position */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Text Position</label>
        <select 
          value={exportOptions.overlayPosition}
          onChange={(e) => updateOptions({ overlayPosition: e.target.value as any })}
          className="w-full text-xs p-2 border border-gray-300 rounded"
        >
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
        </select>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={exportOptions.includeWatermark}
            onChange={(e) => updateOptions({ includeWatermark: e.target.checked })}
            className="rounded"
          />
          Include watermark
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={exportOptions.includeAttribution}
            onChange={(e) => updateOptions({ includeAttribution: e.target.checked })}
            className="rounded"
          />
          Include attribution
        </label>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !map}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {isExporting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            Exporting...
          </div>
        ) : (
          '📸 Export Map'
        )}
      </button>

      {/* Social Share Buttons */}
      {previewUrl && (
        <div className="border-t pt-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Quick Share</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSocialShare('twitter')}
              className="px-2 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-600"
            >
              Twitter
            </button>
            <button
              onClick={() => handleSocialShare('linkedin')}
              className="px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800"
            >
              LinkedIn
            </button>
            <button
              onClick={() => handleSocialShare('facebook')}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Facebook
            </button>
            <button
              onClick={() => handleSocialShare('instagram')}
              className="px-2 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700"
            >
              Instagram
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
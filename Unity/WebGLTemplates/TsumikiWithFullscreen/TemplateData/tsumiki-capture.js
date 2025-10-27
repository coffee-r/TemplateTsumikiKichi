/**
 * TsumikiKichi Video Capture Script
 * Version: 2.0.0
 * 
 * Game playback video is automatically captured and sent to TsumikiKichi.
 * 
 * Supported Engines:
 * - Unity WebGL (external script file)
 * - Godot (HTML5) - requires inline embedding in index.html
 * - Other Canvas-based games
 * 
 * Usage for Unity:
 * 1. Add class="tsumiki-kichi-canvas" to Canvas element
 * 2. Load this script: <script src="TemplateData/tsumiki-capture.js"><\/script>
 *
 * Usage for Godot:
 * 1. Add class="tsumiki-kichi-canvas" to Canvas element
 * 2. Copy entire script content between markers in index.html
 *    Script tags are automatically added by sync-shared.sh
 * 
 * Security Model:
 * - This script is included in game files and can be modified by uploaders
 * - Client-side checks are not trusted; validation is performed server-side
 */

(function() {
  'use strict';
  
  // Disable if running in top-level window
  if (window.parent === window || window.location === window.parent.location) {
    console.log('[TsumikiCapture] Top-level window detected, script disabled');
    return;
  }
  
  let captureConfig = null;
  let captureTimer = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let captureCompleted = false; // Prevent multiple captures
  let recordingIndicator = null; // Recording indicator element
  
  /**
   * Show recording indicator
   */
  function showRecordingIndicator() {
    if (recordingIndicator) return; // Already showing

    recordingIndicator = document.createElement('div');
    recordingIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background-color: rgba(220, 38, 38, 0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 600;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      pointer-events: none;
    `;

    // Red dot
    const dot = document.createElement('span');
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      background-color: white;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    `;

    // Add pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);

    recordingIndicator.appendChild(dot);
    recordingIndicator.appendChild(document.createTextNode('REC'));

    document.body.appendChild(recordingIndicator);
    console.log('[TsumikiCapture] Recording indicator shown');
  }

  /**
   * Hide recording indicator
   */
  function hideRecordingIndicator() {
    if (recordingIndicator && recordingIndicator.parentNode) {
      recordingIndicator.parentNode.removeChild(recordingIndicator);
      recordingIndicator = null;
      console.log('[TsumikiCapture] Recording indicator hidden');
    }
  }

  /**
   * Notify parent that initialization is complete
   */
  function notifyReady() {
    console.log('[TsumikiCapture] Document loaded, notifying parent');
    
    window.parent.postMessage({
      type: 'tsumiki:capture-ready',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    }, '*');
  }
  
  /**
   * Receive messages from parent
   */
  window.addEventListener('message', (event) => {
    // No origin check (can be modified by uploader)
    // Security is handled server-side
    
    switch (event.data.type) {
      case 'tsumiki:capture-start':
        handleConfig(event.data);
        break;
      
      default:
        // Ignore unknown message types
        break;
    }
  });
  
  /**
   * Handle capture configuration and start timer
   */
  function handleConfig(data) {
    // Ignore if capture already completed (prevent multiple captures)
    if (captureCompleted) {
      console.log('[TsumikiCapture] Capture already completed, ignoring config');
      return;
    }
    
    // Ignore if timer already set
    if (captureTimer) {
      console.log('[TsumikiCapture] Timer already set, ignoring config');
      return;
    }
    
    captureConfig = {
      captureDelay: data.captureDelay,              // ms
      captureDuration: data.captureDuration,        // ms
      videoBitsPerSecond: data.videoBitsPerSecond,  // bps
      fps: data.fps || 30,                          // fps (default: 30)
    };
    
    console.log('[TsumikiCapture] Config received:', {
      delay: `${(captureConfig.captureDelay / 1000).toFixed(1)}s`,
      duration: `${captureConfig.captureDuration / 1000}s`,
      bitrate: `${captureConfig.videoBitsPerSecond / 1000}kbps`,
      fps: captureConfig.fps,
    });
    
    // Start timer
    captureTimer = setTimeout(() => {
      startCapture();
    }, captureConfig.captureDelay);
    
    console.log('[TsumikiCapture] Timer started, capture will begin in', 
      `${(captureConfig.captureDelay / 1000).toFixed(1)}s`);
  }
  
  /**
   * Check if the device is a PC (not mobile)
   */
  function isPCDevice() {
    const ua = navigator.userAgent;
    const mobilePatterns = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
      /Mobile/i,
    ];
    
    return !mobilePatterns.some(pattern => pattern.test(ua));
  }
  
  /**
   * Start capture
   */
  async function startCapture() {
    console.log('[TsumikiCapture] Starting capture...');
    
    try {
      // Check if device is PC
      if (!isPCDevice()) {
        console.log('[TsumikiCapture] Mobile device detected, skipping capture');
        captureCompleted = true;
        return;
      }
      
      // Get Canvas element
      const canvas = findCanvas();
      if (!canvas) {
        throw new Error('Canvas element not found');
      }
      
      console.log('[TsumikiCapture] Canvas found:', {
        id: canvas.id || '(no id)',
        class: canvas.className,
        width: canvas.width,
        height: canvas.height,
      });
      
      // Get Canvas stream
      const stream = canvas.captureStream(captureConfig.fps);
      
      if (!stream || stream.getVideoTracks().length === 0) {
        throw new Error('Failed to capture canvas stream');
      }
      
      // Configure MediaRecorder
      const mimeType = getSupportedMimeType();
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: captureConfig.videoBitsPerSecond,
      });
      
      recordedChunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        handleCaptureComplete(stream);
      };
      
      mediaRecorder.onerror = (e) => {
        console.error('[TsumikiCapture] MediaRecorder error:', e);
      };
      
      // Start recording
      mediaRecorder.start();
      console.log('[TsumikiCapture] Recording started');

      // Show recording indicator
      showRecordingIndicator();
      
      // Stop after specified duration
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          console.log('[TsumikiCapture] Stopping recording...');
          mediaRecorder.stop();
        }
      }, captureConfig.captureDuration);
      
    } catch (error) {
      console.error('[TsumikiCapture] Capture failed:', error);
      hideRecordingIndicator(); // Hide indicator on error
      captureCompleted = true; // Mark as completed on error to prevent retry
    }
  }
  
  /**
   * Handle capture completion
   */
  function handleCaptureComplete(stream) {
    // Hide recording indicator
    hideRecordingIndicator();

    // Stop stream
    stream.getTracks().forEach(track => track.stop());
    
    // Create Blob
    const mimeType = getSupportedMimeType();
    const videoBlob = new Blob(recordedChunks, { type: mimeType });
    
    console.log('[TsumikiCapture] Recording complete:', {
      size: `${(videoBlob.size / 1024).toFixed(2)} KB`,
      chunks: recordedChunks.length,
      type: mimeType,
    });
    
    // Send to parent
    window.parent.postMessage({
      type: 'tsumiki:capture-complete',
      videoBlob: videoBlob,
      metadata: {
        duration: captureConfig.captureDuration,
        size: videoBlob.size,
        timestamp: Date.now(),
        mimeType: mimeType,
      },
    }, '*');
    
    // Cleanup
    mediaRecorder = null;
    recordedChunks = [];
    captureTimer = null;
    captureCompleted = true; // Prevent multiple captures
    
    console.log('[TsumikiCapture] Capture completed, script will not record again');
  }
  
  /**
   * Find Canvas element
   */
  function findCanvas() {
    // Only search by tsumiki-kichi-canvas class
    const canvas = document.querySelector('canvas.tsumiki-kichi-canvas');
    
    if (!canvas) {
      console.warn('[TsumikiCapture] Canvas with class "tsumiki-kichi-canvas" not found');
      return null;
    }
    
    return canvas;
  }
  
  /**
   * Get supported MIME type
   * @throws {Error} If no supported MIME type is found
   */
  function getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4', // Safari support
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    throw new Error('Browser does not support video recording (no supported MIME type found)');
  }
  
  // Initialize: wait for window.load
  if (document.readyState === 'complete') {
    // Already loaded
    notifyReady();
  } else {
    window.addEventListener('load', notifyReady);
  }
  
  console.log('[TsumikiCapture] Script initialized and waiting for document load');
})();

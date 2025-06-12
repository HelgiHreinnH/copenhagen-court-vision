/**
 * Copenhagen Court Vision - QR Code Detection System
 * Handles QR code scanning, validation, and AR positioning calibration
 */

class QRDetector {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.video = null;
        this.isScanning = false;
        this.detectedMarkers = new Set();
        this.markerPositions = new Map();
        this.onMarkerDetected = null;
        this.onCalibrationComplete = null;
        
        // QR code configuration
        this.qrConfig = {
            entrance: {
                id: 'entrance',
                name: 'Point A - Entrance',
                url: 'https://helgihreinnh.github.io/copenhagen-court-vision/ar-experience.html?start=entrance',
                position: { x: 0, y: 0, z: 0 }, // Origin point
                size: 0.15, // 150mm
                height: 1.5 // 1500mm above ground
            },
            left: {
                id: 'left',
                name: 'Point B - Left Hoop',
                url: 'https://helgihreinnh.github.io/copenhagen-court-vision/ar-experience.html?marker=left',
                position: { x: -14, y: 1.6, z: 28 }, // Left hoop position
                size: 0.04, // 40mm
                height: 1.6 // 1600mm above ground
            },
            right: {
                id: 'right',
                name: 'Point C - Right Hoop', 
                url: 'https://helgihreinnh.github.io/copenhagen-court-vision/ar-experience.html?marker=right',
                position: { x: 14, y: 1.6, z: 28 }, // Right hoop position
                size: 0.04, // 40mm
                height: 1.6 // 1600mm above ground
            }
        };
        
        this.setupCanvas();
    }
    
    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
    }
    
    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            this.video = document.createElement('video');
            this.video.srcObject = stream;
            this.video.setAttribute('playsinline', true);
            this.video.play();
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve(this.video);
                };
            });
            
        } catch (error) {
            console.error('Camera initialization failed:', error);
            throw new Error('Camera access denied or not available');
        }
    }
    
    startScanning() {
        if (this.isScanning) return;
        
        this.isScanning = true;
        this.scanLoop();
        console.log('🔍 QR code scanning started');
    }
    
    stopScanning() {
        this.isScanning = false;
        console.log('⏹️ QR code scanning stopped');
    }
    
    scanLoop() {
        if (!this.isScanning || !this.video) return;
        
        try {
            // Draw current video frame to canvas
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data for QR scanning
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Scan for QR codes using jsQR
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode) {
                this.processQRCode(qrCode);
            }
            
        } catch (error) {
            console.warn('QR scanning error:', error);
        }
        
        // Continue scanning
        requestAnimationFrame(() => this.scanLoop());
    }
    
    processQRCode(qrCode) {
        const qrData = qrCode.data;
        console.log('📱 QR code detected:', qrData);
        
        // Validate QR code against expected markers
        const markerInfo = this.validateQRCode(qrData);
        
        if (markerInfo) {
            this.handleValidMarker(markerInfo, qrCode);
        } else {
            console.warn('⚠️ Invalid or unknown QR code:', qrData);
        }
    }
    
    validateQRCode(qrData) {
        // Check if QR data matches any of our expected markers
        for (const [key, config] of Object.entries(this.qrConfig)) {
            if (qrData === config.url || qrData.includes(`marker=${key}`) || qrData.includes(`start=${key}`)) {
                return { ...config, key };
            }
        }
        
        // Check for direct marker IDs
        if (this.qrConfig[qrData]) {
            return { ...this.qrConfig[qrData], key: qrData };
        }
        
        return null;
    }
    
    handleValidMarker(markerInfo, qrCode) {
        const markerId = markerInfo.key;
        
        // Prevent duplicate detections
        if (this.detectedMarkers.has(markerId)) {
            return;
        }
        
        console.log(`✅ Valid marker detected: ${markerInfo.name}`);
        
        // Calculate marker position in 3D space
        const markerPosition = this.calculateMarkerPosition(markerInfo, qrCode);
        
        // Store marker data
        this.detectedMarkers.add(markerId);
        this.markerPositions.set(markerId, {
            ...markerInfo,
            detectedAt: Date.now(),
            position3D: markerPosition,
            qrCorners: qrCode.location
        });
        
        // Trigger callback
        if (this.onMarkerDetected) {
            this.onMarkerDetected(markerId, markerInfo, markerPosition);
        }
        
        // Check if calibration is complete
        this.checkCalibrationStatus();
        
        // Track analytics
        if (window.analytics) {
            window.analytics.trackEvent('qr_marker_detected', {
                markerId: markerId,
                markerName: markerInfo.name,
                timestamp: Date.now()
            });
        }
    }
    
    calculateMarkerPosition(markerInfo, qrCode) {
        // Extract QR code corners for pose estimation
        const corners = qrCode.location;
        
        // Calculate marker center point
        const centerX = (corners.topLeftCorner.x + corners.topRightCorner.x + 
                        corners.bottomLeftCorner.x + corners.bottomRightCorner.x) / 4;
        const centerY = (corners.topLeftCorner.y + corners.topRightCorner.y + 
                        corners.bottomLeftCorner.y + corners.bottomRightCorner.y) / 4;
        
        // Calculate marker size in pixels for scale estimation
        const width = Math.abs(corners.topRightCorner.x - corners.topLeftCorner.x);
        const height = Math.abs(corners.bottomLeftCorner.y - corners.topLeftCorner.y);
        const avgSize = (width + height) / 2;
        
        // Estimate distance based on known physical size
        const focalLength = 1000; // Estimated camera focal length in pixels
        const distance = (markerInfo.size * focalLength) / avgSize;
        
        return {
            screen: { x: centerX, y: centerY },
            world: { ...markerInfo.position },
            distance: distance,
            scale: avgSize / markerInfo.size,
            corners: corners
        };
    }
    
    checkCalibrationStatus() {
        const requiredMarkers = ['entrance', 'left', 'right'];
        const detectedCount = requiredMarkers.filter(marker => this.detectedMarkers.has(marker)).length;
        
        console.log(`📊 Calibration progress: ${detectedCount}/${requiredMarkers.length} markers`);
        
        if (detectedCount === requiredMarkers.length) {
            console.log('🎯 All markers detected - calibration complete!');
            
            if (this.onCalibrationComplete) {
                const calibrationData = this.generateCalibrationData();
                this.onCalibrationComplete(calibrationData);
            }
            
            // Track analytics
            if (window.analytics) {
                window.analytics.trackEvent('calibration_complete', {
                    markers: Array.from(this.detectedMarkers),
                    completionTime: Date.now()
                });
            }
        }
    }
    
    generateCalibrationData() {
        const data = {
            markers: {},
            courtTransform: null,
            calibratedAt: Date.now()
        };
        
        // Collect all marker data
        for (const [markerId, markerData] of this.markerPositions) {
            data.markers[markerId] = markerData;
        }
        
        // Calculate court transformation matrix
        if (this.detectedMarkers.size >= 3) {
            data.courtTransform = this.calculateCourtTransform();
        }
        
        return data;
    }
    
    calculateCourtTransform() {
        const entrance = this.markerPositions.get('entrance');
        const leftHoop = this.markerPositions.get('left');
        const rightHoop = this.markerPositions.get('right');
        
        if (!entrance || !leftHoop || !rightHoop) {
            console.error('Missing markers for court transform calculation');
            return null;
        }
        
        // Court coordinate system based on three points
        const origin = entrance.position3D.world;
        const left = leftHoop.position3D.world;
        const right = rightHoop.position3D.world;
        
        // Calculate court center (between hoops)
        const courtCenter = {
            x: (left.x + right.x) / 2,
            y: (left.y + right.y) / 2,
            z: (left.z + right.z) / 2
        };
        
        // Calculate court orientation vectors
        const courtWidth = {
            x: right.x - left.x,
            y: right.y - left.y,
            z: right.z - left.z
        };
        
        const courtLength = {
            x: courtCenter.x - origin.x,
            y: 0, // Keep level
            z: courtCenter.z - origin.z
        };
        
        // Normalize vectors
        const widthLength = Math.sqrt(courtWidth.x ** 2 + courtWidth.y ** 2 + courtWidth.z ** 2);
        const lengthMagnitude = Math.sqrt(courtLength.x ** 2 + courtLength.z ** 2);
        
        const rightVector = {
            x: courtWidth.x / widthLength,
            y: 0,
            z: courtWidth.z / widthLength
        };
        
        const forwardVector = {
            x: courtLength.x / lengthMagnitude,
            y: 0,
            z: courtLength.z / lengthMagnitude
        };
        
        const upVector = { x: 0, y: 1, z: 0 };
        
        // Create transformation matrix (4x4)
        const transform = [
            [rightVector.x, upVector.x, forwardVector.x, origin.x],
            [rightVector.y, upVector.y, forwardVector.y, origin.y],
            [rightVector.z, upVector.z, forwardVector.z, origin.z],
            [0, 0, 0, 1]
        ];
        
        return transform;
    }
    
    reset() {
        this.detectedMarkers.clear();
        this.markerPositions.clear();
        console.log('🔄 QR detector reset');
    }
    
    getDetectedMarkers() {
        return Array.from(this.detectedMarkers);
    }
    
    getMarkerPosition(markerId) {
        return this.markerPositions.get(markerId);
    }
    
    isCalibrationComplete() {
        return this.detectedMarkers.size >= 3;
    }
    
    // Debug methods
    drawDebugOverlay() {
        if (!this.canvas || !this.context) return;
        
        // Clear any previous debug drawings
        this.context.strokeStyle = '#00ff00';
        this.context.lineWidth = 2;
        
        // Draw detected QR code positions
        for (const [markerId, markerData] of this.markerPositions) {
            const pos = markerData.position3D.screen;
            const corners = markerData.position3D.corners;
            
            // Draw QR code boundary
            this.context.beginPath();
            this.context.moveTo(corners.topLeftCorner.x, corners.topLeftCorner.y);
            this.context.lineTo(corners.topRightCorner.x, corners.topRightCorner.y);
            this.context.lineTo(corners.bottomRightCorner.x, corners.bottomRightCorner.y);
            this.context.lineTo(corners.bottomLeftCorner.x, corners.bottomLeftCorner.y);
            this.context.closePath();
            this.context.stroke();
            
            // Draw marker label
            this.context.fillStyle = '#00ff00';
            this.context.font = '16px Arial';
            this.context.fillText(markerId.toUpperCase(), pos.x + 10, pos.y - 10);
        }
    }
    
    exportDebugData() {
        return {
            detectedMarkers: Array.from(this.detectedMarkers),
            markerPositions: Object.fromEntries(this.markerPositions),
            qrConfig: this.qrConfig,
            isScanning: this.isScanning,
            calibrationComplete: this.isCalibrationComplete()
        };
    }
    
    // Cleanup
    destroy() {
        this.stopScanning();
        
        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        console.log('🧹 QR detector destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRDetector;
}
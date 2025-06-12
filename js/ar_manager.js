/**
 * Copenhagen Court Vision - AR Manager
 * Main controller for AR experience, coordinates all AR components
 */

class CopenhagenCourtAR {
    constructor() {
        this.state = 'loading';
        this.qrDetector = null;
        this.courtModel = null;
        this.analytics = null;
        this.feedbackSystem = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arContext = null;
        
        // UI Elements
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            welcomeScreen: document.getElementById('welcome-screen'),
            arInterface: document.getElementById('ar-interface'),
            arSuccess: document.getElementById('ar-success'),
            errorPanel: document.getElementById('error-panel'),
            startCamera: document.getElementById('start-camera'),
            giveFeedback: document.getElementById('give-feedback'),
            retryAR: document.getElementById('retry-ar'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            arInstruction: document.getElementById('ar-instruction'),
            trackingStatus: document.getElementById('tracking-status')
        };
        
        // Calibration state
        this.calibrationData = {
            markers: {},
            isComplete: false,
            currentStep: 1,
            totalSteps: 3
        };
        
        // Debug mode
        this.debugMode = false;
        this.debugPanel = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Copenhagen Court Vision AR...');
        
        try {
            // Initialize analytics first
            this.analytics = new AnalyticsTracker();
            this.analytics.trackEvent('ar_session_start');
            
            // Check device capabilities
            await this.checkARSupport();
            
            // Initialize components
            this.qrDetector = new QRDetector();
            this.courtModel = new CourtModel();
            this.feedbackSystem = new FeedbackSystem();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup QR detector callbacks
            this.qrDetector.onMarkerDetected = this.onMarkerDetected.bind(this);
            this.qrDetector.onCalibrationComplete = this.onCalibrationComplete.bind(this);
            
            // Show welcome screen
            this.setState('welcome');
            
        } catch (error) {
            console.error('AR initialization failed:', error);
            this.showError('AR initialization failed', error.message);
        }
    }
    
    async checkARSupport() {
        const support = {
            webgl: !!window.WebGLRenderingContext,
            camera: !!navigator.mediaDevices?.getUserMedia,
            deviceMotion: 'DeviceMotionEvent' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window
        };
        
        console.log('📱 Device AR support:', support);
        
        if (!support.webgl) {
            throw new Error('WebGL not supported - 3D graphics unavailable');
        }
        
        if (!support.camera) {
            throw new Error('Camera access not available');
        }
        
        // Track device capabilities
        this.analytics.trackEvent('device_capabilities', support);
        
        return support;
    }
    
    setupEventListeners() {
        // UI Button events
        this.elements.startCamera?.addEventListener('click', this.startARExperience.bind(this));
        this.elements.giveFeedback?.addEventListener('click', this.showFeedbackForm.bind(this));
        this.elements.retryAR?.addEventListener('click', this.retryARSetup.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.exitAR();
            }
            if (e.key === 'd' && e.ctrlKey) {
                e.preventDefault();
                this.toggleDebugMode();
            }
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    async startARExperience() {
        console.log('📹 Starting AR camera experience...');
        
        try {
            this.setState('initializing');
            
            // Initialize camera
            const video = await this.qrDetector.initializeCamera();
            
            // Initialize AR scene
            await this.initializeARScene(video);
            
            // Start QR scanning
            this.qrDetector.startScanning();
            
            // Show AR interface
            this.setState('scanning');
            
            this.analytics.trackEvent('camera_started');
            
        } catch (error) {
            console.error('Failed to start AR experience:', error);
            this.showError('Camera Error', 'Could not access camera. Please grant permission and try again.');
        }
    }
    
    async initializeARScene(video) {
        console.log('🎬 Initializing AR scene...');
        
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // aspect
            0.1, // near
            1000 // far
        );
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        
        // Add renderer to DOM
        const arContainer = document.getElementById('ar-container');
        arContainer.appendChild(this.renderer.domElement);
        
        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Load court model
        await this.courtModel.load();
        
        console.log('✅ AR scene initialized');
    }
    
    onMarkerDetected(markerId, markerInfo, position) {
        console.log(`📍 Marker detected: ${markerId}`, markerInfo);
        
        // Update UI
        this.updateMarkerStatus(markerId, 'detected');
        this.updateCalibrationProgress();
        
        // Store marker data
        this.calibrationData.markers[markerId] = {
            info: markerInfo,
            position: position,
            timestamp: Date.now()
        };
        
        // Update instruction text
        this.updateInstructionText(markerId);
        
        // Track analytics
        this.analytics.trackEvent('marker_detected', {
            markerId: markerId,
            step: this.calibrationData.currentStep
        });
    }
    
    onCalibrationComplete(calibrationData) {
        console.log('🎯 Calibration complete!', calibrationData);
        
        this.calibrationData = {
            ...this.calibrationData,
            ...calibrationData,
            isComplete: true
        };
        
        // Place the court model
        this.placeCourtModel(calibrationData);
        
        // Update UI
        this.setState('calibrated');
        
        // Track analytics
        this.analytics.trackEvent('calibration_complete', {
            duration: Date.now() - this.analytics.sessionStart,
            markers: Object.keys(this.calibrationData.markers)
        });
    }
    
    placeCourtModel(calibrationData) {
        console.log('🏀 Placing court model...');
        
        try {
            // Get the court model
            const courtMesh = this.courtModel.getMesh();
            
            if (!courtMesh) {
                throw new Error('Court model not loaded');
            }
            
            // Calculate position based on calibration
            const transform = this.calculateModelTransform(calibrationData);
            
            // Apply transformation
            courtMesh.position.set(transform.position.x, transform.position.y, transform.position.z);
            courtMesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
            courtMesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
            
            // Add to scene
            this.scene.add(courtMesh);
            
            // Start rendering loop
            this.startRenderLoop();
            
            // Show success UI
            setTimeout(() => {
                this.setState('success');
            }, 1000);
            
            console.log('✅ Court model placed successfully');
            
        } catch (error) {
            console.error('Failed to place court model:', error);
            this.showError('Model Error', 'Failed to place 3D court model');
        }
    }
    
    calculateModelTransform(calibrationData) {
        // Get marker positions
        const markers = calibrationData.markers;
        const entrance = markers.entrance?.position3D?.world || { x: 0, y: 0, z: 0 };
        const leftHoop = markers.left?.position3D?.world || { x: -14, y: 1.6, z: 28 };
        const rightHoop = markers.right?.position3D?.world || { x: 14, y: 1.6, z: 28 };
        
        // Calculate court center
        const courtCenter = {
            x: (leftHoop.x + rightHoop.x) / 2,
            y: 0, // Ground level
            z: (leftHoop.z + rightHoop.z) / 2
        };
        
        // Calculate court orientation
        const courtDirection = {
            x: rightHoop.x - leftHoop.x,
            y: 0,
            z: rightHoop.z - leftHoop.z
        };
        
        // Normalize direction vector
        const dirLength = Math.sqrt(courtDirection.x ** 2 + courtDirection.z ** 2);
        const normalizedDir = {
            x: courtDirection.x / dirLength,
            z: courtDirection.z / dirLength
        };
        
        // Calculate rotation (Y-axis rotation for court orientation)
        const rotation = {
            x: 0,
            y: Math.atan2(normalizedDir.x, normalizedDir.z),
            z: 0
        };
        
        return {
            position: entrance, // Place model at entrance
            rotation: rotation,
            scale: { x: 1, y: 1, z: 1 } // 1:1 scale
        };
    }
    
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
        console.log('🎬 Render loop started');
    }
    
    updateMarkerStatus(markerId, status) {
        const markerElement = document.getElementById(`marker-${markerId}`);
        if (markerElement) {
            markerElement.className = `marker-icon ${status}`;
            
            if (status === 'detected') {
                markerElement.innerHTML = '✓';
            }
        }
    }
    
    updateCalibrationProgress() {
        const detectedCount = Object.keys(this.calibrationData.markers).length;
        const progress = (detectedCount / this.calibrationData.totalSteps) * 100;
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }
        
        if (this.elements.progressText) {
            this.elements.progressText.textContent = `Step ${detectedCount} of ${this.calibrationData.totalSteps}`;
        }
        
        this.calibrationData.currentStep = detectedCount + 1;
    }
    
    updateInstructionText(lastDetectedMarker) {
        const instructions = {
            'entrance': 'Great! Now scan the LEFT hoop QR code',
            'left': 'Perfect! Now scan the RIGHT hoop QR code',
            'right': 'Excellent! Processing AR calibration...'
        };
        
        if (this.elements.arInstruction && instructions[lastDetectedMarker]) {
            this.elements.arInstruction.textContent = instructions[lastDetectedMarker];
        }
    }
    
    setState(newState) {
        console.log(`🔄 State change: ${this.state} → ${newState}`);
        
        // Hide all screens
        Object.values(this.elements).forEach(element => {
            if (element && element.style) {
                element.style.display = 'none';
            }
        });
        
        // Show appropriate screen
        switch (newState) {
            case 'loading':
                this.elements.loadingScreen?.style.setProperty('display', 'flex');
                break;
            case 'welcome':
                this.elements.welcomeScreen?.style.setProperty('display', 'flex');
                break;
            case 'initializing':
                this.elements.loadingScreen?.style.setProperty('display', 'flex');
                this.updateLoadingMessage('Starting camera...');
                break;
            case 'scanning':
                this.elements.arInterface?.style.setProperty('display', 'block');
                break;
            case 'calibrated':
                this.elements.arInterface?.style.setProperty('display', 'block');
                this.updateLoadingMessage('Placing court model...');
                break;
            case 'success':
                this.elements.arSuccess?.style.setProperty('display', 'flex');
                break;
            case 'error':
                this.elements.errorPanel?.style.setProperty('display', 'flex');
                break;
        }
        
        this.state = newState;
        
        // Track state changes
        this.analytics.trackEvent('state_change', { 
            from: this.state, 
            to: newState 
        });
    }
    
    updateLoadingMessage(message) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }
    
    showError(title, message) {
        console.error(`❌ ${title}: ${message}`);
        
        const errorTitle = this.elements.errorPanel?.querySelector('h2');
        const errorMessage = document.getElementById('error-message');
        
        if (errorTitle) errorTitle.textContent = title;
        if (errorMessage) errorMessage.textContent = message;
        
        this.setState('error');
        
        // Track error
        this.analytics.trackEvent('error_occurred', {
            title: title,
            message: message,
            state: this.state
        });
    }
    
    showFeedbackForm() {
        // Initialize feedback system
        this.feedbackSystem.show({
            onSubmit: (feedback) => {
                this.analytics.trackEvent('feedback_submitted', feedback);
                console.log('📝 Feedback submitted:', feedback);
            }
        });
    }
    
    retryARSetup() {
        console.log('🔄 Retrying AR setup...');
        
        // Reset state
        this.calibrationData = {
            markers: {},
            isComplete: false,
            currentStep: 1,
            totalSteps: 3
        };
        
        // Reset QR detector
        this.qrDetector.reset();
        
        // Try again
        this.startARExperience();
    }
    
    exitAR() {
        console.log('🚪 Exiting AR experience...');
        
        // Stop scanning
        if (this.qrDetector) {
            this.qrDetector.stopScanning();
        }
        
        // Clean up Three.js
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Return to welcome
        this.setState('welcome');
        
        this.analytics.trackEvent('ar_session_end');
    }
    
    pause() {
        if (this.qrDetector) {
            this.qrDetector.stopScanning();
        }
        console.log('⏸️ AR experience paused');
    }
    
    resume() {
        if (this.qrDetector && this.state === 'scanning') {
            this.qrDetector.startScanning();
        }
        console.log('▶️ AR experience resumed');
    }
    
    handleOrientationChange() {
        if (this.renderer && this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    setEntryPoint(entryPoint) {
        console.log(`🔗 Entry point set: ${entryPoint}`);
        
        // Track entry method
        this.analytics.trackEvent('entry_point', { source: entryPoint });
        
        // Auto-start if coming from QR code
        if (entryPoint && this.state === 'welcome') {
            setTimeout(() => {
                this.startARExperience();
            }, 1000);
        }
    }
    
    enableDebugMode() {
        this.debugMode = true;
        console.log('🔧 Debug mode enabled');
        
        // Create debug panel
        this.createDebugPanel();
        
        // Enable QR debug overlay
        if (this.qrDetector) {
            this.qrDetector.drawDebugOverlay();
        }
    }
    
    createDebugPanel() {
        if (this.debugPanel) return;
        
        this.debugPanel = document.createElement('div');
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(this.debugPanel);
        
        // Update debug info periodically
        setInterval(() => {
            this.updateDebugPanel();
        }, 1000);
    }
    
    updateDebugPanel() {
        if (!this.debugPanel || !this.debugMode) return;
        
        const debugInfo = {
            state: this.state,
            markers: Object.keys(this.calibrationData.markers),
            fps: this.getFPS(),
            memory: this.getMemoryUsage()
        };
        
        this.debugPanel.innerHTML = `
            <strong>Debug Info</strong><br>
            State: ${debugInfo.state}<br>
            Markers: ${debugInfo.markers.join(', ')}<br>
            FPS: ${debugInfo.fps}<br>
            Memory: ${debugInfo.memory}MB<br>
            <button onclick="window.arApp.exportDebugData()">Export Data</button>
        `;
    }
    
    getFPS() {
        // Simple FPS counter
        return Math.round(1000 / 16); // Approximation
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        return 'N/A';
    }
    
    exportDebugData() {
        const debugData = {
            state: this.state,
            calibrationData: this.calibrationData,
            qrDetector: this.qrDetector?.exportDebugData(),
            analytics: this.analytics?.exportData(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(debugData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'copenhagen-court-ar-debug.json';
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 Debug data exported');
    }
    
    toggleDebugMode() {
        if (this.debugMode) {
            this.debugMode = false;
            if (this.debugPanel) {
                this.debugPanel.remove();
                this.debugPanel = null;
            }
        } else {
            this.enableDebugMode();
        }
    }
    
    // Cleanup method
    destroy() {
        console.log('🧹 Destroying AR application...');
        
        // Stop all systems
        this.qrDetector?.destroy();
        this.renderer?.dispose();
        
        // Clean up DOM
        if (this.debugPanel) {
            this.debugPanel.remove();
        }
        
        // Track session end
        this.analytics?.trackEvent('session_destroyed');
    }
}

// Make available globally for debugging
window.CopenhagenCourtAR = CopenhagenCourtAR;
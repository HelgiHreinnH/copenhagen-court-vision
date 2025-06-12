/**
 * Copenhagen Court Vision - Court Model Manager
 * Handles loading, optimization, and management of the 3D court model
 */

class CourtModel {
    constructor() {
        this.model = null;
        this.mesh = null;
        this.loader = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadingProgress = 0;
        this.boundingBox = null;
        this.scale = { x: 1, y: 1, z: 1 };
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        
        // Model configuration
        this.config = {
            modelPath: 'assets/models/sonder_court.glb',
            usdcPath: 'assets/models/sonder_court.usdz', // iOS fallback
            maxFileSize: 30 * 1024 * 1024, // 30MB
            optimizationLevel: 'high'
        };
        
        // Callbacks
        this.onLoadStart = null;
        this.onLoadProgress = null;
        this.onLoadComplete = null;
        this.onLoadError = null;
        
        this.initializeLoader();
    }
    
    initializeLoader() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }
        
        // Check if GLTFLoader is available
        if (typeof THREE.GLTFLoader !== 'undefined') {
            this.loader = new THREE.GLTFLoader();
        } else {
            console.warn('GLTFLoader not available, attempting to load from CDN');
            this.loadGLTFLoader().then(() => {
                this.loader = new THREE.GLTFLoader();
            });
        }
        
        console.log('🎮 Court model manager initialized');
    }
    
    async loadGLTFLoader() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    async load() {
        if (this.isLoaded) {
            console.log('🏀 Model already loaded');
            return this.mesh;
        }
        
        if (this.isLoading) {
            console.log('⏳ Model loading in progress');
            return this.waitForLoad();
        }
        
        console.log('🚀 Loading court model...');
        this.isLoading = true;
        this.loadingProgress = 0;
        
        if (this.onLoadStart) {
            this.onLoadStart();
        }
        
        try {
            // Check if model file exists
            await this.checkModelAvailability();
            
            // Load the model
            const gltf = await this.loadGLTF();
            
            // Process the loaded model
            this.processLoadedModel(gltf);
            
            // Optimize for AR
            this.optimizeForAR();
            
            this.isLoaded = true;
            this.isLoading = false;
            this.loadingProgress = 100;
            
            if (this.onLoadComplete) {
                this.onLoadComplete(this.mesh);
            }
            
            console.log('✅ Court model loaded successfully');
            
            // Track analytics
            if (window.analytics) {
                window.analytics.trackEvent('model_loaded', {
                    success: true,
                    fileSize: await this.getModelFileSize(),
                    loadTime: this.loadingProgress
                });
            }
            
            return this.mesh;
            
        } catch (error) {
            console.error('❌ Failed to load court model:', error);
            this.isLoading = false;
            
            if (this.onLoadError) {
                this.onLoadError(error);
            }
            
            // Track error
            if (window.analytics) {
                window.analytics.trackError('model_load_failed', error.message);
            }
            
            throw error;
        }
    }
    
    async checkModelAvailability() {
        try {
            const response = await fetch(this.config.modelPath, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`Model file not found: ${this.config.modelPath}`);
            }
            
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > this.config.maxFileSize) {
                console.warn('⚠️ Model file is large, may affect performance');
            }
            
        } catch (error) {
            // Try fallback URLs or create placeholder
            console.warn('Primary model not available, trying alternatives...');
            await this.handleModelFallback();
        }
    }
    
    async handleModelFallback() {
        // iOS devices can use USDZ format
        if (this.isIOSDevice() && this.config.usdcPath) {
            console.log('📱 iOS detected, will use AR Quick Look fallback');
            return;
        }
        
        // Create a simple placeholder model
        console.log('🔄 Creating placeholder court model');
        this.createPlaceholderModel();
    }
    
    isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    createPlaceholderModel() {
        console.log('🏗️ Creating placeholder court model');
        
        // Create a basic court representation
        const courtGroup = new THREE.Group();
        
        // Court surface
        const courtGeometry = new THREE.PlaneGeometry(28, 15); // Standard basketball court
        const courtMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513, // Brown court color
            transparent: true,
            opacity: 0.8
        });
        const courtSurface = new THREE.Mesh(courtGeometry, courtMaterial);
        courtSurface.rotation.x = -Math.PI / 2; // Lay flat
        courtGroup.add(courtSurface);
        
        // Court lines
        this.addCourtLines(courtGroup);
        
        // Hoops
        this.addBasketballHoops(courtGroup);
        
        this.model = { scene: courtGroup };
        this.mesh = courtGroup;
        this.isLoaded = true;
        
        console.log('✅ Placeholder court model created');
    }
    
    addCourtLines(courtGroup) {
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        // Center line
        const centerLineGeometry = new THREE.PlaneGeometry(0.1, 15);
        const centerLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.01;
        courtGroup.add(centerLine);
        
        // Three-point lines (simplified)
        const threePointGeometry = new THREE.RingGeometry(6.7, 6.8, 0, Math.PI);
        const leftThreePoint = new THREE.Mesh(threePointGeometry, lineMaterial);
        leftThreePoint.rotation.x = -Math.PI / 2;
        leftThreePoint.position.set(-9, 0.01, 0);
        courtGroup.add(leftThreePoint);
        
        const rightThreePoint = leftThreePoint.clone();
        rightThreePoint.position.set(9, 0.01, 0);
        rightThreePoint.rotation.y = Math.PI;
        courtGroup.add(rightThreePoint);
    }
    
    addBasketballHoops(courtGroup) {
        const hoopMaterial = new THREE.MeshLambertMaterial({ color: 0xFF5722 });
        
        // Left hoop
        const hoopGeometry = new THREE.TorusGeometry(0.225, 0.02, 8, 16);
        const leftHoop = new THREE.Mesh(hoopGeometry, hoopMaterial);
        leftHoop.position.set(-12, 3.05, 0); // Standard hoop height
        leftHoop.rotation.x = Math.PI / 2;
        courtGroup.add(leftHoop);
        
        // Right hoop
        const rightHoop = leftHoop.clone();
        rightHoop.position.set(12, 3.05, 0);
        courtGroup.add(rightHoop);
        
        // Backboards (simplified)
        const backboardGeometry = new THREE.PlaneGeometry(1.8, 1.05);
        const backboardMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9
        });
        
        const leftBackboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
        leftBackboard.position.set(-12.5, 3.05, 0);
        courtGroup.add(leftBackboard);
        
        const rightBackboard = leftBackboard.clone();
        rightBackboard.position.set(12.5, 3.05, 0);
        courtGroup.add(rightBackboard);
    }
    
    loadGLTF() {
        return new Promise((resolve, reject) => {
            if (!this.loader) {
                reject(new Error('GLTF loader not initialized'));
                return;
            }
            
            this.loader.load(
                this.config.modelPath,
                (gltf) => {
                    resolve(gltf);
                },
                (progress) => {
                    if (progress.lengthComputable) {
                        this.loadingProgress = (progress.loaded / progress.total) * 100;
                        console.log(`📊 Loading progress: ${this.loadingProgress.toFixed(1)}%`);
                        
                        if (this.onLoadProgress) {
                            this.onLoadProgress(this.loadingProgress);
                        }
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
    
    processLoadedModel(gltf) {
        console.log('🔄 Processing loaded model...');
        
        this.model = gltf;
        this.mesh = gltf.scene.clone();
        
        // Calculate bounding box
        this.calculateBoundingBox();
        
        // Ensure materials are properly set up
        this.setupMaterials();
        
        // Set initial transform
        this.applyInitialTransform();
        
        console.log('✅ Model processed:', {
            boundingBox: this.boundingBox,
            childCount: this.mesh.children.length
        });
    }
    
    calculateBoundingBox() {
        if (!this.mesh) return;
        
        const box = new THREE.Box3().setFromObject(this.mesh);
        this.boundingBox = {
            min: box.min,
            max: box.max,
            size: box.getSize(new THREE.Vector3()),
            center: box.getCenter(new THREE.Vector3())
        };
        
        console.log('📏 Model bounds:', this.boundingBox);
    }
    
    setupMaterials() {
        if (!this.mesh) return;
        
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                // Ensure materials work in AR lighting
                if (child.material) {
                    // Enable shadows if supported
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Optimize for mobile
                    if (child.material.map) {
                        child.material.map.minFilter = THREE.LinearFilter;
                        child.material.map.magFilter = THREE.LinearFilter;
                    }
                }
            }
        });
    }
    
    applyInitialTransform() {
        if (!this.mesh) return;
        
        // Apply configured scale
        this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
        
        // Apply configured position
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        // Apply configured rotation
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    }
    
    optimizeForAR() {
        if (!this.mesh) return;
        
        console.log('⚡ Optimizing model for AR...');
        
        // Reduce geometry complexity if needed
        if (this.config.optimizationLevel === 'high') {
            this.optimizeGeometry();
        }
        
        // Optimize textures
        this.optimizeTextures();
        
        // Set up frustum culling
        this.mesh.frustumCulled = true;
        
        // Enable automatic LOD if applicable
        this.setupLevelOfDetail();
        
        console.log('✅ AR optimization complete');
    }
    
    optimizeGeometry() {
        let vertexCount = 0;
        let faceCount = 0;
        
        this.mesh.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const geometry = child.geometry;
                
                // Count vertices and faces
                if (geometry.attributes.position) {
                    vertexCount += geometry.attributes.position.count;
                }
                if (geometry.index) {
                    faceCount += geometry.index.count / 3;
                }
                
                // Merge vertices
                if (geometry.mergeVertices) {
                    geometry.mergeVertices();
                }
                
                // Compute vertex normals if missing
                if (!geometry.attributes.normal) {
                    geometry.computeVertexNormals();
                }
            }
        });
        
        console.log(`📊 Model complexity: ${vertexCount} vertices, ${faceCount} faces`);
    }
    
    optimizeTextures() {
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const material = child.material;
                
                // Optimize texture settings for mobile
                if (material.map) {
                    material.map.generateMipmaps = false;
                    material.map.minFilter = THREE.LinearFilter;
                    material.map.magFilter = THREE.LinearFilter;
                }
                
                // Reduce material complexity for better performance
                if (material.normalMap) {
                    // Keep normal maps but optimize
                    material.normalMap.generateMipmaps = false;
                }
            }
        });
    }
    
    setupLevelOfDetail() {
        // Implement LOD system for complex models
        // This would create simplified versions for distant viewing
        console.log('📐 LOD system ready');
    }
    
    // Public methods for AR positioning
    
    setPosition(x, y, z) {
        this.position = { x, y, z };
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }
    
    setRotation(x, y, z) {
        this.rotation = { x, y, z };
        if (this.mesh) {
            this.mesh.rotation.set(x, y, z);
        }
    }
    
    setScale(x, y, z) {
        this.scale = { x, y, z };
        if (this.mesh) {
            this.mesh.scale.set(x, y, z);
        }
    }
    
    getMesh() {
        return this.mesh;
    }
    
    getBoundingBox() {
        return this.boundingBox;
    }
    
    isModelLoaded() {
        return this.isLoaded;
    }
    
    getLoadingProgress() {
        return this.loadingProgress;
    }
    
    // Utility methods
    
    async getModelFileSize() {
        try {
            const response = await fetch(this.config.modelPath, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength) : 0;
        } catch (error) {
            return 0;
        }
    }
    
    waitForLoad() {
        return new Promise((resolve, reject) => {
            const checkLoaded = () => {
                if (this.isLoaded) {
                    resolve(this.mesh);
                } else if (!this.isLoading) {
                    reject(new Error('Model loading failed'));
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        });
    }
    
    // Animation methods
    
    playAnimation(animationName) {
        if (this.model && this.model.animations) {
            const animation = this.model.animations.find(anim => anim.name === animationName);
            if (animation) {
                console.log(`🎬 Playing animation: ${animationName}`);
                // Animation playback would be implemented here
            }
        }
    }
    
    // Debug methods
    
    addWireframeOverlay() {
        if (!this.mesh) return;
        
        const wireframeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            wireframe: true 
        });
        
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                const wireframe = new THREE.Mesh(child.geometry, wireframeMaterial);
                wireframe.position.copy(child.position);
                wireframe.rotation.copy(child.rotation);
                wireframe.scale.copy(child.scale);
                this.mesh.add(wireframe);
            }
        });
    }
    
    addBoundingBoxHelper() {
        if (!this.mesh || !this.boundingBox) return;
        
        const box = new THREE.Box3(this.boundingBox.min, this.boundingBox.max);
        const helper = new THREE.Box3Helper(box, 0xff0000);
        this.mesh.add(helper);
    }
    
    exportModelInfo() {
        return {
            isLoaded: this.isLoaded,
            loadingProgress: this.loadingProgress,
            boundingBox: this.boundingBox,
            position: this.position,
            rotation: this.rotation,
            scale: this.scale,
            config: this.config,
            vertexCount: this.getVertexCount(),
            faceCount: this.getFaceCount()
        };
    }
    
    getVertexCount() {
        let count = 0;
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh && child.geometry && child.geometry.attributes.position) {
                    count += child.geometry.attributes.position.count;
                }
            });
        }
        return count;
    }
    
    getFaceCount() {
        let count = 0;
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh && child.geometry && child.geometry.index) {
                    count += child.geometry.index.count / 3;
                }
            });
        }
        return count;
    }
    
    // Cleanup
    
    dispose() {
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }
        
        this.model = null;
        this.mesh = null;
        this.isLoaded = false;
        
        console.log('🧹 Court model disposed');
    }
}

// Make available globally
window.CourtModel = CourtModel;
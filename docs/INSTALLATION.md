# 🛠️ Copenhagen Court Vision - Installation Guide

Complete setup instructions for deploying the AR basketball court visualization system.

## 📋 Prerequisites

### Required Software:
- **Rhino 3D** (for 3D model creation/editing)
- **Web browser** with camera support (Chrome, Safari, Edge)
- **Git** for version control
- **Text editor** (VS Code recommended)

### Required Assets:
- [ ] 3D court model (GLB format, <30MB)
- [ ] High-resolution court photo for landing page
- [ ] Copenhagen logo/branding assets
- [ ] QR code stickers (weatherproof)

## 🏗️ Project Setup

### 1. Repository Setup

**Fork and Clone:**
```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/copenhagen-court-vision.git
cd copenhagen-court-vision
```

**Or start from scratch:**
```bash
# Create new repository
git clone https://github.com/HelgiHreinnH/copenhagen-court-vision.git
cd copenhagen-court-vision

# Make it your own
rm -rf .git
git init
git add .
git commit -m "Initial commit: Copenhagen Court Vision"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. File Structure Setup

**Create missing directories:**
```bash
mkdir -p assets/{models,images,icons,qr-codes,audio}
mkdir -p css js tools docs
mkdir -p .github/workflows
```

**Verify structure:**
```
copenhagen-court-vision/
├── index.html                     ✓ Landing page
├── ar-experience.html             ✓ AR application  
├── manifest.json                  ✓ PWA config
├── css/
│   ├── main.css                   ✓ Global styles
│   ├── ar-overlay.css             ⚠️ Create this
│   ├── mobile-responsive.css      ⚠️ Create this
│   └── copenhagen-theme.css       ⚠️ Create this
├── js/
│   ├── qr-detector.js             ✓ QR scanning
│   ├── ar-manager.js              ⚠️ Create this
│   ├── court-model.js             ⚠️ Create this
│   ├── analytics.js               ⚠️ Create this
│   ├── feedback.js                ⚠️ Create this
│   └── utils.js                   ⚠️ Create this
├── assets/
│   ├── models/
│   │   ├── sonder_court.glb       🔴 Add your model
│   │   └── sonder_court.usdz       🔴 iOS version
│   ├── images/
│   │   ├── copenhagen-logo.png     🔴 Add logo
│   │   └── court-preview.jpg       🔴 Add hero image
│   └── qr-codes/                   🔴 Generate these
└── .github/workflows/
    └── deploy.yml                  ✓ Auto-deployment
```

## 🎨 3D Model Preparation

### Rhino 3D Export Process:

**1. Prepare Model in Rhino:**
```
1. Open your court model in Rhino 3D
2. Set document units to METERS
3. Position origin at entrance marker location (0,0,0)
4. Verify hoop positions:
   - Left hoop: approximately (-14, 1.6, 28)
   - Right hoop: approximately (14, 1.6, 28)
5. Check scale: Standard basketball hoop height = 3.05m
```

**2. Export Settings:**
```
File → Export Selected → Choose GLB
Export Options:
├── Include materials: ✓
├── Include textures: ✓  
├── Compression: High quality
├── File size target: <30MB
└── Coordinate system: Right-handed (Y-up)
```

**3. Validation:**
```bash
# Test file size
ls -lh assets/models/sonder_court.glb

# Should be under 30MB for mobile performance
# If larger, reduce texture resolution or simplify geometry
```

**4. iOS Version (Optional):**
```
File → Export Selected → Choose USDZ
- Same settings as GLB
- Place in assets/models/sonder_court.usdz
- Enables iOS AR Quick Look fallback
```

## 📱 QR Code Generation

### 1. Generate QR Codes

**Using tools/qr-generator.html:**
```html
<!-- Create this file -->
<!DOCTYPE html>
<html>
<head>
    <title>QR Code Generator</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body>
    <h1>Copenhagen Court Vision - QR Generator</h1>
    
    <div id="qr-entrance">
        <h3>Entrance QR (Point A)</h3>
        <canvas id="canvas-entrance"></canvas>
        <p>URL: <span id="url-entrance"></span></p>
    </div>
    
    <script>
        const baseURL = 'https://YOUR_USERNAME.github.io/copenhagen-court-vision';
        
        const qrCodes = [
            { id: 'entrance', url: `${baseURL}/ar-experience.html?start=entrance` },
            { id: 'left', url: `${baseURL}/ar-experience.html?marker=left` },
            { id: 'right', url: `${baseURL}/ar-experience.html?marker=right` }
        ];
        
        qrCodes.forEach(qr => {
            QRCode.toCanvas(document.getElementById(`canvas-${qr.id}`), qr.url, {
                width: 256,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });
            document.getElementById(`url-${qr.id}`).textContent = qr.url;
        });
    </script>
</body>
</html>
```

### 2. Print QR Codes

**Specifications:**
- **Entrance QR:** A4 size (210×297mm), laminated poster
- **Hoop QRs:** 40×40mm, weatherproof stickers
- **Material:** UV-resistant, waterproof
- **Colors:** High contrast black/white

**Printing checklist:**
- [ ] Test scan QR codes before printing
- [ ] Use high-quality printer (600+ DPI)
- [ ] Laminate for weather protection
- [ ] Include backup copies

## 🌐 Deployment

### Option 1: GitHub Pages (Recommended)

**1. Enable GitHub Pages:**
```
Repository Settings → Pages → Source: GitHub Actions
```

**2. Push to trigger deployment:**
```bash
git add .
git commit -m "Initial Copenhagen Court Vision setup"
git push origin main
```

**3. Verify deployment:**
```
Site will be available at:
https://YOUR_USERNAME.github.io/copenhagen-court-vision/
```

### Option 2: Manual Hosting

**Requirements:**
- HTTPS hosting (required for camera access)
- Static file serving capability

**Upload files to your web host:**
```bash
# Example using rsync
rsync -avz --delete . user@yourhost.com:/var/www/court-vision/
```

## 📍 Physical Installation

### 1. Site Survey

**Measure and record:**
- [ ] Court dimensions (length × width)
- [ ] Hoop positions (GPS coordinates if available)
- [ ] Entrance location
- [ ] Lighting conditions throughout day
- [ ] Potential QR code mounting points

**Survey checklist:**
```
Court Length: _____ meters
Court Width: _____ meters
Hoop Height: _____ meters (should be 3.05m)
Left Hoop GPS: _____, _____
Right Hoop GPS: _____, _____
Entrance GPS: _____, _____
```

### 2. QR Code Installation

**Entrance (Point A):**
- Mount A4 laminated poster at eye level (1.5m height)
- Secure against theft/vandalism
- Ensure clear sight lines for scanning

**Hoops (Points B & C):**
- Attach 40mm stickers to hoop frames
- Height: exactly 1600mm above ground
- Position on frame side facing court entrance
- Clean surface before application

**Installation verification:**
- [ ] All QR codes scan successfully
- [ ] URLs load correctly on mobile devices
- [ ] No obstructions blocking scan angles
- [ ] Codes remain readable in various lighting

### 3. Coordinate Mapping

**Update model coordinates:**
```javascript
// In js/qr-detector.js, update qrConfig:
this.qrConfig = {
    entrance: {
        position: { x: 0, y: 0, z: 0 }, // Origin
        // ... other properties
    },
    left: {
        position: { x: -14, y: 1.6, z: 28 }, // Measured position
        // ... other properties  
    },
    right: {
        position: { x: 14, y: 1.6, z: 28 }, // Measured position
        // ... other properties
    }
};
```

## 🧪 Testing

### 1. Browser Testing

**Test on multiple devices:**
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Desktop (Chrome/Firefox/Edge)

**Test scenarios:**
- [ ] QR code scanning works
- [ ] Camera permission granted
- [ ] AR model loads and positions correctly
- [ ] Feedback submission works
- [ ] Performance acceptable (>20 FPS)

### 2. On-site Testing

**Test at actual court location:**
- [ ] Scan all three QR codes in sequence
- [ ] Verify AR model alignment with real court
- [ ] Test in different lighting conditions
- [ ] Verify at different distances from court
- [ ] Test with multiple users simultaneously

**Performance checklist:**
- [ ] AR tracking stable
- [ ] Model appears in correct position
- [ ] No significant drift or jitter
- [ ] Feedback system functional
- [ ] Analytics recording properly

## 📊 Analytics Setup

### 1. Basic Analytics (Built-in)

Analytics are automatically tracked to browser localStorage. Access via:

```javascript
// In browser console
const analytics = new AnalyticsTracker();
analytics.getDashboardData().then(console.log);
```

### 2. Advanced Analytics (Optional)

**Google Analytics integration:**
```html
<!-- Add to <head> of all HTML files -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔧 Troubleshooting

### Common Issues:

**1. Camera access denied:**
- Ensure HTTPS hosting
- Check browser permissions
- Test on different browsers

**2. AR model not appearing:**
- Verify GLB file size <30MB
- Check browser WebGL support
- Validate model coordinates

**3. QR codes not scanning:**
- Ensure good lighting
- Check QR code print quality
- Verify URLs are correct
- Test different scanning distances

**4. Performance issues:**
- Reduce model complexity
- Optimize textures
- Check device capabilities
- Monitor memory usage

### Debug Tools:

**Enable debug mode:**
```
Tap top-left corner 5 times rapidly
```

**Browser console:**
```javascript
// Check AR support
console.log('WebGL:', !!window.WebGLRenderingContext);
console.log('Camera:', !!navigator.mediaDevices);

// View analytics
window.analytics?.exportDebugData();
```

## 🚀 Going Live

### Pre-launch Checklist:

**Technical:**
- [ ] All QR codes tested and working
- [ ] AR model positioned correctly
- [ ] Analytics tracking functional
- [ ] Performance acceptable on target devices
- [ ] Error handling working properly

**Physical:**
- [ ] QR codes installed at court
- [ ] Signs/instructions posted if needed
- [ ] Contact information available for issues
- [ ] Weather protection verified

**Legal/Administrative:**
- [ ] Municipal approval obtained
- [ ] Privacy policy updated
- [ ] Data collection consent handled
- [ ] Accessibility compliance checked

### Launch Strategy:

**1. Soft Launch (1 week):**
- Limited promotion
- Monitor for technical issues
- Gather initial feedback
- Fix any critical bugs

**2. Public Launch:**
- Social media promotion
- Municipal announcement
- Community engagement
- Press coverage

**3. Ongoing Monitoring:**
- Weekly analytics review
- User feedback collection
- Performance optimization
- Feature updates

## 📞 Support

### Getting Help:

**Documentation:**
- [Project README](../README.md)
- [Analytics Guide](ANALYTICS.md)
- [Customization Guide](CUSTOMIZATION.md)

**Community:**
- [GitHub Issues](https://github.com/HelgiHreinnH/copenhagen-court-vision/issues)
- [Discussions](https://github.com/HelgiHreinnH/copenhagen-court-vision/discussions)

**Emergency Contact:**
For critical issues during public deployment, contact: [your-email@example.com]

---

**🎯 Success Criteria:**
- >75% QR scan success rate
- >50% user completion rate
- Municipal stakeholder satisfaction
- Community engagement goals met

**Next Steps:**
After successful deployment, consider [customizing for other cities](CUSTOMIZATION.md) or exploring advanced features like multiple court support and multilingual interfaces.

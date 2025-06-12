# 🏀 Copenhagen Court Vision

**Web-based AR visualization of basketball court improvements for municipal decision-making**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://helgihreinnh.github.io/copenhagen-court-vision/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![AR.js](https://img.shields.io/badge/AR-AR.js-orange)](https://ar-js-org.github.io/AR.js-Docs/)

## 🎯 Overview

Copenhagen Court Vision is a progressive web app that uses augmented reality to show citizens and municipal stakeholders how a basketball court could be transformed with proposed improvements. Users scan QR codes positioned on the basketball hoops to calibrate the AR system and see a 1:1 scale 3D model of the upgraded court overlaid on the real environment.

### ✨ Key Features

- 📱 **Web-based AR** - No app download required, works on all smartphones
- 🔲 **3-point QR calibration** - Precise positioning using entrance + both hoops  
- 📊 **Real-time analytics** - Track usage and collect community feedback
- 🏀 **1:1 scale visualization** - Accurate representation of proposed changes
- 💬 **Community voting** - Yes/No/Neutral feedback for municipal decisions
- 🌐 **Cross-platform** - Works on iOS, Android, desktop browsers

## 🚀 Live Demo

**Primary:** [https://helgihreinnh.github.io/copenhagen-court-vision/](https://helgihreinnh.github.io/copenhagen-court-vision/)

### QR Code Links (for testing):
- **Entrance:** `https://helgihreinnh.github.io/copenhagen-court-vision/ar-experience.html?start=entrance`
- **Left Hoop:** `https://helgihreinnh.github.io/copenhagen-court-vision/ar-experience.html?marker=left`  
- **Right Hoop:** `https://helgihreinnh.github.io/copenhagen-court-vision/ar-experience.html?marker=right`

## 📱 How to Use

### For Citizens:
1. **Visit the basketball court** in Copenhagen
2. **Scan the QR code** on either basketball hoop frame (1600mm height)
3. **Follow the AR calibration** to position the court model
4. **Explore the AR court vision** and see proposed improvements
5. **Submit your feedback** - support or oppose the upgrade

### For Municipal Stakeholders:
1. **Visit the live demo** to see the technology in action
2. **Review analytics dashboard** for community engagement data
3. **Access feedback reports** showing citizen opinions
4. **Use for presentations** and community meetings

## 🛠️ Technical Implementation

### Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **AR Framework:** AR.js + Three.js
- **3D Models:** GLB format (exported from Rhino 3D)
- **PWA:** Service Worker, Web App Manifest
- **Analytics:** Local storage + optional backend integration

### Architecture
```
Web Browser (Mobile/Desktop)
├── Camera Access (WebRTC)
├── AR.js (Marker tracking)
├── Three.js (3D rendering)
├── GLB Model (Court visualization)
└── Local Analytics (Usage tracking)
```

## 📐 QR Code & Positioning System

The app uses a **3-point calibration system** for precise AR positioning:

### QR Code Locations:
- **Point A (Entrance):** Large poster at court entrance (A4 size)
- **Point B (Left Hoop):** Sticker on left hoop frame at **1600mm height**
- **Point C (Right Hoop):** Sticker on right hoop frame at **1600mm height**

### Positioning Algorithm:
1. **Entrance QR** establishes origin point and court orientation
2. **Hoop QRs** define court scale and precise positioning (Z-axis: +1600mm)
3. **3D model** placed using triangulation between three points
4. **Court appears** perfectly aligned with real basketball court at 1:1 scale

### Physical Setup:
- QR codes printed on weatherproof stickers
- Exact placement coordinates surveyed and mapped
- Model origin aligned with entrance marker position
- Hoop heights verified at 1600mm above ground

## 📊 Analytics & Feedback

### Tracked Metrics:
- **Session Count:** Number of people who used the experience
- **Completion Rate:** Percentage who successfully completed AR calibration
- **Feedback Votes:** Yes/No/Neutral responses with percentages
- **Device Analytics:** Browser/OS compatibility data
- **Usage Patterns:** Peak times, return visitors

### Data Access:
- **Real-time:** Tap top-left corner 5 times for debug panel
- **Export:** Browser console: `exportAllFeedback()`
- **Dashboard:** `/tools/debug-dashboard.html` (admin access)

## 🏗️ Setup & Deployment

### Prerequisites:
- 3D court model in GLB format (exported from Rhino 3D)
- QR codes printed and installed at court location
- Web hosting with HTTPS (required for camera access)

### Quick Deploy to GitHub Pages:
1. **Fork this repository**
2. **Update URLs** in `js/qr-detector.js` with your GitHub Pages domain
3. **Add your 3D model** to `assets/models/sonder_court.glb`
4. **Enable GitHub Pages** in repository settings
5. **Generate QR codes** using `/tools/qr-generator.html`

### Model Requirements (Rhino 3D Export):
- **Format:** GLB (optimized for web)
- **Scale:** 1:1 real-world measurements (critical!)
- **Size:** <30MB for mobile performance
- **Origin:** Set at entrance marker location (0,0,0)
- **Coordinates:** Hoops at exact surveyed positions, 1.6m height
- **Materials:** Embedded textures and colors

## 🎨 Rhino 3D to AR Workflow

### Export Settings:
1. **Set units** to meters in Rhino
2. **Place origin** at entrance marker position
3. **Export as GLB** with materials embedded
4. **Verify scale** using known measurements (hoop height = 1.6m)
5. **Test in browser** before deployment

### Alternative: USDZ for iOS
- Export USDZ from Rhino for iOS AR Quick Look
- Place in `assets/models/sonder_court.usdz`
- Automatic fallback for iOS users

## 🎯 Customization for Other Cities

### For Other Municipalities:
1. **Update branding** in `assets/images/` and CSS
2. **Replace 3D model** with your court design
3. **Modify text content** in HTML files
4. **Survey your court** and update coordinates
5. **Generate new QR codes** with your domain

### Physical Setup Checklist:
- [ ] Survey exact court dimensions
- [ ] Identify QR code placement points
- [ ] Measure heights and distances precisely
- [ ] Update 3D model coordinates accordingly
- [ ] Test AR alignment before public deployment

## 📈 Municipal Benefits

### Community Engagement:
- **Higher participation** than traditional consultation methods
- **Visual understanding** of proposed changes
- **Real-time feedback** collection and analysis
- **Cost-effective** consultation process

### Decision Support:
- **Data-driven insights** into community preferences
- **Professional presentation** tool for stakeholders
- **Transparent** public engagement documentation
- **Scalable** to multiple court locations

## 🤝 Contributing

We welcome contributions! This project serves as a template for other municipalities.

### Areas for Enhancement:
- **Multiple language support** (Danish/English)
- **Backend analytics integration**
- **A/B testing for different designs**
- **Accessibility improvements**
- **Performance optimizations**

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎯 Project Status

### Current Phase: MVP Development
- **Status:** Ready for deployment and testing
- **Target:** Copenhagen basketball court upgrade consultation
- **Location:** [Insert specific Copenhagen court address]

### Success Metrics:
- **Engagement:** Target >100 citizens in first month
- **Completion:** >75% successful AR calibrations
- **Feedback:** >50% of users submit votes
- **Municipal Impact:** Inform court upgrade decision

## 📞 Contact

**Project Lead:** Helgi Hreinn Helgason  
**GitHub:** [@HelgiHreinnH](https://github.com/HelgiHreinnH)  
**Repository:** [copenhagen-court-vision](https://github.com/HelgiHreinnH/copenhagen-court-vision)

## 🙏 Acknowledgments

- **Copenhagen Municipality** for supporting innovative civic engagement
- **AR.js Community** for open-source AR framework
- **Three.js Team** for 3D rendering capabilities
- **Citizens of Copenhagen** for participating in the vision

---

**Built with ❤️ for better urban spaces and community engagement**

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Analytics Guide](docs/ANALYTICS.md)
- [Customization Guide](docs/CUSTOMIZATION.md)
- [API Documentation](docs/API.md)
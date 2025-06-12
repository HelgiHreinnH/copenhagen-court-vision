/**
 * Copenhagen Court Vision - Analytics System
 * Tracks user engagement, technical performance, and community feedback
 */

class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();
        this.events = [];
        this.storageKey = 'copenhagen_court_analytics';
        this.feedbackKey = 'copenhagen_court_feedback';
        this.deviceInfo = this.getDeviceInfo();
        
        // Initialize session
        this.trackEvent('session_start', {
            sessionId: this.sessionId,
            device: this.deviceInfo,
            url: window.location.href,
            referrer: document.referrer
        });
        
        console.log('📊 Analytics initialized:', this.sessionId);
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getDeviceInfo() {
        const ua = navigator.userAgent;
        
        return {
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio || 1
            },
            browser: this.detectBrowser(ua),
            mobile: this.isMobile(ua),
            ar: {
                webgl: !!window.WebGLRenderingContext,
                camera: !!navigator.mediaDevices?.getUserMedia,
                deviceMotion: 'DeviceMotionEvent' in window,
                deviceOrientation: 'DeviceOrientationEvent' in window
            },
            timestamp: new Date().toISOString()
        };
    }
    
    detectBrowser(ua) {
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1) return 'Safari';
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Edge') > -1) return 'Edge';
        return 'Unknown';
    }
    
    isMobile(ua) {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    }
    
    trackEvent(eventType, data = {}) {
        const event = {
            eventType,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            url: window.location.href,
            data: {
                ...data,
                sessionDuration: Date.now() - this.sessionStart
            }
        };
        
        this.events.push(event);
        this.storeEvent(event);
        
        console.log('📈 Event tracked:', eventType, data);
        
        // Also send to external analytics if configured
        this.sendToExternalAnalytics(event);
    }
    
    storeEvent(event) {
        try {
            // Get existing events from localStorage
            const existingEvents = this.getStoredEvents();
            existingEvents.push(event);
            
            // Keep only last 1000 events to prevent storage overflow
            const recentEvents = existingEvents.slice(-1000);
            
            localStorage.setItem(this.storageKey, JSON.stringify(recentEvents));
        } catch (error) {
            console.warn('Failed to store analytics event:', error);
        }
    }
    
    getStoredEvents() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to retrieve stored events:', error);
            return [];
        }
    }
    
    sendToExternalAnalytics(event) {
        // Google Analytics 4 integration
        if (typeof gtag !== 'undefined') {
            gtag('event', event.eventType, {
                event_category: 'AR_Experience',
                event_label: event.data.markerId || event.data.step || 'general',
                value: event.data.duration || 1,
                custom_parameters: {
                    session_id: this.sessionId,
                    device_type: this.deviceInfo.mobile ? 'mobile' : 'desktop',
                    browser: this.deviceInfo.browser
                }
            });
        }
        
        // Custom webhook integration (optional)
        if (window.ANALYTICS_WEBHOOK_URL) {
            this.sendToWebhook(event);
        }
    }
    
    async sendToWebhook(event) {
        try {
            await fetch(window.ANALYTICS_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project: 'copenhagen_court_vision',
                    event: event
                })
            });
        } catch (error) {
            console.warn('Failed to send to webhook:', error);
        }
    }
    
    // Specific tracking methods for common events
    
    trackMarkerDetection(markerId, success = true, duration = null) {
        this.trackEvent('marker_detection', {
            markerId,
            success,
            duration,
            step: this.getCalibrationStep(markerId)
        });
    }
    
    trackCalibrationComplete(markers, duration) {
        this.trackEvent('calibration_complete', {
            markers: markers,
            duration: duration,
            success: true
        });
    }
    
    trackModelPlacement(success, errorMessage = null) {
        this.trackEvent('model_placement', {
            success,
            errorMessage
        });
    }
    
    trackFeedbackSubmission(feedback) {
        // Store feedback separately
        this.storeFeedback(feedback);
        
        this.trackEvent('feedback_submitted', {
            vote: feedback.vote,
            hasComment: !!feedback.comment,
            demographics: feedback.demographics || {}
        });
    }
    
    trackError(errorType, errorMessage, context = {}) {
        this.trackEvent('error_occurred', {
            errorType,
            errorMessage,
            context,
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    }
    
    trackPerformance(metric, value, unit = 'ms') {
        this.trackEvent('performance_metric', {
            metric,
            value,
            unit,
            timestamp: performance.now()
        });
    }
    
    getCalibrationStep(markerId) {
        const stepMap = {
            'entrance': 1,
            'left': 2,
            'right': 3
        };
        return stepMap[markerId] || 0;
    }
    
    // Feedback management
    
    storeFeedback(feedback) {
        try {
            const existingFeedback = this.getStoredFeedback();
            const feedbackEntry = {
                ...feedback,
                sessionId: this.sessionId,
                timestamp: Date.now(),
                deviceInfo: this.deviceInfo
            };
            
            existingFeedback.push(feedbackEntry);
            localStorage.setItem(this.feedbackKey, JSON.stringify(existingFeedback));
            
            console.log('💬 Feedback stored:', feedback);
        } catch (error) {
            console.warn('Failed to store feedback:', error);
        }
    }
    
    getStoredFeedback() {
        try {
            const stored = localStorage.getItem(this.feedbackKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to retrieve stored feedback:', error);
            return [];
        }
    }
    
    // Analytics dashboard data
    
    async getDashboardData() {
        const events = this.getStoredEvents();
        const feedback = this.getStoredFeedback();
        
        return {
            overview: this.calculateOverviewStats(events),
            funnel: this.calculateFunnelStats(events),
            feedback: this.calculateFeedbackStats(feedback),
            performance: this.calculatePerformanceStats(events),
            devices: this.calculateDeviceStats(events),
            errors: this.calculateErrorStats(events),
            generatedAt: new Date().toISOString()
        };
    }
    
    calculateOverviewStats(events) {
        const sessions = new Set(events.map(e => e.sessionId));
        const successfulSessions = new Set(
            events.filter(e => e.eventType === 'calibration_complete').map(e => e.sessionId)
        );
        
        return {
            totalSessions: sessions.size,
            successfulSessions: successfulSessions.size,
            successRate: sessions.size > 0 ? (successfulSessions.size / sessions.size) * 100 : 0,
            totalEvents: events.length,
            avgSessionDuration: this.calculateAvgSessionDuration(events)
        };
    }
    
    calculateFunnelStats(events) {
        const sessions = new Set(events.map(e => e.sessionId));
        const cameraStarted = new Set(
            events.filter(e => e.eventType === 'camera_started').map(e => e.sessionId)
        );
        const markersDetected = new Set(
            events.filter(e => e.eventType === 'marker_detected').map(e => e.sessionId)
        );
        const calibrationComplete = new Set(
            events.filter(e => e.eventType === 'calibration_complete').map(e => e.sessionId)
        );
        const feedbackSubmitted = new Set(
            events.filter(e => e.eventType === 'feedback_submitted').map(e => e.sessionId)
        );
        
        return {
            sessions: sessions.size,
            cameraStarted: cameraStarted.size,
            markersDetected: markersDetected.size,
            calibrationComplete: calibrationComplete.size,
            feedbackSubmitted: feedbackSubmitted.size
        };
    }
    
    calculateFeedbackStats(feedback) {
        const votes = feedback.map(f => f.vote).filter(Boolean);
        const voteCounts = votes.reduce((acc, vote) => {
            acc[vote] = (acc[vote] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total: feedback.length,
            yes: voteCounts.yes || 0,
            no: voteCounts.no || 0,
            neutral: voteCounts.neutral || 0,
            withComments: feedback.filter(f => f.comment).length,
            averageRating: this.calculateAverageRating(votes)
        };
    }
    
    calculatePerformanceStats(events) {
        const performanceEvents = events.filter(e => e.eventType === 'performance_metric');
        
        const metrics = performanceEvents.reduce((acc, event) => {
            const metric = event.data.metric;
            if (!acc[metric]) acc[metric] = [];
            acc[metric].push(event.data.value);
            return acc;
        }, {});
        
        const stats = {};
        for (const [metric, values] of Object.entries(metrics)) {
            stats[metric] = {
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                count: values.length
            };
        }
        
        return stats;
    }
    
    calculateDeviceStats(events) {
        const sessionEvents = events.filter(e => e.eventType === 'session_start');
        
        const browsers = {};
        const platforms = {};
        const mobile = { mobile: 0, desktop: 0 };
        
        sessionEvents.forEach(event => {
            const device = event.data.device;
            if (device) {
                browsers[device.browser] = (browsers[device.browser] || 0) + 1;
                platforms[device.platform] = (platforms[device.platform] || 0) + 1;
                if (device.mobile) {
                    mobile.mobile++;
                } else {
                    mobile.desktop++;
                }
            }
        });
        
        return { browsers, platforms, mobile };
    }
    
    calculateErrorStats(events) {
        const errorEvents = events.filter(e => e.eventType === 'error_occurred');
        
        const errorTypes = {};
        errorEvents.forEach(event => {
            const type = event.data.errorType || 'unknown';
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });
        
        return {
            total: errorEvents.length,
            types: errorTypes,
            errorRate: events.length > 0 ? (errorEvents.length / events.length) * 100 : 0
        };
    }
    
    calculateAvgSessionDuration(events) {
        const sessionDurations = {};
        
        events.forEach(event => {
            const sessionId = event.sessionId;
            if (!sessionDurations[sessionId]) {
                sessionDurations[sessionId] = { start: event.timestamp, end: event.timestamp };
            } else {
                sessionDurations[sessionId].end = Math.max(sessionDurations[sessionId].end, event.timestamp);
            }
        });
        
        const durations = Object.values(sessionDurations).map(s => s.end - s.start);
        return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    }
    
    calculateAverageRating(votes) {
        const ratingMap = { yes: 5, neutral: 3, no: 1 };
        const ratings = votes.map(vote => ratingMap[vote]).filter(Boolean);
        return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    }
    
    // Export functions
    
    exportData(format = 'json') {
        const data = {
            meta: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                project: 'copenhagen_court_vision'
            },
            events: this.getStoredEvents(),
            feedback: this.getStoredFeedback(),
            dashboard: null // Will be populated below
        };
        
        return this.getDashboardData().then(dashboardData => {
            data.dashboard = dashboardData;
            
            if (format === 'csv') {
                return this.exportToCSV(data);
            } else {
                return this.exportToJSON(data);
            }
        });
    }
    
    exportToJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        this.downloadBlob(blob, 'copenhagen-court-analytics.json');
        return data;
    }
    
    exportToCSV(data) {
        // Convert events to CSV
        const eventsCSV = this.convertEventsToCSV(data.events);
        const feedbackCSV = this.convertFeedbackToCSV(data.feedback);
        
        const combinedCSV = 'EVENTS\n' + eventsCSV + '\n\nFEEDBACK\n' + feedbackCSV;
        
        const blob = new Blob([combinedCSV], {
            type: 'text/csv'
        });
        this.downloadBlob(blob, 'copenhagen-court-analytics.csv');
        return combinedCSV;
    }
    
    convertEventsToCSV(events) {
        if (events.length === 0) return '';
        
        const headers = ['timestamp', 'eventType', 'sessionId', 'url', 'data'];
        const rows = events.map(event => [
            new Date(event.timestamp).toISOString(),
            event.eventType,
            event.sessionId,
            event.url,
            JSON.stringify(event.data)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    convertFeedbackToCSV(feedback) {
        if (feedback.length === 0) return '';
        
        const headers = ['timestamp', 'sessionId', 'vote', 'comment', 'device'];
        const rows = feedback.map(fb => [
            new Date(fb.timestamp).toISOString(),
            fb.sessionId,
            fb.vote,
            fb.comment || '',
            fb.deviceInfo?.browser || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Admin functions
    
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.feedbackKey);
        this.events = [];
        console.log('🗑️ Analytics data cleared');
    }
    
    exportDebugData() {
        return {
            sessionId: this.sessionId,
            sessionStart: this.sessionStart,
            currentEvents: this.events,
            storedEvents: this.getStoredEvents(),
            storedFeedback: this.getStoredFeedback(),
            deviceInfo: this.deviceInfo
        };
    }
    
    // Utility methods
    
    generateReport() {
        return this.getDashboardData().then(data => {
            const report = {
                summary: `Copenhagen Court Vision - Analytics Report\nGenerated: ${data.generatedAt}\n\n`,
                overview: this.formatOverviewReport(data.overview),
                funnel: this.formatFunnelReport(data.funnel),
                feedback: this.formatFeedbackReport(data.feedback),
                devices: this.formatDeviceReport(data.devices)
            };
            
            return report;
        });
    }
    
    formatOverviewReport(overview) {
        return `OVERVIEW:
Total Sessions: ${overview.totalSessions}
Successful Sessions: ${overview.successfulSessions}
Success Rate: ${overview.successRate.toFixed(1)}%
Average Duration: ${Math.round(overview.avgSessionDuration / 1000)}s
`;
    }
    
    formatFunnelReport(funnel) {
        return `USER FUNNEL:
Started Sessions: ${funnel.sessions}
Camera Started: ${funnel.cameraStarted} (${Math.round(funnel.cameraStarted/funnel.sessions*100)}%)
Markers Detected: ${funnel.markersDetected} (${Math.round(funnel.markersDetected/funnel.sessions*100)}%)
Calibration Complete: ${funnel.calibrationComplete} (${Math.round(funnel.calibrationComplete/funnel.sessions*100)}%)
Feedback Submitted: ${funnel.feedbackSubmitted} (${Math.round(funnel.feedbackSubmitted/funnel.sessions*100)}%)
`;
    }
    
    formatFeedbackReport(feedback) {
        const total = feedback.yes + feedback.no + feedback.neutral;
        return `COMMUNITY FEEDBACK:
Total Responses: ${feedback.total}
Support (Yes): ${feedback.yes} (${total > 0 ? Math.round(feedback.yes/total*100) : 0}%)
Oppose (No): ${feedback.no} (${total > 0 ? Math.round(feedback.no/total*100) : 0}%)
Neutral: ${feedback.neutral} (${total > 0 ? Math.round(feedback.neutral/total*100) : 0}%)
With Comments: ${feedback.withComments}
Average Rating: ${feedback.averageRating.toFixed(1)}/5
`;
    }
    
    formatDeviceReport(devices) {
        const topBrowser = Object.entries(devices.browsers).sort((a,b) => b[1] - a[1])[0];
        const mobilePercentage = Math.round(devices.mobile.mobile / (devices.mobile.mobile + devices.mobile.desktop) * 100);
        
        return `DEVICE BREAKDOWN:
Mobile: ${mobilePercentage}%
Desktop: ${100 - mobilePercentage}%
Top Browser: ${topBrowser ? topBrowser[0] : 'N/A'}
`;
    }
}

// Make available globally
window.AnalyticsTracker = AnalyticsTracker;

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.TEST_MODE) {
    window.analytics = new AnalyticsTracker();
}
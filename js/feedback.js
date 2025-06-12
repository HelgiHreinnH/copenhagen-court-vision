/**
 * Copenhagen Court Vision - Feedback System
 * Handles community feedback collection and municipal reporting
 */

class FeedbackSystem {
    constructor() {
        this.isVisible = false;
        this.currentFeedback = null;
        this.onSubmitCallback = null;
        this.storageKey = 'copenhagen_court_feedback';
        
        // Feedback form HTML template
        this.feedbackHTML = this.createFeedbackHTML();
        
        console.log('💬 Feedback system initialized');
    }
    
    createFeedbackHTML() {
        return `
            <div class="feedback-overlay" id="feedback-overlay">
                <div class="feedback-modal">
                    <div class="feedback-header">
                        <h2>🏀 Your Opinion Matters</h2>
                        <p>Help shape the future of this basketball court</p>
                        <button class="feedback-close" id="feedback-close">×</button>
                    </div>
                    
                    <div class="feedback-content">
                        <!-- Question 1: Support Level -->
                        <div class="feedback-section">
                            <h3>Do you support upgrading this basketball court?</h3>
                            <div class="vote-buttons">
                                <button class="vote-btn vote-yes" data-vote="yes">
                                    <span class="vote-icon">👍</span>
                                    <span class="vote-label">Yes, I support it</span>
                                </button>
                                <button class="vote-btn vote-neutral" data-vote="neutral">
                                    <span class="vote-icon">🤷</span>
                                    <span class="vote-label">I don't mind</span>
                                </button>
                                <button class="vote-btn vote-no" data-vote="no">
                                    <span class="vote-icon">👎</span>
                                    <span class="vote-label">No, I oppose it</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Question 2: Comments -->
                        <div class="feedback-section">
                            <h3>Any additional thoughts? (Optional)</h3>
                            <textarea id="feedback-comment" placeholder="Share your ideas, concerns, or suggestions..."></textarea>
                        </div>
                        
                        <!-- Question 3: Demographics (Optional) -->
                        <div class="feedback-section collapsible">
                            <h3>
                                <button class="section-toggle" id="demographics-toggle">
                                    Help us understand the community (Optional) ▼
                                </button>
                            </h3>
                            <div class="section-content" id="demographics-content" style="display: none;">
                                <div class="demo-grid">
                                    <div class="demo-item">
                                        <label>Age range:</label>
                                        <select id="demo-age">
                                            <option value="">Prefer not to say</option>
                                            <option value="under-18">Under 18</option>
                                            <option value="18-29">18-29</option>
                                            <option value="30-49">30-49</option>
                                            <option value="50-69">50-69</option>
                                            <option value="70+">70+</option>
                                        </select>
                                    </div>
                                    
                                    <div class="demo-item">
                                        <label>Do you play basketball?</label>
                                        <select id="demo-plays">
                                            <option value="">Prefer not to say</option>
                                            <option value="regularly">Yes, regularly</option>
                                            <option value="sometimes">Yes, sometimes</option>
                                            <option value="rarely">Rarely</option>
                                            <option value="never">No</option>
                                        </select>
                                    </div>
                                    
                                    <div class="demo-item">
                                        <label>Connection to area:</label>
                                        <select id="demo-connection">
                                            <option value="">Prefer not to say</option>
                                            <option value="resident">I live nearby</option>
                                            <option value="work">I work nearby</option>
                                            <option value="visitor">I visit sometimes</option>
                                            <option value="passing">Just passing by</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Privacy Notice -->
                        <div class="feedback-section privacy-notice">
                            <p>
                                🔒 <strong>Privacy:</strong> Your feedback is anonymous and will be used 
                                to inform municipal decision-making about court improvements. 
                                No personal data is collected.
                            </p>
                        </div>
                    </div>
                    
                    <div class="feedback-actions">
                        <button class="btn btn-secondary" id="feedback-cancel">Maybe Later</button>
                        <button class="btn btn-primary" id="feedback-submit" disabled>
                            <span class="btn-icon">📤</span>
                            Submit Feedback
                        </button>
                    </div>
                    
                    <!-- Thank You State -->
                    <div class="feedback-thanks" id="feedback-thanks" style="display: none;">
                        <div class="thanks-icon">🎉</div>
                        <h2>Thank You!</h2>
                        <p>Your feedback has been recorded and will help inform the decision about this court upgrade.</p>
                        <div class="thanks-stats">
                            <p><strong>Community Response So Far:</strong></p>
                            <div class="stats-grid" id="community-stats">
                                <div class="stat-item">
                                    <span class="stat-number" id="yes-count">--</span>
                                    <span class="stat-label">Support</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="neutral-count">--</span>
                                    <span class="stat-label">Neutral</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number" id="no-count">--</span>
                                    <span class="stat-label">Oppose</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="feedback-done">Done</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    show(options = {}) {
        if (this.isVisible) return;
        
        console.log('💬 Showing feedback form');
        
        // Store callback
        this.onSubmitCallback = options.onSubmit;
        
        // Inject HTML if not already present
        if (!document.getElementById('feedback-overlay')) {
            document.body.insertAdjacentHTML('beforeend', this.feedbackHTML);
            this.attachEventListeners();
        }
        
        // Show the modal
        const overlay = document.getElementById('feedback-overlay');
        overlay.style.display = 'flex';
        this.isVisible = true;
        
        // Reset form state
        this.resetForm();
        
        // Track analytics
        if (window.analytics) {
            window.analytics.trackEvent('feedback_form_opened');
        }
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstVoteBtn = document.querySelector('.vote-btn');
            if (firstVoteBtn) firstVoteBtn.focus();
        }, 100);
    }
    
    hide() {
        if (!this.isVisible) return;
        
        const overlay = document.getElementById('feedback-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.isVisible = false;
        
        console.log('💬 Feedback form hidden');
    }
    
    attachEventListeners() {
        // Close button
        document.getElementById('feedback-close')?.addEventListener('click', () => {
            this.hide();
            if (window.analytics) {
                window.analytics.trackEvent('feedback_form_closed', { method: 'close_button' });
            }
        });
        
        // Cancel button
        document.getElementById('feedback-cancel')?.addEventListener('click', () => {
            this.hide();
            if (window.analytics) {
                window.analytics.trackEvent('feedback_form_closed', { method: 'cancel' });
            }
        });
        
        // Vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleVoteSelection(e.target.closest('.vote-btn'));
            });
        });
        
        // Demographics toggle
        document.getElementById('demographics-toggle')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDemographicsSection();
        });
        
        // Submit button
        document.getElementById('feedback-submit')?.addEventListener('click', () => {
            this.submitFeedback();
        });
        
        // Done button (thank you state)
        document.getElementById('feedback-done')?.addEventListener('click', () => {
            this.hide();
        });
        
        // Close on overlay click
        document.getElementById('feedback-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'feedback-overlay') {
                this.hide();
                if (window.analytics) {
                    window.analytics.trackEvent('feedback_form_closed', { method: 'overlay_click' });
                }
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isVisible && e.key === 'Escape') {
                this.hide();
                if (window.analytics) {
                    window.analytics.trackEvent('feedback_form_closed', { method: 'escape_key' });
                }
            }
        });
    }
    
    handleVoteSelection(button) {
        const vote = button.dataset.vote;
        console.log('🗳️ Vote selected:', vote);
        
        // Update visual state
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        
        // Enable submit button
        const submitBtn = document.getElementById('feedback-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        // Store current vote
        this.currentFeedback = { vote: vote };
        
        // Track selection
        if (window.analytics) {
            window.analytics.trackEvent('vote_selected', { vote: vote });
        }
    }
    
    toggleDemographicsSection() {
        const content = document.getElementById('demographics-content');
        const toggle = document.getElementById('demographics-toggle');
        
        if (content && toggle) {
            const isVisible = content.style.display !== 'none';
            
            if (isVisible) {
                content.style.display = 'none';
                toggle.textContent = toggle.textContent.replace('▲', '▼');
            } else {
                content.style.display = 'block';
                toggle.textContent = toggle.textContent.replace('▼', '▲');
            }
            
            // Track analytics
            if (window.analytics) {
                window.analytics.trackEvent('demographics_toggled', { expanded: !isVisible });
            }
        }
    }
    
    collectFeedbackData() {
        if (!this.currentFeedback) {
            throw new Error('No vote selected');
        }
        
        const feedback = {
            ...this.currentFeedback,
            comment: document.getElementById('feedback-comment')?.value.trim() || null,
            demographics: {
                age: document.getElementById('demo-age')?.value || null,
                playsBasketball: document.getElementById('demo-plays')?.value || null,
                connectionToArea: document.getElementById('demo-connection')?.value || null
            },
            timestamp: Date.now(),
            sessionId: window.analytics?.sessionId || 'unknown'
        };
        
        return feedback;
    }
    
    async submitFeedback() {
        try {
            console.log('📤 Submitting feedback...');
            
            // Collect form data
            const feedback = this.collectFeedbackData();
            
            // Validate required fields
            if (!feedback.vote) {
                alert('Please select your opinion about the court upgrade.');
                return;
            }
            
            // Store feedback locally
            this.storeFeedback(feedback);
            
            // Call external callback
            if (this.onSubmitCallback) {
                this.onSubmitCallback(feedback);
            }
            
            // Track analytics
            if (window.analytics) {
                window.analytics.trackFeedbackSubmission(feedback);
            }
            
            // Show thank you state
            this.showThankYouState();
            
            console.log('✅ Feedback submitted successfully:', feedback);
            
        } catch (error) {
            console.error('❌ Failed to submit feedback:', error);
            alert('Sorry, there was an error submitting your feedback. Please try again.');
            
            if (window.analytics) {
                window.analytics.trackError('feedback_submission_failed', error.message);
            }
        }
    }
    
    storeFeedback(feedback) {
        try {
            const existingFeedback = this.getStoredFeedback();
            existingFeedback.push(feedback);
            
            localStorage.setItem(this.storageKey, JSON.stringify(existingFeedback));
        } catch (error) {
            console.warn('Failed to store feedback locally:', error);
        }
    }
    
    getStoredFeedback() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to retrieve stored feedback:', error);
            return [];
        }
    }
    
    async showThankYouState() {
        // Hide main content
        const mainContent = document.querySelector('.feedback-content');
        const actions = document.querySelector('.feedback-actions');
        const thanksSection = document.getElementById('feedback-thanks');
        
        if (mainContent) mainContent.style.display = 'none';
        if (actions) actions.style.display = 'none';
        if (thanksSection) thanksSection.style.display = 'block';
        
        // Update community stats
        await this.updateCommunityStats();
        
        // Track thank you view
        if (window.analytics) {
            window.analytics.trackEvent('feedback_thank_you_shown');
        }
    }
    
    async updateCommunityStats() {
        try {
            const allFeedback = this.getStoredFeedback();
            const stats = this.calculateFeedbackStats(allFeedback);
            
            // Update display
            const yesCount = document.getElementById('yes-count');
            const neutralCount = document.getElementById('neutral-count');
            const noCount = document.getElementById('no-count');
            
            if (yesCount) yesCount.textContent = stats.yes;
            if (neutralCount) neutralCount.textContent = stats.neutral;
            if (noCount) noCount.textContent = stats.no;
            
        } catch (error) {
            console.warn('Failed to update community stats:', error);
        }
    }
    
    calculateFeedbackStats(feedback) {
        const stats = { yes: 0, neutral: 0, no: 0 };
        
        feedback.forEach(fb => {
            if (fb.vote && stats.hasOwnProperty(fb.vote)) {
                stats[fb.vote]++;
            }
        });
        
        return stats;
    }
    
    resetForm() {
        // Clear vote selection
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Clear comment
        const commentField = document.getElementById('feedback-comment');
        if (commentField) commentField.value = '';
        
        // Reset demographics
        document.querySelectorAll('#demographics-content select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Collapse demographics section
        const content = document.getElementById('demographics-content');
        const toggle = document.getElementById('demographics-toggle');
        if (content) content.style.display = 'none';
        if (toggle) toggle.textContent = toggle.textContent.replace('▲', '▼');
        
        // Disable submit button
        const submitBtn = document.getElementById('feedback-submit');
        if (submitBtn) submitBtn.disabled = true;
        
        // Reset to main state
        const mainContent = document.querySelector('.feedback-content');
        const actions = document.querySelector('.feedback-actions');
        const thanksSection = document.getElementById('feedback-thanks');
        
        if (mainContent) mainContent.style.display = 'block';
        if (actions) actions.style.display = 'flex';
        if (thanksSection) thanksSection.style.display = 'none';
        
        // Clear current feedback
        this.currentFeedback = null;
    }
    
    // Admin/Analytics methods
    
    exportFeedback(format = 'json') {
        const feedback = this.getStoredFeedback();
        
        if (format === 'csv') {
            return this.exportToCSV(feedback);
        } else {
            return this.exportToJSON(feedback);
        }
    }
    
    exportToJSON(feedback) {
        const data = {
            exportDate: new Date().toISOString(),
            totalResponses: feedback.length,
            stats: this.calculateFeedbackStats(feedback),
            responses: feedback
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        this.downloadBlob(blob, 'copenhagen-court-feedback.json');
        return data;
    }
    
    exportToCSV(feedback) {
        const headers = [
            'timestamp',
            'vote',
            'comment',
            'age',
            'playsBasketball',
            'connectionToArea',
            'sessionId'
        ];
        
        const rows = feedback.map(fb => [
            new Date(fb.timestamp).toISOString(),
            fb.vote || '',
            fb.comment || '',
            fb.demographics?.age || '',
            fb.demographics?.playsBasketball || '',
            fb.demographics?.connectionToArea || '',
            fb.sessionId || ''
        ]);
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, 'copenhagen-court-feedback.csv');
        
        return csv;
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
    
    getFeedbackSummary() {
        const feedback = this.getStoredFeedback();
        const stats = this.calculateFeedbackStats(feedback);
        const total = stats.yes + stats.neutral + stats.no;
        
        return {
            totalResponses: feedback.length,
            breakdown: stats,
            percentages: {
                yes: total > 0 ? Math.round((stats.yes / total) * 100) : 0,
                neutral: total > 0 ? Math.round((stats.neutral / total) * 100) : 0,
                no: total > 0 ? Math.round((stats.no / total) * 100) : 0
            },
            withComments: feedback.filter(fb => fb.comment).length,
            latestResponse: feedback.length > 0 ? new Date(Math.max(...feedback.map(fb => fb.timestamp))) : null
        };
    }
    
    clearAllFeedback() {
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ All feedback data cleared');
    }
    
    // Utility methods
    
    generateMunicipalReport() {
        const summary = this.getFeedbackSummary();
        const feedback = this.getStoredFeedback();
        
        const report = {
            title: 'Copenhagen Court Vision - Community Feedback Report',
            generatedAt: new Date().toISOString(),
            summary: summary,
            recommendations: this.generateRecommendations(summary),
            detailedComments: feedback.filter(fb => fb.comment).map(fb => ({
                vote: fb.vote,
                comment: fb.comment,
                timestamp: new Date(fb.timestamp).toLocaleDateString()
            })),
            demographics: this.analyzeDemographics(feedback)
        };
        
        return report;
    }
    
    generateRecommendations(summary) {
        const { percentages } = summary;
        const recommendations = [];
        
        if (percentages.yes > 60) {
            recommendations.push('Strong community support suggests proceeding with court upgrade');
        } else if (percentages.yes > 40) {
            recommendations.push('Moderate support - consider addressing concerns raised in comments');
        } else {
            recommendations.push('Limited support - review community concerns before proceeding');
        }
        
        if (summary.withComments > summary.totalResponses * 0.3) {
            recommendations.push('High engagement - detailed feedback available for planning');
        }
        
        return recommendations;
    }
    
    analyzeDemographics(feedback) {
        const demographics = feedback.map(fb => fb.demographics).filter(Boolean);
        
        const analysis = {
            ageDistribution: this.analyzeField(demographics, 'age'),
            basketballPlayers: this.analyzeField(demographics, 'playsBasketball'),
            areaConnection: this.analyzeField(demographics, 'connectionToArea')
        };
        
        return analysis;
    }
    
    analyzeField(demographics, field) {
        const counts = {};
        demographics.forEach(demo => {
            const value = demo[field];
            if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        });
        return counts;
    }
}

// Make available globally
window.FeedbackSystem = FeedbackSystem;
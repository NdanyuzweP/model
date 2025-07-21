// Advanced Kigali Traffic Predictor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');

    // Initialize the application
    initializeApp();
    
    // Mobile-specific enhancements
    initializeMobileFeatures();

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading with enhanced animation
        showLoading();
        
        // Get form data
        const formData = {
            Hour: parseInt(document.getElementById('hour').value),
            Day_of_Week: document.getElementById('dayOfWeek').value,
            Public_Holiday: document.getElementById('publicHoliday').value,
            Road_Name: document.getElementById('roadName').value,
            Population_Density: document.getElementById('populationDensity').value,
            Rainfall: document.getElementById('rainfall').value
        };

        try {
            // Make API call
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Prediction failed');
            }

            const prediction = await response.json();
            showResults(prediction, formData);
            
        } catch (err) {
            showError(err.message);
        }
    });

    function initializeApp() {
        // Add smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add form validation with visual feedback
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                validateField(this);
                updateFormState();
            });
            
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });

        // Add copy functionality for code blocks
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const codeBlock = this.closest('.code-block').querySelector('code');
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    showCopyFeedback(this);
                });
            });
        });

        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.api-card, .form-group, .panel-header').forEach(el => {
            observer.observe(el);
        });
    }

    function validateField(field) {
        const isValid = field.checkValidity();
        const isFilled = field.value.trim() !== '';
        
        field.classList.remove('is-valid', 'is-invalid');
        
        if (isFilled && isValid) {
            field.classList.add('is-valid');
        } else if (isFilled && !isValid) {
            field.classList.add('is-invalid');
        }
    }

    function updateFormState() {
        const submitBtn = form.querySelector('button[type="submit"]');
        const requiredFields = form.querySelectorAll('[required]');
        const isValid = Array.from(requiredFields).every(field => field.value.trim() !== '');
        
        submitBtn.disabled = !isValid;
        submitBtn.classList.toggle('btn-secondary', !isValid);
        submitBtn.classList.toggle('btn-primary', isValid);
    }

    function showLoading() {
        loading.classList.remove('d-none');
        results.classList.add('d-none');
        error.classList.add('d-none');
        
        // Add loading animation
        loading.classList.add('fade-in');
    }

    function showResults(prediction, formData) {
        loading.classList.add('d-none');
        results.classList.remove('d-none');
        error.classList.add('d-none');

        // Update congestion level with enhanced styling
        const congestionLevel = document.getElementById('congestionLevel');
        const congestionIcon = document.getElementById('congestionIcon');
        const congestionDescription = document.getElementById('congestionDescription');
        
        congestionLevel.textContent = prediction.Congestion_Level;
        congestionLevel.className = `congestion-title congestion-${prediction.Congestion_Level.toLowerCase()}`;

        // Set icon and description based on congestion level
        const congestionData = getCongestionData(prediction.Congestion_Level);
        congestionIcon.className = `indicator-icon ${congestionData.icon}`;
        congestionIcon.style.color = congestionData.color;
        congestionDescription.textContent = congestionData.description;

        // Update confidence meter with animation
        const confidenceBar = document.getElementById('confidenceBar');
        const confidenceScore = document.getElementById('confidenceScore');
        const confidence = Math.round(prediction.confidence_score * 100);
        
        // Animate confidence bar
        setTimeout(() => {
            confidenceBar.style.width = `${confidence}%`;
            confidenceBar.style.backgroundColor = getConfidenceColor(confidence);
        }, 300);
        
        confidenceScore.textContent = confidence;

        // Update result details with enhanced formatting
        document.getElementById('resultTime').textContent = formatTime(formData.Hour);
        document.getElementById('resultRoad').textContent = formData.Road_Name;
        document.getElementById('resultConditions').textContent = formatConditions(formData);
        
        // Format timestamp
        const timestamp = new Date(prediction.timestamp);
        document.getElementById('resultTimestamp').textContent = timestamp.toLocaleString();

        // Generate and display recommendations
        generateRecommendations(prediction, formData);

        // Add animation classes
        results.classList.add('slide-up');
    }

    function showError(message) {
        loading.classList.add('d-none');
        results.classList.add('d-none');
        error.classList.remove('d-none');
        
        document.getElementById('errorMessage').textContent = message;
        error.classList.add('fade-in');
    }

    function getCongestionData(level) {
        const data = {
            'Low': {
                icon: 'fas fa-check-circle',
                color: '#27ae60',
                description: 'Traffic is flowing smoothly with minimal delays'
            },
            'Medium': {
                icon: 'fas fa-exclamation-triangle',
                color: '#f39c12',
                description: 'Moderate traffic congestion with some delays expected'
            },
            'High': {
                icon: 'fas fa-exclamation-circle',
                color: '#e74c3c',
                description: 'Heavy traffic congestion with significant delays'
            }
        };
        
        return data[level] || data['Medium'];
    }

    function getConfidenceColor(confidence) {
        if (confidence >= 80) return '#27ae60';
        if (confidence >= 60) return '#f39c12';
        if (confidence >= 40) return '#e67e22';
        return '#e74c3c';
    }

    function formatTime(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
        return `${displayHour}:00 ${period}`;
    }

    function formatConditions(formData) {
        const conditions = [];
        if (formData.Rainfall === 'Yes') conditions.push('Rainy');
        if (formData.Public_Holiday === 'Yes') conditions.push('Holiday');
        conditions.push(`${formData.Population_Density} Density`);
        
        return conditions.join(', ') || 'Normal Conditions';
    }

    function generateRecommendations(prediction, formData) {
        const recommendationsContainer = document.getElementById('recommendations');
        const recommendations = [];

        // Generate recommendations based on prediction and conditions
        if (prediction.Congestion_Level === 'High') {
            recommendations.push({
                icon: 'fas fa-clock',
                text: 'Consider leaving 15-30 minutes earlier than usual'
            });
            recommendations.push({
                icon: 'fas fa-route',
                text: 'Check alternative routes to avoid congestion'
            });
            recommendations.push({
                icon: 'fas fa-car',
                text: 'Consider carpooling or public transportation'
            });
        } else if (prediction.Congestion_Level === 'Medium') {
            recommendations.push({
                icon: 'fas fa-clock',
                text: 'Allow extra 10-15 minutes for your journey'
            });
            recommendations.push({
                icon: 'fas fa-info-circle',
                text: 'Monitor traffic updates for route changes'
            });
        } else {
            recommendations.push({
                icon: 'fas fa-thumbs-up',
                text: 'Traffic conditions are favorable for travel'
            });
            recommendations.push({
                icon: 'fas fa-car',
                text: 'Normal travel time expected'
            });
        }

        // Add weather-based recommendations
        if (formData.Rainfall === 'Yes') {
            recommendations.push({
                icon: 'fas fa-umbrella',
                text: 'Rain may affect traffic flow - drive carefully'
            });
        }

        // Add time-based recommendations
        if (formData.Hour >= 7 && formData.Hour <= 9) {
            recommendations.push({
                icon: 'fas fa-sun',
                text: 'Morning rush hour - expect moderate delays'
            });
        } else if (formData.Hour >= 17 && formData.Hour <= 19) {
            recommendations.push({
                icon: 'fas fa-moon',
                text: 'Evening rush hour - plan accordingly'
            });
        }

        // Render recommendations
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <i class="${rec.icon} me-2"></i>
                ${rec.text}
            </div>
        `).join('');
    }

    function showCopyFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-secondary');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-secondary');
        }, 2000);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Add form auto-save functionality
    let autoSaveTimeout;
    form.addEventListener('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem('trafficPredictionForm', JSON.stringify(data));
        }, 1000);
    });

    // Load saved form data
    const savedData = localStorage.getItem('trafficPredictionForm');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
        } catch (e) {
            console.log('Could not load saved form data');
        }
    }

    // Add real-time form validation feedback
    form.addEventListener('input', function() {
        const submitBtn = form.querySelector('button[type="submit"]');
        const requiredFields = form.querySelectorAll('[required]');
        const isValid = Array.from(requiredFields).every(field => field.value.trim() !== '');
        
        submitBtn.disabled = !isValid;
        
        if (isValid) {
            submitBtn.classList.remove('btn-secondary');
            submitBtn.classList.add('btn-primary');
        } else {
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-secondary');
        }
    });

    // Initialize form state
    updateFormState();
    
    function initializeMobileFeatures() {
        // Add mobile-specific touch improvements
        if ('ontouchstart' in window) {
            // Add touch feedback for buttons
            document.querySelectorAll('.btn, .form-control, .form-select').forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                });
                
                element.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                });
            });
            
            // Improve scroll performance on mobile
            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.code-block')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        // Add mobile-specific keyboard handling
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open dropdowns or modals
                document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
        
        // Add mobile-specific form improvements
        const mobileInputs = document.querySelectorAll('input[type="number"], select');
        mobileInputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Scroll to input on mobile
                setTimeout(() => {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            });
        });
        
        // Add mobile-specific loading improvements
        const loadingStates = document.querySelectorAll('.loading-state');
        loadingStates.forEach(loading => {
            loading.addEventListener('touchstart', function(e) {
                e.preventDefault();
            });
        });
    }
}); 
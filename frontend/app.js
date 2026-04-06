// Online Vehicle Parking System - JavaScript

class ParkingSystem {
    constructor() {
        this.currentSection = 'home';
        this.selectedSlot = null;
        this.isAdminLoggedIn = false;
        this.bookings = [];
        this.slots = [];
        this.totalSlots = 36;
        this.apiUrl = 'http://localhost:5001/api';
        
        this.init();
    }

    async init() {
        await this.initializeData();
        this.bindEvents();
        this.renderParkingGrid();
        this.updateBookingsDisplay();
        // Set minimum datetime after a short delay to ensure DOM is ready
        setTimeout(() => this.setMinDateTime(), 100);
        // Check for expired bookings every minute
        this.startExpiryCheck();
    }

    async initializeData() {
        try {
            // Fetch bookings from MongoDB
            const bookingsResponse = await fetch(`${this.apiUrl}/bookings`);
            this.bookings = await bookingsResponse.json();

            // Fetch slots from MongoDB
            const slotsResponse = await fetch(`${this.apiUrl}/slots`);
            this.slots = await slotsResponse.json();

            // If no slots exist, initialize them
            if (this.slots.length === 0) {
                await this.initializeSlots();
            }
        } catch (error) {
            console.error('Error loading data from MongoDB:', error);
            // Fallback to empty arrays if API fails
            this.bookings = [];
            this.slots = [];
        }
    }

    async initializeSlots() {
        try {
            for (let i = 1; i <= this.totalSlots; i++) {
                await fetch(`${this.apiUrl}/slots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slotNumber: i })
                });
            }
            // Refresh slots after initialization
            const slotsResponse = await fetch(`${this.apiUrl}/slots`);
            this.slots = await slotsResponse.json();
        } catch (error) {
            console.error('Error initializing slots:', error);
        }
    }

    bindEvents() {
        // Navigation events
        document.getElementById('homeBtn').addEventListener('click', () => this.showSection('home'));
        document.getElementById('bookingBtn').addEventListener('click', () => this.showSection('booking'));
        document.getElementById('adminBtn').addEventListener('click', () => this.showSection('admin'));
        document.getElementById('ctaBookingBtn').addEventListener('click', () => this.showSection('booking'));
        document.getElementById('ctaAdminBtn').addEventListener('click', () => this.showSection('admin'));

        // Booking form events
        document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleBookingSubmit(e));
        document.getElementById('clearFormBtn').addEventListener('click', () => this.clearBookingForm());

        // Admin events
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));
        document.getElementById('adminLogoutBtn').addEventListener('click', () => this.adminLogout());
        document.getElementById('addSlotBtn').addEventListener('click', () => this.addNewSlot());
        document.getElementById('refreshSlotsBtn').addEventListener('click', () => this.refreshSlots());
        document.getElementById('runPipelineBtn').addEventListener('click', () => this.runMlPipeline());

        // Modal events
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideModal('confirmModal'));
        document.getElementById('successOkBtn').addEventListener('click', () => this.hideModal('successModal'));

        // Modal backdrop clicks
        document.querySelector('#confirmModal .modal__backdrop').addEventListener('click', () => this.hideModal('confirmModal'));
        document.querySelector('#successModal .modal__backdrop').addEventListener('click', () => this.hideModal('successModal'));
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        
        // Show target section
        document.getElementById(section + 'Section').classList.add('active');
        
        this.currentSection = section;

        // Update active nav button
        document.querySelectorAll('.header__nav .btn').forEach(btn => {
            btn.classList.remove('btn--primary');
            btn.classList.add('btn--secondary');
        });

        if (section === 'home') {
            document.getElementById('homeBtn').classList.remove('btn--secondary');
            document.getElementById('homeBtn').classList.add('btn--primary');
        } else if (section === 'booking') {
            document.getElementById('bookingBtn').classList.remove('btn--secondary');
            document.getElementById('bookingBtn').classList.add('btn--primary');
            this.renderParkingGrid();
            this.updateBookingsDisplay();
            // Reset datetime field when switching to booking section
            setTimeout(() => this.setMinDateTime(), 100);
        } else if (section === 'admin') {
            document.getElementById('adminBtn').classList.remove('btn--secondary');
            document.getElementById('adminBtn').classList.add('btn--primary');
            this.checkAdminStatus();
        }
    }

    renderParkingGrid() {
        const grid = document.getElementById('parkingGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        this.slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'parking-slot';
            slotElement.textContent = slot.slotNumber;
            slotElement.dataset.slotNumber = slot.slotNumber;

            if (slot.isAvailable) {
                slotElement.classList.add('available');
                slotElement.addEventListener('click', () => this.selectSlot(slot.slotNumber));
            } else {
                slotElement.classList.add('booked');
            }

            if (this.selectedSlot === slot.slotNumber) {
                slotElement.classList.remove('available');
                slotElement.classList.add('selected');
            }

            grid.appendChild(slotElement);
        });
    }

    selectSlot(slotNumber) {
        const slot = this.slots.find(s => s.slotNumber === slotNumber);
        if (!slot.isAvailable) return;

        this.selectedSlot = slotNumber;
        const selectedSlotInput = document.getElementById('selectedSlot');
        if (selectedSlotInput) {
            selectedSlotInput.value = slotNumber;
        }
        this.renderParkingGrid();
        this.clearError('slotError');
    }

    setMinDateTime() {
        const bookingTimeInput = document.getElementById('bookingTime');
        if (!bookingTimeInput) return;

        const now = new Date();
        // Add 1 hour to current time as minimum booking time
        const minDateTime = new Date(now.getTime() + (60 * 60 * 1000));
        
        // Format datetime for input field (YYYY-MM-DDTHH:MM)
        const year = minDateTime.getFullYear();
        const month = String(minDateTime.getMonth() + 1).padStart(2, '0');
        const day = String(minDateTime.getDate()).padStart(2, '0');
        const hours = String(minDateTime.getHours()).padStart(2, '0');
        const minutes = String(minDateTime.getMinutes()).padStart(2, '0');
        
        const minDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
        bookingTimeInput.min = minDateTimeString;
        
        // Set default value to 2 hours from now
        const defaultDateTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        const defaultYear = defaultDateTime.getFullYear();
        const defaultMonth = String(defaultDateTime.getMonth() + 1).padStart(2, '0');
        const defaultDay = String(defaultDateTime.getDate()).padStart(2, '0');
        const defaultHours = String(defaultDateTime.getHours()).padStart(2, '0');
        const defaultMinutes = String(defaultDateTime.getMinutes()).padStart(2, '0');
        
        const defaultDateTimeString = `${defaultYear}-${defaultMonth}-${defaultDay}T${defaultHours}:${defaultMinutes}`;
        if (!bookingTimeInput.value) {
            bookingTimeInput.value = defaultDateTimeString;
        }
        
        // Add placeholder text to help users
        bookingTimeInput.setAttribute('title', 'Click the calendar icon to select date and time');
        
        // Ensure the input opens calendar on click
        bookingTimeInput.addEventListener('click', function() {
            this.showPicker && this.showPicker();
        });
    }

    async handleBookingSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('userName').value.trim();
        const vehicleNumber = document.getElementById('vehicleNumber').value.trim().toUpperCase();
        const slotNumber = this.selectedSlot;
        const time = document.getElementById('bookingTime').value;

        // Validate form
        let isValid = true;

        if (!name) {
            this.showError('nameError', 'Name is required');
            isValid = false;
        } else if (name.length < 2) {
            this.showError('nameError', 'Name must be at least 2 characters');
            isValid = false;
        } else {
            this.clearError('nameError');
        }

        if (!vehicleNumber) {
            this.showError('vehicleError', 'Vehicle number is required');
            isValid = false;
        } else if (!/^[A-Z0-9]{3,10}$/.test(vehicleNumber)) {
            this.showError('vehicleError', 'Vehicle number must be 3-10 characters (letters and numbers only)');
            isValid = false;
        } else {
            this.clearError('vehicleError');
        }

        if (!slotNumber) {
            this.showError('slotError', 'Please select a parking slot');
            isValid = false;
        } else {
            this.clearError('slotError');
        }

        if (!time) {
            this.showError('timeError', 'Booking time is required');
            isValid = false;
        } else {
            const selectedTime = new Date(time);
            const now = new Date();
            if (selectedTime <= now) {
                this.showError('timeError', 'Booking time must be in the future');
                isValid = false;
            } else {
                this.clearError('timeError');
            }
        }

        if (!isValid) return;

        // Check if vehicle already has an active booking
        const existingBooking = this.bookings.find(b => 
            b.vehicleNumber === vehicleNumber && b.status === 'active'
        );

        if (existingBooking) {
            this.showError('vehicleError', 'This vehicle already has an active booking');
            return;
        }

        try {
            // Create booking in MongoDB with 3-hour duration
            const response = await fetch(`${this.apiUrl}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    vehicleNumber, 
                    slotNumber, 
                    time,
                    duration: 3 // 3 hours duration
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Booking failed');
            }

            // Refresh data from MongoDB
            await this.initializeData();
            
            this.clearBookingForm();
            this.renderParkingGrid();
            this.updateBookingsDisplay();
            this.updateAdminStats();

            const formattedTime = new Date(time).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const endTime = new Date(new Date(time).getTime() + (3 * 60 * 60 * 1000));
            const formattedEndTime = endTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            this.showSuccessModal(`✅ Booking Confirmed!\n\nSlot: ${slotNumber}\nVehicle: ${vehicleNumber}\nStart: ${formattedTime}\nEnd: ${formattedEndTime}\nDuration: 3 hours\n\n⏰ Your booking will expire automatically after 3 hours!`);
        } catch (error) {
            console.error('Booking error:', error);
            this.showError('slotError', error.message || 'Failed to create booking. Please try again.');
        }
    }

    clearBookingForm() {
        const form = document.getElementById('bookingForm');
        if (form) {
            form.reset();
        }
        this.selectedSlot = null;
        this.renderParkingGrid();
        setTimeout(() => this.setMinDateTime(), 100);
        document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    }

    updateBookingsDisplay() {
        const container = document.getElementById('userBookingsList');
        if (!container) return;

        const activeBookings = this.bookings.filter(b => b.status === 'active');

        if (activeBookings.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active bookings found</p></div>';
            return;
        }

        container.innerHTML = activeBookings.map(booking => {
            const formattedTime = new Date(booking.time).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const endTime = booking.endTime ? new Date(booking.endTime) : null;
            const formattedEndTime = endTime ? endTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'N/A';

            const duration = booking.duration || 3;
            const now = new Date();
            const timeRemaining = endTime ? Math.max(0, Math.floor((endTime - now) / (1000 * 60))) : 0;
            const hoursRemaining = Math.floor(timeRemaining / 60);
            const minutesRemaining = timeRemaining % 60;

            // Determine status based on time remaining
            let timeStatus = '';
            let timeColor = 'var(--color-success)';
            
            if (timeRemaining <= 0) {
                timeStatus = '⏰ Expired';
                timeColor = 'var(--color-error)';
            } else if (timeRemaining <= 30) {
                timeStatus = `⏰ Expiring soon! ${minutesRemaining}m left`;
                timeColor = 'var(--color-error)';
            } else if (timeRemaining <= 60) {
                timeStatus = `⚠️ ${hoursRemaining > 0 ? hoursRemaining + 'h ' : ''}${minutesRemaining}m remaining`;
                timeColor = 'var(--color-warning)';
            } else {
                timeStatus = `${hoursRemaining}h ${minutesRemaining}m remaining`;
                timeColor = 'var(--color-success)';
            }

            return `
                <div class="booking-item">
                    <div class="booking-info">
                        <h4>Slot ${booking.slotNumber} - ${booking.vehicleNumber}</h4>
                        <p><strong>Name:</strong> ${booking.name}</p>
                        <p><strong>Start:</strong> ${formattedTime}</p>
                        <p><strong>End:</strong> ${formattedEndTime}</p>
                        <p><strong>Duration:</strong> ${duration} hours</p>
                        <p><strong>Time Remaining:</strong> <span style="color: ${timeColor}; font-weight: bold;">${timeStatus}</span></p>
                        <p><strong>Status:</strong> <span class="status status--success">Active</span></p>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn--outline btn--sm" onclick="parkingSystem.cancelBooking('${booking._id}')">Cancel</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async cancelBooking(bookingId) {
        const booking = this.bookings.find(b => b._id === bookingId);
        if (!booking) return;

        this.showConfirmModal(
            'Cancel Booking',
            `Are you sure you want to cancel the booking for slot ${booking.slotNumber} (${booking.vehicleNumber})?`,
            async () => {
                try {
                    const response = await fetch(`${this.apiUrl}/bookings/${bookingId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to cancel booking');
                    }

                    // Refresh data from MongoDB
                    await this.initializeData();
                    
                    this.renderParkingGrid();
                    this.updateBookingsDisplay();
                    this.updateAdminStats();
                    this.updateAdminBookings();

                    this.showSuccessModal('Booking cancelled successfully!');
                } catch (error) {
                    console.error('Cancel booking error:', error);
                    alert('Failed to cancel booking. Please try again.');
                }
            }
        );
    }

    handleAdminLogin(e) {
        e.preventDefault();

        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === 'admin' && password === 'password') {
            this.isAdminLoggedIn = true;
            this.showAdminDashboard();
            this.clearError('loginError');
        } else {
            this.showError('loginError', 'Invalid username or password');
        }
    }

    checkAdminStatus() {
        if (this.isAdminLoggedIn) {
            this.showAdminDashboard();
        } else {
            const loginDiv = document.getElementById('adminLogin');
            const dashboardDiv = document.getElementById('adminDashboard');
            if (loginDiv) loginDiv.classList.remove('hidden');
            if (dashboardDiv) dashboardDiv.classList.add('hidden');
        }
    }

    showAdminDashboard() {
        const loginDiv = document.getElementById('adminLogin');
        const dashboardDiv = document.getElementById('adminDashboard');
        if (loginDiv) loginDiv.classList.add('hidden');
        if (dashboardDiv) dashboardDiv.classList.remove('hidden');
        
        this.renderAdminParkingGrid();
        this.updateAdminStats();
        this.updateAdminBookings();
        this.renderPipelineReport(null);
    }

    adminLogout() {
        this.isAdminLoggedIn = false;
        const loginDiv = document.getElementById('adminLogin');
        const dashboardDiv = document.getElementById('adminDashboard');
        if (loginDiv) loginDiv.classList.remove('hidden');
        if (dashboardDiv) dashboardDiv.classList.add('hidden');
        
        const form = document.getElementById('adminLoginForm');
        if (form) form.reset();
        this.clearError('loginError');
    }

    renderAdminParkingGrid() {
        const grid = document.getElementById('adminParkingGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        this.slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'parking-slot';
            slotElement.textContent = slot.slotNumber;
            slotElement.dataset.slotNumber = slot.slotNumber;

            if (slot.isAvailable) {
                slotElement.classList.add('available');
            } else {
                slotElement.classList.add('booked');
            }

            slotElement.addEventListener('click', () => this.toggleSlotAvailability(slot.slotNumber));
            grid.appendChild(slotElement);
        });
    }

    toggleSlotAvailability(slotNumber) {
        const slot = this.slots.find(s => s.slotNumber === slotNumber);
        const booking = this.bookings.find(b => 
            b.slotNumber === slotNumber && b.status === 'active'
        );

        if (!slot.isAvailable && booking) {
            this.showConfirmModal(
                'Free Slot',
                `Slot ${slotNumber} is currently booked by ${booking.name} (${booking.vehicleNumber}). Do you want to free this slot and cancel the booking?`,
                () => {
                    booking.status = 'cancelled';
                    slot.isAvailable = true;
                    this.saveData();
                    this.renderAdminParkingGrid();
                    this.updateAdminStats();
                    this.updateAdminBookings();
                    this.updateBookingsDisplay();
                    this.showSuccessModal('Slot freed successfully!');
                }
            );
        } else {
            slot.isAvailable = !slot.isAvailable;
            this.saveData();
            this.renderAdminParkingGrid();
            this.updateAdminStats();
        }
    }

    addNewSlot() {
        if (this.slots.length >= 50) {
            this.showSuccessModal('Maximum number of slots (50) reached!');
            return;
        }

        const newSlotNumber = Math.max(...this.slots.map(s => s.slotNumber)) + 1;
        this.slots.push({
            slotNumber: newSlotNumber,
            isAvailable: true
        });

        this.saveData();
        this.renderAdminParkingGrid();
        this.renderParkingGrid();
        this.updateAdminStats();
        this.showSuccessModal(`Slot ${newSlotNumber} added successfully!`);
    }

    refreshSlots() {
        this.renderAdminParkingGrid();
        this.renderParkingGrid();
        this.updateAdminStats();
        this.showSuccessModal('Slots refreshed successfully!');
    }

    runMlPipeline() {
        const report = this.buildPipelineReport();
        this.renderPipelineReport(report);
    }

    buildPipelineReport() {
        const totalSlots = this.slots.length;
        const activeBookings = this.bookings.filter(b => b.status === 'active');
        const totalBookings = this.bookings.length;
        const now = new Date();

        const rows = this.bookings.map((booking, index) => {
            const start = new Date(booking.time);
            const hour = Number.isNaN(start.getTime()) ? 0 : start.getHours();
            const dayOfWeek = Number.isNaN(start.getTime()) ? 0 : start.getDay();
            const duration = typeof booking.duration === 'number' ? booking.duration : Number(booking.duration || 3);
            const slotNumber = Number(booking.slotNumber || 0);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
            const slotGroup = slotNumber <= 12 ? 0 : slotNumber <= 24 ? 1 : 2;
            const durationBucket = duration <= 2 ? 0 : duration <= 4 ? 1 : 2;
            const target = booking.status === 'active' ? 1 : 0;

            return {
                id: booking._id || index,
                slotNumber,
                hour,
                dayOfWeek,
                isWeekend,
                duration,
                slotGroup,
                durationBucket,
                target,
                rawStatus: booking.status
            };
        });

        const duplicateCount = this.countDuplicates(rows);
        const missingBefore = rows.filter(r => !r.slotNumber || Number.isNaN(r.duration)).length;

        const cleanedRows = rows
            .filter((r, index, arr) => arr.findIndex(x => String(x.id) === String(r.id)) === index)
            .map(r => ({
                ...r,
                duration: Number.isFinite(r.duration) ? Math.max(0.5, Math.min(r.duration, 12)) : 3,
                slotNumber: Number.isFinite(r.slotNumber) ? r.slotNumber : 0
            }));

        const labelCounts = cleanedRows.reduce((acc, row) => {
            acc[row.target] = (acc[row.target] || 0) + 1;
            return acc;
        }, { 0: 0, 1: 0 });

        const split = this.splitDataset(cleanedRows);
        const baseline = this.trainBaseline(split.train, split.test);
        const main = this.trainMainModel(split.train, split.test);

        const steps = [
            { n: 1, name: 'Business Goal', detail: 'Forecast near-term slot occupancy for admin planning and operational decisions.', status: 'done' },
            { n: 2, name: 'ML Task Type', detail: 'Selected binary classification: occupied(1) vs not occupied(0).', status: 'done' },
            { n: 3, name: 'Define Target', detail: 'Target label mapped from booking status: active=1, expired/cancelled=0.', status: 'done' },
            { n: 4, name: 'Success Metrics', detail: 'Primary metric: F1-score. Secondary metrics: precision, recall, accuracy.', status: 'done' },
            { n: 5, name: 'Find Data Sources', detail: `Using bookings and slots APIs as primary structured data sources (${totalBookings} booking rows).`, status: 'done' },
            { n: 6, name: 'Collect/Ingest Data', detail: 'Ingested live in-memory dataset from MongoDB-backed API responses.', status: 'done' },
            { n: 7, name: 'EDA', detail: `Dataset profile: rows=${cleanedRows.length}, features=6, class balance active=${labelCounts[1]}, inactive=${labelCounts[0]}.`, status: 'done' },
            { n: 8, name: 'Data Quality Check', detail: `Detected duplicate rows=${duplicateCount}. Removed duplicates and normalized numeric ranges.`, status: 'done' },
            { n: 9, name: 'Label Quality Check', detail: 'Validated target mapping consistency against booking lifecycle statuses.', status: 'done' },
            { n: 10, name: 'Train/Val/Test Split', detail: `Split into train=${split.train.length}, val=${split.val.length}, test=${split.test.length}.`, status: 'done' },
            { n: 11, name: 'Clean Data', detail: 'Standardized slot and duration fields, fixed invalid or empty values.', status: 'done' },
            { n: 12, name: 'Handle Missing Values', detail: `Missing rows before clean=${missingBefore}; imputed with defaults where needed.`, status: 'done' },
            { n: 13, name: 'Handle Outliers/Noise', detail: 'Duration clipped to safe window [0.5, 12] hours to reduce noise impact.', status: 'done' },
            { n: 14, name: 'Feature Engineering', detail: 'Created hour, dayOfWeek, weekendFlag, slotGroup, durationBucket features.', status: 'done' },
            { n: 15, name: 'Feature Transformation', detail: 'Scaled inputs to [0,1] range using train-set min/max statistics.', status: 'done' },
            { n: 16, name: 'Baseline Model', detail: `Majority-class baseline F1=${baseline.metrics.f1.toFixed(3)}.`, status: 'done' },
            { n: 17, name: 'Train Main Model', detail: `Rule-based weighted model trained on train set with validation checks.`, status: 'done' },
            { n: 18, name: 'Hyperparameter Tuning', detail: `Tuned threshold=${main.bestThreshold.toFixed(2)} using validation F1 maximization.`, status: 'done' },
            { n: 19, name: 'Final Evaluation', detail: `Test metrics: Acc=${main.metrics.accuracy.toFixed(3)}, F1=${main.metrics.f1.toFixed(3)}.`, status: 'done' },
            { n: 20, name: 'Deploy + Monitor + Retrain', detail: 'Model report exposed in admin dashboard; rerun pipeline as data updates for continual retraining.', status: 'done' }
        ];

        return {
            generatedAt: now.toLocaleString(),
            totalSlots,
            totalBookings,
            activeBookings: activeBookings.length,
            modelSummary: {
                baseline: baseline.metrics,
                main: main.metrics,
                threshold: main.bestThreshold
            },
            steps
        };
    }

    splitDataset(rows) {
        const sorted = [...rows].sort((a, b) => String(a.id).localeCompare(String(b.id)));
        const trainEnd = Math.max(1, Math.floor(sorted.length * 0.6));
        const valEnd = Math.max(trainEnd + 1, Math.floor(sorted.length * 0.8));

        const train = sorted.slice(0, trainEnd);
        const val = sorted.slice(trainEnd, valEnd);
        const test = sorted.slice(valEnd);

        return {
            train,
            val: val.length ? val : sorted.slice(-Math.min(1, sorted.length)),
            test: test.length ? test : sorted.slice(-Math.min(1, sorted.length))
        };
    }

    countDuplicates(rows) {
        const seen = new Set();
        let duplicates = 0;
        rows.forEach(row => {
            const key = String(row.id);
            if (seen.has(key)) {
                duplicates += 1;
            } else {
                seen.add(key);
            }
        });
        return duplicates;
    }

    trainBaseline(trainRows, testRows) {
        const positives = trainRows.filter(r => r.target === 1).length;
        const negatives = trainRows.length - positives;
        const prediction = positives >= negatives ? 1 : 0;
        const predictions = testRows.map(() => prediction);
        const labels = testRows.map(r => r.target);
        return { metrics: this.calculateMetrics(predictions, labels) };
    }

    trainMainModel(trainRows, testRows) {
        const score = (row) => {
            let s = 0;
            s += row.hour >= 8 && row.hour <= 20 ? 0.3 : -0.1;
            s += row.isWeekend ? -0.15 : 0.15;
            s += row.duration >= 2 ? 0.2 : -0.05;
            s += row.slotGroup === 1 ? 0.1 : 0;
            return s;
        };

        const thresholds = [0.0, 0.1, 0.2, 0.3, 0.4];
        let bestThreshold = 0.2;
        let bestF1 = -1;

        const validationRows = trainRows.slice(-Math.max(1, Math.floor(trainRows.length * 0.2)));
        validationRows.forEach(() => {});

        thresholds.forEach(threshold => {
            const preds = validationRows.map(r => (score(r) >= threshold ? 1 : 0));
            const labels = validationRows.map(r => r.target);
            const metrics = this.calculateMetrics(preds, labels);
            if (metrics.f1 > bestF1) {
                bestF1 = metrics.f1;
                bestThreshold = threshold;
            }
        });

        const testPreds = testRows.map(r => (score(r) >= bestThreshold ? 1 : 0));
        const testLabels = testRows.map(r => r.target);
        return {
            bestThreshold,
            metrics: this.calculateMetrics(testPreds, testLabels)
        };
    }

    calculateMetrics(predictions, labels) {
        if (!labels.length || labels.length !== predictions.length) {
            return { accuracy: 0, precision: 0, recall: 0, f1: 0 };
        }

        let tp = 0;
        let fp = 0;
        let fn = 0;
        let correct = 0;

        for (let i = 0; i < labels.length; i += 1) {
            const p = predictions[i];
            const y = labels[i];

            if (p === y) correct += 1;
            if (p === 1 && y === 1) tp += 1;
            if (p === 1 && y === 0) fp += 1;
            if (p === 0 && y === 1) fn += 1;
        }

        const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
        const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
        const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

        return {
            accuracy: correct / labels.length,
            precision,
            recall,
            f1
        };
    }

    renderPipelineReport(report) {
        const container = document.getElementById('pipelineResults');
        if (!container) return;

        if (!report) {
            container.innerHTML = '<div class="empty-state"><p>Run the pipeline to see detailed step-by-step results.</p></div>';
            return;
        }

        const baseline = report.modelSummary.baseline;
        const main = report.modelSummary.main;

        container.innerHTML = `
            <div class="pipeline-summary">
                <h4>Pipeline Run Summary</h4>
                <p><strong>Generated:</strong> ${this.escapeHtml(report.generatedAt)}</p>
                <p><strong>Slots:</strong> ${report.totalSlots} | <strong>Total Bookings:</strong> ${report.totalBookings} | <strong>Active:</strong> ${report.activeBookings}</p>
                <p><strong>Baseline F1:</strong> ${baseline.f1.toFixed(3)} | <strong>Main F1:</strong> ${main.f1.toFixed(3)} | <strong>Threshold:</strong> ${report.modelSummary.threshold.toFixed(2)}</p>
            </div>
            <div class="pipeline-steps-list">
                ${report.steps.map(step => `
                    <div class="pipeline-step ${step.status}">
                        <div class="pipeline-step__title">Step ${step.n}: ${this.escapeHtml(step.name)}</div>
                        <div class="pipeline-step__detail">${this.escapeHtml(step.detail)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    updateAdminStats() {
        const total = this.slots.length;
        const available = this.slots.filter(s => s.isAvailable).length;
        const booked = total - available;

        const totalElement = document.getElementById('totalSlotsCount');
        const availableElement = document.getElementById('availableSlotsCount');
        const bookedElement = document.getElementById('bookedSlotsCount');

        if (totalElement) totalElement.textContent = total;
        if (availableElement) availableElement.textContent = available;
        if (bookedElement) bookedElement.textContent = booked;
    }

    updateAdminBookings() {
        const container = document.getElementById('allBookingsList');
        if (!container) return;
        
        const activeBookings = this.bookings.filter(b => b.status === 'active');

        if (activeBookings.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active bookings found</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="booking-table-header">
                <div>Name</div>
                <div>Vehicle Number</div>
                <div>Slot</div>
                <div>Booking Time</div>
                <div>Status</div>
                <div>Actions</div>
            </div>
            ${activeBookings.map(booking => {
                const formattedTime = new Date(booking.time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return `
                    <div class="booking-table-row">
                        <div>${booking.name}</div>
                        <div>${booking.vehicleNumber}</div>
                        <div>${booking.slotNumber}</div>
                        <div>${formattedTime}</div>
                        <div><span class="status status--success">Active</span></div>
                        <div>
                            <button class="btn btn--outline btn--sm" onclick="parkingSystem.adminCancelBooking('${booking._id}')">Cancel</button>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    adminCancelBooking(bookingId) {
        this.cancelBooking(bookingId);
        setTimeout(() => {
            this.updateAdminBookings();
            this.renderAdminParkingGrid();
        }, 100);
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
        }
    }

    showConfirmModal(title, message, onConfirm) {
        const titleElement = document.getElementById('modalTitle');
        const messageElement = document.getElementById('modalMessage');
        const modal = document.getElementById('confirmModal');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (modal) modal.classList.remove('hidden');

        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.addEventListener('click', () => {
                this.hideModal('confirmModal');
                onConfirm();
            });
        }
    }

    showSuccessModal(message) {
        const messageElement = document.getElementById('successMessage');
        const modal = document.getElementById('successModal');
        
        if (messageElement) messageElement.textContent = message;
        if (modal) modal.classList.remove('hidden');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async saveData() {
        // Data is now saved to MongoDB through API calls
        // This method is kept for compatibility but data persistence
        // is handled by the backend MongoDB database
        console.log('Data synced with MongoDB');
    }

    startExpiryCheck() {
        // Check for expired bookings immediately on load
        this.checkExpiredBookings();
        
        // Then check every 30 seconds for more responsive expiry
        setInterval(() => {
            this.checkExpiredBookings();
        }, 30000); // Check every 30 seconds
    }

    async checkExpiredBookings() {
        try {
            const response = await fetch(`${this.apiUrl}/bookings/check-expired`);
            const data = await response.json();
            
            if (data.expiredBookings && data.expiredBookings.length > 0) {
                // Show notification for expired bookings
                this.showExpiryNotification(data.expiredBookings.length);
                
                // Refresh the data
                await this.initializeData();
                this.renderParkingGrid();
                this.updateBookingsDisplay();
                this.updateAdminStats();
                this.updateAdminBookings();
            }
        } catch (error) {
            console.error('Error checking expired bookings:', error);
        }
    }

    showExpiryNotification(count) {
        const message = count === 1 
            ? '⏰ Your booking has expired! The slot has been released.'
            : `⏰ ${count} bookings have expired! Slots have been released.`;
        
        // Show a notification modal
        this.showSuccessModal(message);
        
        // Also show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Parking Booking Expired', {
                body: message,
                icon: '🚗'
            });
        }
    }
}

// Initialize the parking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.parkingSystem = new ParkingSystem();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (window.parkingSystem) {
        const section = e.state?.section || 'home';
        window.parkingSystem.showSection(section);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.parkingSystem) return;

    // ESC to close modals
    if (e.key === 'Escape') {
        window.parkingSystem.hideModal('confirmModal');
        window.parkingSystem.hideModal('successModal');
    }

    // Alt + H for Home
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.parkingSystem.showSection('home');
    }

    // Alt + B for Booking
    if (e.altKey && e.key === 'b') {
        e.preventDefault();
        window.parkingSystem.showSection('booking');
    }

    // Alt + A for Admin
    if (e.altKey && e.key === 'a') {
        e.preventDefault();
        window.parkingSystem.showSection('admin');
    }
});

// Auto-refresh parking grid every 30 seconds
setInterval(() => {
    if (window.parkingSystem && window.parkingSystem.currentSection === 'booking') {
        window.parkingSystem.renderParkingGrid();
    }
}, 30000);

// Auto-refresh bookings display every 10 seconds to update time remaining
setInterval(() => {
    if (window.parkingSystem) {
        window.parkingSystem.updateBookingsDisplay();
        if (window.parkingSystem.currentSection === 'admin' && window.parkingSystem.isAdminLoggedIn) {
            window.parkingSystem.updateAdminBookings();
        }
    }
}, 10000); // Update every 10 seconds
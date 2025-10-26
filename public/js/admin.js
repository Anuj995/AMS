// Admin panel functionality
let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
});

function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Admin action buttons
    document.getElementById('backup-data').addEventListener('click', backupData);
    document.getElementById('clear-logs').addEventListener('click', clearLogs);
    document.getElementById('generate-sample-data').addEventListener('click', generateSampleData);
    document.getElementById('export-reports').addEventListener('click', exportReports);
    document.getElementById('system-maintenance').addEventListener('click', systemMaintenance);
}

function checkAuthStatus() {
    // Check if user is already authenticated (in a real app, check Firebase Auth)
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Authenticating...';
        submitBtn.disabled = true;
        
        // Simulate authentication (in real app, use Firebase Auth)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (email === 'admin@airport.com' && password === 'admin123') {
            localStorage.setItem('admin_authenticated', 'true');
            isAuthenticated = true;
            showAdminPanel();
            addLogEntry('Admin login successful');
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid email or password');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Access Admin Panel';
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    localStorage.removeItem('admin_authenticated');
    isAuthenticated = false;
    showLoginForm();
    addLogEntry('Admin logout');
}

function showLoginForm() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
}

async function showAdminPanel() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    // Load admin dashboard data
    await loadAdminData();
}

async function loadAdminData() {
    try {
        const [flights, passengers, staff, gates] = await Promise.all([
            FirebaseHelper.get('flights'),
            FirebaseHelper.get('passengers'),
            FirebaseHelper.get('staff'),
            FirebaseHelper.get('gates')
        ]);

        // Update analytics stats
        document.getElementById('admin-total-flights').textContent = flights ? Object.keys(flights).length : 0;
        document.getElementById('admin-total-passengers').textContent = passengers ? Object.keys(passengers).length : 0;
        document.getElementById('admin-total-staff').textContent = staff ? Object.keys(staff).length : 0;

        addLogEntry('Admin dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading admin data:', error);
        addLogEntry('Error loading dashboard data', 'error');
    }
}

async function backupData() {
    try {
        addLogEntry('Initiating data backup...');
        
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const [flights, passengers, staff, gates] = await Promise.all([
            FirebaseHelper.get('flights'),
            FirebaseHelper.get('passengers'),
            FirebaseHelper.get('staff'),
            FirebaseHelper.get('gates')
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: { flights, passengers, staff, gates }
        };

        // In a real implementation, this would upload to cloud storage
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `airport-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        addLogEntry('Data backup completed successfully');
        showSuccess('Data backup downloaded successfully');
    } catch (error) {
        console.error('Backup error:', error);
        addLogEntry('Data backup failed', 'error');
        showError('Failed to backup data');
    }
}

async function clearLogs() {
    if (!confirm('Are you sure you want to clear all system logs?')) return;
    
    try {
        const logContainer = document.getElementById('admin-logs');
        logContainer.innerHTML = `
            <div class="log-entry">
                <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
                <span class="log-message">System logs cleared</span>
            </div>
        `;
        
        showSuccess('System logs cleared');
    } catch (error) {
        console.error('Error clearing logs:', error);
        showError('Failed to clear logs');
    }
}

async function generateSampleData() {
    if (!confirm('This will add sample data to the system. Continue?')) return;
    
    try {
        addLogEntry('Generating sample data...');
        
        // Sample flights
        const sampleFlights = [
            {
                flightNumber: 'DL123',
                origin: 'Atlanta',
                destination: 'Denver',
                departureTime: '2024-01-16T08:00',
                gate: 'C5',
                status: 'On Time',
                createdAt: Date.now()
            },
            {
                flightNumber: 'SW456',
                origin: 'Phoenix',
                destination: 'Seattle',
                departureTime: '2024-01-16T12:30',
                gate: 'A8',
                status: 'Delayed',
                createdAt: Date.now()
            }
        ];

        // Sample passengers
        const samplePassengers = [
            {
                firstName: 'Alice',
                lastName: 'Johnson',
                flightNumber: 'DL123',
                seatNumber: '15B',
                email: 'alice.johnson@email.com',
                phone: '+1 555 0123',
                checkInStatus: 'Checked In',
                createdAt: Date.now()
            },
            {
                firstName: 'Bob',
                lastName: 'Williams',
                flightNumber: 'SW456',
                seatNumber: '22A',
                email: 'bob.williams@email.com',
                phone: '+1 555 0456',
                checkInStatus: 'Not Checked In',
                createdAt: Date.now()
            }
        ];

        // Add sample data to Firebase
        for (const flight of sampleFlights) {
            await FirebaseHelper.push('flights', flight);
        }
        
        for (const passenger of samplePassengers) {
            await FirebaseHelper.push('passengers', passenger);
        }

        addLogEntry('Sample data generated successfully');
        showSuccess('Sample data added to the system');
        
        // Refresh admin data
        await loadAdminData();
    } catch (error) {
        console.error('Error generating sample data:', error);
        addLogEntry('Failed to generate sample data', 'error');
        showError('Failed to generate sample data');
    }
}

async function exportReports() {
    try {
        addLogEntry('Generating system reports...');
        
        const [flights, passengers, staff, gates] = await Promise.all([
            FirebaseHelper.get('flights'),
            FirebaseHelper.get('passengers'),
            FirebaseHelper.get('staff'),
            FirebaseHelper.get('gates')
        ]);

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalFlights: flights ? Object.keys(flights).length : 0,
                totalPassengers: passengers ? Object.keys(passengers).length : 0,
                totalStaff: staff ? Object.keys(staff).length : 0,
                totalGates: gates ? Object.keys(gates).length : 0
            },
            flightStatus: calculateFlightStatusDistribution(flights),
            passengerStatus: calculatePassengerStatusDistribution(passengers),
            staffDistribution: calculateStaffDistribution(staff),
            gateUtilization: calculateGateUtilization(gates)
        };

        const reportStr = JSON.stringify(report, null, 2);
        const reportBlob = new Blob([reportStr], { type: 'application/json' });
        const url = URL.createObjectURL(reportBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `airport-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        addLogEntry('System reports exported successfully');
        showSuccess('Reports exported successfully');
    } catch (error) {
        console.error('Error exporting reports:', error);
        addLogEntry('Report export failed', 'error');
        showError('Failed to export reports');
    }
}

async function systemMaintenance() {
    if (!confirm('This will perform system maintenance operations. Continue?')) return;
    
    try {
        addLogEntry('Starting system maintenance...');
        
        // Simulate maintenance tasks
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        addLogEntry('Database optimization completed');
        addLogEntry('Cache cleared');
        addLogEntry('System health check passed');
        addLogEntry('System maintenance completed successfully');
        
        showSuccess('System maintenance completed');
    } catch (error) {
        console.error('Maintenance error:', error);
        addLogEntry('System maintenance failed', 'error');
        showError('System maintenance failed');
    }
}

function calculateFlightStatusDistribution(flights) {
    const distribution = { 'On Time': 0, 'Delayed': 0, 'Departed': 0, 'Cancelled': 0 };
    if (flights) {
        Object.values(flights).forEach(flight => {
            distribution[flight.status] = (distribution[flight.status] || 0) + 1;
        });
    }
    return distribution;
}

function calculatePassengerStatusDistribution(passengers) {
    const distribution = { 'Not Checked In': 0, 'Checked In': 0, 'Boarded': 0 };
    if (passengers) {
        Object.values(passengers).forEach(passenger => {
            distribution[passenger.checkInStatus] = (distribution[passenger.checkInStatus] || 0) + 1;
        });
    }
    return distribution;
}

function calculateStaffDistribution(staff) {
    const distribution = {};
    if (staff) {
        Object.values(staff).forEach(member => {
            distribution[member.role] = (distribution[member.role] || 0) + 1;
        });
    }
    return distribution;
}

function calculateGateUtilization(gates) {
    const utilization = { 'Available': 0, 'Occupied': 0, 'Maintenance': 0, 'Closed': 0 };
    if (gates) {
        Object.values(gates).forEach(gate => {
            utilization[gate.status] = (utilization[gate.status] || 0) + 1;
        });
    }
    return utilization;
}

function addLogEntry(message, type = 'info') {
    const logContainer = document.getElementById('admin-logs');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <span class="log-time">[${timestamp}]</span>
        <span class="log-message">${message}</span>
    `;
    
    // Add to beginning of log container
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Keep only last 50 entries
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function showSuccess(message) {
    console.log('Success:', message);
    addLogEntry(message, 'success');
}

function showError(message) {
    console.error('Error:', message);
    addLogEntry(message, 'error');
}
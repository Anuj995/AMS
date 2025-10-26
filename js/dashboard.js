// Dashboard functionality
document.addEventListener('DOMContentLoaded', async function() {
    await loadDashboardData();
    setupRealTimeUpdates();
});

async function loadDashboardData() {
    try {
        // Load all data from Firebase
        const [flights, passengers, staff, gates] = await Promise.all([
            FirebaseHelper.get('flights'),
            FirebaseHelper.get('passengers'),
            FirebaseHelper.get('staff'),
            FirebaseHelper.get('gates')
        ]);

        // Update statistics
        updateStatistics(flights, passengers, staff, gates);
        
        // Update flight status overview
        updateFlightStatusOverview(flights);
        
        // Update activity feed
        updateActivityFeed(flights, passengers, staff);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

function updateStatistics(flights, passengers, staff, gates) {
    const flightCount = flights ? Object.keys(flights).length : 0;
    const passengerCount = passengers ? Object.keys(passengers).length : 0;
    const staffCount = staff ? Object.keys(staff).length : 0;
    const gateCount = gates ? Object.keys(gates).length : 0;

    document.getElementById('total-flights').textContent = flightCount;
    document.getElementById('total-passengers').textContent = passengerCount;
    document.getElementById('total-staff').textContent = staffCount;
    document.getElementById('total-gates').textContent = gateCount;
}

function updateFlightStatusOverview(flights) {
    let onTimeCount = 0;
    let delayedCount = 0;
    let departedCount = 0;

    if (flights) {
        Object.values(flights).forEach(flight => {
            switch (flight.status) {
                case 'On Time':
                    onTimeCount++;
                    break;
                case 'Delayed':
                    delayedCount++;
                    break;
                case 'Departed':
                    departedCount++;
                    break;
            }
        });
    }

    document.getElementById('ontime-count').textContent = onTimeCount;
    document.getElementById('delayed-count').textContent = delayedCount;
    document.getElementById('departed-count').textContent = departedCount;
}

function updateActivityFeed(flights, passengers, staff) {
    const activityFeed = document.getElementById('activity-feed');
    const activities = [];

    // Generate activities from recent data
    if (flights) {
        Object.values(flights).forEach(flight => {
            activities.push({
                time: new Date(flight.createdAt || Date.now()),
                text: `Flight ${flight.flightNumber} scheduled from ${flight.origin} to ${flight.destination}`,
                type: 'flight'
            });
        });
    }

    if (passengers) {
        Object.values(passengers).forEach(passenger => {
            activities.push({
                time: new Date(passenger.createdAt || Date.now()),
                text: `Passenger ${passenger.firstName} ${passenger.lastName} registered for flight ${passenger.flightNumber}`,
                type: 'passenger'
            });
        });
    }

    if (staff) {
        Object.values(staff).forEach(member => {
            activities.push({
                time: new Date(member.createdAt || Date.now()),
                text: `${member.role} ${member.firstName} ${member.lastName} assigned to duty`,
                type: 'staff'
            });
        });
    }

    // Sort activities by time (most recent first)
    activities.sort((a, b) => b.time - a.time);

    // Display latest 5 activities
    const recentActivities = activities.slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityFeed.innerHTML = `
            <div class="activity-item">
                <span class="activity-time">[System]</span>
                <span class="activity-text">No recent activities</span>
            </div>
        `;
        return;
    }

    activityFeed.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <span class="activity-time">${formatActivityTime(activity.time)}</span>
            <span class="activity-text">${activity.text}</span>
        </div>
    `).join('');
}

function formatActivityTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function setupRealTimeUpdates() {
    // In a real Firebase implementation, you would use onValue() to listen for changes
    // For demo purposes, we'll refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
}

function showError(message) {
    console.error(message);
    // You could implement a toast notification system here
}
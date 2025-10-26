// Flights management functionality
let flights = {};
let currentEditingFlight = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadFlights();
    setupEventListeners();
});

function setupEventListeners() {
    // Add flight button
    document.getElementById('add-flight-btn').addEventListener('click', openAddFlightModal);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Cancel button
    document.getElementById('cancel-flight').addEventListener('click', closeModal);
    
    // Form submission
    document.getElementById('flight-form').addEventListener('submit', handleFlightFormSubmit);
    
    // Search and filter
    document.getElementById('flight-search').addEventListener('input', filterFlights);
    document.getElementById('status-filter').addEventListener('change', filterFlights);
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('flight-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

async function loadFlights() {
    try {
        const flightsData = await FirebaseHelper.get('flights');
        flights = flightsData || {};
        renderFlightsTable();
    } catch (error) {
        console.error('Error loading flights:', error);
        showError('Failed to load flights');
    }
}

function renderFlightsTable() {
    const tbody = document.getElementById('flights-table-body');
    
    if (Object.keys(flights).length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">No flights found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = Object.entries(flights).map(([id, flight]) => `
        <tr>
            <td>${flight.flightNumber}</td>
            <td>${flight.origin}</td>
            <td>${flight.destination}</td>
            <td>${formatDateTime(flight.departureTime)}</td>
            <td>${flight.gate}</td>
            <td><span class="status-badge status-${flight.status.toLowerCase().replace(' ', '')}">${flight.status}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="editFlight('${id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="deleteFlight('${id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddFlightModal() {
    currentEditingFlight = null;
    document.getElementById('modal-title').textContent = 'Add New Flight';
    document.getElementById('flight-form').reset();
    document.getElementById('flight-modal').style.display = 'block';
}

function openEditFlightModal(flightId) {
    const flight = flights[flightId];
    if (!flight) return;

    currentEditingFlight = flightId;
    document.getElementById('modal-title').textContent = 'Edit Flight';
    
    // Populate form fields
    document.getElementById('flight-number').value = flight.flightNumber;
    document.getElementById('origin').value = flight.origin;
    document.getElementById('destination').value = flight.destination;
    document.getElementById('departure-time').value = flight.departureTime;
    document.getElementById('gate').value = flight.gate;
    document.getElementById('status').value = flight.status;
    
    document.getElementById('flight-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('flight-modal').style.display = 'none';
    currentEditingFlight = null;
}

async function handleFlightFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        flightNumber: document.getElementById('flight-number').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        departureTime: document.getElementById('departure-time').value,
        gate: document.getElementById('gate').value,
        status: document.getElementById('status').value,
        createdAt: currentEditingFlight ? flights[currentEditingFlight].createdAt : Date.now(),
        updatedAt: Date.now()
    };

    try {
        if (currentEditingFlight) {
            // Update existing flight
            await FirebaseHelper.set(`flights/${currentEditingFlight}`, formData);
            flights[currentEditingFlight] = formData;
            showSuccess('Flight updated successfully');
        } else {
            // Add new flight
            const newFlightId = await FirebaseHelper.push('flights', formData);
            flights[newFlightId] = { ...formData, id: newFlightId };
            showSuccess('Flight added successfully');
        }
        
        renderFlightsTable();
        closeModal();
    } catch (error) {
        console.error('Error saving flight:', error);
        showError('Failed to save flight');
    }
}

// Global functions for inline event handlers
window.editFlight = function(flightId) {
    openEditFlightModal(flightId);
};

window.deleteFlight = async function(flightId) {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    
    try {
        await FirebaseHelper.remove(`flights/${flightId}`);
        delete flights[flightId];
        renderFlightsTable();
        showSuccess('Flight deleted successfully');
    } catch (error) {
        console.error('Error deleting flight:', error);
        showError('Failed to delete flight');
    }
};

function filterFlights() {
    const searchTerm = document.getElementById('flight-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    const filteredFlights = Object.entries(flights).filter(([id, flight]) => {
        const matchesSearch = !searchTerm || 
            flight.flightNumber.toLowerCase().includes(searchTerm) ||
            flight.origin.toLowerCase().includes(searchTerm) ||
            flight.destination.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || flight.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const tbody = document.getElementById('flights-table-body');
    
    if (filteredFlights.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">No flights match your filters</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredFlights.map(([id, flight]) => `
        <tr>
            <td>${flight.flightNumber}</td>
            <td>${flight.origin}</td>
            <td>${flight.destination}</td>
            <td>${formatDateTime(flight.departureTime)}</td>
            <td>${flight.gate}</td>
            <td><span class="status-badge status-${flight.status.toLowerCase().replace(' ', '')}">${flight.status}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="editFlight('${id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="deleteFlight('${id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    console.log('Success:', message);
    // You could implement a toast notification system here
}

function showError(message) {
    console.error('Error:', message);
    // You could implement a toast notification system here
}
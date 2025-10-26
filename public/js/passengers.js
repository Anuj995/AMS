// Passengers management functionality
let passengers = {};
let flights = {};
let currentEditingPassenger = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // Add passenger button
    document.getElementById('add-passenger-btn').addEventListener('click', openAddPassengerModal);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Cancel button
    document.getElementById('cancel-passenger').addEventListener('click', closeModal);
    
    // Form submission
    document.getElementById('passenger-form').addEventListener('submit', handlePassengerFormSubmit);
    
    // Search and filter
    document.getElementById('passenger-search').addEventListener('input', filterPassengers);
    document.getElementById('flight-filter').addEventListener('change', filterPassengers);
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('passenger-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

async function loadData() {
    try {
        const [passengersData, flightsData] = await Promise.all([
            FirebaseHelper.get('passengers'),
            FirebaseHelper.get('flights')
        ]);
        
        passengers = passengersData || {};
        flights = flightsData || {};
        
        populateFlightSelects();
        renderPassengersTable();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    }
}

function populateFlightSelects() {
    const passengerFlightSelect = document.getElementById('passenger-flight');
    const flightFilterSelect = document.getElementById('flight-filter');
    
    // Clear existing options (except first one)
    passengerFlightSelect.innerHTML = '<option value="">Select Flight</option>';
    flightFilterSelect.innerHTML = '<option value="">All Flights</option>';
    
    Object.entries(flights).forEach(([id, flight]) => {
        const option = `<option value="${flight.flightNumber}">${flight.flightNumber} - ${flight.origin} to ${flight.destination}</option>`;
        passengerFlightSelect.innerHTML += option;
        flightFilterSelect.innerHTML += `<option value="${flight.flightNumber}">${flight.flightNumber}</option>`;
    });
}

function renderPassengersTable() {
    const tbody = document.getElementById('passengers-table-body');
    
    if (Object.keys(passengers).length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">No passengers found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = Object.entries(passengers).map(([id, passenger]) => `
        <tr>
            <td>${passenger.firstName} ${passenger.lastName}</td>
            <td>${passenger.flightNumber}</td>
            <td>${passenger.seatNumber}</td>
            <td><span class="status-badge status-${passenger.checkInStatus.toLowerCase().replace(' ', '')}">${passenger.checkInStatus}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="generateBoardingPass('${id}')">
                    Generate
                </button>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="editPassenger('${id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="deletePassenger('${id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddPassengerModal() {
    currentEditingPassenger = null;
    document.getElementById('modal-title').textContent = 'Register New Passenger';
    document.getElementById('passenger-form').reset();
    document.getElementById('passenger-modal').style.display = 'block';
}

function openEditPassengerModal(passengerId) {
    const passenger = passengers[passengerId];
    if (!passenger) return;

    currentEditingPassenger = passengerId;
    document.getElementById('modal-title').textContent = 'Edit Passenger';
    
    // Populate form fields
    document.getElementById('first-name').value = passenger.firstName;
    document.getElementById('last-name').value = passenger.lastName;
    document.getElementById('passenger-flight').value = passenger.flightNumber;
    document.getElementById('seat-number').value = passenger.seatNumber;
    document.getElementById('email').value = passenger.email;
    document.getElementById('phone').value = passenger.phone;
    document.getElementById('check-in-status').value = passenger.checkInStatus;
    
    document.getElementById('passenger-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('passenger-modal').style.display = 'none';
    currentEditingPassenger = null;
}

async function handlePassengerFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        flightNumber: document.getElementById('passenger-flight').value,
        seatNumber: document.getElementById('seat-number').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        checkInStatus: document.getElementById('check-in-status').value,
        createdAt: currentEditingPassenger ? passengers[currentEditingPassenger].createdAt : Date.now(),
        updatedAt: Date.now()
    };

    try {
        if (currentEditingPassenger) {
            // Update existing passenger
            await FirebaseHelper.set(`passengers/${currentEditingPassenger}`, formData);
            passengers[currentEditingPassenger] = formData;
            showSuccess('Passenger updated successfully');
        } else {
            // Add new passenger
            const newPassengerId = await FirebaseHelper.push('passengers', formData);
            passengers[newPassengerId] = { ...formData, id: newPassengerId };
            showSuccess('Passenger registered successfully');
        }
        
        renderPassengersTable();
        closeModal();
    } catch (error) {
        console.error('Error saving passenger:', error);
        showError('Failed to save passenger');
    }
}

// Global functions for inline event handlers
window.editPassenger = function(passengerId) {
    openEditPassengerModal(passengerId);
};

window.deletePassenger = async function(passengerId) {
    if (!confirm('Are you sure you want to delete this passenger?')) return;
    
    try {
        await FirebaseHelper.remove(`passengers/${passengerId}`);
        delete passengers[passengerId];
        renderPassengersTable();
        showSuccess('Passenger deleted successfully');
    } catch (error) {
        console.error('Error deleting passenger:', error);
        showError('Failed to delete passenger');
    }
};

window.generateBoardingPass = function(passengerId) {
    const passenger = passengers[passengerId];
    if (!passenger) return;
    
    const flight = Object.values(flights).find(f => f.flightNumber === passenger.flightNumber);
    if (!flight) {
        showError('Flight information not found');
        return;
    }
    
    // Generate boarding pass (in a real implementation, this would be a PDF or proper boarding pass)
    const boardingPassData = {
        passengerName: `${passenger.firstName} ${passenger.lastName}`,
        flightNumber: passenger.flightNumber,
        seatNumber: passenger.seatNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        gate: flight.gate,
        boardingTime: new Date(flight.departureTime).getTime() - (30 * 60 * 1000) // 30 minutes before departure
    };
    
    showBoardingPassModal(boardingPassData);
};

function showBoardingPassModal(data) {
    const boardingPassHTML = `
        <div style="background: white; color: black; padding: 20px; border-radius: 8px; font-family: monospace;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #000;">✈ BOARDING PASS</h2>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <p><strong>Passenger:</strong> ${data.passengerName}</p>
                    <p><strong>Flight:</strong> ${data.flightNumber}</p>
                    <p><strong>Seat:</strong> ${data.seatNumber}</p>
                </div>
                <div>
                    <p><strong>From:</strong> ${data.origin}</p>
                    <p><strong>To:</strong> ${data.destination}</p>
                    <p><strong>Gate:</strong> ${data.gate}</p>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center; border-top: 2px solid #000; padding-top: 10px;">
                <p><strong>Departure:</strong> ${formatDateTime(data.departureTime)}</p>
                <p><strong>Boarding:</strong> ${formatDateTime(data.boardingTime)}</p>
            </div>
        </div>
    `;
    
    // Create temporary modal for boarding pass
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Boarding Pass Generated</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                ${boardingPassHTML}
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="window.print()">Print</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function filterPassengers() {
    const searchTerm = document.getElementById('passenger-search').value.toLowerCase();
    const flightFilter = document.getElementById('flight-filter').value;
    
    const filteredPassengers = Object.entries(passengers).filter(([id, passenger]) => {
        const matchesSearch = !searchTerm || 
            passenger.firstName.toLowerCase().includes(searchTerm) ||
            passenger.lastName.toLowerCase().includes(searchTerm) ||
            passenger.flightNumber.toLowerCase().includes(searchTerm) ||
            passenger.seatNumber.toLowerCase().includes(searchTerm);
        
        const matchesFlight = !flightFilter || passenger.flightNumber === flightFilter;
        
        return matchesSearch && matchesFlight;
    });

    const tbody = document.getElementById('passengers-table-body');
    
    if (filteredPassengers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">No passengers match your filters</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredPassengers.map(([id, passenger]) => `
        <tr>
            <td>${passenger.firstName} ${passenger.lastName}</td>
            <td>${passenger.flightNumber}</td>
            <td>${passenger.seatNumber}</td>
            <td><span class="status-badge status-${passenger.checkInStatus.toLowerCase().replace(' ', '')}">${passenger.checkInStatus}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="generateBoardingPass('${id}')">
                    Generate
                </button>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="editPassenger('${id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="deletePassenger('${id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    console.log('Success:', message);
}

function showError(message) {
    console.error('Error:', message);
}
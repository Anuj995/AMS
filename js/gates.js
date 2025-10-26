// Gates management functionality
let gates = {};
let flights = {};
let currentEditingGate = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // Add gate button
    document.getElementById('add-gate-btn').addEventListener('click', openAddGateModal);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Cancel button
    document.getElementById('cancel-gate').addEventListener('click', closeModal);
    
    // Form submission
    document.getElementById('gate-form').addEventListener('submit', handleGateFormSubmit);
    
    // Search and filter
    document.getElementById('gate-search').addEventListener('input', filterGates);
    document.getElementById('terminal-filter').addEventListener('change', filterGates);
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('gate-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

async function loadData() {
    try {
        const [gatesData, flightsData] = await Promise.all([
            FirebaseHelper.get('gates'),
            FirebaseHelper.get('flights')
        ]);
        
        gates = gatesData || {};
        flights = flightsData || {};
        
        populateFlightSelects();
        renderGatesGrid();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    }
}

function populateFlightSelects() {
    const gateFlightSelect = document.getElementById('gate-flight');
    
    // Clear existing options (except first one)
    gateFlightSelect.innerHTML = '<option value="">No Assignment</option>';
    
    Object.entries(flights).forEach(([id, flight]) => {
        const option = `<option value="${flight.flightNumber}">${flight.flightNumber} - ${flight.origin} to ${flight.destination}</option>`;
        gateFlightSelect.innerHTML += option;
    });
}

function renderGatesGrid() {
    const gatesGrid = document.getElementById('gates-grid');
    
    if (Object.keys(gates).length === 0) {
        gatesGrid.innerHTML = `
            <div class="gate-card loading">
                <h3>No gates found</h3>
                <p>Click "Add New Gate" to create your first gate</p>
            </div>
        `;
        return;
    }

    gatesGrid.innerHTML = Object.entries(gates).map(([id, gate]) => `
        <div class="gate-card">
            <div class="gate-header">
                <div class="gate-number">${gate.gateNumber}</div>
                <div class="gate-status">
                    <span class="status-badge status-${gate.status.toLowerCase().replace(' ', '')}">${gate.status}</span>
                </div>
            </div>
            <div class="gate-info">
                <p><strong>Terminal:</strong> ${gate.terminal}</p>
                <p><strong>Assigned Flight:</strong> ${gate.assignedFlight || 'Not Assigned'}</p>
                ${gate.assignedFlight ? getFlightDetails(gate.assignedFlight) : ''}
            </div>
            <div class="gate-actions">
                <button class="btn btn-outline btn-sm" onclick="editGate('${id}')">Edit</button>
                <button class="btn btn-warning btn-sm" onclick="deleteGate('${id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function getFlightDetails(flightNumber) {
    const flight = Object.values(flights).find(f => f.flightNumber === flightNumber);
    if (!flight) return '';
    
    return `
        <p><strong>Route:</strong> ${flight.origin} → ${flight.destination}</p>
        <p><strong>Departure:</strong> ${formatDateTime(flight.departureTime)}</p>
    `;
}

function openAddGateModal() {
    currentEditingGate = null;
    document.getElementById('modal-title').textContent = 'Add New Gate';
    document.getElementById('gate-form').reset();
    document.getElementById('gate-modal').style.display = 'block';
}

function openEditGateModal(gateId) {
    const gate = gates[gateId];
    if (!gate) return;

    currentEditingGate = gateId;
    document.getElementById('modal-title').textContent = 'Edit Gate';
    
    // Populate form fields
    document.getElementById('gate-number').value = gate.gateNumber;
    document.getElementById('terminal').value = gate.terminal;
    document.getElementById('gate-flight').value = gate.assignedFlight || '';
    document.getElementById('gate-status').value = gate.status;
    
    document.getElementById('gate-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('gate-modal').style.display = 'none';
    currentEditingGate = null;
}

async function handleGateFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        gateNumber: document.getElementById('gate-number').value,
        terminal: document.getElementById('terminal').value,
        assignedFlight: document.getElementById('gate-flight').value || null,
        status: document.getElementById('gate-status').value,
        createdAt: currentEditingGate ? gates[currentEditingGate].createdAt : Date.now(),
        updatedAt: Date.now()
    };

    try {
        if (currentEditingGate) {
            // Update existing gate
            await FirebaseHelper.set(`gates/${currentEditingGate}`, formData);
            gates[currentEditingGate] = formData;
            showSuccess('Gate updated successfully');
        } else {
            // Add new gate
            const newGateId = await FirebaseHelper.push('gates', formData);
            gates[newGateId] = { ...formData, id: newGateId };
            showSuccess('Gate added successfully');
        }
        
        renderGatesGrid();
        closeModal();
    } catch (error) {
        console.error('Error saving gate:', error);
        showError('Failed to save gate');
    }
}

// Global functions for inline event handlers
window.editGate = function(gateId) {
    openEditGateModal(gateId);
};

window.deleteGate = async function(gateId) {
    if (!confirm('Are you sure you want to delete this gate?')) return;
    
    try {
        await FirebaseHelper.remove(`gates/${gateId}`);
        delete gates[gateId];
        renderGatesGrid();
        showSuccess('Gate deleted successfully');
    } catch (error) {
        console.error('Error deleting gate:', error);
        showError('Failed to delete gate');
    }
};

function filterGates() {
    const searchTerm = document.getElementById('gate-search').value.toLowerCase();
    const terminalFilter = document.getElementById('terminal-filter').value;
    
    const filteredGates = Object.entries(gates).filter(([id, gate]) => {
        const matchesSearch = !searchTerm || 
            gate.gateNumber.toLowerCase().includes(searchTerm) ||
            gate.terminal.toLowerCase().includes(searchTerm) ||
            (gate.assignedFlight && gate.assignedFlight.toLowerCase().includes(searchTerm));
        
        const matchesTerminal = !terminalFilter || gate.terminal === terminalFilter;
        
        return matchesSearch && matchesTerminal;
    });

    const gatesGrid = document.getElementById('gates-grid');
    
    if (filteredGates.length === 0) {
        gatesGrid.innerHTML = `
            <div class="gate-card loading">
                <h3>No gates match your filters</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    gatesGrid.innerHTML = filteredGates.map(([id, gate]) => `
        <div class="gate-card">
            <div class="gate-header">
                <div class="gate-number">${gate.gateNumber}</div>
                <div class="gate-status">
                    <span class="status-badge status-${gate.status.toLowerCase().replace(' ', '')}">${gate.status}</span>
                </div>
            </div>
            <div class="gate-info">
                <p><strong>Terminal:</strong> ${gate.terminal}</p>
                <p><strong>Assigned Flight:</strong> ${gate.assignedFlight || 'Not Assigned'}</p>
                ${gate.assignedFlight ? getFlightDetails(gate.assignedFlight) : ''}
            </div>
            <div class="gate-actions">
                <button class="btn btn-outline btn-sm" onclick="editGate('${id}')">Edit</button>
                <button class="btn btn-warning btn-sm" onclick="deleteGate('${id}')">Delete</button>
            </div>
        </div>
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
}

function showError(message) {
    console.error('Error:', message);
}
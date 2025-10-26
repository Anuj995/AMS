// Staff management functionality
let staff = {};
let flights = {};
let currentEditingStaff = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // Add staff button
    document.getElementById('add-staff-btn').addEventListener('click', openAddStaffModal);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Cancel button
    document.getElementById('cancel-staff').addEventListener('click', closeModal);
    
    // Form submission
    document.getElementById('staff-form').addEventListener('submit', handleStaffFormSubmit);
    
    // Search and filter
    document.getElementById('staff-search').addEventListener('input', filterStaff);
    document.getElementById('role-filter').addEventListener('change', filterStaff);
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('staff-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

async function loadData() {
    try {
        const [staffData, flightsData] = await Promise.all([
            FirebaseHelper.get('staff'),
            FirebaseHelper.get('flights')
        ]);
        
        staff = staffData || {};
        flights = flightsData || {};
        
        populateFlightSelects();
        renderStaffTable();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    }
}

function populateFlightSelects() {
    const assignedFlightSelect = document.getElementById('assigned-flight');
    
    // Clear existing options (except first one)
    assignedFlightSelect.innerHTML = '<option value="">No Assignment</option>';
    
    Object.entries(flights).forEach(([id, flight]) => {
        const option = `<option value="${flight.flightNumber}">${flight.flightNumber} - ${flight.origin} to ${flight.destination}</option>`;
        assignedFlightSelect.innerHTML += option;
    });
}

function renderStaffTable() {
    const tbody = document.getElementById('staff-table-body');
    
    if (Object.keys(staff).length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">No staff members found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = Object.entries(staff).map(([id, member]) => `
        <tr>
            <td>${member.firstName} ${member.lastName}</td>
            <td>${member.role}</td>
            <td>${member.employeeId}</td>
            <td>${member.assignedFlight || 'Not Assigned'}</td>
            <td><span class="status-badge status-${member.status.toLowerCase().replace(' ', '')}">${member.status}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="editStaff('${id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="deleteStaff('${id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddStaffModal() {
    currentEditingStaff = null;
    document.getElementById('modal-title').textContent = 'Add New Staff Member';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-modal').style.display = 'block';
}

function openEditStaffModal(staffId) {
    const member = staff[staffId];
    if (!member) return;

    currentEditingStaff = staffId;
    document.getElementById('modal-title').textContent = 'Edit Staff Member';
    
    // Populate form fields
    document.getElementById('staff-first-name').value = member.firstName;
    document.getElementById('staff-last-name').value = member.lastName;
    document.getElementById('employee-id').value = member.employeeId;
    document.getElementById('staff-role').value = member.role;
    document.getElementById('assigned-flight').value = member.assignedFlight || '';
    document.getElementById('staff-status').value = member.status;
    
    document.getElementById('staff-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('staff-modal').style.display = 'none';
    currentEditingStaff = null;
}

async function handleStaffFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById('staff-first-name').value,
        lastName: document.getElementById('staff-last-name').value,
        employeeId: document.getElementById('employee-id').value,
        role: document.getElementById('staff-role').value,
        assignedFlight: document.getElementById('assigned-flight').value || null,
        status: document.getElementById('staff-status').value,
        createdAt: currentEditingStaff ? staff[currentEditingStaff].createdAt : Date.now(),
        updatedAt: Date.now()
    };

    try {
        if (currentEditingStaff) {
            // Update existing staff member
            await FirebaseHelper.set(`staff/${currentEditingStaff}`, formData);
            staff[currentEditingStaff] = formData;
            showSuccess('Staff member updated successfully');
        } else {
            // Add new staff member
            const newStaffId = await FirebaseHelper.push('staff', formData);
            staff[newStaffId] = { ...formData, id: newStaffId };
            showSuccess('Staff member added successfully');
        }
        
        renderStaffTable();
        closeModal();
    } catch (error) {
        console.error('Error saving staff member:', error);
        showError('Failed to save staff member');
    }
}

// Global functions for inline event handlers
window.editStaff = function(staffId) {
    openEditStaffModal(staffId);
};

window.deleteStaff = async function(staffId) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
        await FirebaseHelper.remove(`staff/${staffId}`);
        delete staff[staffId];
        renderStaffTable();
        showSuccess('Staff member deleted successfully');
    } catch (error) {
        console.error('Error deleting staff member:', error);
        showError('Failed to delete staff member');
    }
};

function filterStaff() {
    const searchTerm = document.getElementById('staff-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    
    const filteredStaff = Object.entries(staff).filter(([id, member]) => {
        const matchesSearch = !searchTerm || 
            member.firstName.toLowerCase().includes(searchTerm) ||
            member.lastName.toLowerCase().includes(searchTerm) ||
            member.employeeId.toLowerCase().includes(searchTerm) ||
            member.role.toLowerCase().includes(searchTerm) ||
            (member.assignedFlight && member.assignedFlight.toLowerCase().includes(searchTerm));
        
        const matchesRole = !roleFilter || member.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    const tbody = document.getElementById('staff-table-body');
    
    if (filteredStaff.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">No staff members match your filters</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredStaff.map(([id, member]) => `
        <tr>
            <td>${member.firstName} ${member.lastName}</td>
            <td>${member.role}</td>
            <td>${member.employeeId}</td>
            <td>${member.assignedFlight || 'Not Assigned'}</td>
            <td><span class="status-badge status-${member.status.toLowerCase().replace(' ', '')}">${member.status}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="editStaff('${id}')">Edit</button>
                    <button class="btn btn-warning btn-sm" onclick="deleteStaff('${id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showSuccess(message) {
    console.log('Success:', message);
}

function showError(message) {
    console.error('Error:', message);
}
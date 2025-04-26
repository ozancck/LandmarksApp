// Global variables
let map;
let currentMarker = null;
let landmarks = [];
let selectedLocation = null;

// API endpoints
import { LANDMARKS_API, VISITED_API } from './config.js';

// DOM Elements
const landmarkList = document.getElementById('landmarkList');
const selectedLocationEl = document.getElementById('selectedLocation');
const saveLandmarkBtn = document.getElementById('saveLandmarkBtn');
const landmarkForm = document.getElementById('landmarkForm');
const addNotesBtn = document.getElementById('addNotesBtn');
const visitedLandmarksBtn = document.getElementById('visitedLandmarksBtn');
const createPlanBtn = document.getElementById('createPlanBtn');
const notesModal = document.getElementById('notesModal');
const visitedModal = document.getElementById('visitedModal');
const planModal = document.getElementById('planModal');
const selectLandmark = document.getElementById('selectLandmark');
const notesForm = document.getElementById('notesForm');
const visitedList = document.getElementById('visitedList');
const planForm = document.getElementById('planForm');
const planLandmarks = document.getElementById('planLandmarks');

// Initialize map
function initMap() {
    map = L.map('map').setView([20, 0], 2); // Default global view

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add landmark on map click
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        
        // Remove previous marker if exists
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        
        // Create new marker
        currentMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup(`Lat: ${lat}, Lng: ${lng}`)
            .openPopup();

        // Store selected location
        selectedLocation = { latitude: lat, longitude: lng };
        selectedLocationEl.textContent = `Latitude: ${lat}, Longitude: ${lng}`;
        
        // Enable save button
        saveLandmarkBtn.disabled = false;
    });

    // Load existing landmarks
    loadLandmarks();
}

// Load landmarks from API
async function loadLandmarks() {
    try {
        const response = await fetch(LANDMARKS_API);
        const data = await response.json();
        landmarks = data;
        
        // Display landmarks on map
        displayLandmarksOnMap(landmarks);
        
        // Update landmarks list
        updateLandmarkList();
        
        // Update landmark dropdowns
        updateLandmarkDropdowns();
    } catch (error) {
        console.error('Error loading landmarks:', error);
    }
}

// Display landmarks on the map
function displayLandmarksOnMap(landmarks) {
    landmarks.forEach(landmark => {
        const { latitude, longitude } = landmark.location;
        const marker = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`<strong>${landmark.name}</strong><br>${landmark.description}`);
    });
}

// Update the landmarks list
function updateLandmarkList() {
    landmarkList.innerHTML = '';
    landmarks.forEach(landmark => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${landmark.name}</strong> - ${landmark.category}
            <button class="small-btn edit-btn" data-id="${landmark._id}">Edit</button>
            <button class="small-btn delete-btn" data-id="${landmark._id}">Delete</button>
        `;
        landmarkList.appendChild(li);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editLandmark(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteLandmark(id);
        });
    });
}

// Update landmark dropdowns
function updateLandmarkDropdowns() {
    // Clear existing options
    selectLandmark.innerHTML = '';
    planLandmarks.innerHTML = '';
    
    // Add options to select dropdown
    landmarks.forEach(landmark => {
        const option = document.createElement('option');
        option.value = landmark._id;
        option.textContent = landmark.name;
        selectLandmark.appendChild(option);
        
        // Add checkboxes for plan creation
        const div = document.createElement('div');
        div.innerHTML = `
            <input type="checkbox" id="plan-${landmark._id}" name="plan-landmarks" value="${landmark._id}">
            <label for="plan-${landmark._id}">${landmark.name}</label>
        `;
        planLandmarks.appendChild(div);
    });
}

// Save a new landmark
async function saveLandmark(e) {
    e.preventDefault();
    
    if (!selectedLocation) {
        alert('Please select a location on the map first');
        return;
    }
    
    const landmark = {
        name: document.getElementById('landmarkName').value,
        location: selectedLocation,
        description: document.getElementById('landmarkDescription').value,
        category: document.getElementById('landmarkCategory').value,
        notes: document.getElementById('landmarkNotes').value
    };
    
    try {
        const response = await fetch(LANDMARKS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(landmark)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save landmark');
        }
        
        const data = await response.json();
        
        // Reset form
        landmarkForm.reset();
        selectedLocation = null;
        selectedLocationEl.textContent = 'No location selected';
        saveLandmarkBtn.disabled = true;
        
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
        }
        
        // Reload landmarks
        loadLandmarks();
        
        alert('Landmark saved successfully!');
    } catch (error) {
        console.error('Error saving landmark:', error);
        alert('Failed to save landmark');
    }
}

// Edit landmark
async function editLandmark(id) {
    try {
        const response = await fetch(`${LANDMARKS_API}/${id}`);
        const landmark = await response.json();
        
        // Fill form with landmark data
        document.getElementById('landmarkName').value = landmark.name;
        document.getElementById('landmarkDescription').value = landmark.description;
        document.getElementById('landmarkCategory').value = landmark.category;
        document.getElementById('landmarkNotes').value = landmark.notes;
        
        selectedLocation = landmark.location;
        selectedLocationEl.textContent = `Latitude: ${landmark.location.latitude}, Longitude: ${landmark.location.longitude}`;
        saveLandmarkBtn.disabled = false;
        
        // Add event listener for form submission (update)
        landmarkForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const updatedLandmark = {
                name: document.getElementById('landmarkName').value,
                location: selectedLocation,
                description: document.getElementById('landmarkDescription').value,
                category: document.getElementById('landmarkCategory').value,
                notes: document.getElementById('landmarkNotes').value
            };
            
            try {
                const updateResponse = await fetch(`${LANDMARKS_API}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedLandmark)
                });
                
                if (!updateResponse.ok) {
                    throw new Error('Failed to update landmark');
                }
                
                // Reset form
                landmarkForm.reset();
                selectedLocation = null;
                selectedLocationEl.textContent = 'No location selected';
                saveLandmarkBtn.disabled = true;
                
                // Reload landmarks
                loadLandmarks();
                
                // Reset form submission handler
                landmarkForm.onsubmit = saveLandmark;
                
                alert('Landmark updated successfully!');
            } catch (error) {
                console.error('Error updating landmark:', error);
                alert('Failed to update landmark');
            }
        };
    } catch (error) {
        console.error('Error fetching landmark:', error);
        alert('Failed to fetch landmark details');
    }
}

// Delete landmark
async function deleteLandmark(id) {
    if (!confirm('Are you sure you want to delete this landmark?')) {
        return;
    }
    
    try {
        const response = await fetch(`${LANDMARKS_API}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete landmark');
        }
        
        // Reload landmarks
        loadLandmarks();
        
        alert('Landmark deleted successfully!');
    } catch (error) {
        console.error('Error deleting landmark:', error);
        alert('Failed to delete landmark');
    }
}

// Modal functionality
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Event listeners for modal close buttons
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
    });
});

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

// Add Notes button event listener
addNotesBtn.addEventListener('click', function() {
    if (landmarks.length === 0) {
        alert('No landmarks available. Please create a landmark first.');
        return;
    }
    
    openModal(notesModal);
});

// Visited Landmarks button event listener
visitedLandmarksBtn.addEventListener('click', function() {
    loadVisitedLandmarks();
    openModal(visitedModal);
});

// Create Visiting Plan button event listener
createPlanBtn.addEventListener('click', function() {
    if (landmarks.length === 0) {
        alert('No landmarks available. Please create a landmark first.');
        return;
    }
    
    openModal(planModal);
});

// Load visited landmarks
async function loadVisitedLandmarks() {
    try {
        const response = await fetch(VISITED_API);
        const visitedLandmarks = await response.json();
        
        visitedList.innerHTML = '';
        
        if (visitedLandmarks.length === 0) {
            visitedList.innerHTML = '<p>No visited landmarks yet.</p>';
            return;
        }
        
        visitedLandmarks.forEach(visit => {
            const landmark = visit.landmark_id;
            const date = new Date(visit.visited_date).toLocaleDateString();
            
            const div = document.createElement('div');
            div.className = 'visited-item';
            div.innerHTML = `
                <h4>${landmark.name}</h4>
                <p><strong>Category:</strong> ${landmark.category}</p>
                <p><strong>Visited by:</strong> ${visit.visitor_name}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Notes:</strong> ${visit.notes || 'No notes'}</p>
            `;
            
            visitedList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading visited landmarks:', error);
        visitedList.innerHTML = '<p>Failed to load visited landmarks.</p>';
    }
}

// Notes form submission
notesForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const landmarkId = selectLandmark.value;
    const notes = document.getElementById('notes').value;
    
    try {
        const response = await fetch(`${LANDMARKS_API}/${landmarkId}`);
        const landmark = await response.json();
        
        landmark.notes = notes;
        
        const updateResponse = await fetch(`${LANDMARKS_API}/${landmarkId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(landmark)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update notes');
        }
        
        closeModal(notesModal);
        notesForm.reset();
        loadLandmarks();
        
        alert('Notes updated successfully!');
    } catch (error) {
        console.error('Error updating notes:', error);
        alert('Failed to update notes');
    }
});

// Plan form submission
planForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const visitorName = document.getElementById('visitorName').value;
    const planNotes = document.getElementById('planNotes').value;
    const selectedLandmarks = Array.from(
        document.querySelectorAll('input[name="plan-landmarks"]:checked')
    ).map(input => input.value);
    
    if (selectedLandmarks.length === 0) {
        alert('Please select at least one landmark to visit.');
        return;
    }
    
    try {
        // Create visited records for each selected landmark
        const promises = selectedLandmarks.map(landmarkId => {
            return fetch(VISITED_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    landmark_id: landmarkId,
                    visitor_name: visitorName,
                    notes: planNotes
                })
            });
        });
        
        await Promise.all(promises);
        
        closeModal(planModal);
        planForm.reset();
        
        alert('Visiting plan created successfully!');
    } catch (error) {
        console.error('Error creating visiting plan:', error);
        alert('Failed to create visiting plan');
    }
});

// Initial event listeners
landmarkForm.addEventListener('submit', saveLandmark);

// Initialize app
document.addEventListener('DOMContentLoaded', initMap);
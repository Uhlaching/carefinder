const hospitals = [ { id: 1, name: "City General Hospital", latlng: [34.0522, -118.2437], specialties: ["Cardiology", "Neurology", "General Surgery"] }, { id: 2, name: "Downtown Urgent Care", latlng: [34.0560, -118.2510], specialties: ["General Practice", "Pediatrics"] }, { id: 3, name: "Sunnyvale Dental Clinic", latlng: [34.0488, -118.2527], specialties: ["Dentist", "Orthodontics"] }, { id: 4, name: "Westside Cardiology Center", latlng: [34.0600, -118.4452], specialties: ["Cardiology"] }, { id: 5, name: "Coastal Pediatric Group", latlng: [34.0219, -118.4814], specialties: ["Pediatrics"] } ];
const welcomeScreen = document.getElementById('welcome-screen');
const findCareButton = document.getElementById('find-care-button');
const specialtyInput = document.getElementById('specialty-input');
const resultsList = document.getElementById('results-list');
const mapElement = document.getElementById('map');
const queryDisplay = document.getElementById('query-display');
let map = null, userMarker = null, hospitalMarkers = [];
findCareButton.addEventListener('click', () => {
    const query = specialtyInput.value.trim();
    if (!query) { alert("Please enter a medical specialty."); return; }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            startApp(query, userLocation);
        },
        () => { alert("Location access is required to find nearby doctors. Please enable it."); }
    );
});
function startApp(query, userLocation) {
    welcomeScreen.classList.add('fading-out');
    document.getElementById('map-dashboard').classList.remove('hidden');
    queryDisplay.textContent = query;
    if (!map) {
        map = L.map(mapElement).setView([userLocation.lat, userLocation.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    } else { map.setView([userLocation.lat, userLocation.lng], 13); }
    if (userMarker) userMarker.setLatLng([userLocation.lat, userLocation.lng]);
    else {
        const userIcon = L.divIcon({ html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>', className: '' });
        userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup('<b>You are here</b>');
    }
    const filteredHospitals = findNearbyHospitals(query);
    displayResults(filteredHospitals);
}
function findNearbyHospitals(query) {
    const lowerCaseQuery = query.toLowerCase();
    return hospitals.filter(hospital => hospital.specialties.some(specialty => specialty.toLowerCase().includes(lowerCaseQuery)));
}
function displayResults(foundHospitals) {
    resultsList.innerHTML = "";
    hospitalMarkers.forEach(marker => map.removeLayer(marker));
    hospitalMarkers = [];
    if (foundHospitals.length === 0) { resultsList.innerHTML = `<p style="padding: 20px;">No results found for "${specialtyInput.value}".</p>`; return; }
    foundHospitals.forEach(hospital => {
        const marker = L.marker(hospital.latlng).addTo(map).bindPopup(`<b>${hospital.name}</b>`);
        hospitalMarkers.push(marker);
        const card = document.createElement('div');
        card.className = 'result-card';
        card.setAttribute('data-hospital-id', hospital.id);
        card.innerHTML = `<h3>${hospital.name}</h3><p>${hospital.specialties.join(', ')}</p>`;
        card.addEventListener('click', () => {
            map.setView(hospital.latlng, 15, { animate: true });
            marker.openPopup();
            document.querySelectorAll('.result-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
        resultsList.appendChild(card);
    });
}
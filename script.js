let map;
let favoriteCountries = [];
let marker;
let currentIndex = -1;

const indianStates = {
    "Andhra Pradesh": [15.9129, 79.74],
    "Arunachal Pradesh": [28.218, 94.7278],
    "Assam": [26.2006, 92.9376],
    "Bihar": [25.0961, 85.3131],
    "Chhattisgarh": [21.2787, 81.8661],
    "Goa": [15.2993, 74.124],
    "Gujarat": [22.2587, 71.1924],
    "Haryana": [29.0588, 76.0856],
    "Himachal Pradesh": [31.1048, 77.1734],
    "Jharkhand": [23.6102, 85.2799],
    "Karnataka": [15.3173, 75.7139],
    "Kerala": [10.8505, 76.2711],
    "Madhya Pradesh": [22.9734, 78.6569],
    "Maharashtra": [19.7515, 75.7139],
    "Manipur": [24.6637, 93.9063],
    "Meghalaya": [25.467, 91.3662],
    "Mizoram": [23.1645, 92.9376],
    "Nagaland": [26.1584, 94.5624],
    "Odisha": [20.9517, 85.0985],
    "Punjab": [31.1471, 75.3412],
    "Rajasthan": [27.0238, 74.2179],
    "Sikkim": [27.533, 88.5122],
    "Tamil Nadu": [11.1271, 78.6569],
    "Telangana": [18.1124, 79.0193],
    "Tripura": [23.9408, 91.9882],
    "Uttar Pradesh": [26.8467, 80.9462],
    "Uttarakhand": [30.0668, 79.0193],
    "West Bengal": [22.9868, 87.855]
};

const biharDistricts = {
    "Araria": [26.1485, 87.5136],
    "Arwal": [25.2442, 84.6918],
    "Aurangabad": [24.7539, 84.374],
    "Banka": [24.8845, 86.918],
    "Begusarai": [25.4185, 86.1335],
    "Bhagalpur": [25.2425, 87.0167],
    "Bhojpur": [25.467, 84.417],
    "Buxar": [25.5647, 83.9785],
    "Darbhanga": [26.1542, 85.8918],
    "East Champaran": [26.5037, 84.8568],
    "Gaya": [24.7914, 85.0002],
    "Gopalganj": [26.4686, 84.4406],
    "Jamui": [24.9255, 86.2115],
    "Jehanabad": [25.2137, 84.9873],
    "Kaimur": [25.0505, 83.5582],
    "Katihar": [25.5421, 87.5645],
    "Khagaria": [25.503, 86.473],
    "Kishanganj": [26.1026, 87.951],
    "Lakhisarai": [25.171, 86.1028],
    "Madhepura": [25.9213, 86.7925],
    "Madhubani": [26.3492, 86.0712],
    "Munger": [25.3747, 86.4741],
    "Muzaffarpur": [26.1222, 85.3799],
    "Nalanda": [25.2531, 85.4438],
    "Nawada": [24.8867, 85.5431],
    "Patna": [25.5941, 85.1376],
    "Purnia": [25.7771, 87.4753],
    "Rohtas": [24.9361, 84.0066],
    "Saharsa": [25.8746, 86.5964],
    "Samastipur": [25.8601, 85.7897],
    "Saran": [25.856, 84.8035],
    "Sheikhpura": [25.1405, 85.861],
    "Sheohar": [26.5156, 85.296],
    "Sitamarhi": [26.5933, 85.4906],
    "Siwan": [26.222, 84.3566],
    "Supaul": [26.1223, 86.5928],
    "Vaishali": [26.0041, 85.124],
    "West Champaran": [27.1473, 84.3556]
};

document.addEventListener("DOMContentLoaded", () => {
    // Initialize the map
    map = L.map('map').setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Add event listener for keydown on the search box
    document.getElementById('searchBox').addEventListener('keydown', handleKeyDown);

    // Invalidate map size on window resize
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });
});

async function searchCountry() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    if (query.length < 2) {
        document.getElementById('suggestions').innerHTML = '';
        document.getElementById('suggestions').style.display = 'none'; // Hide suggestions
        currentIndex = -1;
        return;
    }

    let countries = [];
    if (Object.keys(indianStates).map(state => state.toLowerCase()).includes(query)) {
        countries = Object.keys(indianStates)
            .filter(state => state.toLowerCase().includes(query))
            .map(state => ({ name: { common: state }, latlng: indianStates[state], cca2: 'IN' }));
    } else if (Object.keys(biharDistricts).map(district => district.toLowerCase()).includes(query)) {
        countries = Object.keys(biharDistricts)
            .filter(district => district.toLowerCase().includes(query))
            .map(district => ({ name: { common: district }, latlng: biharDistricts[district], cca2: 'IN' }));
    } else {
        const response = await fetch(`https://restcountries.com/v3.1/name/${query}`);
        countries = await response.json();
    }

    displaySuggestions(countries);
}

function displaySuggestions(countries) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    countries.forEach((country, index) => {
        const div = document.createElement('div');
        div.innerHTML = country.name.common;
        div.onclick = () => selectCountry(country);
        div.dataset.index = index;
        suggestions.appendChild(div);
    });
    suggestions.style.display = 'block'; // Show suggestions
    currentIndex = -1;
}

function handleKeyDown(event) {
    const suggestions = document.getElementById('suggestions').children;
    if (event.key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % suggestions.length;
        highlightSuggestion();
    } else if (event.key === 'ArrowUp') {
        currentIndex = (currentIndex - 1 + suggestions.length) % suggestions.length;
        highlightSuggestion();
    } else if (event.key === 'Enter' && currentIndex > -1) {
        suggestions[currentIndex].click();
    }
}

function highlightSuggestion() {
    const suggestions = document.getElementById('suggestions').children;
    for (let i = 0; i < suggestions.length; i++) {
        if (i === currentIndex) {
            suggestions[i].classList.add('highlight');
        } else {
            suggestions[i].classList.remove('highlight');
        }
    }
}

function selectCountry(country) {
    document.getElementById('searchBox').value = country.name.common;
    document.getElementById('countryCode').innerHTML = `Country Code: ${country.cca2}`;

    const location = [country.latlng[0], country.latlng[1]];
    map.setView(location, 5);

    if (marker) {
        marker.setLatLng(location);
    } else {
        marker = L.marker(location).addTo(map);
    }

    map.invalidateSize(); // Invalidate map size after setting the view

    document.getElementById('favoriteBtn').dataset.country = country.name.common;
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('suggestions').style.display = 'none'; // Hide suggestions after selection
}

function addFavorite() {
    const countryName = document.getElementById('favoriteBtn').dataset.country;
    if (countryName && !favoriteCountries.includes(countryName)) {
        favoriteCountries.push(countryName);
        updateFavoriteList();
    }
}

function removeFavorite(countryName) {
    favoriteCountries = favoriteCountries.filter(country => country !== countryName);
    updateFavoriteList();
}

function updateFavoriteList() {
    const favoriteList = document.getElementById('favoriteList');
    favoriteList.innerHTML = '';
    favoriteCountries.forEach(country => {
        const li = document.createElement('li');
        li.innerHTML = `${country} <span class="remove-btn" onclick="removeFavorite('${country}')">❌</span>`;
        favoriteList.appendChild(li);
    });
}

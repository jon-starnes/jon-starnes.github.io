class CheckPointInPolygon {
    checkPointInPolygon(x, y, cornersX, cornersY) {
        let i, j = cornersX.length - 1;
        let oddNodes = false;

        for (i = 0; i < cornersX.length; i++) {
            if (((cornersY[i] < y && cornersY[j] >= y) || (cornersY[j] < y && cornersY[i] >= y)) &&
                (cornersX[i] <= x || cornersX[j] <= x)) {
                if (cornersX[i] + (y - cornersY[i]) / (cornersY[j] - cornersY[i]) * (cornersX[j] - cornersX[i]) < x) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    }

    isPointInsidePolygon(x, y, geoJsonData) {
        let isInside = false;
        if (geoJsonData && geoJsonData.features) {
            geoJsonData.features.forEach(feature => {
                const geoData = feature.geometry;

                if (geoData.type === "Polygon") {
                    const coordinates = geoData.coordinates[0];
                    const cornersX = coordinates.map(coord => coord[0]);
                    const cornersY = coordinates.map(coord => coord[1]);

                    if (this.checkPointInPolygon(x, y, cornersX, cornersY)) {
                        isInside = true;
                    }
                }
            });
        }
        return isInside;
    }
}

// Function to fetch the GeoJSON data from USGS
async function fetchGeoJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        console.log('Fetched GeoJSON:', data);
        return data;
    } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
        return null;
    }
}


// Function to handle the user input and check if the point is inside any earthquake zone
async function checkUserPoint() {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

    const longitude = parseFloat(document.getElementById('longitude').value.trim());
    const latitude = parseFloat(document.getElementById('latitude').value.trim());
    /* const longitude = parseFloat(document.getElementById('longitude').value);
    const latitude = parseFloat(document.getElementById('latitude').value); */
    const outputElement = document.getElementById('output');

    if (isNaN(longitude) || isNaN(latitude)) {
        outputElement.textContent = 'Please enter valid coordinates.';
        return;
    }

    try {
        const geoJsonData = await fetchGeoJSON(url);
        if (!geoJsonData) {
            outputElement.textContent = 'Failed to fetch GeoJSON data.';
            return;
        }

        const checker = new CheckPointInPolygon();
        const isInside = checker.isPointInsidePolygon(longitude, latitude, geoJsonData);

        outputElement.textContent = `Point (${longitude}, ${latitude}) is inside a polygon: ${isInside}`;
    } catch (error) {
        console.error('Error checking point:', error);
        outputElement.textContent = 'An error occurred while checking the point.';
    }
}



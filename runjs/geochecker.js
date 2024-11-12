// Define your CheckPointInPolygon class
class CheckPointInPolygon {
    // Check if a point is inside the polygon using ray-casting algorithm
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

// Function to fetch GeoJSON data and test the point-in-polygon check
async function testPointInsidePolygon() {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
    const outputElement = document.getElementById('output');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching data: ${response.status}`);
        const geoJsonData = await response.json();

        const checker = new CheckPointInPolygon();
        const testX = -121.5; // Example longitude
        const testY = 37.75;  // Example latitude

        const isInside = checker.isPointInsidePolygon(testX, testY, geoJsonData);
        outputElement.textContent = `Point (${testX}, ${testY}) is inside polygon: ${isInside}`;
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
    }
}

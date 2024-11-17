class CheckPointInPolygon {
    // Main raycasting algorithm required by isPointInsidePolygon
    checkPointInPolygon(x, y, cornersX, cornersY) {
        let i, j = cornersX.length - 1;
        let oddNodes = false;
        const epsilon = 1e-10; // Small value to account for floating-point errors

        for (i = 0; i < cornersX.length; i++) {
            if (Math.abs(cornersX[i] - x) < epsilon && Math.abs(cornersY[i] - y) < epsilon) {
                return true;
            }
            if (((cornersY[i] + epsilon < y && cornersY[j] + epsilon >= y) || (cornersY[j] + epsilon < y && cornersY[i] + epsilon >= y))) {
                const intersectionX = cornersX[i] + ((y - cornersY[i]) * (cornersX[j] - cornersX[i])) / (cornersY[j] - cornersY[i]);
                if (Math.abs(intersectionX - x) < epsilon) {
                    return true;
                }
                if (intersectionX < x - epsilon) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    }

    isPointInsidePolygon(x, y, geoObjects) {
        let isInside = false;

        if (geoObjects && typeof geoObjects.all === 'function') {
            geoObjects.all().forEach(obj => {
                const geoData = obj.geometry;

                if (geoData.type === "MultiPolygon") {
                    const geoJsonString = JSON.stringify(geoData);
                    const parsedPolygons = this.parseMultiPolygon(geoJsonString);

                    parsedPolygons.forEach(polygon => {
                        const cornersX = polygon.map(coord => coord.x);
                        const cornersY = polygon.map(coord => coord.y);
                        if (this.checkPointInPolygon(x, y, cornersX, cornersY)) {
                            isInside = true;
                        }
                    });
                } else if (geoData.type === "Polygon") {
                    const polygon = this.parsePolygon(JSON.stringify(obj.geometry));
                    const cornersX = polygon.map(coord => coord.x);
                    const cornersY = polygon.map(coord => coord.y);
                    if (this.checkPointInPolygon(x, y, cornersX, cornersY)) {
                        isInside = true;
                    }
                }
            });
        }
        return isInside;
    }
}

//////////

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


////////////////////  USGS Data parser ////////////////////

class USGSDataParser {
    parseUSGSPoints(usgsData, radius = 0.1) {
        const polygonCollection = {
            all: function() {
                return this.features;
            },
            features: []
        };

        if (usgsData && usgsData.features) {
            usgsData.features.forEach(feature => {
                if (feature.geometry && feature.geometry.type === "Point") {
                    const point = feature.geometry.coordinates;
                    const polygonFeature = this.createPolygonFeature(point[0], point[1], radius, feature.properties);
                    polygonCollection.features.push(polygonFeature);
                }
            });
        }

        return polygonCollection;
    }

    createPolygonFeature(centerX, centerY, radius, properties) {
        const points = 32;
        const coordinates = [];

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            coordinates.push([x, y]);
        }
        coordinates.push(coordinates[0]);

        return {
            geometry: {
                type: "Polygon",
                coordinates: [coordinates]
            },
            properties: properties
        };
    }
}


// Updated checkUserPoint function
async function checkUserPoint() {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
    const longitude = parseFloat(document.getElementById('longitude').value.trim());
    const latitude = parseFloat(document.getElementById('latitude').value.trim());
    const outputElement = document.getElementById('output');

    if (isNaN(longitude) || isNaN(latitude)) {
        outputElement.textContent = 'Please enter valid coordinates.';
        return;
    }

    try {
        const usgsData = await fetchGeoJSON(url);
        if (!usgsData) {
            outputElement.textContent = 'Failed to fetch GeoJSON data.';
            return;
        }

        const parser = new USGSDataParser();
        const polygonData = parser.parseUSGSPoints(usgsData);

        const checker = new CheckPointInPolygon();
        const isInside = checker.isPointInsidePolygon(longitude, latitude, polygonData);

        if (isInside) {
            outputElement.textContent = `Point (${longitude}, ${latitude}) is inside an earthquake zone.`;
        } else {
            outputElement.textContent = `Point (${longitude}, ${latitude}) is not near any recent earthquakes.`;
        }
    } catch (error) {
        console.error('Error checking point:', error);
        outputElement.textContent = 'An error occurred while checking the point.';
    }
}

///////////////////////////////////////////////////////////////////////////////




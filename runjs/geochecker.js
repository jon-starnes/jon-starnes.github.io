class CheckPointInPolygon {
    // Main raycasting algorithm required by isPointInsidePolygon
    checkPointInPolygon(x, y, cornersX, cornersY) {
        let i, j = cornersX.length - 1;
        let oddNodes: boolean = false;
        const epsilon = 1e-10; // Small value to account for floating-point errors

        for (i = 0; i < cornersX.length; i++) {
            // Check if the point lies exactly on a vertex
            if (Math.abs(cornersX[i] - x) < epsilon && Math.abs(cornersY[i] - y) < epsilon) {
                return true; // Point is exactly on a vertex
            }
            // Adjusted condition to include points on the edge
            if (((cornersY[i] + epsilon < y && cornersY[j] + epsilon >= y) || (cornersY[j] + epsilon < y && cornersY[i] + epsilon >= y))) {
                const intersectionX = cornersX[i] + ((y - cornersY[i]) * (cornersX[j] - cornersX[i])) / (cornersY[j] - cornersY[i]);
                if (Math.abs(intersectionX - x) < epsilon) {
                    return true; // Point is exactly on the edge
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
        let trueFalse: boolean = false;

        // Check if geoObjects and its all method are defined
        if (geoObjects && typeof geoObjects.all === 'function') {
            const geoShapes = geoObjects;

            // Iterate over all geoShapes in the set
            geoObjects.all().forEach(obj => {
                // Access the geometry property
                const geoData: GeoShape | any = obj.geometry;

                if (geoData.type === "MultiPolygon") {
                    // Create the GeoJSON string from the geometry property
                    const geoJsonString = JSON.stringify(geoData);
                    // Parse the MultiPolygon geometry
                    const parsedPolygons = this.parseMultiPolygon(geoJsonString);

                    // Check if the point is inside any of the parsed polygons
                    parsedPolygons.forEach(polygon => {
                        const cornersX = polygon.map(coord => coord.x);
                        const cornersY = polygon.map(coord => coord.y);

                        if (this.checkPointInPolygon(x, y, cornersX, cornersY) === true) {
                            trueFalse = true;
                        }
                    });
                } else if (geoData.type === "Polygon") {
                    // If the geometry is a Polygon, use the parsePolygon function
                    const polygon = this.parsePolygon(JSON.stringify(obj.geometry));
                    const cornersX = polygon.map(coord => coord.x);
                    const cornersY = polygon.map(coord => coord.y);

                    if (this.checkPointInPolygon(x, y, cornersX, cornersY) === true) {
                        trueFalse = true;
                    }
                }
            });
        }
        return trueFalse;
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


////////////////////  USGS Data parser ////////////////////

class USGSDataParser {
    // Parse USGS GeoJSON data into polygon format
    parseUSGSPoints(usgsData, radius = 0.1) { // radius in degrees for creating polygons around points
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
                    // Create a polygon object around each earthquake point
                    const polygonFeature = this.createPolygonFeature(
                        point[0], // longitude
                        point[1], // latitude
                        radius,
                        feature.properties
                    );
                    polygonCollection.features.push(polygonFeature);
                }
            });
        }

        return polygonCollection;
    }

    // Create a polygon feature around a point
    createPolygonFeature(centerX, centerY, radius, properties) {
        const points = 32; // number of points to create circular polygon
        const coordinates = [];

        // Create circular polygon points
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            coordinates.push([x, y]);
        }
        // Close the polygon by repeating the first point
        coordinates.push(coordinates[0]);

        return {
            geometry: {
                type: "Polygon",
                coordinates: [coordinates]
            },
            properties: properties // original USGS feature properties
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
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        const parser = new USGSDataParser();
        const polygonData = parser.parseUSGSPoints(data);
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




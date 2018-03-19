'use strict';

require('module');

module.exports = {
    fetch: fetchXml(),
    distance: getDistance()
}

fetchXml(33.8124434, -84.436457, 100);

function fetchXml(lat1, lon1, maxDistance) { //Fetches the XML path coordinate 
    //file.
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            returnMatch(this, lat1, lon1, maxDistance);
        }
    };
    xmlhttp.open("GET", "bike-paths.xml", true);
    xmlhttp.send();
}

function returnMatch(xml, lat1, lon1, maxDistance) { //Parses the XML, finds 
    //distance from point searched and nearest path, filters by path type
    //and nearest distance if user specifies, and returns the match(es).
    let xmlDoc = xml.responseXML;
    let lineString = xmlDoc.getElementsByTagName("LineString");//The parent
    //element of the "coordinates" element containing the path.
    let coordinateString;//Add each path to a string
    for (let i = 0; i < lineString.length; i++) {
        if (i == 0) {
            coordinateString = lineString[i].childNodes[3].innerHTML;
        }
        else {
            coordinateString += lineString[i].childNodes[3].innerHTML;
        }
    }
    let normalizedString = coordinateString.replace(/,0/g, ",");//Finding and
    //replacing ",0"
    let coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();//Trim whitespace
            s = parseFloat(s);//Convert to float
            return s;
        });
    let distanceArray = [];//This array holds all distances from the point
    //to all points along the paths.
    for (let i = 0, j = 0; i < (coordinateArray.length - 2); i += 2, j++) {
        distanceArray[j] = getDistance(lat1, lon1, coordinateArray[i+1], 
            coordinateArray[i]);
        //Since Google Maps exports KML with longitude first on each pair,
        //the coordinate array is accessed "backwards".
    }
    let minDistance = Math.min.apply(Math, distanceArray);//Smallest distance.
    let minDistanceIndex = distanceArray.indexOf(Math.min.apply(Math, 
        distanceArray));//Index of smallest distance.
    let matchObject = {};
    if (minDistance > maxDistance) { 
        matchObject.noMatches;//Property will be checked for truthiness.
    }
    else if (minDistance < maxDistance) {
        matchObject.closest = minDistance;
        matchObject.lat = coordinateArray[minDistanceIndex + 1];
        matchObject.lon = coordinateArray[minDistanceIndex];
    }
    else {
        matchObject.err;//Property will be checked for truthiness.
    }
    return matchObject;
}

function getDistance(lat1, lon1, lat2, lon2) {//Uses Haversine function to
    //return distance from point specified from each point on specified path
    Number.prototype.toRad = function () {
    return this * Math.PI / 180;
    }
    const R = 6371; //Radius of earth in km
    let x1 = lat2-lat1;
    let dLat = x1.toRad();  
    let x2 = lon2-lon1;
    let dLon = x2.toRad();  
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);  
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let distance = R * c; 
    return distance; //Distance between points(km)
    }

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
    }
/*
-if there is no destination specified, the directions end at the nearest path
-if there is a destination, the directions stick strictly to the paths
    -if there is a break, find path within maxDistance
    -use djikstra's algorithm to find shortest path between nodes
        -find the index of nodes on coordinate array
    -plot path on map
    -23 waypoints is okay
    -If there is a break, navigate to the end, the alert the user to use 
        walking directions to the next path
-for each path, search along all paths to find the pairs of coordinates are true for intersection
    -convert all cooridnates to x,y through NCAT
        -parse through xml to format to multipoint
        -search through each pair of lines? sounds inefficient. It'd take a long time
            -would need to keep lines separate
            -unique IDs
            -
        -search is performed by Java Line2D
        -intersections are given to intersection finder function
        -each intersection is given back to NCAT to convert to lat/lon
        
*/

/* ARRAY MATCH SEARCH 
(function () {
    for (let i = 0; i < (coordinateArray.length - 2); i += 2)  {
        if (
            (coordinateArray.indexOf(coordinateArray[i], i+1)) != -1 &&
            (coordinateArray.indexOf(coordinateArray[i+1], i+2)) != -1
           ) {
            console.log(coordinateArray[i] + ", " +
                        coordinateArray[i+1] + " and, " +
                        coordinateArray[coordinateArray.indexOf(coordinateArray[i], i+1)] + ", " + coordinateArray[coordinateArray.indexOf(coordinateArray[i+1], i+2)] + 
                        " first pair: " + coordinateArray.indexOf(coordinateArray[i]) + ", " + coordinateArray.indexOf(coordinateArray[i+1]) + " second pair: " +
                        coordinateArray.indexOf(coordinateArray[i], i+1) + ", " + coordinateArray.indexOf(coordinateArray[i+1], i+2));
        }
     }
    })();
    
    (function () {
        for (let i = 0; i < (coordinateArray.length - 2); i += 2) {
            console.log(getDistance(coordinateArray[i+1], coordinateArray[i],
                                    coordinateArray[i+3], coordinateArray[i+2]));
        }
    })();
    
*/










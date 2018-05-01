'use strict';

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
                                                 distanceArray));//Index of 
                                                 //smallest distance.
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



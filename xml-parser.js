'use strict';
console.time("fetchXml");
fetchXml(33.8124434, -84.43645699999999, 100);
console.timeEnd("fetchXml");

function fetchXml(lat1, lon1, maxDistance) { //Fetches the XML path coordinate file.
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
    let lineString = xmlDoc.getElementsByTagName("LineString");
    let coordinateString;
    for (let i = 0 ; i < lineString.length; i++) {
        if (i == 0) {
            coordinateString = lineString[i].childNodes[3].innerHTML;
        }
        else {
            coordinateString += lineString[i].childNodes[3].innerHTML;
        }
    }
    let normalizedString = coordinateString.replace(/,0/g, ",");//Finding and replacing ",0"
    let coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();//Trim whitespace
            s = parseFloat(s);//Convert to float
            return s;
        });
    let distanceArray = [];
    for (let i = 0, j = 0; i < (coordinateArray.length - 2); i += 2, j++) {
        distanceArray[j] = getDistance(lat1, lon1, coordinateArray[i+1], coordinateArray[i]);
        
    }
    let minDistance = Math.min.apply(Math, distanceArray);
    let minDistanceIndex = distanceArray.indexOf(Math.min.apply(Math, distanceArray));
    let matchObject = {};
    if (minDistance > maxDistance) { 
        matchObject.noMatches;
    }
    else if (minDistance < maxDistance) {
        /*console.log("closest distance is " + minDistance.toFixed(4) + 
            "km at coordinates " + coordinateArray[minDistanceIndex + 1] + 
            ", " + coordinateArray[minDistanceIndex]);*/
        matchObject.closest = minDistance;
        matchObject.lat = coordinateArray[minDistanceIndex + 1];
        matchObject.lon = coordinateArray[minDistanceIndex];
    }
    else {
        matchObject.err = true;
    }
    return matchObject;
}

function getDistance(lat1, lon1, lat2, lon2) {//Uses distance function to return distance from point
    //specified from each point on specified path
    
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
let closestLat;
    let closestLon;
    let closestMaxDistance;
    //____ Coordinate Array ____
    let xmlDoc = xml.responseXML;
    let coordinateArray = [];
    let coordinateObject = xmlDoc.getElementsByTagName("coordinates");
    for (let i = 0; i < coordinateObject.length; i++) {
        let coordinateString = xmlDoc.getElementsByTagName("coordinates")[i]
            .childNodes[0].nodeValue; //This returns a string of the coordinates on the path.
        let normalizedString = coordinateString.replace(/,0/g, ",");//Finding and replacing ",0"
        coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();//Trim whitespace
            s = parseFloat(s);//Convert to float
            coordinateArray[i] += s;
        });
        console.log(coordinateArray);
        for(let i = 0; i < coordinateArray.length; i+=3){
            let currentDistance = getDistance(lat1, lon1, parseFloat(coordinateArray[i]), parseFloat(coordinateArray[i+1])); 
            console.log(parseFloat(coordinateArray[i]) + " " + parseFloat(coordinateArray[i+1]));
            console.log("Current Distance: " + currentDistance);
            if(i == 0 || currentDistance < closestMaxDistance) {
                closestLat = coordinateArray[i];
                closestLon = coordinateArray[i+1];
                closestMaxDistance = currentDistance;
                console.log("Found Closer Distance: " + closestMaxDistance);
            }
        }

    }
    console.log("passed - full array: " + typeof(coordinateArray));*/




/*
{ 
-function is given the coordinate array
-use .map to create an array of the difference between each set of points
-use math.min to find smallest difference, corresponding array index is the index of closest match.
-use this function as the callback of the haversine function,
}

*/










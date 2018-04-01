'use strict';

//let fs = require("fs");

fetchXml();

function fetchXml() { //Fetches the XML path coordinate 
    //file.
    let self = this;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            discretePaths(this);
        }
    };
    xmlhttp.open("GET", "bike-paths.xml", true);
    xmlhttp.send();
}

function discretePaths(xml) { //Parses the XML, returns an array of arrays 
    //containing path coordinates
    //EACH ARRAY COULD HAVE ROAD NAME ASSOCIATED
        //directions computed from here, google API only used for walking 
        //directions and travel times
    let xmlDoc = xml.responseXML;
    let lineString = xmlDoc.getElementsByTagName("LineString");//The parent
    //element of the "coordinates" element containing the path.
    let pathsArray = [];
    for (let i = 0; i < lineString.length; i++) {
        let coordinateString;//Add each path to a string
        coordinateString = lineString[i].childNodes[3].innerHTML;
        let normalizedString = coordinateString.replace(/,0/g, ",");//Finding 
        //and replacing ",0"
        let coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();//Trim whitespace
            s = parseFloat(s);//Convert to float
            return s;
            });
        coordinateArray.pop(); //Removing "NaN"
        pathsArray[i] = coordinateArray;
    }
    console.log(pathsArray);
    let matchesArray = [], noDuplicateArray = []; //Array that will hold matches
    let lastIntersection; //Last match
    for (let i = 0; i < pathsArray.length; i++) {
        let path = pathsArray[i];
        
        for (let j = 0; j < path.length; j+=2) {
            let p1 = new Object(), p2 = new Object();
            p1.lat = path[j+1];
            p1.lon = path[j];
            p2.lat = path[j+3];
            p2.lon = path[j+2];
            
//            console.log(i + " " + j + " " + path[j+1] + " " + path[j]);
            for (let k = 0; k < pathsArray.length; k++) {
                let path2 = pathsArray[k];
                if (k == i) {
                    continue;
                }
                
                else {
                    for (let l = 0; l < path2.length; l+=2) {
                        let p3 = new Object(), p4 = new Object();
                        p3.lat = path2[l+1];
                        p3.lon = path2[l];
                        p4.lat = path2[l+3];
                        p4.lon = path2[l+2];
                        //console.log(path[j+1] + " " + path[j] + " " + path[j+3] + " " + path[j+2]
                                   // + " " + path2[l+1] + " " + path2[l] + " " + path2[l+3] + " " + path2[l+2] );
//                        console.log(i + " " + j + " " + k + " " + l);
                        if(isIntersect(p1, p2, p3, p4) === true) {
                            let newIntersection = findIntersect(p1, p2, p3, p4);
                            if (typeof lastIntersection === 'undefined') { 
                                lastIntersection = newIntersection;
                                continue;
                            }
                            else if ((getDistance(
                                                    lastIntersection.lat, 
                                                    lastIntersection.lon,
                                                    newIntersection.lat,
                                                    newIntersection.lon))
                               > .1) {
                                lastIntersection = newIntersection;
                                matchesArray.push(lastIntersection.lat);
                                matchesArray.push(lastIntersection.lon);
                            }
                        }
                    }
                }
            }
        }
    }
    noDuplicateArray = Array.from(new Set(matchesArray)); //Set removes duplicates from array
    console.log(noDuplicateArray);
}

function writeJson(arr) {
    let intersectionObject = {};
    for (let i = 0; i < arr.length; i+=2) {
        
    }
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

function Turn(p1, p2, p3) {
    let a = p1.lon; 
    let b = p1.lat; 
    let c = p2.lon;
    let d = p2.lat;
    let e = p3.lon;
    let f = p3.lat;
    let A = (f - b) * (c - a);
    let B = (d - b) * (e - a);
    return (A > B + Number.EPSILON) ? 1 : (A + Number.EPSILON < B) ? -1 : 0;
}

function isIntersect(p1, p2, p3, p4) {
    return (Turn(p1, p3, p4) != Turn(p2, p3, p4)) && (Turn(p1, p2, p3) != Turn(p1, p2, p4));
}

function findIntersect(p1, p2, p3, p4) {
    var XAsum = p1.lon - p2.lon;
    var XBsum = p3.lon - p4.lon;
    var YAsum = p1.lat - p2.lat;
    var YBsum = p3.lat - p4.lat;

    var LineDenominator = XAsum * YBsum - YAsum * XBsum;
    if(LineDenominator == 0.0) {
        return false;
    }

    var a = p1.lon * p2.lat - p1.lat * p2.lon;
    var b = p3.lon * p4.lat - p3.lat * p4.lon;

    var x = (a * XBsum - b * XAsum) / LineDenominator;
    var y = (a * YBsum - b * YAsum) / LineDenominator;
    let intersection = new Object();
    intersection.lat = y, intersection.lon = x;
    return intersection;
}

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

/*for(let i = 0; i < matchesArray.length; i++) {
    let duplicateBool = (function () {
        for(let j = 0; j < matchesArray.length; j++) {
//                            console.log(i + " " + j);
            if (i == j) { j++; }
            if(matchesArray[i].lat == matchesArray[j].lat && matchesArray[i]
            .lon == matchesArray[j].lon) {
                return true;
            }
        }
    })();
//        console.log(duplicateBool);
//        console.log(previousDuplicates[previousDuplicates.indexOf(matchesArray[i])].lat);
    if(duplicateBool != true) {
        noDuplicateArray.push(matchesArray[i]);
    }
    else if(duplicateBool == true) {
        noDuplicateArray.push(matchesArray[i]);
        previousDuplicates.push(matchesArray[i]);
    }
    else if(duplicateBool == true && typeof previousDuplicates[0] != 'undefined' &&  matchesArray[i].lat == 
            previousDuplicates[previousDuplicates.indexOf(matchesArray[i])].lat &&
            matchesArray[i].lon == previousDuplicates[previousDuplicates.indexOf(matchesArray[i])].lon) {
        console.log("match");
        continue;
    }

console.log(noDuplicateArray);
}*/
/*

*/
'use strict';

//let fs = require("fs");

fetchXml();

function fetchXml() { //Fetches the XML path coordinate 
    //file.
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
    let xmlDoc = xml.responseXML;
    let lineString = xmlDoc.getElementsByTagName("LineString");//The parent
    //element of the "coordinates" element containing the path.
    let pathsArray = [];
    let pathTypeParent = xmlDoc.getElementsByTagName("Document");
    let pathType = pathTypeParent[0].childNodes[1].innerHTML;
    for (let i = 0; i < lineString.length; i++) {
        let coordinateString;//Add each path to a string
        coordinateString = lineString[i].childNodes[3].innerHTML;
        let normalizedString = coordinateString.replace(/,0/g, ",");//Replacing ",0"
        let coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();
            s = parseFloat(s);
            return s;
            });
        coordinateArray[0] = pathType;
        coordinateArray.pop(); //Removing "NaN"
        pathsArray[i] = coordinateArray;
    }
    console.log(pathsArray);
    let intersectionsArray = pathsArray.findIntersections()/*.filterDuplicates().removeExtraStrings().filterDuplicates();*/
    console.log(intersectionsArray);
//    let test = ["q",5,5,"q","q","q","q","rr",5,5,"q",5,5,"q","q",5,5,"q"];
//    let test2 = test.removeExtraStrings();
//    console.log(test2);
//    console.log(test == test2);
}

Array.prototype.removeExtraStrings = function() {
    let self = this;
    for (let i = 0; i < self.length;) {
        if(typeof self[self.length - 1] === 'string') {
            self[self.length - 1] = undefined;
        }
        if(typeof self[i+1] !== 'number' && typeof self[i+1] === 'string') {
            let start = i, end = i;
            while(typeof self[end] === 'string') {
                end++;
            }
            while(start < (end - 1)) {
                self[start] = undefined;
                start++;
            }
            i = (end - 1);
            continue;
        }
        i += 3;
    }
    return self;
}


Array.prototype.filterDuplicates = function() {
    let self = this, returnArray;
    returnArray = Array.from(new Set(self))
    return returnArray;
}

Array.prototype.findIntersections = function() {//DEATH BY FOR LOOPS
    let matchesArray = [], lastIntersection; //Last match
    for (let i = 0; i < this.length; i++) {
        let path = this[i];
        
        for (let j = 1; j < path.length; j+=2) {
            let p1 = new Object(), p2 = new Object();
            p1.lat = path[j+1];
            p1.lon = path[j];
            p2.lat = path[j+3];
            p2.lon = path[j+2];
            
            for (let k = 0; k < this.length; k++) {
                let path2 = this[k];
                
                if (k == i) {
                    continue;
                }
                else {
                    for (let l = 1; l < path2.length; l+=2) {
                        let p3 = new Object(), p4 = new Object();
                        p3.lat = path2[l+1];
                        p3.lon = path2[l];
                        p4.lat = path2[l+3];
                        p4.lon = path2[l+2];
                        
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
                                matchesArray.push(path[0] + i + path2[0] + k);
                                matchesArray.push(lastIntersection.lat, lastIntersection.lon);
                            }
                        }
                    }//fourth
                }
            }//third
        }//second
    } //first 
    return matchesArray;
}

//function writeJson(arr) {
//    let intersectionObject = {};
//    for (let i = 0; i < arr.length; i+=2) {
//        
//    }
//}

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
    let XAsum = p1.lon - p2.lon;
    let XBsum = p3.lon - p4.lon;
    let YAsum = p1.lat - p2.lat;
    let YBsum = p3.lat - p4.lat;

    let LineDenominator = XAsum * YBsum - YAsum * XBsum;
    if(LineDenominator == 0.0) {
        return false;
    }

    let a = p1.lon * p2.lat - p1.lat * p2.lon;
    let b = p3.lon * p4.lat - p3.lat * p4.lon;

    let x = (a * XBsum - b * XAsum) / LineDenominator;
    let y = (a * YBsum - b * YAsum) / LineDenominator;
    let intersection = new Object();
    intersection.lat = y, intersection.lon = x;
    return intersection;
}

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

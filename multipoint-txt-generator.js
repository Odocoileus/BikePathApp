
'use strict';

//let fs = require("fs");

fetchXml();

function fetchXml() { //Fetches the XML path coordinate file.
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            main(this);
        }
    };
    xmlhttp.open("GET", "moreintersections.xml", true);
    xmlhttp.send();
}

function main(xml) {
    console.log(discretePaths(xml));
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
        coordinateArray.unshift(pathType);
        coordinateArray.pop(); //Removing "NaN"
        pathsArray[i] = coordinateArray;
    }
//    console.log(pathsArray);
    let intersectionsArray = pathsArray.findIntersections().filterDuplicates().nodes(pathsArray);
    return intersectionsArray;
}

function sumDistance(object1, object2, path) {
    let sum, 
        intersection1 = object1.intersection,
        intersection2 = object2.intersection,
        intersectionDistance = getDistance(intersection1.lat, intersection1.lon,
                                           intersection2.lat, intersection2.lon),
        intersectionToFirstIndex,
        intersectionToLastIndex,
        startIndex,
        endIndex,
        matchi,
        matchj;
    for(let i = 1; i < path.length; i+=2) {//getting a point between the two intersections
//        debugger;
        if(getDistance(path[i+1], path[i], intersection1.lat, intersection1.lon) < intersectionDistance &&
           getDistance(path[i+1], path[i], intersection2.lat, intersection2.lon) < intersectionDistance &&
          matchi === undefined) { 
            matchi = new Object();
            matchi.lat = path[i+1];
            matchi.lon = path[i];
            matchi.matchIndex = i;
        }
    }
    for(let j = (path.length - 1); j > 0; j-=2) {
//        debugger;
        if(getDistance(path[j], path[j-1], intersection1.lat, intersection1.lon) < intersectionDistance &&
           getDistance(path[j], path[j-1], intersection2.lat, intersection2.lon) < intersectionDistance &&
          matchj === undefined) {
            matchj = new Object();
            matchj.lat = path[j];
            matchj.lon = path[j-1];
            matchj.matchIndex = j;

        }
    }
    let combo1 = getDistance(matchi.lat, matchi.lon, intersection1.lat, intersection1.lon),
        combo2 = getDistance(matchi.lat, matchi.lon, intersection2.lat, intersection2.lon),
        combo3 = getDistance(matchj.lat, matchj.lon, intersection1.lat, intersection1.lon),
        combo4 = getDistance(matchj.lat, matchj.lon, intersection2.lat, intersection2.lon);
    if(combo1 < combo2) { //Finding the distance from each intersection to the path 
        //index it it is closest to
        intersectionToFirstIndex = combo1;
    }
    if(combo2 < combo1) {
        intersectionToFirstIndex = combo2;
    }
    if(combo3 < combo4) {
        intersectionToLastIndex = combo3;
    }
    if(combo4 < combo3) {
        intersectionToLastIndex = combo4;
    }
    
    sum = (intersectionToFirstIndex + intersectionToLastIndex);
//    debugger;
    for(let k = matchi.matchIndex; k < matchj.matchIndex; k+=2) {
//        debugger;
        let add = getDistance(path[k+1], path[k], path[k+3], path[k+2]);
        sum += add;
    }
    
    return sum;
}

Array.prototype.nodes = function(paths) {
    let self = this;
    
    for(let i = 0; i < paths.length; i++) { //increment for paths
        for(let j = 0; j < self.length; j++) {//increment for searching objects
//            debugger;
            let searchPath,
                searchIndex,
                matchPath,
                matchIndex, 
                ownSearchIndex,
                ownMatchIndex,
                negativeBest = Infinity,
                positiveBest = Infinity,
                ownNegativeBest = Infinity,
                ownPositiveBest = Infinity,
                negativeDistance,
                positiveDistance,
                ownNegativeDistance,
                ownPositiveDistance,
                intersectObjectIndex1,
                intersectObjectIndex2,
                ownIntersectObjectIndex1,
                ownIntersectObjectIndex2;
            if(self[j].path1PathIndex === i ||
               self[j].path2PathIndex === i) {//if object contains path being
                //searched
//                debugger;
                if(self[j].path1PathIndex === i) { ownSearchIndex = self[j].path1CoordIndex; }
                if(self[j].path2PathIndex === i) { ownSearchIndex = self[j].path2CoordIndex }
                
                for(let g = 0; g < self.length; g++) { //finding closest intersections on own path
//                    debugger;
                    if(self[g].path1PathIndex === i) { ownMatchIndex = self[g].path1CoordIndex; }
                    if(self[g].path2PathIndex === i) { ownMatchIndex = self[g].path2CoordIndex; }
                    
//                    if(self[g].path1PathIndex === i) {
//                        ownSearchIndex = self[g].path1CoordIndex;
//                    }
//                    if(self[g].path2PathIndex === i) {
//                        ownSearchIndex = self[g].path2CoordIndex;
//                    }
                    let difference = (ownSearchIndex - ownMatchIndex);
                    if((difference < 0) && (Math.abs(difference) < Math.abs(ownNegativeBest))) { 
                        ownNegativeBest = difference;
                        ownIntersectObjectIndex1 = g;
//                            debugger;
                        ownNegativeDistance = sumDistance(self[j], self[g], paths[i]);
                    }
                    if((difference > 0) && (difference < ownPositiveBest)) {
                        ownPositiveBest = difference;
                        ownIntersectObjectIndex2 = g;
//                            debugger;
                        ownPositiveDistance =  sumDistance(self[j], self[g], paths[i]);
                    }  
                }
                
                if(self[j].path1PathIndex !== i) {//whichever is not the path being searched
                    searchPath = self[j].path1PathIndex;
                    searchIndex = self[j].path1CoordIndex;
                }
                if(self[j].path2PathIndex !== i) {
                    searchPath = self[j].path2PathIndex;
                    searchIndex = self[j].path2CoordIndex;
                }
                for(let k = 0; k < self.length; k++) {//finding closest on other path
//                    debugger;
                    if(self[k].path1PathIndex === searchPath || //finding objects with same path
                       self[k].path2PathIndex === searchPath) {
                        if(self[k].path1PathIndex === searchPath) { 
                            matchIndex = self[k].path1CoordIndex;
                            matchPath = self[k].path1PathIndex;
                        }
                        if(self[k].path2PathIndex === searchPath) {//whichever IS path being searched
                            matchIndex = self[k].path2CoordIndex;
                            matchPath = self[k].path2PathIndex;
                        }
//                        debugger;
                        let difference = (searchIndex - matchIndex);//difference in number of indices
                        if((difference < 0) && (Math.abs(difference) < Math.abs(negativeBest))) { 
                            negativeBest = difference;
                            intersectObjectIndex1 = k;
//                            debugger;
                            negativeDistance = sumDistance(self[j], self[k], paths[matchPath]);
                        }
                        if((difference > 0) && (difference < positiveBest)) {
                            positiveBest = difference;
                            intersectObjectIndex2 = k;
//                            debugger;
                            positiveDistance =  sumDistance(self[j], self[k], paths[matchPath]);
                        }
                    }
                }//three
                
                if(ownNegativeBest !== Infinity && ownPositiveBest !== Infinity) { //FOR OWN PATH
                    self[j].ownPointer1 = {
                        objIndex: ownIntersectObjectIndex1,
                        distance: ownNegativeDistance
                    }
                    self[j].ownPointer2 = {
                        objIndex: ownIntersectObjectIndex2,
                        distance: ownPositiveDistance
                    }
                }
                if(ownNegativeBest !== Infinity && self[j].ownPointer1) {
                    self[j].ownPointer1 = {
                        objIndex: ownIntersectObjectIndex1,
                        distance: ownNegativeDistance
                    }
                }
                if(ownPositiveBest !== Infinity && self[j].ownPointer1) {
                    self[j].ownPointer1 = {
                        objIndex: ownIntersectObjectIndex2,
                        distance: ownPositiveDistance
                    }
                }
                
                
                if(negativeBest !== Infinity && positiveBest !== Infinity) { //FOR OTHER PATH
                    self[j].pointer1 = {
                        objIndex: intersectObjectIndex1,
                        distance: negativeDistance
                    }
                    self[j].pointer2 = {
                        objIndex: intersectObjectIndex2,
                        distance: positiveDistance
                    }
                    
                }
                if(negativeBest !== Infinity && self[j].pointer1 === undefined) {
                    self[j].pointer1 = {
                        objIndex: intersectObjectIndex1,
                        distance: negativeDistance
                    }
                }
                if(positiveBest !== Infinity && self[j].pointer1 === undefined) {
                    self[j].pointer1 = {
                        objIndex: intersectObjectIndex2,
                        distance: positiveDistance
                    }
                }
            }
        }//two
    }//one
    console.log(self);
}

Array.prototype.filterDuplicates = function() {
    let self = this;
    
    for(let i = 0; i < self.length; i += 3) {
        let indexOfMatch = self.indexOf(self[i + 1], (i + 3));
        if (indexOfMatch !== -1 && self[i + 2] === self[indexOfMatch + 1]) {
            self.splice((indexOfMatch - 1), 3);
        }
    }
    for(let j = 1; j < self.length; j++) {
        self.splice(j, 2);
    }
    return self;
}

Array.prototype.findIntersections = function() {//DEATH BY FOR LOOPS
    let matchesArray = [], lastIntersection; //Last match
    let p1 = new Object(), p2 = new Object(),
        p3 = new Object(), p4 = new Object();
    for (let i = 0; i < this.length; i++) {
        let path = this[i];
        for (let j = 1; j < path.length; j += 2) {
            p1.lat = path[j+1];
            p1.lon = path[j];
            p2.lat = path[j+3];
            p2.lon = path[j+2];
            
            for (let k = 0; k < this.length; k++) {
                let path2 = this[k];
                
                if (k === i) {
                    continue;
                }
                else {
                    for (let l = 1; l < path2.length; l+=2) {
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
                                let matchObject = {
                                    path1Type: path[0],
                                    path1PathIndex: i,
                                    path1CoordIndex: j,
                                    path2Type: path2[0],
                                    path2PathIndex: k,
                                    path2CoordIndex: l,
                                    intersection: {
                                        lat: lastIntersection.lat,
                                        lon: lastIntersection.lon
                                    }
                                }
                                matchesArray.push(matchObject);
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


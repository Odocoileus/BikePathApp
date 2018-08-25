
'use strict';

const fs = require("fs");
const path = require("path");
const DOMParser = require('xmldom').DOMParser;


fetchXml();

function fetchXml() { //Fetches the XML path coordinate file.
    let string = fs.readFileSync(path.resolve("C:\Users\Ryan\Desktop\Sites\Bike App",
                                              "../../bike-paths.xml"), "utf8");
    main(string);
}

function main(xml) {
    writeJson(discretePaths(xml));
}

function discretePaths(xml) { //Parses the XML, returns an array of arrays 
    //containing path coordinates
    let xmlDoc = new DOMParser().parseFromString(xml);
    let lineString = xmlDoc.getElementsByTagName("LineString");//The parent
    //element of the "coordinates" element containing the path.
    let pathsArray = [];
    let pathTypeParent = xmlDoc.getElementsByTagName("Document");
    let pathType = pathTypeParent[0].childNodes[1].firstChild.data;
    for (let i = 0; i < lineString.length; i++) {
        let coordinateString;//Add each path to a string
        coordinateString = lineString[i].getElementsByTagName("coordinates")[0].firstChild.data;
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
    let intersectionsArray = findIntersections(pathsArray);
    intersectionsArray = filterDuplicates(intersectionsArray);
    intersectionsArray = nodes(pathsArray, intersectionsArray);
    groups(intersectionsArray);
    return intersectionsArray;
}

function closestGrouping(groupsArray) {
    //This function allows separated groups of nodes to be connected with
    //edges. If a user reaches a point where they must walk, this function
    //finds the nearest point by walking.
}

function groups(graph/*Graph given by nodes()*/) {
    debugger;
    let groups = [],
        visitedPaths = [];
    for(let i = 0; i < graph.length; i++) {
        let start = graph[i].objIndex,
            group = dijkstra(graph, start),
            visitedPathsToAdd = [];
        for(let j = 0; j < group.visited.length; j++) {
            visitedPathsToAdd.push(group.visited[j].path1PathIndex);
            if(group.visited[j].path2PathIndex !== undefined) {
                visitedPathsToAdd.push(group.visited[j].path2PathIndex);
            }
        }
        groups.push(group);
        visitedPaths.push(visitedPathsToAdd);
    }
    visitedPaths = visitedPaths.flat();
    visitedPaths = new Set(visitedPaths);//Removing duplicates
    visitedPaths = visitedPaths.toArray();//Converting back to array
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
    if(intersectionDistance < .1) {
//        debugger;
        return intersectionDistance;
    }
    for(let i = 1; i < path.length; i+=2) {//getting two points between the two intersections
//        debugger;
        let point1Distance = getDistance(path[i+1], path[i], intersection1.lat, intersection1.lon),
            point2Distance = getDistance(path[i+1], path[i], intersection2.lat, intersection2.lon);
//        debugger;
        if((point1Distance < intersectionDistance || point1Distance === 0) &&
           (point2Distance < intersectionDistance || point2Distance === 0) &&
           matchi === undefined) {
//            debugger;
            matchi = new Object();
            matchi.lat = path[i+1];
            matchi.lon = path[i];
            matchi.matchIndex = i;
        }
    }
    for(let j = (path.length - 1); j > 0; j-=2) {
//        debugger;
        let point1Distance = getDistance(path[j], path[j-1], intersection1.lat, intersection1.lon),
            point2Distance = getDistance(path[j], path[j-1], intersection2.lat, intersection2.lon);
//        debugger;
        if((point1Distance < intersectionDistance || point1Distance === 0) &&
           (point2Distance < intersectionDistance || point2Distance === 0) &&
           matchj === undefined) {
//            debugger;
            matchj = new Object();
            matchj.lat = path[j];
            matchj.lon = path[j-1];
            matchj.matchIndex = j;

        }
    }
    if(typeof(matchi) === 'undefined' || typeof(matchj) === 'undefined') {
        debugger;
    }
    if(typeof(intersection1.lat) === 'undefined' || typeof(intersection2.lat) === 'undefined') {
        debugger;
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

function nodes(paths, arr) {
    
    for(let i = 0; i < paths.length; i++) {
        let intersectionObjectArray = [];
        for(let j = 0; j < arr.length; j++) { //adding objects with same path
            if(arr[j].path1PathIndex === i ||
               arr[j].path2PathIndex === i) {
                let temporaryObject = arr[j]; //Is this necessary?
                temporaryObject.index = j;
                intersectionObjectArray.push(temporaryObject);
            }
        }
        
        let coordIndexA,
            coordIndexB;
        intersectionObjectArray.sort(function(a, b) { //sorting by coordinate index (least to greatest)
            if(a.path1PathIndex === i) { coordIndexA = a.path1CoordIndex; }
            if(a.path2PathIndex === i) { coordIndexA = a.path2CoordIndex; }
            if(b.path1PathIndex === i) { coordIndexB = b.path1CoordIndex; }
            if(b.path2PathIndex === i) { coordIndexB = b.path2CoordIndex; }
            
            if(coordIndexA < coordIndexB) { return -1; }
            if(coordIndexA > coordIndexB) { return 1; }
            return 0;
        });
        for(let k = 0; k < intersectionObjectArray.length; k++) {//Adding pointers for two closest neighbors
            let objectIndex = intersectionObjectArray[k].index;
            if(arr[objectIndex].pointer === undefined) {
                arr[objectIndex].pointer = [];
            }
//            debugger;
            if(intersectionObjectArray[k+1] !== undefined) {
                let pointer = {
                    objIndex: intersectionObjectArray[k+1].index,
                    distance: sumDistance(intersectionObjectArray[k], 
                                          intersectionObjectArray[k+1], 
                                          paths[i])
                };
                arr[objectIndex].pointer.push(pointer);
            }
            if(intersectionObjectArray[k-1] !== undefined) {
                let pointer = {
                    objIndex: intersectionObjectArray[k-1].index,
                    distance: sumDistance(intersectionObjectArray[k], 
                                          intersectionObjectArray[k-1], 
                                          paths[i])
                };
                arr[objectIndex].pointer.push(pointer);
            }
        }
    }
    return arr;
}

function filterDuplicates(arr) {
//    for(let i = 0; i < arr.length; i += 3) {
//        let indexOfMatch = arr.indexOf(arr[i + 1], (i + 3));
//        if (indexOfMatch !== -1 && arr[i + 2] === arr[indexOfMatch + 1]) {
//            arr.splice((indexOfMatch - 1), 3);
//        }
//    }
//    debugger;
    for(let i = 1; i < arr.length; i += 3) {
        for(let j = 1; j < arr.length; j += 3) {
            if(j !== i && getDistance(arr[i], arr[i+1], arr[j], arr[j+1]) < .001) {
//                debugger;
                arr.splice((j - 1), 3);
            }
        }
    }
    
    for(let j = 1; j < arr.length; j++) {
        arr.splice(j, 2);
    }
    console.log(arr);
    return arr;
}

function findIntersections(paths) {//DEATH BY FOR LOOPS
    let matchesArray = [], lastIntersection; //Last match
    let p1 = new Object(), p2 = new Object(),
        p3 = new Object(), p4 = new Object();
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i];
        for (let j = 1; j < path.length; j += 2) {
            p1.lat = path[j+1];
            p1.lon = path[j];
            p2.lat = path[j+3];
            p2.lon = path[j+2];
            
            for (let k = 0; k < paths.length; k++) {
                let path2 = paths[k];
                
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
                            else if ((getDistance(lastIntersection.lat, 
                                                    lastIntersection.lon,
                                                    newIntersection.lat,
                                                    newIntersection.lon))
                                     //Don't add intersections that may be the same.
                               > .1) {
//                                debugger;
                                lastIntersection = newIntersection;
                                let intersection1 = parseFloat(lastIntersection.lat.toFixed(5));
                                let intersection2 = parseFloat(lastIntersection.lon.toFixed(5));
                                let matchObject = {
                                    path1Type: path[0],
                                    path1PathIndex: i,
                                    path1CoordIndex: j,
                                    path2Type: path2[0],
                                    path2PathIndex: k,
                                    path2CoordIndex: l,
                                    intersection: {
                                        lat: intersection1,
                                        lon: intersection2
                                    }
                                }
//                                debugger;
                                matchesArray.push(matchObject);
                                matchesArray.push(lastIntersection.lat, lastIntersection.lon);
                            }
                        }
                    }//fourth
                }
            }//third
        }//second
    } //first 
    for(let i = 0; i < paths.length; i++) { //Adding nodes to the beginning and end of the paths
        let path = paths[i],
            endIndex = (path.length - 1),
            start = {
                path1Type: path[0],
                path1PathIndex: i,
                path1CoordIndex: 1,
                intersection: { //This is not a real intersection, but it is used as one later.
                    lat: path[2],
                    lon: path[1]
                }
            },
            end = {
                path1Type: path[0],
                path1PathIndex: i,
                path1CoordIndex: (endIndex - 1), //Lat-long is indexed backwards
                intersection: { //This is not a real intersection, but it is used as one later.
                    lat: path[endIndex],
                    lon: path[endIndex-1]
                }
            }
        matchesArray.push(start);
        matchesArray.push(path[2], path[1]); //This is strictly to preserve the order of the 
        //array so that the duplicate filtering function works. There will not be duplicates
        //of these nodes, however.
        matchesArray.push(end);
        matchesArray.push(path[endIndex], path[endIndex-1]);
    }
    return matchesArray;
}

function writeJson(arr) {
    let jsonString = JSON.stringify(arr, null, 2);
    fs.writeFileSync('graph.json', jsonString);
}

function getDistance(lat1, lon1, lat2, lon2) {//Uses Haversine function to
    //return distance from point specified from each point on specified path
    Number.prototype.toRad = function () {
    return this * Math.PI / 180;
    }
    if(typeof(lat1) === 'undefined' || typeof(lat2) === 'undefined' ) {
        console.trace();
        return;
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


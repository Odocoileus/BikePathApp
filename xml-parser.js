'use strict';

fetchXml();

function fetchXml() { //Fetches the XML path coordinate 
    //file.
    let xmlhttp = new XMLHttpRequest(),
        xmlObject;
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            parseXml(this);
        }
    };
    xmlhttp.open("GET", "bike-paths.xml", true);
    xmlhttp.send();
}

function parseXml(xml, lat, lon) { //Parses the XML, finds 
    //distance from point searched and nearest path, filters by path type
    //and nearest distance if user specifies, and returns the match(es).
    let xmlDoc = xml.responseXML;
    let coordinateArray;
    let lineString = xmlDoc.getElementsByTagName("LineString");//The parent
//    debugger;
    //element of the "coordinates" element containing the path.
    let pathTypeParent = xmlDoc.getElementsByTagName("Document");
    let pathType = pathTypeParent[0].childNodes[1].innerHTML;
    let pathsArray = [];
    for(let i = 0; i < lineString.length; i++) {
//        debugger;
        let coordinateString;//Add each path to a string
        coordinateString = lineString[i].getElementsByTagName("coordinates")[0].innerHTML;
        let normalizedString = coordinateString.replace(/,0/g, ",");//Replacing ",0"
        coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();
            s = parseFloat(s);
            return s;
            });
        coordinateArray.unshift(pathType);
        coordinateArray.pop(); //Removing "NaN"
        pathsArray[i] = coordinateArray;
    }
    for(let i = 0; i < pathsArray.length; i++) {
        let totalDistance = 0,
            numberOfCoordinates = (pathsArray[i].length - 4),
            averageDistance;
        for(let j = 1; j < (pathsArray[i].length - 4); j+=2) {
            let distance = getDistance(pathsArray[i][j+1], pathsArray[i][j],
                                       pathsArray[i][j+3], pathsArray[i][j+4]);
            totalDistance += distance;
        }
//        debugger;
        averageDistance = (totalDistance / numberOfCoordinates);
        console.log(averageDistance);
    }
    let startObject = closestPath(pathsArray, 33.772582, -84.360720, 100, graph),
        endObject = closestPath(pathsArray, 33.772680, -84.367661, 100, graph);
    let shortestPath = dijkstra(graph, startObject.graphIndex);
    console.log(shortestPath);
    for(let i = 0; i < shortestPath.length; i++) {
        let nextIndex = i,
            coordinates = "-----------------------------\n",
            nodesVisited = [];
        while(shortestPath[nextIndex].previous !== undefined) {
            nodesVisited.push(nextIndex);
            coordinates += `${shortestPath[nextIndex].intersection.lat}, ${shortestPath[nextIndex].intersection.lon}\n`;
            nextIndex = shortestPath[nextIndex].previous;
        }
        coordinates += nodesVisited.toString();
        console.log(coordinates);
    }
}

function closestPath(paths,/* pathTypeArray,*/ lat, lon, maxDistance, graph) {
    let minDistance, minDistanceIndex, pathIndex;
    for(let i = 0; i < paths.length; i++) {
        for(let j = 1; j < (paths[i].length - 1); j += 2) { //Searching 
            //through paths array for each path, finding the path and
            //coordinates of the closest point.
//            debugger;
//            if(pathTypeArray.indexOf(paths[i][0]) === -1) { break; } //If
            //the type of path is not what the user wants, skip the path.
            let distance = getDistance(lat, lon, paths[i][j+1], 
                                         paths[i][j]);
            if(minDistance === undefined || distance < minDistance) {//If
                //the distance is the lowest so far, replace lowest with
                //current distance.
                minDistance = distance;
                pathIndex = i;
                minDistanceIndex = j;
            }
        }
    }
//    debugger;
    let matchObject = new Object;
    if(minDistance > maxDistance) { return "too far" } //If the minimum distance
    //exceeds the maximum distance, return "too far".
    
    let matchArray = [];
    for(let k = 0; k < graph.length; k++) { //Finding nodes on the graph with
        //the same path as the closest point found.
        if(graph[k].path1PathIndex === pathIndex || 
           graph[k].path2PathIndex === pathIndex) {
            matchArray.push(graph[k]); //Adding node objects 
            matchArray[matchArray.length - 1].graphIndex = k; //The index will 
            //be used to find the original node object after the operations
            //are finished.
        }
    }
    matchArray.sort(function(a, b) { //Sorting by coordinate index (least to greatest).
            let coordIndexA, coordIndexB;
            if(a.path1PathIndex === pathIndex) { coordIndexA = a.path1CoordIndex; }
            if(a.path2PathIndex === pathIndex) { coordIndexA = a.path2CoordIndex; }
            if(b.path1PathIndex === pathIndex) { coordIndexB = b.path1CoordIndex; }
            if(b.path2PathIndex === pathIndex) { coordIndexB = b.path2CoordIndex; }
            
            if(coordIndexA < coordIndexB) { return -1; }
            if(coordIndexA > coordIndexB) { return 1; }
            return 0;
        });
    let difference, sign, pastSign, crossed = false;
    for(let l = 0; l < matchArray.length; l++) {
        let coordIndex;
        if(matchArray[l].path1PathIndex === pathIndex) { //Finding which
            //path on the matchArray has the same path as the one searched.
            coordIndex = matchArray[l].path1CoordIndex; 
        }
        if(matchArray[l].path2PathIndex === pathIndex) {
            coordIndex = matchArray[l].path2CoordIndex; 
        }
        difference = (coordIndex - minDistanceIndex); //Finding the difference
        //in number of lat-lon coordinates from the node to the closest point
        //on the path.
        if(sign !== undefined) { pastSign = sign; }
        if(difference > 0) { sign = 1; }
        if(difference < 0) { sign = -1; }
        if((sign + pastSign) === 0 || coordIndex === minDistanceIndex) {
            let lat = paths[pathIndex][minDistanceIndex+1],
                lon = paths[pathIndex][minDistanceIndex],
                previousElementDistance = sumDistance(lat, lon,
                                                      matchArray[l-1], 
                                                      paths[pathIndex]),
                nextElementDistance = sumDistance(lat, lon, matchArray[l],
                                                  paths[pathIndex]);
            if(previousElementDistance < nextElementDistance) {
                matchObject.distance = previousElementDistance;
                matchObject.pathIndex = pathIndex;
                matchObject.minDistanceIndex = minDistanceIndex;
                matchObject.graphIndex = matchArray[l-1].graphIndex;
            }
            if(previousElementDistance > nextElementDistance) {
                matchObject.distance = nextElementDistance;
                matchObject.pathIndex = pathIndex;
                matchObject.minDistanceIndex = minDistanceIndex;
                matchObject.graphIndex = matchArray[l].graphIndex;
            }
        }
    }
//    debugger;
    return matchObject;
}

function dijkstra(graph, start/*, pathTypeArray*/) {
//    debugger;
    let currentNode, 
        nextNode,
        visitedNodes = [],
        shortestNodeIndex,
        nodeIndex;
    for(let i = 0; i < graph.length; i++) { //Setting all distances in graph
        //equal to infinity
        if(i === start) { continue; } //Skip starting node, it needs to be set
        //to zero
        graph[i].totalDistance = Infinity;
    }
    graph[start].totalDistance = 0;
//    start.totalDistance = 0;
//    end.totalDistance = Infinity;
//    debugger;
    for(let k = 0; k < graph.length; k++) {
        let shortestEdge = Infinity;
        if(k == 0) { 
            currentNode = graph[start];
            visitedNodes.push(currentNode.index);
        }
        //If the current node has only one pointer, and no unvisited 
        //neighbors, reverse through visited nodes until a node is found
        //with unvisited neighbors.
        else if(nextNode.pointer.length === 1 &&
                visitedNodes.indexOf(nextNode.pointer[0].objIndex) !== -1 &&
               visitedNodes.indexOf(nextNode.index) !== -1) {
//            debugger;
            loop1: //This is similar to a "GOTO" in other languages.
            for(let i = visitedNodes.length;
                i > 0; i--) {
                let loopNodeIndex = visitedNodes[i-1],
                    shortestCandidate = Infinity,
                    shortestCandidateIndex,
                    graphPointer = graph[loopNodeIndex].pointer,
                    triggered = false;
                for(let j = 0; j < graphPointer.length; j++) {
                    if(visitedNodes.indexOf(graphPointer[j].objIndex)
                      === -1) {
                        if(graphPointer[j].distance < shortestCandidate) {
                            shortestCandidate = graphPointer[j].distance;
                            shortestCandidateIndex = j;
                            triggered = true;
//                        break loop1;
                        }
                    }
                    else if(j === (graphPointer.length - 1) && triggered === false) {
                            continue loop1;
                    }
                }
                currentNode = graph[graphPointer[shortestCandidateIndex].objIndex];
                currentNode.totalDistance = graph[loopNodeIndex].totalDistance + 
                    shortestCandidate;
                visitedNodes.push(graphPointer[shortestCandidateIndex].objIndex);
                break;
            }
        }
        else {
            currentNode = nextNode;
            visitedNodes.push(shortestNodeIndex);
        }
        
        
        for(let j = 0; j < currentNode.pointer.length; j++) {
            if(visitedNodes.indexOf(currentNode.pointer[j].objIndex) !== -1) { 
                continue;
            }
            let connectingNodeDistance = currentNode.pointer[j].distance,
                candidateTotal = connectingNodeDistance + 
                                 currentNode.totalDistance;
                nodeIndex = currentNode.pointer[j].objIndex;
            if(graph[nodeIndex].previous === undefined || 
            (graph[nodeIndex].totalDistance !== Infinity && 
             graph[nodeIndex].totalDistance > candidateTotal)) {
                graph[nodeIndex].previous = currentNode.index;
                graph[nodeIndex].totalDistance = candidateTotal;
            }
            if(candidateTotal < shortestEdge) {
                shortestEdge = candidateTotal;
                shortestNodeIndex = nodeIndex;
            }    
        }
        if(visitedNodes.indexOf(shortestNodeIndex) !== -1) { 
                continue;
        }
        nextNode = graph[shortestNodeIndex];
    }
    return graph;
}

function sumDistance(lat, lon, object, path) {
//    debugger;
    let sum, 
        intersection = object.intersection,
        intersectionDistance = getDistance(lat, lon, intersection.lat,
                                           intersection.lon),
        intersectionToFirstIndex,
        intersectionToLastIndex,
        startIndex,
        endIndex,
        matchI,
        matchJ;
    if(intersectionDistance < .1) {
//        debugger;
        return intersectionDistance;
    }
    for(let i = 1; i < path.length; i+=2) {//getting two points between the two intersections
//        debugger;
        if(getDistance(path[i+1], path[i], lat, lon) < intersectionDistance &&
           getDistance(path[i+1], path[i], intersection.lat, intersection.lon) < intersectionDistance &&
           matchI === undefined) { 
            matchI = new Object();
            matchI.lat = path[i+1];
            matchI.lon = path[i];
            matchI.matchIndex = i;
        }
    }
    for(let j = (path.length - 1); j > 0; j-=2) {
//        debugger;
        if(getDistance(path[j], path[j-1], lat, lon) < intersectionDistance &&
           getDistance(path[j], path[j-1], intersection.lat, intersection.lon) < intersectionDistance &&
          matchJ === undefined) {
            matchJ = new Object();
            matchJ.lat = path[j];
            matchJ.lon = path[j-1];
            matchJ.matchIndex = j;

        }
    }
//    debugger;
    let combo1 = getDistance(matchI.lat, matchI.lon, lat, lon),
        combo2 = getDistance(matchI.lat, matchI.lon, intersection.lat, intersection.lon),
        combo3 = getDistance(matchJ.lat, matchJ.lon, lat, lon),
        combo4 = getDistance(matchJ.lat, matchJ.lon, intersection.lat, intersection.lon);
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
    for(let k = matchI.matchIndex; k < matchJ.matchIndex; k+=2) {
//        debugger;
        let add = getDistance(path[k+1], path[k], path[k+3], path[k+2]);
        sum += add;
    }
    return sum;
}

function getDistance(lat1, lon1, lat2, lon2) {//Uses Haversine function to
    //return distance from point specified from each point on specified path
//    debugger;
    if(Array.isArray(lat1)) {
        console.trace();
        return;
    }
    Number.prototype.toRad = function () {
    return this * Math.PI / 180;
    }
//    if(Array.isArray(lat1)) { debugger; }
//    console.trace();
//    console.log(lat1, lon1, lat2, lon2);
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

function nodes(paths, arr) {
    
    for(let i = 0; i < paths.length; i++) {
        
        let intersectionObjectArray = [];
        for(let j = 0; j < arr.length; j++) { //adding objects with same path
            if(arr[j].path1PathIndex === i ||
               arr[j].path2PathIndex === i) {
                let temporaryObject = arr[j];
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

let jsonString = `[
  {
    "path1Type": "bp",
    "path1PathIndex": 0,
    "path1CoordIndex": 19,
    "path2Type": "bp",
    "path2PathIndex": 5,
    "path2CoordIndex": 9,
    "intersection": {
      "lat": 33.77113,
      "lon": -84.3677
    },
    "index": 0,
    "pointer": [
      {
        "objIndex": 6,
        "distance": 1.1465182209484641
      },
      {
        "objIndex": 2,
        "distance": 0.34504682736973324
      },
      {
        "objIndex": 3,
        "distance": 0.35146817969632976
      },
      {
        "objIndex": 15,
        "distance": 0.2385241677719685
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 1,
    "path1CoordIndex": 1,
    "path2Type": "bp",
    "path2PathIndex": 2,
    "path2CoordIndex": 117,
    "intersection": {
      "lat": 33.77335,
      "lon": -84.36457
    },
    "index": 1,
    "pointer": [
      {
        "objIndex": 7,
        "distance": 0.017541773257294405
      },
      {
        "objIndex": 3,
        "distance": 0.27324278556883624
      },
      {
        "objIndex": 9,
        "distance": 1.9759275791852413
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 1,
    "path1CoordIndex": 37,
    "path2Type": "bp",
    "path2PathIndex": 0,
    "path2CoordIndex": 1,
    "intersection": {
      "lat": 33.7735,
      "lon": -84.36762
    },
    "index": 2,
    "pointer": [
      {
        "objIndex": 0,
        "distance": 0.34504682736973324
      },
      {
        "objIndex": 8,
        "distance": 1.5076367943071336
      },
      {
        "objIndex": 7,
        "distance": 0.3499942750885219
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 2,
    "path1CoordIndex": 131,
    "path2Type": "bp",
    "path2PathIndex": 5,
    "path2CoordIndex": 37,
    "intersection": {
      "lat": 33.77113,
      "lon": -84.36391
    },
    "index": 3,
    "pointer": [
      {
        "objIndex": 10,
        "distance": 2.2260981458487854
      },
      {
        "objIndex": 1,
        "distance": 0.27324278556883624
      },
      {
        "objIndex": 5,
        "distance": 0.32816628638567497
      },
      {
        "objIndex": 0,
        "distance": 0.35146817969632976
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 3,
    "path1CoordIndex": 5,
    "path2Type": "bp",
    "path2PathIndex": 4,
    "path2CoordIndex": 3,
    "intersection": {
      "lat": 33.77381,
      "lon": -84.36098
    },
    "index": 4,
    "pointer": [
      {
        "objIndex": 5,
        "distance": 0.3125639176649013
      },
      {
        "objIndex": 11,
        "distance": 0.0600452603881588
      },
      {
        "objIndex": 14,
        "distance": 0.04529046602763789
      },
      {
        "objIndex": 13,
        "distance": 0.04529046602763789
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 3,
    "path1CoordIndex": 11,
    "path2Type": "bp",
    "path2PathIndex": 5,
    "path2CoordIndex": 45,
    "intersection": {
      "lat": 33.77111,
      "lon": -84.36101
    },
    "index": 5,
    "pointer": [
      {
        "objIndex": 12,
        "distance": 0.06115720965416725
      },
      {
        "objIndex": 4,
        "distance": 0.3125639176649013
      },
      {
        "objIndex": 16,
        "distance": 0.1313135790112436
      },
      {
        "objIndex": 3,
        "distance": 0.32816628638567497
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 0,
    "path1CoordIndex": 53,
    "intersection": {
      "lat": 33.76147,
      "lon": -84.36784
    },
    "index": 6,
    "pointer": [
      {
        "objIndex": 0,
        "distance": 1.1465182209484641
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 1,
    "path1CoordIndex": 1,
    "intersection": {
      "lat": 33.7734,
      "lon": -84.36439
    },
    "index": 7,
    "pointer": [
      {
        "objIndex": 2,
        "distance": 0.3499942750885219
      },
      {
        "objIndex": 1,
        "distance": 0.017541773257294405
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 1,
    "path1CoordIndex": 157,
    "intersection": {
      "lat": 33.77242,
      "lon": -84.38331
    },
    "index": 8,
    "pointer": [
      {
        "objIndex": 2,
        "distance": 1.5076367943071336
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 2,
    "path1CoordIndex": 1,
    "intersection": {
      "lat": 33.78184,
      "lon": -84.37856
    },
    "index": 9,
    "pointer": [
      {
        "objIndex": 1,
        "distance": 1.9759275791852413
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 2,
    "path1CoordIndex": 253,
    "intersection": {
      "lat": 33.75443,
      "lon": -84.36554
    },
    "index": 10,
    "pointer": [
      {
        "objIndex": 3,
        "distance": 2.2260981458487854
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 3,
    "path1CoordIndex": 1,
    "intersection": {
      "lat": 33.77435,
      "lon": -84.36098
    },
    "index": 11,
    "pointer": [
      {
        "objIndex": 4,
        "distance": 0.0600452603881588
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 3,
    "path1CoordIndex": 15,
    "intersection": {
      "lat": 33.77056,
      "lon": -84.36101
    },
    "index": 12,
    "pointer": [
      {
        "objIndex": 5,
        "distance": 0.06115720965416725
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 4,
    "path1CoordIndex": 1,
    "intersection": {
      "lat": 33.77381,
      "lon": -84.36147
    },
    "index": 13,
    "pointer": [
      {
        "objIndex": 4,
        "distance": 0.04529046602763789
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 4,
    "path1CoordIndex": 9,
    "intersection": {
      "lat": 33.77381,
      "lon": -84.36049
    },
    "index": 14,
    "pointer": [
      {
        "objIndex": 4,
        "distance": 0.04529046602763789
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 5,
    "path1CoordIndex": 1,
    "intersection": {
      "lat": 33.77116,
      "lon": -84.36957
    },
    "index": 15,
    "pointer": [
      {
        "objIndex": 0,
        "distance": 0.2385241677719685
      }
    ]
  },
  {
    "path1Type": "bp",
    "path1PathIndex": 5,
    "path1CoordIndex": 55,
    "intersection": {
      "lat": 33.77108,
      "lon": -84.35896
    },
    "index": 16,
    "pointer": [
      {
        "objIndex": 5,
        "distance": 0.1313135790112436
      }
    ]
  }
]`;

let graph = JSON.parse(jsonString);




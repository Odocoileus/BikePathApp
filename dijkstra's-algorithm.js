'use strict';

let jsonString = `[
  {
    "path1Type": "bp",
    "path1PathIndex": 0,
    "path1CoordIndex": 19,
    "path2Type": "bp",
    "path2PathIndex": 5,
    "path2CoordIndex": 9,
    "intersection": {
      "lat": 33.7711300001047,
      "lon": -84.36770000011553
    },
    "index": 0,
    "pointer": [
      {
        "objIndex": 2,
        "distance": 0.34504698725043853
      },
      {
        "objIndex": 3,
        "distance": 0.35109922714214736
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
      "lat": 33.77335308816053,
      "lon": -84.36456826763118
    },
    "index": 1,
    "pointer": [
      {
        "objIndex": 2,
        "distance": 0.341784164120784
      },
      {
        "objIndex": 3,
        "distance": 0.27342567354320185
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
      "lat": 33.77350000010865,
      "lon": -84.36762000184977
    },
    "index": 2,
    "pointer": [
      {
        "objIndex": 0,
        "distance": 0.34504698725043853
      },
      {
        "objIndex": 1,
        "distance": 0.341784164120784
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
      "lat": 33.77112997530391,
      "lon": -84.36391399183714
    },
    "index": 3,
    "pointer": [
      {
        "objIndex": 1,
        "distance": 0.27342567354320185
      },
      {
        "objIndex": 5,
        "distance": 0.4052621334138806
      },
      {
        "objIndex": 0,
        "distance": 0.35109922714214736
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
      "lat": 33.77381000006771,
      "lon": -84.36097999970494
    },
    "index": 4,
    "pointer": [
      {
        "objIndex": 5,
        "distance": 0.36145497243586183
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
      "lat": 33.77110999948115,
      "lon": -84.36100999868711
    },
    "index": 5,
    "pointer": [
      {
        "objIndex": 4,
        "distance": 0.36145497243586183
      },
      {
        "objIndex": 3,
        "distance": 0.4052621334138806
      }
    ]
  }
]`;

let graph = JSON.parse(jsonString);

dijkstra(graph);
 //TODO: add behavior for replacing path if a shorter path is found to a node
function dijkstra(graph) {
//    debugger;
    let currentNode, 
        nextNode,
        visitedNodes = [],
        shortestNodeIndex;
    for(let i = 0; i < graph.length; i++) { //Setting all distances in graph
        //equal to infinity
        if(i == 0) { 
            graph[i].totalDistance = 0;
            continue;
        }
        graph[i].totalDistance = Infinity;
    }
//    start.totalDistance = 0;
//    end.totalDistance = Infinity;
    for(let k = 0; k < graph.length; k++) {
        let shortestEdge = Infinity;
//        debugger;
        if(k == 0) { 
            currentNode = graph[k]; //CHANGE
            visitedNodes.push(currentNode.index);
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
                                 currentNode.totalDistance,
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
        nextNode = graph[shortestNodeIndex];
    }
    console.log(graph);
    console.log(visitedNodes);
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

function getDistance(lat1, lon1, lat2, lon2) {//Uses Haversine function to
    //return distance from point specified from each point on specified path
    Number.prototype.toRad = function() {
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



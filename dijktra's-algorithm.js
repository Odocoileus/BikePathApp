'use strict';

let graph = JSON.parse(jsonString);

function dijkstra(start, graph, end) {
    let currentNode, 
        nextNode,
        visitedNodes = [];
    for(let i = 0; i < graph.length; i++) { //Setting all distances in graph
        //equal to infinity
        graph[i].totalDistance = Infinity;
    }
    start.totalDistance = 0;
    end.totalDistance = Infinity;
    if(i = 0) { //This does not work
        currentNode = start;
        visitedNodes.push(currentNode);
    }
    else {
        currentNode = nextNode;
        visitedNodes.push(shortestNodeIndex);
    }
    let shortestEdge = Infinity, shortestNodeIndex;
    for(let j = 0; j < currentNode.pointer.length; j++) { //TODO: if pointer === undefined
        let connectingNodeDistance = currentNode.pointer[j].distance,
            candidateTotal = connectingNodeDistance + 
                             currentNode.totalDistance;
        graph[j].previous = currentNode.index;
        graph[j].previousDistance = candidateTotal;
        if(candidateTotal < shortestEdge) {
            shortestEdge = candidateTotal;
            shortestNodeIndex = currentNode.pointer[j].objIndex;
        }    
    }
    nextNode = graph[shortestNodeIndex];
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
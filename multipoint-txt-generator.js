'use strict';

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
    xmlhttp.open("GET", "short.xml", true);
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
        let normalizedString = coordinateString.replace(/,0/g, ",");//Finding and
        //replacing ",0"
        let coordinateArray = normalizedString.split(",").map(function(s) {
            s.trim();//Trim whitespace
            s = parseFloat(s);//Convert to float
            return s;
            });
        pathsArray[i] = coordinateArray;
    }
    //let matchesArray = []; //Array that will hold match objects
    for (let i = 0; i < pathsArray.length; i++) {
        let path = pathsArray[i];
        
        for (let j = 0; j < (path.length - 1); j+=2) {
            let lat = path[j+1];
            let lon = path[j];
            
            for (let k = 0, m = 0; m < 1000 || k < pathsArray.length; k++, m++) {
                let path2 = pathsArray[k];
                console.log(i + " " + k);
                /*if (k = i) {
                    k++;
                }
                else {
                    for (let l = 0; l < (path2.length - 1); l+=2) {
                        let lat2 = path2[l+1];
                        let lon2 = path2[l];
                        if((getDistance(lat, lon, lat2, lon2) < .05)) {
                           console.log(lat + " " + lon + " " + lat2 + " " + lon2);
                        }*/
                    
            }
        }
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
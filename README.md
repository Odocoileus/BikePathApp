# BikePathApp
This app will allow users to receive turn-by-turn directions that only take routes known to be bike-friendly. Users will have the
ability to filter routes based upon using any combination of the following: bike lanes, bike paths (bikes only), bike-friendly streets
and unpaved trails. 

The inspiration for the project followed an experience in which I was routed by Google Maps onto a road that was not bike-friendly. 
Google Maps does provide excellent biking directions, and tries to route onto bike-friendly routes when possible, but they 
still provide directions even if the route is not safe. My goal is to alert users when they should walk, when they should ride,
and allow them to choose the type of route they feel most comfortable using.

Notes about the files:
Xml-parser and dijkstra's-algorithm.js will eventually live on the client side. Multipoint-txt-generator.js is a script that will run in Node for each update to the path data XML file, providing the graph that xml-parser.js and dijkstra's-algorithm.js uses to find the shortest path to the destination.

//whats the best way to separate this for future transitions?
//repo - scaffold for server to hold json
// import Blight from './data/blight.json'

//referenced: http://bl.ocks.org/d3noob/9211665
//referenced: https://www.w3schools.com/howto/howto_css_loader.asp

var CURR_YEAR = 15
//load data
Promise.all(
  [d3.json("./data/districts.geojson"),
   d3.json("./data/neighborhoods.geojson"),
   d3.json("./data/blight.json"),
   //d3.json("./data/dem.json"),
   d3.json("./data/sales.json")
  ])
  .then(function(data) {
    console.log(data)
    makeMap(data)
    //makeDistrictDotMap(data)
    //makeNHoodDotMap(data)
    })
  .catch(error => console.warn(error))

function makeMap(dataset) {
  const [dist, nhood, blight, sales] = dataset;

  var map = L.map('chart', { center: [42.3614, -83.0458], zoom:11}); //setView(new L.LatLng(42.3314, -83.0458));
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
  L.geoJSON(dist, {
    "color": '#31044F',
    "weight": 5,
    "opacity": 0.75,
  }).addTo(map);

  var myRenderer = L.canvas({ padding: 0.5 });

  //blight
  // var blight_curr = blight.filter(d => d.year == CURR_YEAR)
  //
  // for (var i = 0; i < Object.keys(blight_curr).length; i += 1) {
  //   L.circleMarker([blight_curr[i].lat, blight_curr[i].long], {
  //     renderer: myRenderer,
  //     color: '#B0EE31',
  //     fillColor: '#B0EE31',
  //     fillOpacity: 0.75,
  //     radius: 1
  //   }).addTo(map);
  // }
  //
  //
  // //demolitions
  // var dem_curr = dem.filter(d => d.year == CURR_YEAR)
  //
  // for (var i = 0; i < Object.keys(dem_curr).length; i += 1) {
  // 	L.circleMarker([dem_curr[i].lat, dem_curr[i].long], {
  //   	renderer: myRenderer,
  //     color: '#14E5D0',
  //     fillColor: '#14E5D0',
  //     fillOpacity: 0.75,
  //     radius: 1
  //   }).addTo(map);
  // }

  //sales
  var sales_curr = sales.filter(d => d.year == CURR_YEAR)

  for (var i = 0; i < Object.keys(sales_curr).length; i += 1) {
  	L.circleMarker([sales_curr[i].lat, sales_curr[i].long], {
    	renderer: myRenderer,
      color: '#8C82FA',
      fillColor: '#8C82FA',
      fillOpacity: 0.05,
      radius: 1
    }).addTo(map);
  }



}






//graphs using d3
function makeDistrictDotMap(dataset) {

  const [dist, nhood, blight, dem, sales] = dataset;

  const margin = {
    top: 100,
    left: 50,
    right: 50,
    bottom: 50
  };

  const width = 900 - margin.right - margin.left;
  const height = 600 - margin.top - margin.bottom;

  var svg = d3.select('#chart')
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class','framed');

var center = d3.geoCentroid(dist)
var scale  = 90000;
var offset = [width/2, height/3];
var projection = d3.geoMercator().scale(scale).center(center)
    .translate(offset);
//referenced: https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object

//const projection = d3.geoEquirectangular();
const geoGenerator = d3.geoPath(projection);

g = svg.append('g')
      .attr('transform', 'translate('+margin.left+',' +margin.top+')');

const districts = g.selectAll('.district').data(dist.features);

districts.enter()
  .append('path')
  .attr('class', 'district')
  .attr('stroke','black')
  .attr('fill', 'grey')
  .attr('d', d => geoGenerator(d))

//const x = sales[1];
//console.log(projection([x.long, x.lat]));

const blight_points = g.selectAll('.circle-blight').data(blight)

blight_points.enter()
  .append('circle')
  .attr('class','circle-blight')
  .attr('r', '2px')
  .attr('cx', d => projection([d.long, d.lat])[0])
  .attr('cy', d => projection([d.long, d.lat])[1]);

const dem_points = g.selectAll('.circle-dem').data(dem)

  dem_points.enter()
    .append('circle')
    .attr('class','circle-dem')
    .attr('r', '2px')
    .attr('cx', d => projection([d.long, d.lat])[0])
    .attr('cy', d => projection([d.long, d.lat])[1]);

const sale_points = g.selectAll('.circle-sale').data(sales)

sale_points.enter()
  .append('circle')
  .attr('class','circle-sale')
  .attr('r', '2px')
  .attr('cx', d => projection([d.long, d.lat])[0])
  .attr('cy', d => projection([d.long, d.lat])[1]);

}

function makeNHoodDotMap(dataset) {

  const [dist, nhood, blight, dem, sales] = dataset;

  const margin = {
    top: 100,
    left: 50,
    right: 50,
    bottom: 50
  };

  const width = 900 - margin.right - margin.left;
  const height = 600 - margin.top - margin.bottom;

  var svg = d3.select('#chart')
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class','framed');

var center = d3.geoCentroid(nhood)
var scale  = 90000;
var offset = [width/2, height/3];
var projection = d3.geoMercator().scale(scale).center(center)
    .translate(offset);
//referenced: https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object

//const projection = d3.geoEquirectangular();
const geoGenerator = d3.geoPath(projection);

g = svg.append('g')
      .attr('transform', 'translate('+margin.left+',' +margin.top+')');

const nhood_map = g.selectAll('.nhood').data(nhood.features);

nhood_map.enter()
  .append('path')
  .attr('class', 'nhood')
  .attr('stroke','black')
  .attr('fill', 'grey')
  .attr('d', d => geoGenerator(d))

//const x = sales[1];
//console.log(projection([x.long, x.lat]));

const blight_points = g.selectAll('.circle-blight').data(blight)

blight_points.enter()
  .append('circle')
  .attr('class','circle-blight')
  .attr('r', '2px')
  .attr('cx', d => projection([d.long, d.lat])[0])
  .attr('cy', d => projection([d.long, d.lat])[1]);

const dem_points = g.selectAll('.circle-dem').data(dem)

  dem_points.enter()
    .append('circle')
    .attr('class','circle-dem')
    .attr('r', '2px')
    .attr('cx', d => projection([d.long, d.lat])[0])
    .attr('cy', d => projection([d.long, d.lat])[1]);

const sale_points = g.selectAll('.circle-sale').data(sales)

sale_points.enter()
  .append('circle')
  .attr('class','circle-sale')
  .attr('r', '2px')
  .attr('cx', d => projection([d.long, d.lat])[0])
  .attr('cy', d => projection([d.long, d.lat])[1]);

}



//load data
Promise.all(
  [d3.json("./data/districts.geojson")])
  .then(function(data) {
    console.log(data)
    makeDotMap(data)
    })
  .catch(error => console.warn(error))

function makeDotMap(dataset) {

  const dist = dataset[0]

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

const aa = [-83.110337, 42.344463]
const bb = [-82.947461, 42.419229]

const points = g.selectAll('.circle').data([aa,bb])

points.enter()
  .append('circle')
  .attr('class','circle')
  .attr('fill','red')
  .attr('r', '8px')
  .attr('cx', d => projection(d)[0])
  .attr('cy', d => projection(d)[1])


}

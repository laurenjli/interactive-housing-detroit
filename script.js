//whats the best way to separate this for future transitions?
//repo - scaffold for server to hold json
// import Blight from './data/blight.json'

//referenced: http://bl.ocks.org/d3noob/9211665
//referenced: https://www.w3schools.com/howto/howto_css_loader.asp

var CURR_YEAR = 18

//load data
Promise.all(
  [d3.json("./data/districts.geojson"),
   d3.json("./data/neighborhoods.geojson"),
   d3.json("./data/blight.geojson"),
   d3.json("./data/dem.geojson"),
   d3.json("./data/sales.geojson"),
   //d3.json("./data/summary.json")
  ])
  .then(function(data) {
    console.log(data)
    makeVis(data)
    //makeDistrictDotMap(data)
    //makeNHoodDotMap(data)
    })
  .catch(error => console.warn(error))


function makeVis(dataset) {
  // const summaryStats = dataset[5];
  // makeTable(summaryStats);
  makeMap(dataset);

}

function makeTable(summary){

  const colNames = ['Category','Total (Number)',
'Pct Change in Total from Previous Year', 'Average Amount',
'Pct Change in Avg Amount from Previous Year'];

  var summaryYr = summary.filter(d => d.Year == CURR_YEAR)

  var title = d3.select('.table-title').append('text')
      .text('Summary of 20' + CURR_YEAR)

  var table = d3.select('.statsTable').append('table')
	var thead = table.append('thead')
	var	tbody = table.append('tbody');

  thead.append('tr')
		  .selectAll('th')
		  .data(colNames).enter()
		  .append('th')
		    .text(d => d);

  //create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(summaryYr)
	  .enter()
	  .append('tr');

	// create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
	    return colNames.map(function (colNames) {
	      return {colNames: colNames, value: row[colNames]};
	    });
	  })
	  .enter()
	  .append('td')
	    .text(d => d.value);
}



function makeMap(dataset) {
  const [dist, nhood, blight, dem, sales] = dataset;

  var map = L.map('chart', { center: [42.3614, -83.0458], zoom:11}); //setView(new L.LatLng(42.3314, -83.0458));

  //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
  var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

	L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}).addTo(map);
  //referenced: https://leafletjs.com/examples/layers-control/example.html

  //referenced: http://www.gistechsolutions.com/leaflet/DEMO/filter/filter.html
  //base layers
  const dist_geo = L.geoJSON(dist, {
    "color": '#31044F',
    "weight": 3,
    "opacity": 0.75,
  }); //.addTo(map);

  const nhood_geo = L.geoJSON(nhood, {
    "color": '#31044F',
    "weight": 3,
    "opacity": 0.75,
  });

  //Use Layers to add and remove data, default is by district, 2018, demolitions
  var myData =  L.layerGroup([]);
    myData.addLayer(dist_geo);
    myData.addTo(map);

  //define tooltip: https://stackoverflow.com/questions/10805184/show-data-on-mouseover-of-circle
  // var tooltip = d3.select(map.getContainer())
  //   .append("div")
  //   .attr("class", "tooltip")
  //   // .style("position", "absolute")
  //   // .style("z-index", "10")
  //   // .style("visibility", "hidden")
  //   .text("a simple tooltip")
  //   .style("opacity", 0);


  //If district map box is clicked.
	document.getElementById("c-district-box").addEventListener('click', function(event) {
    myData.clearLayers();
    map.removeLayer(myData);

    myData.addLayer(dist_geo);
    myData.addTo(map)});

  //If neighborhood map box is clicked
  document.getElementById("nhood-box").addEventListener('click', function(event) {
    myData.clearLayers();
    map.removeLayer(myData);

    myData.addLayer(nhood_geo);
    myData.addTo(map)});

  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");

  var tooltip = d3.select('body')
    .append("div")
    .attr("class", "tooltip")
    .text("a simple tooltip")
    .style("opacity", 0)
    .style("z-index", "999");

  var salesCurr = sales.features.filter(d => d.properties.year == CURR_YEAR);
  plotPoints(reformat(salesCurr), map, 'sale', 'Public Land Sale', tooltip, g, svg);
  var demCurr = dem.features.filter(d => d.properties.year == CURR_YEAR);
  plotPoints(reformat(demCurr), map, 'dem', 'Demolition', tooltip, g, svg);
  var blightCurr = blight.features.filter(d => d.properties.year == CURR_YEAR);
  plotPoints(reformat(blightCurr), map, 'blight', 'Blight Violation', tooltip, g, svg);
}

function plotPoints(dataset, map, type, title, tooltip, g, svg){

  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geoTransform({point: projectPoint}),
            path = d3.geoPath().projection(transform);

  dataset.features.forEach(function(d) {
    d.LatLng = new L.LatLng(d.geometry.coordinates[1],
    d.geometry.coordinates[0]);
  });

  var dots = g.selectAll(".circle-" +type)
             .data(dataset.features)
             //.data(sales.features.filter(d => d.properties.year == CURR_YEAR))
             .enter()
             //.append('a')
             .append('circle')
             .attr('class', 'circle-'+type)
             .attr('r', 2)
             .on("mouseover", function(d){
               console.log(d)
               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: " + d.properties.price + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.neighborhood + "</dt>"
                        + "<dt>Year: " + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX)+"px");})
             //.on("mousemove", function(){return tooltip.style("top",
             //(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(d){tooltip.style('opacity', 0);});

 map.on("moveend", update);
 // map.on("viewreset", update);
 update();

 function update() {
    var bounds = path.bounds(dataset),
      topLeft = bounds[0],
      bottomRight = bounds[1];
    svg.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    dots.attr("transform", function(d) {
      return "translate("+
            map.latLngToLayerPoint(d.LatLng).x +","+
            map.latLngToLayerPoint(d.LatLng).y +")";
        });

  }

    //Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
   var point = map.latLngToLayerPoint(new L.LatLng(y, x));
   this.stream.point(point.x, point.y);
   };
};

function plotBlight(dataset, map, type, title, tooltip, g, svg){

  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geoTransform({point: projectPoint}),
            path = d3.geoPath().projection(transform);

  dataset.features.forEach(function(d) {
    d.LatLng = new L.LatLng(d.geometry.coordinates[1],
    d.geometry.coordinates[0]);
  });

  var dots = g.selectAll(".circle-" +type)
             .data(dataset.features)
             //.data(sales.features.filter(d => d.properties.year == CURR_YEAR))
             .enter()
             //.append('a')
             .append('circle')
             .attr('class', 'circle-'+type)
             .attr('r', 2)
             .on("mouseover", function(d){
               console.log(d)
               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: " + d.properties.totalDue + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.NHood_Name + "</dt>"
                        + "<dt>Year: " + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX)+"px");})
             //.on("mousemove", function(){return tooltip.style("top",
             //(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(d){tooltip.style('opacity', 0);});

 map.on("moveend", update);
 // map.on("viewreset", update);
 update();

 function update() {
    var bounds = path.bounds(dataset),
      topLeft = bounds[0],
      bottomRight = bounds[1];
    svg.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    dots.attr("transform", function(d) {
      return "translate("+
            map.latLngToLayerPoint(d.LatLng).x +","+
            map.latLngToLayerPoint(d.LatLng).y +")";
        });

  }

    //Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
   var point = map.latLngToLayerPoint(new L.LatLng(y, x));
   this.stream.point(point.x, point.y);
   };
};


function reformat(array) {
                // var data = [];
                // array.map(function (d, i) {
                //
                //     data.push({
                //         id: i,
                //         type: "Feature",
                //         geometry: {
                //             coordinates: d.geometry.coordinates,
                //             type: "Point"
                //         }
                //
                //
                //     });
                // });
                return {type: 'FeatureCollection', features: array};
            };


  //Handle different years
  // document.getElementById("2015-box").addEventListener('click', function(event) {
  //   CURR_YEAR = 15;
  //
  //   demCurr = dem.filter(d => d.year == CURR_YEAR);
  //   demDots(demCurr, map);

    // document.getElementById("blight-box").addEventListener('click', function(event) {
    //   var blightCurr = blight.filter(d => d.year == CURR_YEAR);
    //   blightDots(blightCurr, map)});
    //
    // document.getElementById("demolitions-box").addEventListener('click', function(event) {
    //   demCurr = dem.filter(d => d.year == CURR_YEAR);
    //   demDots(demCurr, map)});
    //
    // document.getElementById("land-sales-box").addEventListener('click', function(event) {
    //   var salesCurr = sales.filter(d => d.year == CURR_YEAR);
    //   saleDots(salesCurr, map)});

  // });
  // document.getElementById("2016-box").addEventListener('click', function(event) {
  //   CURR_YEAR = 16;
  //
  //   demCurr = dem.filter(d => d.year == CURR_YEAR);
  //   demDots(demCurr, map);
  //
  // });
  // document.getElementById("2017-box").addEventListener('click', function(event) {
  //   CURR_YEAR = 17;
  //
  //   demCurr = dem.filter(d => d.year == CURR_YEAR);
  //   demDots(demCurr, map);
  //
  // });
  // document.getElementById("2018-box").addEventListener('click', function(event) {
  //   CURR_YEAR = 18;
  //
  //   demCurr = dem.filter(d => d.year == CURR_YEAR);
  //   demDots(demCurr, map);
  //
  // });

  //var myRenderer = L.canvas({ padding: 0.5 });

  //blight
  // var blightCurr = blight.filter(d => d.year == CURR_YEAR)
  //
  // for (var i = 0; i < Object.keys(blightCurr).length; i += 1) {
  // var b_descrip = "<dl><dt>Type: Blight Violation</dt>"
  //      + "<dt>Final Fine Amount: " + blightCurr[i].totalDue + "</dt>"
  //      + "<dt>Council District: " + blightCurr[i].councilDistrict + "</dt>"
  //      + "<dt>Neighborhood: " + blightCurr[i].NHood_Name + "</dt>";
  //   L.circleMarker([blightCurr[i].lat, blightCurr[i].long], {
  //     renderer: myRenderer,
  //     color: '#B0EE31',
  //     fillColor: '#B0EE31',
  //     fillOpacity: 0.75,
  //     radius: 1
  //   }).addTo(map).bindPopup(b_descrip);
  // }
  //
  //
  // //demolitions
  // var demCurr = dem.filter(d => d.year == CURR_YEAR)
  //
  // for (var i = 0; i < Object.keys(demCurr).length; i += 1) {
  // var d_descrip = "<dl><dt>Type: Demolition</dt>"
  //      + "<dt>Cost: " + demCurr[i].price + "</dt>"
  //      + "<dt>Council District: " + demCurr[i].councilDistrict + "</dt>"
  //      + "<dt>Neighborhood: " + demCurr[i].neighborhood + "</dt>";
  // 	L.circleMarker([demCurr[i].lat, demCurr[i].long], {
  //   	renderer: myRenderer,
  //     color: '#14E5D0',
  //     fillColor: '#14E5D0',
  //     fillOpacity: 0.75,
  //     radius: 1
  //   }).addTo(map).bindPopup(d_descrip);
  // }
  //
  //
  // var salesCurr = sales.filter(d => d.year == CURR_YEAR)
  //
  // for (var i = 0; i < Object.keys(salesCurr).length; i += 1) {
  //
  //   var s_descrip = "<dl><dt>Type: Public Land Sale</dt>"
  //        + "<dt>Sale Price: " + salesCurr[i].price + "</dt>"
  //        + "<dt>Council District: " + salesCurr[i].councilDistrict + "</dt>"
  //        + "<dt>Neighborhood: " + salesCurr[i].neighborhood + "</dt>"
  //        + "<dt>Year: " + salesCurr[i].year + "</dt>";
  //
  // 	L.circleMarker([salesCurr[i].lat, salesCurr[i].long], {
  //   	//renderer: myRenderer,
  //     color: '#8C82FA',
  //     fillColor: '#8C82FA',
  //     fillOpacity: 0.05,
  //     radius: 1
  //   }).addTo(map).bindPopup(s_descrip);
  // }



// function blightDots(blightCurr, map){
//
//   for (var i = 0; i < Object.keys(blightCurr).length; i += 1) {
//     var b_descrip = "<dl><dt>Type: Blight Violation</dt>"
//          + "<dt>Final Fine Amount: " + blightCurr[i].totalDue + "</dt>"
//          + "<dt>Council District: " + blightCurr[i].councilDistrict + "</dt>"
//          + "<dt>Neighborhood: " + blightCurr[i].NHood_Name + "</dt>"
//          + "<dt>Year: " + blightCurr[i].year + "</dt>";
//       L.circleMarker([blightCurr[i].lat, blightCurr[i].long], {
//         //renderer: myRenderer,
//         color: '#ED9007',
//         fillColor: '#ED9007',
//         fillOpacity: 0.75,
//         radius: 1
//       }).addTo(map).bindPopup(b_descrip);
//   };
//
// }
//
// function demDots(demCurr, map){
//   var group_temp2 = L.layerGroup()
//   for (var i = 0; i < Object.keys(demCurr).length; i += 1) {
//     var d_descrip = "<dl><dt>Type: Demolition</dt>"
//          + "<dt>Cost: " + demCurr[i].price + "</dt>"
//          + "<dt>Council District: " + demCurr[i].councilDistrict + "</dt>"
//          + "<dt>Neighborhood: " + demCurr[i].neighborhood + "</dt>"
//          + "<dt>Year: " + demCurr[i].year + "</dt>";
//     	L.circleMarker([demCurr[i].lat, demCurr[i].long], {
//       	//renderer: myRenderer,
//         color: '#14E5D0',
//         fillColor: '#14E5D0',
//         fillOpacity: 0.75,
//         radius: 1
//       }).bindPopup(d_descrip)
//       .on('mouseover', function (e) {
//         this.openPopup();
//       })
//       .on('mouseout', function (e) {
//         this.closePopup();
//       })
//       .addTo(group_temp2);
//   };
//   return group_temp2;
// }
//
// function saleDots(salesCurr, map){
//   for (var i = 0; i < Object.keys(salesCurr).length; i += 1) {
//
//     var s_descrip = "<dl><dt>Type: Public Land Sale</dt>"
//          + "<dt>Sale Price: " + salesCurr[i].price + "</dt>"
//          + "<dt>Council District: " + salesCurr[i].councilDistrict + "</dt>"
//          + "<dt>Neighborhood: " + salesCurr[i].neighborhood + "</dt>"
//          + "<dt>Year: " + salesCurr[i].year + "</dt>";
//
//   	L.circleMarker([salesCurr[i].lat, salesCurr[i].long], {
//     	//renderer: myRenderer,
//       color: '#8C82FA',
//       fillColor: '#8C82FA',
//       fillOpacity: 0.05,
//       radius: 1
//     }).addTo(map).bindPopup(s_descrip);
//   };
// }

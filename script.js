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
   d3.json("./data/summary.json")
  ])
  .then(function(data) {
    console.log(data)
    makeVis(data)
    })
  .catch(error => console.warn(error))


function makeVis(dataset) {
  const summaryStats = dataset[5];
  makeTable(summaryStats);
  makeMap(dataset);

}

function makeTable(summary){

  const colNames = ['Category','Total (Number)',
'Pct Change in Total from Previous Year', 'Average Amount',
'Pct Change in Avg Amount from Previous Year'];

  // var summaryYr = summary.filter(d => d.Year == CURR_YEAR)
  //
  // var title = d3.select('.table-title').append('text');
  // title.text('Summary of 20' + CURR_YEAR);
  //
  // var table = d3.select('.statsTable')
	// 				.append("table")
	// 				.property("border","1px");
  //
  // var thead = table.append('thead');
  // var	tbody = table.append('tbody');
  //
  // thead.append('tr')
	// 	  .selectAll('th')
	// 	  .data(colNames).enter()
	// 	  .append('th')
	// 	    .text(d => d);
  //
  // //create a row for each object in the data
	// var rows = tbody.selectAll('tr')
	//   .data(summaryYr)
	//   .enter()
	//   .append('tr');
  //
	// //create a cell in each row for each column
	// var cells = rows.selectAll('td')
	//   .data(function (row) {
	//     return colNames.map(function (colNames) {
	//       return {colNames: colNames, value: row[colNames]};
	//     });
	//   })
	//   .enter()
	//   .append('td')
	//     .text(d => d.value);

  var title = d3.select('.table-title').append('text');
  d3.selectAll('.dot-type').on("change", tableUpdate);
  tableUpdate()

  //handle checkbox year changes
  document.getElementById("2015-box").addEventListener('click', function(event) {
    CURR_YEAR = 15;
    console.log(CURR_YEAR)

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  document.getElementById("2016-box").addEventListener('click', function(event) {
    CURR_YEAR = 16;
    console.log(CURR_YEAR)

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  document.getElementById("2017-box").addEventListener('click', function(event) {
    CURR_YEAR = 17;
    console.log(CURR_YEAR)

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  document.getElementById("2018-box").addEventListener('click', function(event) {
    CURR_YEAR = 18;
    console.log(CURR_YEAR)

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  function tableUpdate() {
    //should change table
    var summaryYr = summary.filter(d => d.Year == CURR_YEAR);
    //var title = d3.select('.table-title').append('text');
    title.text('Summary of 20' + CURR_YEAR);

    d3.select('.statsTable').selectAll("*").remove();

    var table = d3.select('.statsTable')
  					.append("table")
  					.property("border","1px");

    var thead = table.append('thead');
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

  	//create a cell in each row for each column
  	var cells = rows.selectAll('td')
  	  .data(function (row) {
  	    return colNames.map(function (colNames) {
  	      return {colNames: colNames, value: row[colNames]};
  	    });
  	  })
  	  .enter()
  	  .append('td')
  	    .text(d => d.value);

    // console.log(newData)
    // console.log('row')
    //
    // var newRows = tbody.selectAll('tr').data(newData)
  	//   .enter()
  	//   .append('tr').exit().remove();
    //
    // console.log('cell')
    //
    // var newCells = newRows.selectAll('td')
  	//   .data(function (row) {
  	//     return colNames.map(function (colNames) {
  	//       return {colNames: colNames, value: row[colNames]};
  	//     });
  	//   })
    //   .enter()
  	//   .append('td')
  	//     .text(d => d.value);
    //
    // //newRows.data(newData).exit().remove();
    // newCells.exit().remove();


  };

}



function makeMap(dataset) {
  const [dist, nhood, blight, dem, sales, disregard] = dataset;

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

  //initalize for plotting points
  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");

  var tooltip = d3.select('body')
    .append("div")
    .attr("class", "tooltip")
    .text("a simple tooltip")
    .style("opacity", 0)
    .style("z-index", "999");

  //defaults
  var demCurr = dem.features.filter(d => d.properties.year == CURR_YEAR);
  plotPoints(reformat(demCurr), map, 'dem', 'Demolition', tooltip, g, svg);

  d3.selectAll('.dot-type').on("change", manageUpdate);
  manageUpdate()

  document.getElementById("2015-box").addEventListener('click', function(event) {
    CURR_YEAR = 15;

    d3.selectAll('.dot-type').on("change", manageUpdate);
    manageUpdate()
  });

  document.getElementById("2016-box").addEventListener('click', function(event) {
    CURR_YEAR = 16;

    d3.selectAll('.dot-type').on("change", manageUpdate);
    manageUpdate()
  });

  document.getElementById("2017-box").addEventListener('click', function(event) {
    CURR_YEAR = 17;

    d3.selectAll('.dot-type').on("change", manageUpdate);
    manageUpdate()
  });

  document.getElementById("2018-box").addEventListener('click', function(event) {
    CURR_YEAR = 18;

    d3.selectAll('.dot-type').on("change", manageUpdate);
    manageUpdate()
  });

  function manageUpdate() {
    //should change map dots and table
    var choices = [];
    d3.selectAll('.dot-type').each(function(d){
      cb = d3.select(this);
      if(cb.property("checked")){
        choices.push(cb.property("value"));
      }
    });

    var blightCurr = blight.features.filter(d => d.properties.year == CURR_YEAR);
    var demCurr = dem.features.filter(d => d.properties.year == CURR_YEAR);
    var salesCurr = sales.features.filter(d => d.properties.year == CURR_YEAR);

    //console.log(choices)
    if(choices.includes('blight-box')){
      //plot blight
      plotBlight(reformat(blightCurr), map, 'blight', 'Blight Violation', tooltip, g, svg);
      g.selectAll('.circle-blight').data(reformat(blightCurr).features).exit()
        .transition()
        .duration(100)
        .remove();
    }
    else {
      //remove blight
      g.selectAll('.circle-blight').data([]).exit()
        .transition()
        .duration(100)
        .remove();
    }

    if(choices.includes('dem-box')){
      plotPoints(reformat(demCurr), map, 'dem', 'Demolition', tooltip, g, svg);
      g.selectAll('.circle-dem').data(reformat(demCurr).features).exit()
        .transition()
        .duration(100)
        .remove();
    }
    else {
      g.selectAll('.circle-dem').data([]).exit()
        .transition()
        .duration(100)
        .remove();
    }

    if(choices.includes('sales-box')){
      plotPoints(reformat(salesCurr), map, 'sale', 'Public Land Sale', tooltip, g, svg);
      g.selectAll('.circle-sale').data(reformat(salesCurr).features).exit()
        .transition()
        .duration(100)
        .remove();
    }

    else {
      g.selectAll('.circle-sale').data([]).exit()
        .transition()
        .duration(100)
        .remove();
    }

  };
};


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
             .enter()
             .append('circle')
             .attr('class', 'circle-'+type)
             .attr('r', 3.5)
             .on("mouseover", function(d){
               d3.select(this)
                .classed('hovered', true)
                .transition().duration(200)
                .attr('r', 6);

               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: " + d.properties.price + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.neighborhood + "</dt>"
                        + "<dt>Year: " + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX+30)+"px");
               })
            .on("mouseout", function(d){
              tooltip.style('opacity', 0);
              d3.select(this)
               .classed('hovered', false)
               .transition().duration(300)
               .attr('r', 3.5);});

 map.on("moveend", update);
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
             .enter()
             .append('circle')
             .attr('class', 'circle-'+type)
             .attr('r', 3.5)
             .on("mouseover", function(d){
               d3.select(this)
                .classed('hovered', true)
                .transition().duration(200)
                .attr('r', 6);

               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: $" + d.properties.totalDue + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.NHood_Name + "</dt>"
                        + "<dt>Year: " + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX+30)+"px");})
            .on("mouseout", function(d){
              tooltip.style('opacity', 0)
              d3.select(this)
               .classed('hovered', false)
               .transition().duration(300)
               .attr('r', 3.5);});

 map.on("moveend", update);
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
    return {type: 'FeatureCollection', features: array};
};

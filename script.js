//whats the best way to separate this for future transitions?
//repo - scaffold for server to hold json
// import Blight from './data/blight.json'

//referenced: http://bl.ocks.org/d3noob/9211665

var CURR_YEAR = 18;
var unique_point = d3.select(null);

//load data
Promise.all(
  [d3.json("./data/districts.geojson"),
   d3.json("./data/neighborhoods.geojson"),
   d3.json("./data/blight.geojson"),
   d3.json("./data/dem.geojson"),
   d3.json("./data/sales.geojson"),
   d3.json("./data/summary.json"),
   d3.json("./data/dist_dropdown.json"),
   d3.json("./data/nhood_dropdown.json")
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

    title.text('Summary of 20' + CURR_YEAR);

    d3.select('.statsTable').selectAll("*").remove();

    var table = d3.select('.statsTable')
  					.append("table");

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
  };

}



function makeMap(dataset) {
  const [dist, nhood, blight, dem, sales, disregard, dist_dropdown, nhood_dropdown] = dataset;

  //set bounds
  var sw = [42.1, -83.4458]
  var ne = [42.6, -82.4]
  var bounds = L.latLngBounds(sw, ne);

  var map = L.map('chart', {
    center: [42.3614, -83.08],
    zoom:11,
    maxBounds: bounds,
    minZoom: 11 //https://gis.stackexchange.com/questions/179630/how-to-set-bounds-and-make-map-bounce-back-if-moved-away
  }); //setView(new L.LatLng(42.3314, -83.0458));


  //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
  //referenced: https://leafletjs.com/examples/layers-control/example.html
  var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
      'Data Source: <a href="https://data.detroitmi.gov/">Detroit Open Data Portal</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

	L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}).addTo(map);

  //https://gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map
  //legend
  var legend = L.control({
    position: 'topright'
  });

  //referenced: https://gis.stackexchange.com/questions/127286/home-button-leaflet-map
  var home = {
  lat: 42.3614,
  lng: -83.08,
  zoom: 11
  };

  L.easyButton('fa-home',function(btn,map){
    map.setView([home.lat, home.lng], home.zoom);
  },'Return to City View').addTo(map);

  //referenced: http://www.gistechsolutions.com/leaflet/DEMO/filter/filter.html
  //referenced: https://stackoverflow.com/questions/27748453/mouseover-actions-with-geojson-polygon
  //base layers
  const distGeo = L.geoJSON(dist, {
    style: function (){
      return {"color": 'black',
      "weight": 3,
      "fillColor": 'white',
      "fillOpacity": 0}},
  });

  console.log(distGeo)

  const nhoodGeo = L.geoJSON(nhood, {
    style: function (){
      return {"color": 'black',
      "weight": 3,
      "fillColor": 'white',
      "fillOpacity": 0}},
  });

  //Use Layers to add and remove data, default is by district, 2018, demolitions
  var myData =  L.layerGroup([]);
    myData.addLayer(distGeo);
    myData.addTo(map);

  //http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
  //initialize dropdown
  d3.select("#dropdown")
      .selectAll("option")
      .data(dist_dropdown)
      .enter()
      .append("option")
      .attr("value", d => d.value)
      .text(d => d.text);

  var dropDown = d3.select("#dropdown");

  dropDown.on("change", function() {
    //console.log(d3.event.target.value)
    //Highlight district polygon and zoom
    //referenced: https://gis.stackexchange.com/questions/116159/how-to-style-specific-polygons-from-a-geojson-with-leaflet
    //referenced: https://stackoverflow.com/questions/22796520/finding-the-center-of-leaflet-polygon
    myData.clearLayers();
    map.removeLayer(myData);

    myData.addLayer(distGeo);
    myData.addTo(map);

    var currDrop = d3.event.target.value
    if (currDrop != '0'){
      const dropHighlightDist = L.geoJSON(dist, {
        style: function(feature) {
          if (feature.properties.districts == currDrop){
            //console.log(feature.geometry.coordinates[0][0][0])
            map.setView([feature.geometry.coordinates[0][0][7][1],feature.geometry.coordinates[0][0][7][0]], zoom=12);
            return {color: "yellow", "weight": 5, "fillColor": 'yellow', 'fillOpacity':0.5};
          }
          else {
            return {color: "grey", "weight": 0, "fillColor": 'white', 'fillOpacity':0};
          }
        }
      })
      myData.addLayer(dropHighlightDist)
      myData.addTo(map);
  }
  else {
    map.setView([home.lat, home.lng], home.zoom);
  }
  });


  //If district map box is clicked.
	document.getElementById("c-district-box").addEventListener('click', function(event) {
    myData.clearLayers();
    map.removeLayer(myData);

    myData.addLayer(distGeo);
    myData.addTo(map);

    d3.select("#dropdown")
        .selectAll("option")
        .data([]).exit().remove();

    d3.select("#dropdown")
        .selectAll("option")
        .data(dist_dropdown)
        .enter()
        .append("option")
        .attr("value", d => d.value)
        .text(d => d.text);

      dropDown.on("change", function() {
        myData.clearLayers();
        map.removeLayer(myData);

        myData.addLayer(distGeo);
        myData.addTo(map);

        var currDrop = d3.event.target.value
        if (currDrop != '0'){
          const dropHighlightDist = L.geoJSON(dist, {
            style: function(feature) {
              if (feature.properties.districts == currDrop){
                map.setView([feature.geometry.coordinates[0][0][7][1],feature.geometry.coordinates[0][0][7][0]], zoom=12);
                return {color: "yellow", "weight": 5, "fillColor": 'yellow', 'fillOpacity':0.5};
              }
              else {
                return {color: "grey", "weight": 0, "fillColor": 'white', 'fillOpacity':0};
              }
            }
          })
          myData.addLayer(dropHighlightDist)
          myData.addTo(map);
      }
      else {
        map.setView([home.lat, home.lng], home.zoom);
      }
      });

    });

  //If neighborhood map box is clicked
  document.getElementById("nhood-box").addEventListener('click', function(event) {
    myData.clearLayers();
    map.removeLayer(myData);

    myData.addLayer(nhoodGeo);
    myData.addTo(map);

    d3.select("#dropdown")
        .selectAll("option")
        .data([]).exit().remove();

    d3.select("#dropdown")
        .selectAll("option")
        .data(nhood_dropdown)
        .enter()
        .append('option')
        .attr("value", d => d.value)
        .text(d => d.text);

    var dropDownN = d3.select("#dropdown");

    dropDownN.on("change", function() {
      myData.clearLayers();
      map.removeLayer(myData);

      myData.addLayer(nhoodGeo);
      myData.addTo(map);

      var currDropN = d3.event.target.value
      console.log(currDropN)
      if (currDropN != 'All'){
        const dropHighlightNhood = L.geoJSON(nhood, {
          style: function(feature) {
            if (feature.properties.nhood_name == currDropN){
              map.setView([feature.geometry.coordinates[0][0][7][1],feature.geometry.coordinates[0][0][7][0]], zoom=12.25);
              return {color: "yellow", "weight": 5, "fillColor": 'yellow', 'fillOpacity':0.5};
            }
            else {
              return {color: "grey", "weight": 0, "fillColor": 'white', 'fillOpacity':0};
            }
          }
        })
        myData.addLayer(dropHighlightNhood)
        myData.addTo(map);
    }
    else {
      map.setView([home.lat, home.lng], home.zoom);
    }
    });

    });


  //initalize for plotting points
  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");

  //initalize tooltip for hover
  var tooltip = d3.select('body')
    .append("div")
    .attr("class", "tooltip")
    .text("a simple tooltip")
    .style("opacity", 0)
    .style("z-index", "999");


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

    var cats = []
    var types = []

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

      unique_point.classed('active', false)
        .style('opacity', 0.65)
        .style('fill', '#FF4B1E')
        .style('r', 5.5);

      cats.push('Blight Violation')
      types.push(4.5)
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
        //.ease(d3.easeBounceOut)
          // .attr('r', 10)
          // .attr('opacity', .1)
        .remove();

      unique_point.classed('active', false)
        .style('opacity', 0.65)
        .style('fill', '#133090')
        .style('r', 5.5);

      cats.push('Demolition')
      types.push(2.5)
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

      unique_point.classed('active', false)
        .style('opacity', 0.65)
        .style('fill', '#59AB00')
        .style('r', 5.5);

      cats.push('Public Land Sale')
      types.push(1.5)
    }

    else {
      g.selectAll('.circle-sale').data([]).exit()
        .transition()
        .duration(100)
        .remove();
  }

    legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend'),
        //types = [4.5, 3.5, 1.5],
        //cats = ['Blight Violation', 'Demolition', 'Public Land Sale'],
        labels = [],
        from, to;

      for (var i = 0; i < types.length; i++) {
        from = types[i];
        to = types[i + 1];

        labels.push(
          '<i class="map-circle" style="background:' + getColor(types[i] + 1) + '"> &nbsp; &nbsp; &nbsp</i> ' +
          "&nbsp; &nbsp;" + cats[i]);
      };

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);

  };
};

//referenced: http://bl.ocks.org/d3noob/9267535
//referenced: https://bost.ocks.org/mike/leaflet/
function plotPoints(dataset, map, type, title, tooltip, g, svg){

  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geoTransform({point: projectPoint}),
            path = d3.geoPath().projection(transform);

  dataset.features.forEach(function(d) {
    d.LatLng = new L.LatLng(d.geometry.coordinates[1],
    d.geometry.coordinates[0]);
  });

  if (type == 'sale'){
    var color_fade = '#59AB00'
  }
  else{
    var color_fade = '#133090'
  }
  const join = g.selectAll(".circle-" +type)
             .data(dataset.features)

  var dots = join
             .enter()
             .append('circle')
             .merge(join)
             .attr('class', 'circle circle-'+type)
             .attr('r', 5.5)
             .on("mouseover", function(d){
               d3.select(this)
                .classed('hovered', true)
                .transition().duration(200)
                .attr('r', 8)
                .attr('fill','red');

               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: " + d.properties.price + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.neighborhood + "</dt>"
                        + "<dt>Year: 20" + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX+30)+"px");
               })
            .on("mouseout", function(d){
              //console.log('MOUSEOUT')
              tooltip.style('opacity', 0);
              d3.select(this)
               .classed('hovered', false)
               .transition().duration(300)
               .attr('r', 5.5);})
            .on('click', function(d){ //https://jaketrent.com/post/d3-class-operations/
              unique_point.classed('active', false)
            		.style('opacity', 0.65)
                .style('fill', color_fade)
                .style('r', 5.5);
            	unique_point = d3.selectAll('.circle-'+type)
            		.filter(function(f) {return d.properties.id == f.properties.id && d.geometry.coordinates == f.geometry.coordinates && d.properties.saleDate == f.properties.saleDate})
            		.classed('active', true)
            		.style('opacity', 1)
                .style('fill', 'red');
            	map.setView(d.LatLng, 14.5);
            });

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

  const join = g.selectAll(".circle-" +type)
             .data(dataset.features)

  var dots = join
             .enter()
             .append('circle')
             .merge(join)
             .attr('class', 'circle circle-'+type)
             .attr('r', 5.5)
             .on("mouseover", function(d){
               d3.select(this)
                .classed('hovered', true)
                .transition().duration(200)
                .attr('r', 8);

               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: $" + d.properties.totalDue + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.NHood_Name + "</dt>"
                        + "<dt>Year: 20" + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX+30)+"px");})
            .on("mouseout", function(d){
              tooltip.style('opacity', 0)
              d3.select(this)
               .classed('hovered', false)
               .transition().duration(300)
               .attr('r', 5.5);})
           .on('click', function(d){
             unique_point.classed('active', false)
               .style('opacity', 0.5)
               .style('fill', '#FF4B1E')
               .style('r', 5.5);
             unique_point = d3.selectAll('.circle')
               .filter(function(f) {return d.properties.id == f.properties.id && d.geometry.coordinates == f.geometry.coordinates})
               .classed('active', true)
               .style('opacity', 1)
               .style('fill', 'red');

             // Zoom to selected school on the map
             map.setView(d.LatLng, 14.3);
               });

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

function getColor(d) {
    return d > 5 ? '#FF4B1E' :
           d > 3  ? '#133090' :
           d > 1 ? '#59AB00' :
                      '#FFEDA0';
}

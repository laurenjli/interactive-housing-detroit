// References
// (1) http://bl.ocks.org/d3noob/9211665
// (2) https://leafletjs.com/examples/layers-control/example.html
// (3) https://gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map
// (4) http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
// (5) https://gis.stackexchange.com/questions/127286/home-button-leaflet-map
// (6) http://www.gistechsolutions.com/leaflet/DEMO/filter/filter.html
// (7) https://stackoverflow.com/questions/27748453/mouseover-actions-with-geojson-polygon
// (8) https://gis.stackexchange.com/questions/116159/how-to-style-specific-polygons-from-a-geojson-with-leaflet
// (9) https://stackoverflow.com/questions/22796520/finding-the-center-of-leaflet-polygon
// (10) http://bl.ocks.org/d3noob/9267535
// (11) https://bost.ocks.org/mike/leaflet/
// (12) https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
// (13) https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_fixed_footer
// (14) https://github.com/CliffCloud/Leaflet.EasyButton
// (15) https://www.w3schools.com/howto/howto_css_loader.asp
// (16) https://codepen.io/ericrasch/pen/zjDBx
// (17) http://www.tipue.com/blog/radio-checkbox/
// (18) http://bl.ocks.org/williaster/10ef968ccfdc71c30ef8
// (19) https://gis.stackexchange.com/questions/179630/how-to-set-bounds-and-make-map-bounce-back-if-moved-away
// (20) https://jaketrent.com/post/d3-class-operations/

//referenced: (1) http://bl.ocks.org/d3noob/9211665

var CURR_YEAR = 18;
var unique_point = d3.select(null);
var DROP_VAL = null;

//load data
Promise.all(
  [d3.json("./data/districts.geojson"),
   d3.json("./data/neighborhoods.geojson"),
   d3.json("./data/blight.geojson"),
   d3.json("./data/dem.geojson"),
   d3.json("./data/sales.geojson"),
   d3.json("./data/summary.json"),
   d3.json("./data/dist_dropdown.json"),
   d3.json("./data/nhood_dropdown.json"),
   d3.json('./data/sumbyD_final.json'),
   d3.json('./data/sumbyN_final.json')
  ])
  .then(function(data) {
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

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  document.getElementById("2016-box").addEventListener('click', function(event) {
    CURR_YEAR = 16;

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  document.getElementById("2017-box").addEventListener('click', function(event) {
    CURR_YEAR = 17;

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  document.getElementById("2018-box").addEventListener('click', function(event) {
    CURR_YEAR = 18;

    d3.selectAll('.dot-type').on("change", tableUpdate);
    tableUpdate()
  });

  function tableUpdate() {

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

  	var rows = tbody.selectAll('tr')
  	  .data(summaryYr)
  	  .enter()
  	  .append('tr');

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

//referenced: (18) http://bl.ocks.org/williaster/10ef968ccfdc71c30ef8
function makeBarChart (dataset, reg, type, code, svg, g, tooltip){

  const margin = {
  top: 50,
  left: 45,
  right: 25,
  bottom: 25
  };

  const width = 200 - margin.right - margin.left;
  const height = 250 - margin.top - margin.bottom;


  var xScale = d3.scaleBand()
        .domain(["2015", "2016", "2017", "2018"])
        .range([0, width]);

  var yScale = d3.scaleLinear()
    .domain([0, Math.max(10, d3.max(dataset, d => d.count))])
    .range([height, 0])
    .nice();

  g.append('g')
        .call(d3.axisBottom(xScale))
        .attr('transform', 'translate(0,'+ height + ')')
        .attr('class','x-axis');

  g.select('.y-axis')
        .call(d3.axisLeft(yScale));

  var e = 0;

  if (type == 'Blight Violations'){
    var e = 6
  }
  if (type == 'Demolitions'){
    var e = 4
  }
  if (type == 'Public Land Sales'){
    var e = 2
  }

    const joinB = g.selectAll(".bar")
               .data(dataset, function(d) { return d.year });

    var bars = joinB
      .enter()
      .append("rect")
      .style("fill", getColor(e))
      .attr('class', 'bar rect-'+code)
      .attr("width", 23)
      .attr("x", function(d) { return xScale(d.year) + 7; })
      .attr("y", function(d) { return yScale(d.count); })
      .attr("height", function(d) { return height - yScale(d.count); })
      .on("mouseover", function(d) {
        d3.select(this)
         .classed('hovered', true)
         .transition().duration(200)
         .style('fill','#E80C94');
       tooltip.style('opacity',1)
       tooltip.html("<dl><dt> Total " + type + ": " + numberWithCommas(d.count) + "</dt>"
                + "<dt>Average Amount: $" + numberWithCommas(d.amount) + "</dt>"
                + "<dt>Year: " + d.year + "</dt>")
         .style("top",(d3.event.pageY-10)+"px")
         .style("left",(d3.event.pageX+30)+"px");
      })
      .on("mouseout", function() {
          tooltip.style('opacity', 0);

          d3.select(this)
            .classed('hovered', false)
            .transition().duration(200)
            .style("fill", function() {
              return "" + getColor(e) + "";
          });
      })
      .attr('opacity', 0)
      .transition().duration(1600).delay(200)
      .attr('opacity', 1)

    joinB
      .transition().duration(2000)
      .attr("y", function(d,i) { return yScale(d.count); })
      .attr("height", function(d,i) { return height - yScale(d.count); });

  if (reg == 'district'){
    if (dataset[0].councilDistrict == '0'){
      title1 = 'All Districts'
    }
    else {
    title1 = 'District ' + dataset[0].councilDistrict
    }
  }
  else {
    if (dataset[0].neighborhood == 'All'){
      title1 = dataset[0].neighborhood + ' Neighborhoods'
    }
    else {
      title1 = dataset[0].neighborhood
    }
  }



  const labs = [
    {
      x: `${width/2 + margin.left}`,
      y: margin.top/2,
      label: title1 + ':', //title1 + ': Total ' + type,
      size: 12,
      transform: ''
    },
    {
      x: `${width/2 + margin.left}`,
      y: margin.top/2+12,
      label: 'Total ' + type,
      size: 12,
      transform: ''
    }
  ];
  svg.selectAll('.title').data([]).exit().remove();
  const title = svg.selectAll('.title').data(labs);

  title.enter()
    .append('text')
    .attr('class', 'title')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => d.size)
    .attr('font-family', 'Helvetica')
    .attr('transform', d => d.transform)
    .text(d => d.label);

  title.exit().remove();
};



function makeMap(dataset) {
  const [dist, nhood, blight, dem, sales, disregard, dist_dropdown, nhood_dropdown, barD, barN] = dataset;

  //set bounds
  var sw = [42.1, -83.4458]
  var ne = [42.6, -82.4]
  var bounds = L.latLngBounds(sw, ne);

  //referenced: (19) https://gis.stackexchange.com/questions/179630/how-to-set-bounds-and-make-map-bounce-back-if-moved-away
  var map = L.map('chart', {
    center: [42.3614, -83.08],
    zoom:11,
    maxBounds: bounds,
    minZoom: 11
  });

  //referenced: (2) https://leafletjs.com/examples/layers-control/example.html
  var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
      'Data Source: <a href="https://data.detroitmi.gov/">Detroit Open Data Portal</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

	L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}).addTo(map);

  map.on('load', d3.select('#loader').remove())

  //referenced: (3) https://gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map
  var legend = L.control({
    position: 'topright'
  });

  //referenced: (4) http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
  d3.select("#dropdown")
      .selectAll("option")
      .data(dist_dropdown)
      .enter()
      .append("option")
      .attr("value", d => d.value)
      .text(d => d.text);

  var dropDown = d3.select("#dropdown");

  //set up bar charts
  var tooltip2 = d3.select('body')
    .append("div")
    .attr("class", "tooltip-b")
    .text("a simple tooltip-bar")
    .style("opacity", 0)
    .style("z-index", "999");

  const margin = {
  top: 50,
  left: 45,
  right: 25,
  bottom: 25
  };

  const width = 200 - margin.right - margin.left;
  const height = 250 - margin.top - margin.bottom;

  var svgB = d3.select('#barchart-b')
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top+margin.bottom);


  var gB = svgB.append('g')
      .attr('class', 'wowza')
      .attr('transform', 'translate('+ margin.left+',' +margin.top+')');

  gB.append('g')
    .attr('class', 'y-axis');

  var svgD = d3.select('#barchart-d')
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top+margin.bottom);


  var gD = svgD.append('g')
            .attr('transform', 'translate('+ margin.left+',' +margin.top+')');

  gD.append('g')
    .attr('class', 'y-axis');

  var svgS = d3.select('#barchart-s')
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top+margin.bottom);


  var gS = svgS.append('g')
            .attr('transform', 'translate('+ margin.left+',' +margin.top+')');

  gS.append('g')
    .attr('class', 'y-axis');

  makeBarChart(barD.filter(d => d.councilDistrict == '0' && d.type == 'Blight Violation'), 'district', 'Blight Violations', 'b', svgB, gB, tooltip2);
  makeBarChart(barD.filter(d => d.councilDistrict == '0' && d.type == 'Demolition'), 'district', 'Demolitions', 'd', svgD, gD, tooltip2);
  makeBarChart(barD.filter(d => d.councilDistrict == '0' && d.type == 'Public Land Sale'), 'district', 'Public Land Sales', 's', svgS, gS, tooltip2);

  //referenced: (5) https://gis.stackexchange.com/questions/127286/home-button-leaflet-map
  var home = {
  lat: 42.3614,
  lng: -83.08,
  zoom: 11
  };

  L.easyButton('fa-home',function(btn, map){
    map.setView([home.lat, home.lng], home.zoom);
  },'Return to City View').addTo(map);

  //referenced: (6) http://www.gistechsolutions.com/leaflet/DEMO/filter/filter.html
  //referenced: (7) https://stackoverflow.com/questions/27748453/mouseover-actions-with-geojson-polygon
  //base layers
  const distGeo = L.geoJSON(dist, {
    style: function (){
      return {"color": 'black',
      "weight": 3,
      "fillColor": 'white',
      "fillOpacity": 0}},
  });

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


  dropDown.on("change", function() {
    //Highlight district polygon and zoom
    //referenced: (8) https://gis.stackexchange.com/questions/116159/how-to-style-specific-polygons-from-a-geojson-with-leaflet
    //referenced: (9) https://stackoverflow.com/questions/22796520/finding-the-center-of-leaflet-polygon
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
  };

  makeBarChart(barD.filter(function(d){return d.councilDistrict == currDrop && d.type == 'Blight Violation'}), 'district', 'Blight Violations', 'b', svgB, gB,tooltip2);
  makeBarChart(barD.filter(function(d){return d.councilDistrict == currDrop && d.type == 'Demolition'}), 'district', 'Demolitions', 'd', svgD, gD, tooltip2);
  makeBarChart(barD.filter(function(d){return d.councilDistrict == currDrop && d.type == 'Public Land Sale'}), 'district', 'Public Land Sales', 's', svgS, gS, tooltip2);

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

    var checkBar = document.getElementById('barchart-b');
    if (checkBar == null){
      var testappend = d3.select('.row-bar')
              .append('div')
                .attr('id','barchart-b')
      svgB = testappend.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top+margin.bottom);

      var gB = svgB.append('g')
          .attr('class', 'wowza')
          .attr('transform', 'translate('+ margin.left+',' +margin.top+')');

      gB.append('g')
        .attr('class', 'y-axis');
    }

    makeBarChart(barD.filter(function(d){return d.councilDistrict == '0' && d.type == 'Blight Violation'}), 'district', 'Blight Violations', 'b', svgB, gB, tooltip2);
    makeBarChart(barD.filter(function(d){return d.councilDistrict == '0' && d.type == 'Demolition'}), 'district', 'Demolitions', 'd', svgD, gD, tooltip2);
    makeBarChart(barD.filter(function(d){return d.councilDistrict == '0' && d.type == 'Public Land Sale'}), 'district', 'Public Land Sales', 's', svgS, gS, tooltip2);

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
      };

      makeBarChart(barD.filter(function(d){return d.councilDistrict == currDrop && d.type == 'Blight Violation'}), 'district', 'Blight Violations', 'b', svgB, gB, tooltip2);
      makeBarChart(barD.filter(function(d){return d.councilDistrict == currDrop && d.type == 'Demolition'}), 'district', 'Demolitions', 'd', svgD, gD, tooltip2);
      makeBarChart(barD.filter(function(d){return d.councilDistrict == currDrop && d.type == 'Public Land Sale'}), 'district', 'Public Land Sales', 's', svgS, gS, tooltip2);

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

    d3.selectAll('#barchart-b').remove();

    makeBarChart(barN.filter(function(d){return d.neighborhood == 'All' && d.type == 'Demolition'}), 'neighborhood', 'Demolitions', 'd', svgD, gD, tooltip2);
    makeBarChart(barN.filter(function(d){return d.neighborhood == 'All' && d.type == 'Public Land Sale'}), 'neighborhood', 'Public Land Sales', 's', svgS, gS, tooltip2);


    dropDownN.on("change", function() {
      myData.clearLayers();
      map.removeLayer(myData);

      myData.addLayer(nhoodGeo);
      myData.addTo(map);

      var currDropN = d3.event.target.value

      if (currDropN != 'All'){
        const dropHighlightNhood = L.geoJSON(nhood, {
          style: function(feature) {
            if (feature.properties.new_nhood == currDropN){
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

        makeBarChart(barN.filter(function(d){return d.neighborhood == currDropN && d.type == 'Demolition'}), 'neighborhood', 'Demolitions', 'd', svgD, gD, tooltip2);
        makeBarChart(barN.filter(function(d){return d.neighborhood == currDropN && d.type == 'Public Land Sale'}), 'neighborhood', 'Public Land Sales', 's', svgS, gS, tooltip2);

    }
    else {
      map.setView([home.lat, home.lng], home.zoom);

      makeBarChart(barN.filter(function(d){return d.neighborhood == currDropN && d.type == 'Demolition'}), 'neighborhood', 'Demolitions', 'd', svgD, gD, tooltip2);
      makeBarChart(barN.filter(function(d){return d.neighborhood == currDropN && d.type == 'Public Land Sale'}), 'neighborhood', 'Public Land Sales', 's', svgS, gS, tooltip2);
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
      plotPoints(reformat(demCurr), map, 'dem', 'Demolition', tooltip, g, svg, barD, barN, tooltip2);
      g.selectAll('.circle-dem').data(reformat(demCurr).features).exit()
        .transition()
        .duration(100)
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
      plotPoints(reformat(salesCurr), map, 'sale', 'Public Land Sale', tooltip, g, svg, barD, barN);
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

//referenced: (10) http://bl.ocks.org/d3noob/9267535
//referenced: (11) https://bost.ocks.org/mike/leaflet/
function plotPoints(dataset, map, type, title, tooltip, g, svg, barD, barN, tooltip2){

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
                .attr('fill','#F70CDC');

               tooltip.transition().duration(100).style('opacity',1)
               tooltip.html("<dl><dt> Type: " + title + "</dt>"
                        + "<dt>Amount: " + d.properties.price + "</dt>"
                        + "<dt>Council District: " + d.properties.councilDistrict + "</dt>"
                        + "<dt>Neighborhood: " + d.properties.neighborhood + "</dt>"
                        + "<dt>Year: 20" + d.properties.year + "</dt>")
                 .style("top",(d3.event.pageY-10)+"px")
                 .style("left",(d3.event.pageX+30)+"px");
               })
            .on("mouseout", function(d, barD){
              tooltip.style('opacity', 0);
              d3.select(this)
               .classed('hovered', false)
               .transition().duration(300)
               .attr('r', 5.5);})
            .on('click', function(d, barD){ //referenced: (20) https://jaketrent.com/post/d3-class-operations/
              unique_point.classed('active', false)
            		.style('opacity', 0.65)
                .style('fill', color_fade)
                .style('r', 5.5);
            	unique_point = d3.selectAll('.circle-'+type)
            		.filter(function(f) {return d.properties.id == f.properties.id && d.geometry.coordinates == f.geometry.coordinates && d.properties.saleDate == f.properties.saleDate})
            		.classed('active', true)
            		.style('opacity', 1)
                .style('fill', '#F70CDC');
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
               .style('fill', '#F70CDC');

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

//referenced: (12) https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

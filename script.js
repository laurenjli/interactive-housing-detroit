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
   d3.json("./data/blight.json"),
   d3.json("./data/dem.json"),
   d3.json("./data/sales.json"),
   d3.json("./data/summary.json")
  ])
  .then(function(data) {
    console.log(data)
    makeVis(data)
    //makeDistrictDotMap(data)
    //makeNHoodDotMap(data)
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
  const [dist, nhood, blight, dem, sales, summary] = dataset;

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

  var demCurr = dem.filter(d => d.year == CURR_YEAR);
  //demDots(demCurr,map)
  var demGroup = demDots(demCurr);
  demGroup.addTo(map);


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


  //Handle different years
  document.getElementById("2015-box").addEventListener('click', function(event) {
    CURR_YEAR = 15;

    demCurr = dem.filter(d => d.year == CURR_YEAR);
    demDots(demCurr, map);

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

  });
  document.getElementById("2016-box").addEventListener('click', function(event) {
    CURR_YEAR = 16;

    demCurr = dem.filter(d => d.year == CURR_YEAR);
    demDots(demCurr, map);

  });
  document.getElementById("2017-box").addEventListener('click', function(event) {
    CURR_YEAR = 17;

    demCurr = dem.filter(d => d.year == CURR_YEAR);
    demDots(demCurr, map);

  });
  document.getElementById("2018-box").addEventListener('click', function(event) {
    CURR_YEAR = 18;

    demCurr = dem.filter(d => d.year == CURR_YEAR);
    demDots(demCurr, map);

  });





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

}


function blightDots(blightCurr, map){

  for (var i = 0; i < Object.keys(blightCurr).length; i += 1) {
    var b_descrip = "<dl><dt>Type: Blight Violation</dt>"
         + "<dt>Final Fine Amount: " + blightCurr[i].totalDue + "</dt>"
         + "<dt>Council District: " + blightCurr[i].councilDistrict + "</dt>"
         + "<dt>Neighborhood: " + blightCurr[i].NHood_Name + "</dt>"
         + "<dt>Year: " + blightCurr[i].year + "</dt>";
      L.circleMarker([blightCurr[i].lat, blightCurr[i].long], {
        //renderer: myRenderer,
        color: '#ED9007',
        fillColor: '#ED9007',
        fillOpacity: 0.75,
        radius: 1
      }).addTo(map).bindPopup(b_descrip);
  };

}

function demDots(demCurr, map){
  var group_temp2 = L.layerGroup()
  for (var i = 0; i < Object.keys(demCurr).length; i += 1) {
    var d_descrip = "<dl><dt>Type: Demolition</dt>"
         + "<dt>Cost: " + demCurr[i].price + "</dt>"
         + "<dt>Council District: " + demCurr[i].councilDistrict + "</dt>"
         + "<dt>Neighborhood: " + demCurr[i].neighborhood + "</dt>"
         + "<dt>Year: " + demCurr[i].year + "</dt>";
    	L.circleMarker([demCurr[i].lat, demCurr[i].long], {
      	//renderer: myRenderer,
        color: '#14E5D0',
        fillColor: '#14E5D0',
        fillOpacity: 0.75,
        radius: 1
      }).bindPopup(d_descrip)
      .on('mouseover', function (e) {
        this.openPopup();
      })
      .on('mouseout', function (e) {
        this.closePopup();
      })
      .addTo(group_temp2);
  };
  return group_temp2;
}

function saleDots(salesCurr, map){
  for (var i = 0; i < Object.keys(salesCurr).length; i += 1) {

    var s_descrip = "<dl><dt>Type: Public Land Sale</dt>"
         + "<dt>Sale Price: " + salesCurr[i].price + "</dt>"
         + "<dt>Council District: " + salesCurr[i].councilDistrict + "</dt>"
         + "<dt>Neighborhood: " + salesCurr[i].neighborhood + "</dt>"
         + "<dt>Year: " + salesCurr[i].year + "</dt>";

  	L.circleMarker([salesCurr[i].lat, salesCurr[i].long], {
    	//renderer: myRenderer,
      color: '#8C82FA',
      fillColor: '#8C82FA',
      fillOpacity: 0.05,
      radius: 1
    }).addTo(map).bindPopup(s_descrip);
  };
}

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";


d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  function radiusSize(magnitude) {
      return magnitude * 15000;
  }

  function circleColor(depth) {
      if (depth <10) {
          return "white"
      }
      else if (depth <20) {
          return "beige"
      }
      else if (depth <40) {
          return "pink"
      }
      else if (depth <60) {
          return "red"
      }
      else if (depth <80) {
          return "crimson"
      }
      else {
          return "black"
      }
  }

  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(earthquakeData, latlng) {
          return L.circle(latlng, {
              radius: radiusSize(earthquakeData.properties.mag),
              color: circleColor(earthquakeData.geometry.coordinates[2]),
              fillOpacity: 0.75
          });
      },
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}


function createMap(earthquakes) {

  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  })
  
  var faultLine = new L.LayerGroup;

  var baseMaps = {
    "Plain Map": street,
    "Topographic Map": topo
  };

  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  var myMap = L.map("map", {
    center: [
      26.59, 127.98
    ],
    zoom: 4,
    layers: [street, earthquakes, faultLine]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json";

d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
        style: function() {
            return {colorfill: "yellow", fillOpacity: 0}
        }
    }).addTo(faultLine)
})

function getColor(d) {
    return d > 80 ? 'black' :
           d > 60  ? 'crimson' :
           d > 40  ? 'red' :
           d > 20  ? 'pink' :
           d > 10 ? 'beige' :
                    'white';
  }

  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 10, 20, 40, 60, 80],
          labels = [];
  
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}

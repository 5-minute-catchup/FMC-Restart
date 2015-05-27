(function() {
  "use strict";
  var map;
  var markers = [];
  var socket = io.connect('https://fivemincatchup.herokuapp.com');

  var getUser = document.getElementById("map-canvas");

  console.log(getUser.dataset.name);
  console.log(getUser.dataset.image);

  console.log(getUser);

  function initialize() {
    var mapOptions = {
      zoom: 16
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
 
    google.maps.event.addDomListener(window, 'load', initialize);
    google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
    });
 
    /*Try HTML5 geolocation*/
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: '<IMG BORDER="0" ALIGN="Left" SRC=' + getUser.dataset.image + '>'
        });
        map.setCenter(pos);

        /*emit the marker*/
        socket.emit('marker', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, function() {
        handleNoGeolocation(true);
      });
 
    } else {
      /*Browser doesn't support Geolocation*/
      handleNoGeolocation(false);
    }
  }
 
  socket.on('show-marker', function(data) {
    var position = new google.maps.LatLng(data.lat, data.lng);
    add_new_marker(position, data.socketId);
 
    navigator.geolocation.getCurrentPosition(function(position) {
      socket.emit('show-user-location', {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
    });
  });
 
  socket.on('show-user-location', function(data) {
    console.log(data);
    var position = new google.maps.LatLng(data.lat, data.lon);
    add_new_marker(position, 'user2');
  });
 
  function add_new_marker(location, text) {
    var mapOptions = {
      zoom: 6,
      center: location
    };

    var marker = new google.maps.InfoWindow({
      position: location,
      title:"Found User!",
      content: '<IMG BORDER="0" ALIGN="Left" SRC=' + getUser.dataset.image + '>'
    });
 
    /*To add the marker to the map, call setMap();*/
    marker.setMap(map);
  }
 
  function handleNoGeolocation(errorFlag) {
    var content = 'Found user';
 
    if (errorFlag) {content = 'Error: Your browser doesn\'t support geolocation.';}
 
    var options = {
      map: map,
      position: new google.maps.LatLng(60, 105),
      content: content
    };
 
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }
  google.maps.event.addDomListener(window, 'load', initialize);
}());
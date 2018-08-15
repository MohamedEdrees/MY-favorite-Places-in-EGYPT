// Creating our Locations Data -Model-
var locations = [
    {title: 'Mansoura', location: {lat: 31.040948, lng: 31.37847}},
    {title: 'Alexandria', location: {lat: 31.200092, lng: 29.918739}},
    {title: 'Marsa Matruh', location: {lat: 31.354345, lng: 27.237316}},
    {title: 'Tanta', location: {lat:  30.831419, lng: 30.964687}},
    {title: 'Cairo', location: {lat: 30.04442, lng: 31.235712}},
];
// Creating the ViewModel of the app
var AppViewModel=function(){
  // Declaring variables , arrays , observables that we will use later
  this.map;
  this.markers = [];
  this.OAM = ko.observableArray();
  this.filterQuery = ko.observable();
  this.SOAM = ko.observableArray();
  this.infowindow;
  this.marks = [];
  this.bounceHandler="";
  // Google Maps callback function
	this.initMap =function(){
      // creating the basic map
    	map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 30.023696, lng: 31.207232},
          zoom: 7,
          mapTypeControl: false
      });
      // looping through all the locations to create markers
		  for (var i = 0; i < locations.length; i++) {
        	  // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          // setting bounceHandler as a marker to use it later as a marker animtaion
          bounceHandler = new google.maps.Marker();
          var marker = new google.maps.Marker({
              map : map,
              position: position,
              title: title,
              animation: google.maps.Animation.DROP,
              id: i,
          });
          // pushing the markers to both markers array and OAM -Observable Array Marker- to use them later
          markers.push(marker);
          OAM.push(marker);
          // setting infowindow as an InfoWindow 
          infowindow = new google.maps.InfoWindow({
              maxWidth: 250
          });
          marker.addListener('click', function() {
              itemClick(this);	
          });
		  }
      // Show Lists click event
		  $('#show-listings').click(function(){
  		    showListings();
		  });
      // Hide Lists click event
		  $('#hide-listings').click(function(){
  		    hideListings();
		  });	
	}
  // Search input function , compares between the input and the data in OAM and if it found them it pushes them to SOAM -Search Observable Array Marker-
  this.filterQueryResult=function(){
      for (var i = 0; i < OAM().length; i++) {
          if(OAM()[i].title.toLowerCase().includes(filterQuery().toLowerCase())){
              var m = OAM()[i];
              SOAM.push(m);
          }
      // This will hide the list and shows only the list that we searched for
      $("#list-origin").hide();
      $("#list-filter").show();
      }
      // Making an array of markers that we will display them in the map -for the search input-
      for (var i = 0;i<SOAM().length;i++){
          marks.push(SOAM()[i]);
      }
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
      var bounds = new google.maps.LatLngBounds();
      // Extend the boundaries of the map for each marker and display the marker
      for (var i = 0; i < marks.length; i++) {
          marks[i].setMap(map);
          bounds.extend(marks[i].position);
      }
      map.fitBounds(bounds);
      $("#filter-button").hide();
  }
  // Clear Filter function
  this.filterQueryUncheck = function(){
      $("#list-filter").hide();
      $("#list-origin").show();
      SOAM.removeAll();
      filterQuery(null);
      marks=[];
      showListings();
      $("#filter-button").show();
  }
  // creating and displaying the content of the infowindow
  this.itemClick= function(obj){
      var content = "Articles from NYTimes about this area : "+"<br>";
      var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + obj.title + '&sort=newest&api-key=7560cd69c86146ae9ae0397cfb204fc8';
      $.ajax({
          url: nytimesUrl,
          success: function( response ) {
              var articles = response.response.docs;
              for (var i = 0; i < 5; i++) {
                  var article = articles[i];
                  content += i+1 +"- "+"<a style='color: #17a2b8' href="+article.web_url+">"+article.snippet+"</a>"+"<br><br>";
              };
              infowindow.setContent(content);
          }
      }).fail(function() {
          infowindow.setContent("<p>Sorry, couldn't get articles from NewYork Times!</p>");
      });
      infowindow.open(map, obj);
      // setting the bounce animation on the marker to null to avoid multiple bounce markers
      if (bounceHandler != obj) {
          bounceHandler.setAnimation(null);
          bounceHandler = obj;
          obj.setAnimation(google.maps.Animation.BOUNCE);
      }
  }
  // show Markers on the map
	this.showListings= function(){
      var bounds = new google.maps.LatLngBounds();
      // Extend the boundaries of the map for each marker and display the marker
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
      }
      map.fitBounds(bounds);
	}
  // Hide Markers from the map
	this.hideListings= function(){
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
	}
}
ko.applyBindings(AppViewModel());
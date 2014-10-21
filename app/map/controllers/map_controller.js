angular.module('cafehopApp.controllers').controller('MapController', 
    ['$scope', '$http', 'CafeService', 'MapCafes', 'MapDefaults', 
    function($scope, $http, CafeService, MapCafes, MapDefaults){
    
    $scope.markers = [];
    $scope.cafes = [];
    $scope.initialized = false;
    $scope.windowShowing = 0;
    $scope.mapDefaults = MapDefaults;
    $scope.legend = MapDefaults.legend;

    $scope.icons = {
        current: "assets/images/map-icons/chkl-pin-me.png",
        cafe: "assets/images/map-icons/chkl-pin-03.png",
        cafeClosed: "assets/images/map-icons/chkl-pin-01.png",
    }

    $scope.fitMarkerBounds = function(){
        var bounds = new google.maps.LatLngBounds();

        angular.forEach($scope.markers, function(marker, index){
            var coords = marker.coords;
            bounds.extend(new google.maps.LatLng(coords.latitude, coords.longitude));
        });

        $scope.instance.panToBounds(bounds);
    }

    $scope.currentMarkerDragStart = function(marker, e, model){
        // Close infowindow
        if($scope.windowMarker && $scope.windowMarker.idKey == model.idKey){
            $scope.windowMarker.show = false;
        }
    }

    // When current location marker is moved
    $scope.currentMarkerDragEnd = function(marker, e, model){

        var latlng = marker.getPosition();
        $scope.instance.panTo(latlng);
        $scope.cafes = MapCafes.getCafes({
            ll: latlng.lat() + "," + latlng.lng(),
            success: $scope.addMarkers,
        });
    }

    $scope.placeDefaultUser = function(marker){
        marker.coords = $scope.mapDefaults.center;
        var latlng = new google.maps.LatLng($scope.mapDefaults.center.latitude, $scope.mapDefaults.center.longitude);
        $scope.instance.panTo(latlng);
    }

    $scope.ready = function(map){
        if($scope.initialized){
            return;
        }

        $scope.instance = map;
        $scope.$apply(function(){
            $scope.userMarker = {
                idKey: $scope.markers.length, 
                icon: $scope.icons.current,
                options:{
                    draggable: true
                },
                window: {
                    options: $scope.mapDefaults.marker.windowOptions,
                }
            };

            // Set KL as center if no user's location
            $scope.placeDefaultUser($scope.userMarker)
            
            // Get current user location
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(pos){
                    $scope.userMarker.coords = pos.coords;
                    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    $scope.instance.panTo(latlng);
                    $scope.windowShowing = $scope.userMarker.idKey;
               });
            }

            $scope.markers.push($scope.userMarker);
            $scope.cafes = MapCafes.getCafes({success: $scope.addMarkers});
            $scope.fitMarkerBounds();
            $scope.setWindowMarker($scope.userMarker);
            $scope.initialized = true;
        });
    }

    $scope.map = {
        center: angular.copy($scope.mapDefaults.center),
        zoom: 13,
        events: {
            tilesloaded: $scope.ready
        },
        options: {
            scrollwheel: false,
            mapTypeControl: false
        }
    };

    $scope.markerEvents = {
        dragend: $scope.currentMarkerDragEnd,
        dragstart: $scope.currentMarkerDragStart,

    }

    $scope.addMarkers = function(cafes){
        // Create markers for each cafe
        angular.forEach(cafes, function(cafe, index){
            var m = {
                idKey: $scope.markers.length,
                icon: cafe.venue.hours.isOpen? $scope.icons.cafe : $scope.icons.cafeClosed,
                coords: {
                    latitude: cafe.venue.location.lat,
                    longitude: cafe.venue.location.lng
                },
                cafe: cafe.venue,
                window: {
                    iconVisible: true,
                    closeClick: true,
                    options: $scope.mapDefaults.marker.windowOptions
                },
                options:{
                    title: cafe.venue.name,
                    draggable: false
                },
            }
            $scope.markers.push(m)
        });
    };

    $scope.goToCafe = function(cafe){
        $location.path('/cafe')
    }

    $scope.setWindowMarker = function(marker){
        $scope.windowMarker = marker;
        $scope.windowMarker.show = true;
    }
    
    $scope.onMarkerClick = function(marker, event, model){
        $scope.setWindowMarker(model);
    }

}]);

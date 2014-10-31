angular.module('cafehopApp.services').service('CafeService', ['$http', function ($http) {
    var cafe = {};

    function getDirectionLink(cafe){
        var ll = cafe.ll;
        var desc = cafe.name + ", " + cafe.address1
        
        if(cafe.address2){
            desc += " " + cafe.address2;
        }
        
        var city = cafe.city? encodeURIComponent(cafe.city) : "" ;
        
        ll = encodeURIComponent(ll);
        desc = encodeURIComponent(desc)

        var linkToLoc = "http://maps.google.com/maps?f=d"
            + "&near=" + city
            + "&ll=" + ll
            + "&daddr=" + desc 
            + "&iwloc=addr&iwd=1" 

        return linkToLoc;
    }

    var service = {
        cafe: {},
        init: function(){
            this.cafe = {};
        },
        getCafe: function(options) {
            // Get cafes 
            var url = "http://cafehop.my/api/sherminn/cafe.php";
            $http({
                url: url,
                method: 'GET',
                params: {
                    id: options.id,
                },
            }).success(function(data){
                service.cafe = data.response.store;
                service.initCafe();

                if(options.success){
                    options.success(data);
                }
            }).error(function(){
                console.error(url + " cannot be accessed.");
            });
            return cafe;
        },

        getCafeNameAddress: function(cafe) {
            var nameAddr = cafe.name + ", "; 
            var addr1 = cafe.address1 || "";
            var addr2 = cafe.address2 || "";
            var city = cafe.city || "" ;
            
            nameAddr += addr1 + ", " + city;
            console.log(nameAddr);
            return nameAddr
        },

        setCafe: function(value) {
            cafe = value;
        },

        initCafe: function(cafe) {
            if(!cafe){
                cafe = service.cafe;
            }
            cafe.directions = getDirectionLink(cafe);
        }
    };

    return service;
}]);

var offline = false;

if(!offline){
  var dotmarksUrl = "http://dotmarks.dev:5000/dotmarks";
  var auditUrl =  "http://dotmarks.dev:5000/logs";
}else{
  var dotmarksUrl = "http://dotmarks.dev:8000/app/offline-dotmarks.json";
  var dotmarksUrl = "http://localhost:8000/app/offline-dotmarks.json";
}

angular.module('dotApp').factory('appaudit', ['$http', function($http) {
    return {
        clickDotMark: function(id){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'click';
            return $http.post( auditUrl, JSON.stringify(o));
        },
        starDotMark: function(id, star){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'star';
            o['value'] = '' + star;
            return $http.post( auditUrl, JSON.stringify(o));
        },


    };
}]);

angular.module('dotApp').factory('api', ['$http', function($http) {
    return {
        getDotMarksEntries: function() {
            return $http.get(dotmarksUrl);
        },
        saveDotMark: function(entry) {
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            return $http.post(dotmarksUrl, entry, config);
        },

        getDotMarksByTag: function(tag){
             var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            var tagFilter = "?where={\"tags\": \"" + tag + "\"}";
            return $http.get(dotmarksUrl + tagFilter, config);

        },
        searchDotMarks: function(query){
            var filter = "?where={\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}}, {\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}";
            return $http.get(dotmarksUrl + filter);
        },
    };
}]);
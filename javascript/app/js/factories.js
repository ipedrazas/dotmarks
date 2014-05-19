
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
            var filter = "?where={\"$or\":[{\"tags\":\"" + tag + "\"},{\"atags\":\"" +  tag + "\"}]}";
            return $http.get(dotmarksUrl + filter, config);

        },
        searchDotMarks: function(query){
            var filter = "?where={\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}}, {\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}";
            return $http.get(dotmarksUrl + filter);
        },
    };
}]);


angular.module('dotApp').factory('AuthService', function ($http, Session) {
  return {
    login: function (credentials) {
      return $http
        .post('/login', credentials)
        .then(function (res) {
          Session.create(res.id, res.userid, res.role);
        });
    },
    isAuthenticated: function () {
      return !!Session.userId;
    },
    isAuthorized: function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (this.isAuthenticated() &&
        authorizedRoles.indexOf(Session.userRole) !== -1);
    }
  };
});

angular.module('dotApp').service('Session', ['$cookies',
  function ($cookies) {
    this.create = function (id, name){
      $cookies['id'] = id;
      $cookies['name'] = name;
    };

    this.destroy = function () {
      $cookies['id'] = null;
      $cookies['name'] = null;
    };

    this.get = function(key){
      return $cookies[key];
    }
    return this;
}]);
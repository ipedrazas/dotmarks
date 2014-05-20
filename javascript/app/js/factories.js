
var offline = false;

if(!offline){
  var dotmarksUrl = "http://dotmarks.dev:5000/dotmarks";
  var auditUrl =  "http://dotmarks.dev:5000/logs";
  var authUrl = "http://dotmarks.dev:5000/users/";
}else{
  var dotmarksUrl = "http://dotmarks.dev:8000/app/offline-dotmarks.json";
  var auditUrl = "http://localhost:8000/app/offline-dotmarks.json";
  var authUrl = "http://dotmarks.dev:5000/users/";
}



angular.module('dotApp').factory('appauth', ['$http', 'Base64', function($http, Base64) {
    return {

        login: function(username, password){
            var token = Base64.encode(username + ':' + password);
            $http.defaults.headers.common = {"Access-Control-Request-Headers": "Accept, Origin, Authorization, Access-Control-Allow-Origin"};
            $http.defaults.headers.common = {"Access-Control-Allow-Origin": "http://dotmarks.dev:8000"};
            $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
            var config = {
                headers: {
                    "Authorization": "Basic " + token,
                    "Access-Control-Allow-Origin": "http://dotmarks.dev:8000",
                },
                responseType: "application/json",
            };
            return $http.get( authUrl + username, config);
        },


    };
}]);

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
            $http.defaults.headers.common = {"Access-Control-Request-Headers": "accept, origin, authorization"};  //you probably don't need this line.  This lets me connect to my server on a different domain
            $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('ivan' + ':' + 'ivan');
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

angular.module('dotApp').factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

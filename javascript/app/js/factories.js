
var offline = false;

if(!offline){
  var dotmarksUrl = "http://dotmarks.dev:5000/dotmarks";
  var auditUrl =  "http://dotmarks.dev:5000/logs/";
  var authUrl = "http://dotmarks.dev:5000/users/";
}else{
  var dotmarksUrl = "http://dotmarks.dev:8000/app/offline-dotmarks.json";
  var auditUrl = "http://localhost:8000/app/offline-dotmarks.json";
  var authUrl = "http://dotmarks.dev:5000/users/";
}

var config = {
    headers: {
        "Content-Type": "application/json",
    },
    responseType: "application/json",
};



angular.module('dotApp').factory('appauth',  ['$http', '$rootScope', 'Base64', function($http, $rootScope, Base64) {
    return {

        login: function(username, password){
            var token = Base64.encode(username + ':' + password);
            $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
            return $http.get( authUrl + username);
        },
        signup: function(username, password){
            var o = {};
            o['username'] = username;
            o['password'] = password;
            return $http.post(authUrl, JSON.stringify(o));
        },
        logout: function(username){
            var token = Base64.encode(' : ');
            $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
            return $http.get( authUrl + username);
        },

    };
}]);

angular.module('dotApp').factory('appaudit', ['$http', 'localStorageService', function($http, localStorageService){
    return {
        clickDotMark: function(id){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'click';
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post( auditUrl, JSON.stringify(o), config);
        },
        starDotMark: function(id, star){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'star';
            o['value'] = '' + star;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post( auditUrl, JSON.stringify(o));
        },


    };
}]);

angular.module('dotApp').factory('api', ['$http', 'localStorageService', function($http, localStorageService) {


    return {
        getDotMarksEntries: function(params) {
            var username = localStorageService.get('username');
            var dest = dotmarksUrl + '?where={"username":"' + username + '"}&sort=[("views",-1)]';
            if(params.page !== undefined){
                return $http.get(dest + "&page=" + params.page);
            }else{
                return $http.get(dest);
            }

        },
        saveDotMark: function(entry) {
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
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
            var username = localStorageService.get('username');
            // var filter = "?where={\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}}, {\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}";
            var filter = "?where={\"$and\":[{\"username\": \"" + username +"\"}, {\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}},{\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}]}";
            return $http.get(dotmarksUrl + filter);
        },
        getDotMark: function(id){
            return $http.get(dotmarksUrl + "/" + id);
        }
    };
}]);


angular.module('dotApp').factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

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

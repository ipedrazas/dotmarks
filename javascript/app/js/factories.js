

angular.module('dotApp').factory('appauth',  ['$http', '$rootScope', 'Base64',
    function($http, $rootScope, Base64) {
    return {

        login: function(username, password){
            var config = {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    // "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            var token = Base64.encode(username + ':' + password);
            log(token);
            $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
            $http.defaults.headers.common['mozSystem'] = true;
            return $http.get( authUrl + username);
        },

        signup: function(username, password, email){
            var o = {};
            o['username'] = username;
            o['password'] = password;
            o['email'] = email;
            return $http.post(authUrl, JSON.stringify(o));
        },

        logout: function(username){

            var token = Base64.encode(' : ');
            $http.defaults.headers.common['Authorization'] = 'Basic ' + token;
            var config = {
                headers: {
                    // "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                // responseType: "application/json",
            };
            return $http.get( authUrl + username, config);
        },

        sendMailReset: function(email){
            var o = {};
            o['email'] = email;

            var config = {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, GET, POST, HEAD",
                    "Content-Type": "application/json",
                    // "Access-Control-Request-Headers": "accept, origin, x-requested-with",
                    // "Access-Control-Request-Headers": "*"
                },
                // responseType: "application/json",
            };
            return $http.post( passwordUrl + 'sendMailReset', JSON.stringify(o), config);

        },
        resetPassword: function(password, token){
            var o = {};
            o['password'] = password;
            o['token'] = token;
            var config = {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, GET, POST, HEAD",
                    "Access-Control-Request-Headers": "accept, origin, x-requested-with",
                    // "Access-Control-Request-Headers": "*"
                },
                // responseType: "application/json",
            };
            // var BASE_URL = "http://api.dotmarks.dev:5000/";
            log(o);
            return $http.post( passwordUrl + 'resetPassword', JSON.stringify(o), config);
        }
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
            var dest = dotmarksUrl + '?where={"username":"' + username + '"}&sort=[("views",-1)]&d=' + Date.now();
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
            var filter = "?where={\"$and\":[{\"username\": \"" + username +"\"}, {\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}},{\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}]}";
            return $http.get(dotmarksUrl + filter);
        },
        getDotMark: function(id){
            return $http.get(dotmarksUrl + "/" + id);
        },
        updateDotMark: function(dotmark) {
            log("updating " + dotmark._id);
            log(dotmark);
            var config = {
                headers: {
                    "Content-Type": "application/json",
                    "X-HTTP-Method-Override": "PATCH",
                },
                responseType: "application/json",
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post(dotmarksUrl + "/" + dotmark._id, dotmark, config);
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

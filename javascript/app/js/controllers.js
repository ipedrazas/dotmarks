'use strict';

function log(entry){
    if( console && console.log ) {
            console.log(entry);
    }
}

function reduce(arr) {
    var tags = [], a = [], b = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }

    for ( var i = 0; i < a.length; i++ ) {
        tags.push({label: a[i], count: b[i]});
    }
    return tags

}


Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + "/" + (mm[1]?mm:"0"+mm[0]) + "/" + (dd[1]?dd:"0"+dd[0]); // padding
  };



/* Controllers */

angular.module('dotApp').controller('terminalCtl', ['$scope', 'api', '$routeParams', function ($scope, api, $routeParams) {
    $scope.execute = function(){
      log($scope.terminal);
    };
    $scope.bulkImport = function(){
        var params = new Array();
        var data = $scope.terminal;
        // curl -d '[{"firstname": "barack", "lastname": "obama"}, {"firstname": "mitt", "lastname": "romney"}]' -H 'Content-Type: application/json' http://eve-demo.herokuapp.com/people
        var urls = data.split("\n");
        _.each(urls, function(el) {
          var o = {};
          o['username'] = 'ivan';
          o['url'] = el;
          params.push(o);
        });
        api.saveDotMark(JSON.stringify(params)).success(function(data){
            log(data);
            $scope.terminal = $scope.terminal + "\n\nResults:\n"
            _.each(data, function(element){
                log(element);
                if(element._status == 'OK'){
                    $scope.terminal = $scope.terminal + "[OK] - " + element._links.self.href + "\n";
                }
                if(element._status == 'ERR'){
                    $scope.terminal = $scope.terminal + "[FAILED] - " + element._issues.url + "\n";
                }
            });
        });

    };
}]);

angular.module('dotApp').controller('dotMarkController', ['$scope', 'api', 'appaudit', '$routeParams', function ($scope, api, appaudit, $routeParams) {
  	$scope.refreshEntries = function(){
        api.getDotMarksEntries().success(function processDotMarks(data) {
            var elems = new Array();
            var etags = new Array();
            var atags = new Array();
             _.each(data._items, function(item){
                elems.push(item);
                atags.push.apply(atags, item.atags);
                _.each(item.tags, function(tag) {
                    etags.push(tag.toLowerCase());
                });
             });
             log(elems);
             $scope.dotmarks = elems;
             $scope.tags = reduce(etags);
             $scope.atags = reduce(atags);
        });
    };

    $scope.getTags = function(){
        api.getDotMarksByTag($routeParams.tag).success(function (data) {
            var elems = new Array();
            // var etags = new Array();
             _.each(data._items, function(item){
                elems.push(item);
                // _.each(item.tags, function(tag) {
                //     etags.push(tag.toLowerCase());
                // });
             });
             $scope.dotmarks = elems;
             // $scope.tags = reduce(etags);
        });
    };

    $scope.searchDotMarks = function(query){
        api.searchDotMarks(query).success(function (data) {
            var elems = new Array();
             _.each(data._items, function(item){
                elems.push(item);
             });
             $scope.dotmarks = elems;
        });
    };

    $scope.starDotMark = function(id, star){
        log(id);
        _.each($scope.dotmarks, function(item) {
             if(id == item._id){
                item.star = star;
                appaudit.starDotMark(id, star);
             }
        });
    };

    if($routeParams.tag !== undefined){
        $scope.getTags();
    }else{
        $scope.refreshEntries();
    }


  }]);

angular.module('dotApp').directive('a', ['appaudit', function (appaudit) {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(scope.dotmark !== undefined){
                elem.on('click', function(e){
                    scope.dotmark.views++;
                    appaudit.clickDotMark(scope.dotmark._id);
                    scope.refreshEntries();
                });
            }
        }
   };
}]);

angular.module('dotApp').directive('typing', ['$http', function () {
    return function (scope, element, attrs) {
      element.bind('keyup', function () {
        if(element.text().length > 2){
            scope.searchDotMarks(element.text());
        }else if(element.text().length == 0){
            scope.refreshEntries();
        }
      });
    };
  }]);
angular.module('dotApp').directive('targetUrl2', ['appaudit', function (appaudit) {
    return function (scope, element, attrs) {
      element.bind('click', function (event) {
            var source_id = element.attr('data-origin');
            appaudit.clickDotMark(source_id);
      });
    };
  }]);

angular.module('dotApp').directive('a', ['appaudit', function (appaudit) {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(attrs.origin !== undefined && attrs.origin.length >20){
                elem.on('click', function(e){
                    log(attrs);
                    appaudit.clickDotMark(attrs.origin);
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
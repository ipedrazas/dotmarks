angular.module('dotApp').directive('targetUrl', ['appaudit', function (appaudit) {
    return function (scope, element, attrs) {
      element.bind('click', function (event) {
            var source_id = element.attr('data-origin');
            appaudit.clickDotMark(source_id);
      });
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
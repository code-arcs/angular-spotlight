angular.module('de.stekoe.angular.spotlight')
    .directive('spotlightDetails', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        return {
            restrict: "E",
            remove: true,
            link: function (scope, element) {
                scope.$watch('selectedItem', function () {
                    if (scope.selectedItem) {
                        element.html(AngularSpotlight.getTemplateForType(scope.selectedItem.type)).show();
                        $compile(element.contents())(scope);
                    }
                });
            }
        };
    }]);
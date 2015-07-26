angular.module('de.stekoe.angular.spotlight')
    .directive('spotlightDetails', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {

        function link(scope, element) {
            scope.getContentUrl = function() {
                return scope.templateUrl;
            };

            scope.$watch('selectedItem', function () {
                if (scope.selectedItem) {
                    var templateForType = AngularSpotlight.getTemplateForType(scope.selectedItem.type);

                    if(templateIsFile(templateForType)) {
                        scope.templateUrl = templateForType;
                        templateForType = angular.element('<div ng-include="getContentUrl()"></div>');
                    }

                    element.html(templateForType).show();
                    $compile(element.contents())(scope);
                }
            });

            function templateIsFile(templateForType) {
                return new RegExp('\.html?$').test(templateForType);
            }
        }


        return {
            restrict: "E",
            link: link
        };
    }]);
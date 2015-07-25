angular.module('de.stekoe.angular.spotlight')
    .directive('spotlightResultIcon', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        var iconTemplates = {
            'url': '<img class="ng-spotlight-item-icon" ng-src="{{iconDescriptor.data}}">',
            'css': '<div class="ng-spotlight-item-icon {{iconDescriptor.data}}"></div>'
        };

        return {
            restrict: "E",
            remove: true,
            scope: {
                selectedItem: '='
            },
            link: function (scope, element, attrs) {
                if (attrs.type) {
                    updateResultIcon(AngularSpotlight.getIconDescriptorForType(attrs.type));
                } else {
                    scope.$watch('selectedItem', function () {
                        if (scope.selectedItem) {
                            updateResultIcon(AngularSpotlight.getIconDescriptorForType(scope.selectedItem.type));
                        } else {
                            element.html("");
                        }
                    })
                }

                function updateResultIcon(iconDescriptor) {
                    var iconTemplate = iconTemplates[iconDescriptor.type];
                    element.html(iconTemplate).show();
                    $compile(element.contents())(scope);
                    scope.iconDescriptor = iconDescriptor;
                }
            }
        }
    }]);
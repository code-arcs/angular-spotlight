angular.module('de.stekoe.angular.spotlight')
    .directive('spotlightResultIcon', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        var iconTemplates = [
            '<img ng-if="iconTypeIs(\'url\')" class="ng-spotlight-item-icon" ng-src="{{iconDescriptor.data}}">',
            '<div ng-if="iconTypeIs(\'css\')" class="ng-spotlight-item-icon {{iconDescriptor.data}}"></div>'
        ];

        return {
            restrict: "E",
            remove: true,
            template: iconTemplates.join(''),
            scope: {
                selectedItem: '='
            },
            link: function (scope, element, attrs) {
                var isStaticIcon = (attrs.type !== undefined);
                if(!isStaticIcon) {
                    scope.$watch('selectedItem', function () {
                        if (scope.selectedItem) {
                            scope.iconDescriptor = AngularSpotlight.getIconDescriptorForType(scope.selectedItem.type);
                            console.log(scope.iconDescriptor);
                        }
                    });
                } else {
                    scope.iconDescriptor = AngularSpotlight.getIconDescriptorForType(attrs.type);
                }

                // Functions
                scope.iconTypeIs = function(type) {
                    return scope.selectedItem && scope.iconDescriptor && scope.iconDescriptor.type === type;
                };
            }
        }
    }]);
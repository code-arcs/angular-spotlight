angular.module('de.stekoe.angular.spotlight', [])
    .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {

        const KEY = {
            UP: 38,
            DOWN: 40,
            SPACE: 32,
            ESC: 27,
            ENTER: 13
        };

        var $ngSpotlightOverlay;

        var controller = ['$scope', function ($scope) {
            $scope.searchInputInfo = 'Keine Ergebnisse';

            $scope.search = function () {
                if ($scope.searchTerm.length > 0) {
                    AngularSpotlight.search($scope.searchTerm)
                        .then(function setSearchResult(resp) {
                            $scope.searchResults = resp;
                            $scope.searchResultsCount = $scope.searchResults
                                .map(function (category) {
                                    return category.items.length;
                                })
                                .reduce(function (prev, cur) {
                                    return prev + cur;
                                }, 0);

                            selectItemAtIndex($scope.selectedItemIndex);
                        });
                }
            };

            $scope.getIconForType = function (type) {
                return AngularSpotlight.getIconForType(type);
            };

            $scope.showResultItem = function (categoryName, idx) {
                var indexToSelect = 0;

                for (var i = 0; i < $scope.searchResults.length; i++) {
                    if ($scope.searchResults[i].name !== categoryName) {
                        indexToSelect += $scope.searchResults[i].items.length;
                    } else {
                        break;
                    }
                }

                selectItemAtIndex(indexToSelect + idx);
            };

            /**
             * Handle Keyboard events
             * @param $event
             */
            $scope.handleKeyDown = function ($event) {
                switch ($event.keyCode) {
                    case KEY.UP:
                        $event.preventDefault();
                        selectPreviousEntry();
                        break;
                    case KEY.DOWN:
                        $event.preventDefault();
                        selectNextEntry();
                        break;
                    case KEY.ESC:
                        resetSearch();
                        break;
                    case KEY.ENTER:
                        alert($scope.selectedItem.name);
                        break;
                }
            };

            $scope.openResultItem = function() {
                alert($scope.selectedItem.name);
            };


            function resetSearch() {
                $scope.selectedItem = undefined;
                $scope.searchResultsCount = 0;
                $scope.searchResults = [];
                $scope.searchInputInfo = undefined;
                $scope.searchTerm = "";
            }

            function selectPreviousEntry() {
                var idx = getSelectedItemIndex();
                if (idx - 1 >= 0) {
                    selectItemAtIndex(idx - 1)
                }
            }

            function selectNextEntry() {
                var idx = getSelectedItemIndex();
                if (idx + 1 < $scope.searchResultsCount) {
                    selectItemAtIndex(idx + 1);
                }
            }

            function selectItemAtIndex(idx) {
                var currentItemIndex = 0;
                $scope.searchResults.forEach(function (category) {
                    if (category.items.length > 0) {
                        category.items.forEach(function (item) {
                            var isActive = currentItemIndex === (idx || 0);
                            item.active = isActive;
                            currentItemIndex++;

                            if (isActive) {
                                $scope.selectedItem = item;
                                setSearchInputInfo(category.name);
                            }
                        });
                    }
                });
                $scope.selectedItemIndex = idx;
            }

            function setSearchInputInfo(categoryName) {
                $scope.searchInputInfo = undefined;
                if ($scope.searchTerm.length === 0) {
                    $scope.searchInputInfo = undefined;
                } else {
                    if ($scope.selectedItem) {
                        $scope.searchInputInfo = $scope.selectedItem.name + " - " + categoryName;
                    } else if ($scope.searchResultCount() === 0) {
                        $scope.searchInputInfo = "Keine Ergebnisse";
                    }
                }
            }

            function getSelectedItemIndex() {
                return $scope.selectedItemIndex || 0;
            }

            $scope.$watch('selectedItemIndex', function () {
                $timeout(function () {
                    if ($scope.selectedItemIndex !== undefined) {
                        keepItemVisible();
                    }
                }, 100);
            });

            function keepItemVisible() {
                var activeItem = $ngSpotlightOverlay.find('li.ng-spotlight-results-list-item.active');
                var resultsList = $ngSpotlightOverlay.find('.ng-spotlight-results-list');

                var activeItemTop = activeItem.position().top;
                var activeItemBottom = activeItem.position().top + activeItem.outerHeight();
                var parentsHeight = resultsList.height();
                var currentScrollTop = resultsList.scrollTop();

                if (parentsHeight - activeItemBottom < 0) {
                    resultsList.scrollTop(currentScrollTop + Math.abs(parentsHeight - activeItemBottom));
                }
                if (activeItemTop < 0) {
                    var padding = 0;
                    if (activeItem.parent().find('li').index(activeItem) === 0) {
                        padding = $('.ng-spotlight-results-list-header:first').outerHeight();
                    }
                    resultsList.scrollTop(currentScrollTop + activeItemTop - padding);
                }
            }
        }];

        function linkFn(scope, element) {
            var spotlightOverlay = $(element).children();
            $ngSpotlightOverlay = $(element);

            $('[data-toggle="ng-spotlight"]').on('click', function(e) {
                e.stopPropagation();
                toggleOverlay();
            });

            $(document).click(function (e) {
                if ($(e.target).closest('.ng-spotlight').length === 0) {
                    spotlightOverlay.hide();
                } else {
                    spotlightOverlay
                        .find('input')
                        .focus();
                }
            });

            $(document).keydown(function (e) {
                if (e.ctrlKey && e.keyCode === KEY.SPACE) {
                    e.preventDefault();
                    toggleOverlay();
                }
            });

            function toggleOverlay() {
                spotlightOverlay.toggle();
                if (spotlightOverlay.is(':visible')) {
                    spotlightOverlay.find('input')
                        .focus()
                        .select();
                }
            }

            $ngSpotlightOverlay.find('.ng-spotlight-input').autoGrowInput({
                maxWidth: 400,
                minWidth: 10,
                comfortZone: 15
            });
        }

        return {
            restrict: 'E',
            controller: controller,
            link: linkFn,
            templateUrl: 'angularSpotlightTemplate.html'
        };

    }])
    .directive('spotlightResultIcon', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        var iconTemplates = {
            'url': '<img class="ng-spotlight-item-icon" ng-src="{{iconDescriptor.data}}">',
            'css': '<div class="ng-spotlight-item-icon {{iconDescriptor.data}}"></div>'
        };

        return {
            restrict: "E",
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
    }])
    .directive('spotlightDetails', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        return {
            restrict: "E",
            link: function (scope, element) {
                scope.$watch('selectedItem', function () {
                    if (scope.selectedItem) {
                        element.html(AngularSpotlight.getTemplateForType(scope.selectedItem.type)).show();
                        $compile(element.contents())(scope);
                    }
                });
            }
        };
    }])
    .provider("AngularSpotlight", function () {
        var _iconConfig = iconConfig();
        var _detailsTemplateConfig = detailsTemplateConfig();

        this.search = function () {
            throw "You have to implement a search function using AngularSpotlightProvider!";
        };

        this.addIcons = _iconConfig.addIcons;
        this.addTemplates = _detailsTemplateConfig.addTemplates;

        this.$get = ['$http', function ($http) {
            var that = this;
            return {
                search: that.search($http),
                getIconDescriptorForType: _iconConfig.getIconForType,
                getTemplateForType: _detailsTemplateConfig.getTemplateForType
            };
        }];

        function iconConfig() {
            var icons = {
                'default': 'fa fa-file'
            };

            function addIcons(iconDescriptors) {
                Object.keys(iconDescriptors)
                    .forEach(function (iconKey) {
                        icons[iconKey.toLowerCase()] = iconDescriptors[iconKey];
                    });
            }

            function getIconForType(type) {
                var icon = icons[(type || 'default').toLowerCase()] || icons['default'];

                return {
                    data: icon,
                    type: guessType(icon)
                };

                function guessType(icon) {
                    var icon = icon.toLowerCase();
                    if (icon.indexOf('http') === 0 || icon.indexOf('data:') === 0) {
                        return 'url';
                    } else {
                        return 'css';
                    }
                }
            }

            return {
                addIcons: addIcons,
                getIconForType: getIconForType
            }
        }

        function detailsTemplateConfig() {
            var detailsTemplates = {
                'default': '<div class="ng-spotlight-results-detail-default"><spotlight-result-icon selected-item="selectedItem"></spotlight-result-icon><div class="name">{{selectedItem.name}}</div></div>'
            };

            function addTemplates(templateDescriptors) {
                Object.keys(templateDescriptors)
                    .forEach(function (templateKey) {
                        detailsTemplates[templateKey.toLowerCase()] = templateDescriptors[templateKey];
                    });
            }

            function getTemplateForType(type) {
                return detailsTemplates[(type || 'default').toLowerCase()] || detailsTemplates['default'];
            }

            return {
                addTemplates: addTemplates,
                getTemplateForType: getTemplateForType
            }
        }
    });

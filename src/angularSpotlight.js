angular.module('de.stekoe.angular.spotlight', [])
    .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {
        const KEY_UP = 40;
        const KEY_DOWN = 38;
        const SPACE = 32;
        const KEY_ESC = 27;

        var $ngSpotlightElement,
            $ngSpotlightDetailPanel,
            $ngSpotlightResultsPanel;

        return {
            restrict: 'E',
            controller: ['$scope', function ($scope) {
                $scope.searchResultsCount = 0;
                $scope.searchResults = [];
                $scope.selectedItem = undefined;
                $scope.searchInputInfo = undefined;

                $scope.search = function () {
                    AngularSpotlight.search($scope.searchTerm)
                        .then(function setSearchResult(resp) {
                            growInputField();

                            $scope.selectedItem = undefined;
                            $scope.searchResults = resp;
                            $scope.searchResultsCount = Object.keys($scope.searchResults)
                                .map(function (key) {
                                    return $scope.searchResults[key].items.length;
                                })
                                .reduce(function (prev, cur) {
                                    return prev + cur;
                                }, 0);

                            $timeout(function() {
                                if(!$scope.selectedItem)  {
                                    selectItemAtIndex(0, false);
                                }
                            }, 20);
                        });
                };

                $scope.getIconForType = function (type) {
                    return AngularSpotlight.getIconForType(type);
                };

                $scope.showResultItem = function (event, b) {
                    var currentItem = $(event.currentTarget);
                    var categoryName = currentItem.closest('.ng-spotlight-results-category').find('.ng-spotlight-results-list-header').text();

                    currentItem.closest('.ng-spotlight-results-list')
                        .find('.ng-spotlight-results-list-item')
                        .removeClass('active');
                    currentItem.addClass('active');

                    $scope.selectedItem = b;
                    setSearchInputInfo(categoryName);

                    keepItemVisible(resultsList, currentItem);
                };

                $scope.selectPreviousEntry = function () {
                    var idx = getSelectedItemIndex();
                    if (idx - 1 >= 0) {
                        selectItemAtIndex(idx - 1, true)
                    }
                };

                $scope.selectNextEntry = function () {
                    var idx = getSelectedItemIndex();
                    if (idx + 1 < $scope.searchResultsCount) {
                        selectItemAtIndex(idx + 1, true);
                    }
                };

                $scope.resetSearch = function() {
                    $ngSpotlightElement.find('.ng-spotlight-input').val('');
                    $scope.searchResultsCount = 0;
                    $scope.searchResults = [];
                    $scope.selectedItem = undefined;
                    $scope.searchInputInfo = undefined;
                    $scope.searchTerm = "";
                    $scope.$apply();

                    $ngSpotlightElement.find('.ng-spotlight-input').width(400);
                };

                $scope.searchResultCount = function() {
                    return Object.keys($scope.searchResults).length;
                }

                function growInputField() {
                    $ngSpotlightElement.find('.ng-spotlight-input').autoGrowInput({
                        maxWidth: 400,
                        minWidth: 10,
                        comfortZone: 15
                    });
                }

                function selectItemAtIndex(idx, performApply) {
                    var resultsList = $ngSpotlightElement.find('.ng-spotlight-results-list');
                    var resultItems = resultsList.find('li.ng-spotlight-results-list-item');
                    var newActiveItem = $(resultItems.get(idx));
                    var categoryName = newActiveItem.closest('.ng-spotlight-results-category').find('.ng-spotlight-results-list-header').text();

                    resultItems.removeClass('active');
                    newActiveItem.addClass('active');

                    $scope.selectedItem = getResultItemFromSearchResults(idx);
                    setSearchInputInfo(categoryName);

                    keepItemVisible(resultsList, newActiveItem);

                    if (performApply) {
                        $scope.$apply();
                    }
                }

                function setSearchInputInfo(categoryName) {
                    $scope.searchInputInfo = undefined;
                    if ($scope.searchTerm.length === 0) {
                        $scope.searchInputInfo = undefined;
                    } else if ($scope.selectedItem) {
                        $scope.searchInputInfo = $scope.selectedItem.name + " - " + categoryName;
                    } else if ($scope.searchResultCount() === 0) {
                        $scope.searchInputInfo = "Keine Ergebnisse";
                    }
                }

                function getResultItemFromSearchResults(idx) {
                    var resultItems = Object.keys($scope.searchResults)
                        .map(function (key) {
                            return $scope.searchResults[key].items;
                        })
                        .reduce(function (prev, cur) {
                            return prev.concat(cur);
                        }, []);
                    return resultItems[idx];
                }

                function getSelectedItemIndex() {
                    var resultsList = $ngSpotlightElement.find('.ng-spotlight-results-list');
                    var resultItems = resultsList.find('li.ng-spotlight-results-list-item');
                    var activeIndex = -1;

                    resultItems.each(function (idx, elem) {
                        if ($(elem).hasClass('active')) {
                            activeIndex = idx;
                            return false;
                        }
                    });

                    return activeIndex;
                }
            }],
            link: function (scope, element) {
                var spotlightOverlay = $(element).children();
                $ngSpotlightElement = $(element);
                $ngSpotlightDetailPanel = $ngSpotlightElement.find('.ng-spotlight-results-detail');
                $ngSpotlightResultsPanel = $ngSpotlightElement.find('.ng-spotlight-results-panel');

                $(document).click(function (e) {
                    console.log();
                    if ($(e.target).closest('.ng-spotlight').length === 0) {
                        spotlightOverlay.hide();
                    }
                });

                $(document).keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === SPACE) {
                        e.preventDefault();
                        spotlightOverlay.toggle();
                        if (spotlightOverlay.is(':visible')) {
                            spotlightOverlay.find('input')
                                .focus()
                                .val('');
                            scope.searchResults = [];
                        }
                    }

                    if(e.keyCode === KEY_ESC) {
                        e.preventDefault();
                        scope.resetSearch();
                    }

                    if (e.keyCode === KEY_DOWN) {
                        e.preventDefault();
                        scope.selectPreviousEntry();
                    }

                    if (e.keyCode === KEY_UP) {
                        e.preventDefault();
                        scope.selectNextEntry();
                    }
                });
            },
            templateUrl: 'angularSpotlightTemplate.html'
        };

        function keepItemVisible(resultsList, activeItem) {
                var positionNew = activeItem.position().top;
                var parentsHeight = resultsList.height();

                if (positionNew <= 0  || positionNew > parentsHeight) {
                    resultsList.scrollTop(positionNew);
                }
        }
    }])
    .directive('spotlightResultIcon', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
        var iconTemplates = {
            'url': '<img class="ng-spotlight-item-icon" ng-src="{{iconDescriptor.data}}">',
            'css': '<div class="ng-spotlight-item-icon" ng-class="iconDescriptor.data"></div>'
        };

        return {
            restrict: "E",
            scope: {
                selectedItem : '='
            },
            link: function(scope, element, attrs) {
                if(attrs.type) {
                    updateResultIcon(AngularSpotlight.getIconDescriptorForType(attrs.type));
                } else  {
                    scope.$watch('selectedItem', function() {
                        if(scope.selectedItem) {
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
                    .forEach(function(iconKey) {
                        icons[iconKey] = iconDescriptors[iconKey];
                    });
            }

            function getIconForType(type) {
                var icon = icons[type] || icons['default'];

                return {
                    data: icon,
                    type: guessType(icon)
                };

                function guessType(icon) {
                    var icon = icon.toLowerCase();
                    if(icon.indexOf('http') === 0 || icon.indexOf('data:') === 0) {
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
                'default' : '<div class="ng-spotlight-results-detail-default">{{selectedItem.name}}</div>'
            };

            function addTemplates(templateDescriptors) {
                Object.keys(templateDescriptors)
                    .forEach(function(templateKey) {
                        detailsTemplates[templateKey] = templateDescriptors[templateKey];
                    });
            }

            function getTemplateForType(type) {
                return detailsTemplates[type] || detailsTemplates['default'];
            }

            return {
                addTemplates: addTemplates,
                getTemplateForType: getTemplateForType
            }
        }
    });

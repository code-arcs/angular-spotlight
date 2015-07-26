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

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'spotlight/directive/spotlightOverlayTemplate.html'
        };

        function controller() {
            return ['$scope', function ($scope) {
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

                                setSearchInputInfo();
                                selectItemAtIndex(0);
                            });
                    }
                };

                $scope.getIconForType = function (type) {
                    return AngularSpotlight.getIconDescriptorForType(type);
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

                    $ngSpotlightOverlay
                        .find('input')
                        .focus()
                        .select();
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

                $scope.openResultItem = function () {
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
                    } else if ($scope.searchResultsCount === 0) {
                        $scope.searchInputInfo = "Keine Ergebnisse";
                    } else if ($scope.selectedItem) {
                        $scope.searchInputInfo = $scope.selectedItem.name + " - " + categoryName;
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
        }

        function link(scope, element) {
            $ngSpotlightOverlay = $(element);

            $('[data-toggle="ng-spotlight"]')
                .on('click', function (e) {
                    e.stopPropagation();
                    toggleOverlay();
                });

            $(document)
                .on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === KEY.SPACE) {
                        e.preventDefault();
                        toggleOverlay();
                    }
                })
                .on('click', function (e) {
                    if ($(e.target).closest('.ng-spotlight').length === 0) {
                        $ngSpotlightOverlay.hide();
                    } else {
                        $ngSpotlightOverlay
                            .find('input')
                            .focus();
                    }
                });

            function toggleOverlay() {
                $ngSpotlightOverlay.toggle();

                if ($ngSpotlightOverlay.is(':visible')) {
                    $ngSpotlightOverlay
                        .find('input')
                        .focus()
                        .select();
                }
            }

            $ngSpotlightOverlay
                .find('.ng-spotlight-input').autoGrowInput({
                    maxWidth: 400,
                    minWidth: 10,
                    comfortZone: 15
                });
        }
    }]);
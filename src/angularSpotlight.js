angular.module('de.stekoe.spotlight', [])
    .directive('spotlightOverlay', function ($http) {
        const KEY_UP = 40;
        const KEY_DOWN = 38;
        const CTRL = 17;
        const SPACE = 32;

        var $ngSpotlightElement;

        return {
            restrict: 'E',
            controller: function ($scope) {
                $scope.search = function () {
                    $http.get('../data/search.json').then(function (resp) {
                        $scope.searchResults = resp.data;
                    })
                };

                $scope.showResultItem = function (event, b) {
                    var currentItem = $(event.currentTarget);
                    currentItem.closest('.ng-spotlight-results-list').find('li').removeClass('active');
                    currentItem.addClass('active');

                    $scope.resultItem = JSON.stringify(b);
                };

                $scope.selectPreviousEntry = function () {
                    var resultsList = $ngSpotlightElement.find('.ng-spotlight-results-list');
                    var resultItems = resultsList.find('li.ng-spotlight-results-list-item');
                    var idx = getCurrentEntryIndex(resultItems);

                    if (idx - 1 >= 0) {
                        $(resultItems.get(idx)).removeClass('active');
                        $(resultItems.get(idx - 1)).addClass('active');

                        $scope.resultItem = JSON.stringify(getResultItemFromSearchResults(idx - 1));
                        $scope.$apply();
                    }
                };

                $scope.selectNextEntry = function () {
                    var resultsList = $ngSpotlightElement.find('.ng-spotlight-results-list');
                    var resultItems = resultsList.find('li.ng-spotlight-results-list-item');
                    var idx = getCurrentEntryIndex(resultItems);

                    if (idx + 1 < resultItems.length) {
                        $(resultItems.get(idx)).removeClass('active');
                        $(resultItems.get(idx + 1)).addClass('active');

                        $scope.resultItem = JSON.stringify(getResultItemFromSearchResults(idx + 1));
                        $scope.$apply();
                    }
                };

                function getResultItemFromSearchResults(idx) {
                    var resultItems = $scope.searchResults.map(function (category) {
                        return category.items;
                    }).reduce(function (prev, cur) {
                        return prev.concat(cur);
                    }, []);
                    return resultItems[idx];
                }

                function getCurrentEntryIndex(resultItems) {
                    var activeIndex = 0;
                    resultItems.each(function (idx, elem) {
                        if ($(elem).hasClass('active')) {
                            activeIndex = idx;
                            return false;
                        }
                    });

                    return activeIndex;
                };
            },
            link: function ($scope, element) {
                $ngSpotlightElement = $(element);

                $(document).keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === SPACE) {
                        var spotlightOverlay = $(element).children();
                        spotlightOverlay.toggle();
                        if (spotlightOverlay.is(':visible')) {
                            var searchField = spotlightOverlay.find('input');
                            searchField.focus().val('');
                        }
                    }

                    if (e.keyCode === KEY_DOWN) {
                        $scope.selectPreviousEntry();
                    }

                    if (e.keyCode === KEY_UP) {
                        $scope.selectNextEntry();
                    }
                });
            },
            templateUrl: '../template/spotlightDirective.html'
        };
    });

(function ($) {
    // jQuery autoGrowInput plugin by James Padolsey
    // See related thread: http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
    $.fn.autoGrowInput = function (o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function () {
            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                }),
                check = function () {

                    if (val === (val = input.val())) {
                        return;
                    }

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                            || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }

                };

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', check);

            check();
        });

        return this;

    };

})(jQuery);
angular.module('de.devjs.angular.spotlight', [])
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
                $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();

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
                    $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
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
                            $scope.openResultItem();
                            break;
                    }
                };

                $scope.openResultCategory = function() {
                    console.log($scope.selectedCategory);
                };

                $scope.openResultItem = function () {
                    if($scope.selectedItem.href) {
                        window.location.href = $scope.selectedItem.href;
                        $ngSpotlightOverlay.hide();
                    }
                };

                function resetSearch() {
                    $scope.selectedItem = undefined;
                    $scope.searchResultsCount = 0;
                    $scope.searchResults = [];
                    $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
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
                                    $scope.selectedCategory = category;
                                    setSearchInputInfo(category.name);
                                }
                            });
                        }
                    });
                    $scope.selectedItemIndex = idx;
                }

                function setSearchInputInfo(categoryName) {
                    $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();

                    if ($scope.searchTerm.length === 0) {
                        $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
                    } else if ($scope.searchResultsCount === 0) {
                        $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoNoResults();
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
angular.module('de.devjs.angular.spotlight')
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
angular.module('de.devjs.angular.spotlight').run(['$templateCache', function($templateCache) {
    $templateCache.put('spotlight/directive/spotlightOverlayTemplate.html',
        "<div class=\"ng-spotlight ng-spotlight-overlay\" ng-keydown=\"handleKeyDown($event)\">\n    <div class=\"ng-spotlight-searchbar\">\n        <div class=\"ng-spotlight-icon\">\n            <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"  viewBox=\"0 0 283.753 284.51\" enable-background=\"new 0 0 283.753 284.51\" xml:space=\"preserve\">\n            <path d=\"M281.394,264.378l0.135-0.135L176.24,158.954c30.127-38.643,27.45-94.566-8.09-130.104\n\tc-38.467-38.467-100.833-38.467-139.3,0c-38.467,38.467-38.466,100.833,0,139.299c35.279,35.279,90.644,38.179,129.254,8.748\n\tl103.859,103.859c0.01,0.01,0.021,0.021,0.03,0.03l1.495,1.495l0.134-0.134c2.083,1.481,4.624,2.36,7.375,2.36\n\tc7.045,0,12.756-5.711,12.756-12.756C283.753,269.002,282.875,266.462,281.394,264.378z M47.388,149.612\n\tc-28.228-28.229-28.229-73.996,0-102.225c28.228-28.229,73.996-28.228,102.225,0.001c28.229,28.229,28.229,73.995,0,102.224\n\tC121.385,177.841,75.617,177.841,47.388,149.612z\"/>\n            </svg>\n        </div>\n\n        <input class=\"ng-spotlight-input\" ng-class=\"{'empty': searchTerm.length === 0}\" type=\"text\" placeholder=\"Spotlight-Suche\" ng-model=\"searchTerm\" ng-change=\"search()\" ng-model-options=\"{debounce: 250}\"/>\n\n        <div class=\"ng-spotlight-input-after\" ng-if=\"searchInputInfo.length > 0  && searchTerm.length > 0\">&mdash; {{searchInputInfo}}</div>\n        <div class=\"ng-spotlight-results-icon\" ng-if=\"searchTerm.length > 0\">\n            <img ng-if=\"getIconForType(selectedItem.type).type == 'url'\" class=\"ng-spotlight-item-icon\" ng-src=\"{{getIconForType(selectedItem.type).data}}\" width=\"32\" height=\"32\">\n            <div ng-if=\"getIconForType(selectedItem.type).type == 'css'\" class=\"ng-spotlight-item-icon {{getIconForType(selectedItem.type).data}}\"></div>\n        </div>\n    </div>\n    <div class=\"ng-spotlight-results-panel\" ng-if=\"searchTerm && searchTerm.length > 0 && searchResultsCount > 0\" >\n        <div class=\"ng-spotlight-results-list\" ng-keydown=\"handleKeyDown($event)\">\n            <ul>\n                <li class=\"ng-spotlight-results-category\" ng-repeat=\"searchResult in searchResults\" ng-dblclick=\"openResultCategory()\">\n                    <div class=\"ng-spotlight-results-list-header\">{{searchResult.name}}</div>\n                    <ul>\n                        <li class=\"ng-spotlight-results-list-item\"\n                            ng-repeat=\"resultItem in searchResult.items\"\n                            ng-class=\"{'active': resultItem.active === true}\"\n                            ng-click=\"showResultItem(searchResult.name, $index)\"\n                            ng-dblclick=\"openResultItem()\">\n\n                            <img ng-if=\"getIconForType(resultItem.type).type == 'url'\" class=\"ng-spotlight-item-icon\" ng-src=\"{{getIconForType(resultItem.type).data}}\">\n                            <div ng-if=\"getIconForType(resultItem.type).type == 'css'\" class=\"ng-spotlight-item-icon {{getIconForType(resultItem.type).data}}\"></div>\n\n                            {{resultItem.name}}\n\n                            <span class=\"info\" ng-if=\"resultItem.info\">\n                                &ndash; {{resultItem.info}}\n                            </span>\n                        </li>\n                    </ul>\n                </li>\n            </ul>\n        </div>\n        <div class=\"ng-spotlight-results-detail\">\n            <spotlight-details></spotlight-details>\n        </div>\n    </div>\n</div>");
}]);
angular.module('de.devjs.angular.spotlight')
    .provider("AngularSpotlight", function () {
        var _iconConfig = iconConfig();
        var _detailsTemplateConfig = detailsTemplateConfig();
        var _defaultSpotlightConfig = defaultSpotlightConfig();

        // === LE PUBLIC API ====================
        return {
            search: function () {
                throw "You have to implement a search function using AngularSpotlightProvider!";
            },
            addIcons: _iconConfig.addIcons,
            addTemplates: _detailsTemplateConfig.addTemplates,
            setSearchInputInfoSearching: _defaultSpotlightConfig.setSearchInputInfoSearching,
            setSearchInputInfoNoResults: _defaultSpotlightConfig.setSearchInputInfoNoResults,
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {
                    search: that.search($http, $q),
                    getIconDescriptorForType: _iconConfig.getIconForType,
                    getTemplateForType: _detailsTemplateConfig.getTemplateForType,
                    getSearchInputInfoSearching: _defaultSpotlightConfig.getSearchInputInfoSearching,
                    getSearchInputInfoNoResults: _defaultSpotlightConfig.getSearchInputInfoNoResults
                };
            }]
        };

        // === LE HELPER ====================
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
                'default': '<div class="ng-spotlight-results-detail-default"><img ng-if="getIconForType(selectedItem.type).type == \'url\'" class="ng-spotlight-item-icon" ng-src="{{getIconForType(selectedItem.type).data}}" width="64" height="64"><div ng-if="getIconForType(selectedItem.type).type == \'css\'" class="ng-spotlight-item-icon {{getIconForType(selectedItem.type).data}}"></div><div class="name">{{selectedItem.name}}</div></div>'
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

        function defaultSpotlightConfig() {
            var searchInputInfoSearching = 'Suchend ...';
            var searchInputInfoNoResults = 'Keine Ergebnisse';

            function setSearchInputInfoSearching(text) {
                searchInputInfoSearching = text;
            }

            function getSearchInputInfoSearching() {
                return searchInputInfoSearching;
            }

            function setSearchInputInfoNoResults(text) {
                searchInputInfoNoResults = text;
            }

            function getSearchInputInfoNoResults() {
                return searchInputInfoNoResults;
            }

            return {
                setSearchInputInfoSearching: setSearchInputInfoSearching,
                getSearchInputInfoSearching: getSearchInputInfoSearching,
                setSearchInputInfoNoResults: setSearchInputInfoNoResults,
                getSearchInputInfoNoResults: getSearchInputInfoNoResults,
            }
        }
    });

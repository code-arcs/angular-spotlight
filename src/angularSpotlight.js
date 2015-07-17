angular.module('de.stekoe.angular.spotlight', [])
    .directive('spotlightOverlay', function ($http, $compile, AngularSpotlight) {
        const KEY_UP = 40;
        const KEY_DOWN = 38;
        const CTRL = 17;
        const SPACE = 32;

        var $ngSpotlightElement,
            $ngSpotlightDetailPanel,
            $ngSpotlightResultsPanel;

        return {
            restrict: 'E',
            controller: function ($scope) {
                $scope.search = function () {
                    AngularSpotlight.search($scope.searchTerm)
                        .then(function (resp) {
                            $scope.searchResults = resp;
                        });
                };

                $scope.getIconForType = function(type) {
                    return AngularSpotlight.getIconForType(type);
                };

                $scope.showResultItem = function (event, b) {
                    var currentItem = $(event.currentTarget);
                    currentItem.closest('.ng-spotlight-results-list').find('li').removeClass('active');
                    currentItem.addClass('active');

                    $scope.selectedItem = b;
                };

                $scope.selectPreviousEntry = function () {
                    var resultsList = $ngSpotlightElement.find('.ng-spotlight-results-list');
                    var resultItems = resultsList.find('li.ng-spotlight-results-list-item');
                    var idx = getCurrentEntryIndex(resultItems);

                    if (idx - 1 >= 0) {
                        $(resultItems.get(idx)).removeClass('active');
                        $(resultItems.get(idx - 1)).addClass('active');

                        $scope.selectedItem = getResultItemFromSearchResults(idx - 1);
                        $scope.$apply();
                    }
                };

                $scope.selectNextEntry = function () {
                    var resultsList = $ngSpotlightElement.find('.ng-spotlight-results-list');
                    var resultItems = resultsList.find('li.ng-spotlight-results-list-item');
                    var idx = getCurrentEntryIndex(resultItems);

                    if (idx + 1 < resultItems.length) {
                        var currentItem = $(resultItems.get(idx));
                        currentItem.removeClass('active');

                        var nextItem = $(resultItems.get(idx + 1));
                        nextItem.addClass('active');

                        var a = nextItem.position().top + currentItem.outerHeight();
                        var b = resultsList.scrollTop() + resultsList.height();

                        if (a >= b) {
                            resultsList.scrollTop(resultsList.scrollTop() + Math.abs(a - b));
                        }

                        $scope.selectedItem = getResultItemFromSearchResults(idx + 1);
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
                $ngSpotlightDetailPanel = $ngSpotlightElement.find('.ng-spotlight-results-detail');
                $ngSpotlightResultsPanel = $ngSpotlightElement.find('.ng-spotlight-results-panel');

                $(document).keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === SPACE) {
                        var spotlightOverlay = $(element).children();
                        spotlightOverlay.toggle();
                        if (spotlightOverlay.is(':visible')) {
                            spotlightOverlay.find('input')
                                .focus()
                                .val('');
                            $scope.searchResults = [];
                        }
                    }

                    if (e.keyCode === KEY_DOWN) {
                        e.preventDefault();
                        $scope.selectPreviousEntry();
                    }

                    if (e.keyCode === KEY_UP) {
                        e.preventDefault();
                        $scope.selectNextEntry();
                    }
                });
            },
            templateUrl: 'angularSpotlightTemplate.html'
        };
    })
    .provider("AngularSpotlight", function () {
        var icons = {
            'default': 'data:image/svg+xml;utf8,<svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"> <path fill="#FFFFFF" d="M14,2H6C4.9,2,4.01,2.9,4.01,4L4,20c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z"/> <polygon points="13.125,9.312 13.125,3.812 18.625,9.312 "/> </svg> '
        };

        this.search = function() {
            throw "You have to implement a search function using AngularSpotlightProvider!";
        };

        this.setIconForType = function(type, dataUrl) {
            icons[type] = dataUrl;
        };

        this.$get = function ($http) {
            var that = this;
            return {
                search: that.search($http),
                getIconForType: function(type) {
                    return icons[type] || icons['default'];
                }
            };
        };
    })
    .directive('spotlightDetails', function ($compile) {

        var imageTemplate = '<div class="entry-photo"><h2>&nbsp;</h2><div class="entry-img"><span><a href="{{rootDirectory}}{{content.data}}"><img ng-src="{{rootDirectory}}{{content.data}}" alt="entry photo"></a></span></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var videoTemplate = '<div class="entry-video"><h2>&nbsp;</h2><div class="entry-vid"><iframe ng-src="{{content.data}}" width="280" height="200" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var noteTemplate = '<div class="entry-note"><h2>&nbsp;</h2><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.data}}</div></div></div>';
        var defaultTemplate = '<div class="">Name <span>{{resultItem.name | json}}</span><br>{{resultItem  | json}}<br>{{resultItem.type}}</div>';

        var getTemplate = function (contentType) {
            var template = '';

            switch (contentType) {
                case 'image':
                    template = imageTemplate;
                    break;
                case 'video':
                    template = videoTemplate;
                    break;
                case 'notes':
                    template = noteTemplate;
                    break;
                default:
                    template = defaultTemplate;
            }

            return template;
        }

        return {
            restrict: "E",
            link: function ($scope, element) {
                $scope.$watch('resultItem', function () {
                    if ($scope.selectedItem) {
                        element.html(getTemplate($scope.selectedItem.type)).show();
                    }
                });
            }
        };
    });

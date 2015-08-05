describe('Spotlight Overlay', function () {
    beforeEach(function () {
        $(document)
            .off('click')
            .off('keydown');
    });

    it('throws an exception, when no search function is defined!', function () {
        var $compile, $rootScope;

        module('de.devjs.angular.spotlight');
        inject(function (_$compile_, _$rootScope_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        });

        function actual() {
            $compile("<spotlight-overlay></spotlight-overlay>")($rootScope)
        }

        expect(actual).toThrow("You have to implement a search function using AngularSpotlightProvider!")
    });

    it('is invisible in intial state.', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope) {
            var element = createSpotlightOverlayElement($compile, $rootScope);
            expect(element.is(':visible')).toBeFalsy();
        });
    });

    it('is toggled by key event.', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope) {
            var element = createSpotlightOverlayElement($compile, $rootScope);

            triggerKeyDown($(document), 32, {ctrlKey: true});
            var visibilityAfterFirstKeyEvent = element.is(':visible');
            triggerKeyDown($(document), 32, {ctrlKey: true});
            var visibilityAfterSecondKeyEvent = element.is(':visible');

            expect(visibilityAfterFirstKeyEvent).toBeTruthy();
            expect(visibilityAfterSecondKeyEvent).toBeFalsy();
        });
    });

    it('input field has focus when overlay is shown.', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope) {
            var element = createSpotlightOverlayElement($compile, $rootScope);

            triggerKeyDown($(document), 32, {ctrlKey: true});
            expect(document.activeElement === element.find('input')[0]).toBeTruthy();
        });
    });

    it('result panel is hidden when opened.', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope) {
            createSpotlightOverlayElement($compile, $rootScope);
            triggerKeyDown($(document), 32, {ctrlKey: true});

            expect($('.ng-spotlight-results-panel').length).toBe(0);
        });
    });

    it('result panel is visible when search results exist and info container shows category and name of selected item.', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope, $httpBackend) {
            $httpBackend.when('GET', '/test.json').respond([
                {
                    name: "Category 1",
                    items: [
                        {name: "ResultItem", type: "A"},
                        {name: "B", type: "B"},
                        {name: "C", type: "C"}
                    ]
                }
            ]);

            createSpotlightOverlayElement($compile, $rootScope);

            $rootScope.searchTerm = "whatever";
            $rootScope.search();
            $httpBackend.flush();

            expect($('.ng-spotlight-input-after').length).toBe(1); // The info container should be visible...
            expect($('.ng-spotlight-input-after').text()).toContain("Category 1"); // ... and showing "Category 1" ...
            expect($('.ng-spotlight-input-after').text()).toContain("ResultItem"); // ... as well as "ResultItem" ...
            expect($('.ng-spotlight-results-panel').length).toBe(1); // .. and the results panel is visible.
        });
    });

    it('search term is selected when overlay is reopened.', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope, $httpBackend) {
            $httpBackend.when('GET', '/test.json').respond([]);

            // 1st: open overlay
            createSpotlightOverlayElement($compile, $rootScope);
            triggerKeyDown($(document), 32, {ctrlKey: true});
            var selectedTextAfterOpen = getSelectionText();

            // 2nd: Enter search term
            $rootScope.searchTerm = "whatever";
            $rootScope.search();
            $httpBackend.flush();

            // 3rd: close and reopen overlay
            triggerKeyDown($(document), 32, {ctrlKey: true});
            triggerKeyDown($(document), 32, {ctrlKey: true});
            var selectedTextAfterReopen = getSelectionText();

            expect(selectedTextAfterOpen).toBe('');
            expect(selectedTextAfterReopen).toBe($rootScope.searchTerm);
        });
    });

    it('results panel is hidden, when no search results are available and info container shows "No Results"', function () {
        initWithSearchFunction();

        inject(function ($compile, $rootScope, $httpBackend) {
            $httpBackend.when('GET', '/test.json').respond([]);

            createSpotlightOverlayElement($compile, $rootScope);

            $rootScope.searchTerm = "whatever";
            $rootScope.search();
            $httpBackend.flush();

            expect($('.ng-spotlight-input-after').length).toBe(1); // The info container should be visible...
            expect($('.ng-spotlight-input-after').text()).toContain("Keine Ergebnisse"); // ... and showing "no results" ...
            expect($('.ng-spotlight-results-panel').length).toBe(0); // ... and the results panel is closed.
        });
    });


    // === HELPER ==============
    function createSpotlightOverlayElement($compile, $rootScope) {
        var html = angular.element("<spotlight-overlay></spotlight-overlay>");
        var element = $compile(html)($rootScope);

        $(".ng-spotlight").remove();
        $("body").append(element);
        $rootScope.$digest();

        return element;
    }

    function triggerKeyDown(element, keyCode, options) {
        var e = $.Event("keydown");
        e.ctrlKey = options.ctrlKey || false;
        e.keyCode = e.which = keyCode;
        element.trigger(e);
    }

    function initWithSearchFunction() {
        module('de.devjs.angular.spotlight', function (AngularSpotlightProvider) {
            AngularSpotlightProvider.search = function ($http) {
                return function (term) {
                    return $http.get('/test.json')
                        .then(function (resp) {
                            return resp.data;
                        });
                }
            };
        })
    }

    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }
});
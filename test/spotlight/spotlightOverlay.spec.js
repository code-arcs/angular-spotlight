describe('Spotlight Overlay', function () {
    beforeEach(function() {
        $(document)
            .off('click')
            .off('keydown');
    });

    it('throws an exception, when no search function is defined!', function () {
        var $compile, $rootScope;

        module('de.stekoe.angular.spotlight');
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
            var element = createSpotlightOverlayElement($compile, $rootScope);
            triggerKeyDown($(document), 32, {ctrlKey: true});

            expect($('.ng-spotlight-results-panel').length).toBe(0);
        });
    });


    // === HELPER ==============
    function createSpotlightOverlayElement($compile, $rootScope) {
        var html = angular.element("<spotlight-overlay></spotlight-overlay>");
        var element = $compile(html)($rootScope);

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
        module('de.stekoe.angular.spotlight', function (AngularSpotlightProvider) {
            AngularSpotlightProvider.search = function() {};
        })
    }
});
describe('Angular Spotlight', function() {

    it('throws an exception, when no search function is defined!', function() {
        module('de.stekoe.angular.spotlight');
        inject(function($compile, $rootScope){
            expect(function() { $compile("<spotlight-overlay></spotlight-overlay>")($rootScope); }).toThrow("You have to implement a search function using AngularSpotlightProvider!");
        });
    });

    it('is invisible in intial state.', function() {
        module('de.stekoe.angular.spotlight', function(AngularSpotlightProvider) {
            AngularSpotlightProvider.search = function() {};
        });
        inject(function($compile, $rootScope){
            var element = $compile("<spotlight-overlay></spotlight-overlay>")($rootScope);
            $rootScope.$digest();
            expect(element.is(':visible')).toBeFalsy();
        });
    });

});
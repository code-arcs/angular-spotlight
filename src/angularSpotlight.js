angular.module('de.stekoe.spotlight', [])
    .directive('spotlightOverlay', function (){
        return {
            link: function(scope, element){
                $(document).keydown(function(e) {
                    if (e.ctrlKey && e.keyCode === 32) {
                        var spotlightOverlay = $(element).children();
                        spotlightOverlay.toggle();
                        if(spotlightOverlay.is(':visible')) {
                            var searchField = spotlightOverlay.find('input');
                            searchField.focus().val('');
                        }
                    }
                });

            },
            templateUrl: '../template/spotlightDirective.html'
        };
    });

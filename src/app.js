var app = angular.module('de.stekoe.spotlight.example', ['de.stekoe.spotlight']);

app.controller('ExampleSpotlightController', function ($scope) {

    $scope.searchTerm = "";

    $scope.search = function() {
    };

    $scope.showResultItem = function(event, b) {
        var currentItem = $(event.currentTarget);
        currentItem.closest('.ng-spotlight-results-list').find('li').removeClass('active');
        currentItem.addClass('active');

        var detailPanel = $('.ng-spotlight-results-detail');
        detailPanel.empty();
        detailPanel.html(JSON.stringify(b));
    };

    $scope.searchResults = [
        {
            name: "Category 1",
            items: [
                {name: "Result Item", type: 'Folder'},
                {name: "Result Item", type: 'Folder'},
                {name: "Result Item", type: 'Folder'},
                {name: "Result Item", type: 'Folder'},
                {name: "Result Item", type: 'Folder'},
                {name: "Result Item"}
            ]
        },
        {
            name: "Category 2",
            items: [
                {name: "Result Item"},
                {name: "Result Item"},
                {name: "Result Item"},
                {name: "Result Item"}
            ]
        },
        {
            name: "Category 3",
            items: [
                {name: "Result Item"},
                {name: "Result Item"},
                {name: "Result Item"},
                {name: "Result Item"},
                {name: "Result Item"}
            ]
        }
    ];
});


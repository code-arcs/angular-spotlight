angular.module('de.stekoe.angular.spotlight.example', ['de.stekoe.angular.spotlight'])
    .config(function (AngularSpotlightProvider) {
        function extractWikipediaData(result) {
            return {
                name: result.title,
                description: result.snippet,
                updatedOn: result.timestamp,
                type: 'wikipedi'+result.title[0].toLowerCase()
            }
        }

        function orderByCategoryName(searchResults) {
            var sortedKeys = Object.keys(searchResults).sort();
            var sortedResult = sortedKeys.map(function(key) {
                return searchResults[key];
            });

            return sortedResult;
        }

        AngularSpotlightProvider.search = function ($http) {
            return function (term) {
                return $http.jsonp('http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK&format=json&action=query&list=search&srsearch=' + term)
                    .then(function (resp) {
                        var searchResults = {};
                        resp.data.query.search.forEach(function (result) {
                            var key = result.title[0];
                            searchResults[key] = (searchResults[key] || {name: key, items: []});
                            searchResults[key].items.push(extractWikipediaData(result));
                        });

                        searchResults = orderByCategoryName(searchResults);
                        return searchResults;
                    });
            }
        };

        AngularSpotlightProvider.setIconForType('wikipedia', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAAXNCSVQI5gpbmQAAAAJ0Uk5TAP9bkSK1AAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1MzmNZGAwAAABV0RVh0Q3JlYXRpb24gVGltZQAyNy8zLzA56KykjAAABBF0RVh0WE1MOmNvbS5hZG9iZS54bXAAPD94cGFja2V0IGJlZ2luPSIgICAiIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNC4xLWMwMzQgNDYuMjcyOTc2LCBTYXQgSmFuIDI3IDIwMDcgMjI6MTE6NDEgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhhcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyI+CiAgICAgICAgIDx4YXA6Q3JlYXRvclRvb2w+QWRvYmUgRmlyZXdvcmtzIENTMzwveGFwOkNyZWF0b3JUb29sPgogICAgICAgICA8eGFwOkNyZWF0ZURhdGU+MjAwOS0wMy0yN1QxNToyODozMVo8L3hhcDpDcmVhdGVEYXRlPgogICAgICAgICA8eGFwOk1vZGlmeURhdGU+MjAwOS0wOS0wOFQyMzoxMzowMVo8L3hhcDpNb2RpZnlEYXRlPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgpRAV/wAAAMlJREFUGNNVyM8KAUEAB+CfJ7AvYvIAvIAcHJQD8gbUnjyBg3KRI45TW9qSVv5tjp5ATrNpMjVpzfqzaCXrIu1+xw/hOiaE/YmxYb+DiPcSs9c94jWDFehZvUWy7aK+zRcDC9bzTJpeH/vKzSPiOcHk4Q6S7k0jC7dXPz3GMH3Jta5saEpmdtI3YV6FqKVEHsNRVYrrCMaF8w06pJAr7Ti/GKCe4xzSidUcZe44HgVVjLF+QYj0lDGmfnH0GQtEJP4UBVUxFCGNCb8Qm8F04FVtPQAAAABJRU5ErkJggg==');
    });

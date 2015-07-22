(function () {
    angular.module('de.stekoe.angular.spotlight.example', ['de.stekoe.angular.spotlight'])
        .config(function configuration(AngularSpotlightProvider) {

            jsonFileSearch();

            /*
             * Example using static Json File
             */
            function jsonFileSearch() {
                AngularSpotlightProvider.search = function ($http) {
                    return function () {
                        return $http.get('search.json')
                            .then(function (resp) {
                                var searchResults = resp.data;
                                return searchResults;
                            });
                    }
                };

                addCustomIcons();
                addCustomTemplates();
            }

            /*
             * Example using Wikipedia Search API
             */
            function wikipediaSearch() {
                function extractWikipediaData(result) {
                    return {
                        name: result.title,
                        description: jQuery('<div>' + result.snippet + '</div>').text(),
                        timestamp: result.timestamp,
                        size: result.size,
                        wordcount: result.wordcount,
                        type: 'wikipedia'
                    }
                }

                AngularSpotlightProvider.search = function ($http) {
                    return function (term) {
                        return $http.jsonp('http://en.wikipedia.org/w/api.php?callback=JSON_CALLBACK&format=json&action=query&list=search&srsearch=' + term)
                            .then(function (resp) {
                                var searchResults = [];

                                if (resp.data.query) {
                                    resp.data.query.search.forEach(function (result) {
                                        var key = result.title[0];

                                        var category = searchResults.filter(function(result) {
                                            return result.name === key;
                                        })[0];

                                        if(category) {
                                            category.items.push(extractWikipediaData(result));
                                        } else {
                                            category = {name: key, items: []};
                                            category.items.push(extractWikipediaData(result));
                                            searchResults.push(category);
                                        }
                                    });
                                }

                                return searchResults;
                            });
                    }
                };

                addCustomIcons();
                addCustomTemplates();
            }

            function addCustomTemplates() {
                AngularSpotlightProvider.addTemplates({
                    'wikipedia':   '<div class="ng-spotlight-results-detail-wikipedia">\
                                        <div class="title">{{selectedItem.name}}</div>\
                                        <div class="description">{{selectedItem.description}}</div>\
                                        <div class="footer">\
                                            <dl>\
                                                <dt>{{"Last update"}}</dt><dd>{{selectedItem.timestamp | date}}</dd>\
                                                <dt>{{"Word count"}}</dt><dd>{{selectedItem.wordcount}}</dd>\
                                                <dt>{{"Size"}}</dt><dd>{{selectedItem.size}}</dd>\
                                            </dl>\
                                        </div>\
                                    </div>',
                    'vcard':       '<div class="ng-spotlight-results-detail-vcard">\
                                        <div class="profile-image"><span class="fa fa-user"></span></div>\
                                        <ul>\
                                            <li class="name">{{selectedItem.name}}</li>\
                                            <li ng-if="selectedItem.phone"><span class="fa fa-phone"></span> {{selectedItem.phone}}</li>\
                                            <li ng-if="selectedItem.email"><span class="fa fa-envelope"></span> {{selectedItem.email}}</li>\
                                            <li ng-if="selectedItem.fax"><span class="fa fa-print"></span> {{selectedItem.fax}}</li>\
                                            <li ng-if="selectedItem.www"><span class="fa fa-globe"></span> <a href="#" ng-href="{{selectedItem.www}}" target="_blank">{{selectedItem.www}}</a></li>\
                                        </ul>\
                                    </div>'
                });
            }

            function addCustomIcons() {
                AngularSpotlightProvider.addIcons({
                    'wikipedia': 'data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" standalone="no"?> <!-- Created with Inkscape (http://www.inkscape.org/) --> <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="32" height="32" id="svg2" version="1.1" inkscape:version="0.48.2 r9819" sodipodi:docname="wikipedia.svg" inkscape:export-xdpi="90" inkscape:export-ydpi="90"> <defs id="defs4"> <linearGradient id="linearGradient3806"> <stop id="stop3808" offset="0" style="stop-color:#f8f8f8;stop-opacity:1;" /> <stop id="stop3810" offset="1" style="stop-color:#f0f0f0;stop-opacity:1;" /> </linearGradient> <linearGradient inkscape:collect="always" xlink:href="#linearGradient3806" id="linearGradient3804" gradientUnits="userSpaceOnUse" x1="16" y1="1022.3622" x2="16" y2="1051.3622" /> </defs> <sodipodi:namedview id="base" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:zoom="13.78438" inkscape:cx="14.323861" inkscape:cy="14.486647" inkscape:document-units="px" inkscape:current-layer="layer1" showgrid="false" inkscape:window-width="1021" inkscape:window-height="678" inkscape:window-x="190" inkscape:window-y="242" inkscape:window-maximized="0" inkscape:snap-bbox="true" inkscape:snap-bbox-edge-midpoints="true" showguides="true" inkscape:guide-bbox="true" /> <metadata id="metadata7"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title /> </cc:Work> </rdf:RDF> </metadata> <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(0,-1020.3622)"> <rect style="fill:#e8e8e8;fill-opacity:1;stroke:none" id="rect3796" width="32" height="32" x="0" y="1020.3622" rx="4" ry="4" /> <path id="path3798" d="M 16,1036.3622 1.15625,1051.206 c 0.723,0.723 1.73575,1.1562 2.84375,1.1562 l 24,0 c 1.108,0 2.12075,-0.4332 2.84375,-1.1562 L 16,1036.3622 z" style="fill:#d8d8d8;fill-opacity:1;stroke:none" inkscape:connector-curvature="0" /> <rect ry="3" rx="3" y="1021.3622" x="1" height="30" width="30" id="rect3800" style="fill:#ffffff;fill-opacity:1;stroke:none" /> <rect style="fill:url(#linearGradient3804);fill-opacity:1;stroke:none" id="rect3802" width="30" height="29" x="1" y="1022.3622" rx="3" ry="3" /> <g id="g2993" transform="matrix(0.21772207,0,0,0.21772207,4,1029.3577)"> <path id="path2995" d="m 42.980315,14.456693 c 0,0 -1.452756,-2.976378 -1.948819,-3.968504 C 37.700788,3.8976377 37.771654,3.543307 34.405512,3.0826771 33.448819,2.9763779 32.952756,2.8346456 32.952756,2.3740157 l 0,-2.09055114 0.283465,-0.21259842 c 6.094488,0 19.665354,0 19.665354,0 l 0.496063,0.17716535 0,2.09055111 c 0,0.46063 -0.318897,0.7086614 -1.027559,0.7086614 L 50.952756,3.2598425 C 47.338583,3.543307 47.940945,4.9960629 50.314961,9.7795274 L 73.02756,56.232283 73.807087,56.444881 93.968505,8.6102361 C 94.677166,6.6614172 94.570867,5.3149605 93.68504,4.4999999 92.76378,3.7204724 92.125985,3.2598425 89.787402,3.1535433 L 87.90945,3.047244 c -0.248032,0 -0.46063,-0.070866 -0.673229,-0.2480314 C 87.023623,2.6574803 86.917324,2.4803149 86.917324,2.2322834 l 0,-1.98425191 0.283464,-0.21259842 22.783462,0 0.24803,0.21259842 0,1.98425191 c 0,0.5314961 -0.31889,0.8149606 -0.92126,0.8149606 -3.01181,0.1417323 -5.20866,0.7795276 -6.62598,1.9488189 -1.45276,1.1338583 -2.58661,2.7637795 -3.366141,4.8543306 0,0 -18.531497,42.4133855 -24.874016,56.5157475 -2.444882,4.641732 -4.818898,4.216535 -6.944882,-0.141733 C 63.070867,57.118109 50.598426,29.374015 50.598426,29.374015 L 42.980315,14.456693 z" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" inkscape:connector-curvature="0" /> <path id="path2997" d="m 79.37008,0.03543307 c 0,0 -12.791339,-0.03543307 -18.496064,0 l -0.283464,0.21259842 0,1.98425191 c 0,0.2480315 0.106299,0.4251969 0.283464,0.6023622 0.212599,0.1417323 0.425197,0.2125984 0.673229,0.2125984 l 0.92126,0.1062993 c 2.338582,0.1062992 3.401574,0.7086614 3.720472,1.0984251 0.566929,0.6732284 0.814961,1.4173229 -0.531496,4.3582677 L 41.740158,56.303149 41.137796,56.161416 c 0,0 -17.149607,-36.141731 -22.110237,-48.2244082 -0.496063,-1.2401575 -0.744094,-2.1968504 -0.744094,-2.7637795 0,-1.2047244 1.098425,-1.8779528 3.330708,-1.984252 l 2.586615,-0.1062992 c 0.673228,0 1.027559,-0.2480315 1.027559,-0.8149606 l 0,-1.98425194 -0.248032,-0.17716535 c 0,0 -20.515748,-0.03543307 -24.7322835,0 L 0,0.28346456 0,2.3740157 C 0,2.7637795 0.46062993,2.9763779 1.4173228,3.0826771 4.0393701,3.2244094 5.7401575,3.6496062 6.5551182,4.3582676 7.4055119,5.031496 8.2559056,6.8031495 9.4251969,9.566929 15.625984,24.519685 28.877953,51.23622 35.326772,66.437007 c 1.84252,4.145669 4.181102,4.783464 7.015748,-0.141732 4.889764,-9.1063 18.177166,-36.885827 18.177166,-36.885827 L 71.007875,9.8503935 c 1.204724,-2.0905511 2.409449,-3.9330708 2.976378,-4.7834644 1.098425,-1.5590551 1.73622,-1.8779528 4.712598,-2.0196851 0.602362,0 0.92126,-0.2480314 0.92126,-0.8149606 l 0,-1.98425191 -0.248031,-0.21259842 z" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" inkscape:connector-curvature="0" /> </g> </g> </svg>',
                    'vcard': 'fa fa-user'
                });
            }
        });
})();


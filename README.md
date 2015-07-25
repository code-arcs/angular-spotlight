# Angular Spotlight 

[![Build Status](https://travis-ci.org/SteKoe/angular-spotlight.svg)](https://travis-ci.org/SteKoe/angular-spotlight)
[![Dependency Status](https://david-dm.org/SteKoe/angular-spotlight.svg)](https://david-dm.org/SteKoe/angular-spotlight)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)


Spotlight is _the_ awesome search feature of Mac OS X.
Now it is time to move this piece of software into the web area.

The final result of this project is to have an angular directive which consumes a list of result items coming from any search service one can imagine (Lucene, Elastic Search, ...).
The preliminary JSON format which is consumed by the directive is as follows:

```
[
  {
    "name": "I am a category",
    "items": [
    	{
    		"name": "First result in category",
    		"type": "Whatever",
    		"description": "Whatever description",
    		...
    	},
    	...
    ]
  },
  {
    ...
  }
  ...
]
```

The current implementation takes name and items attributes to create the result list as seen in the theming section below.

All rights regarding the design, concept and of course the name "Spotlight" are probably Trademarks of Apple Inc. 
The background image which is used to illustrate to transparency is taken from apfellike.com.

## Themes

Angular Spotlight currently includes three themes: Dark, Light and Material Design. 
This is - of course - due to the dark and light themes available on Mac OS.
Thanks to Lukas @Pandaros for adding the light theme as well as the Material Design theme - much appreciated! :)

![](docs/screenshot-light-theme.png)
![](docs/screenshot-dark-theme.png)
![](docs/screenshot-material-theme.png)

## Third Party Libs
 * We adopted the behavior, look and feel from Apple's Spotlight from Mac OS
 * Implements InputGrow Feature implemented by James Padolsey
 * Background of Material Design Theme is taken from Google's Material Design Guide ([1](https://plus.google.com/photos/+BrianParkerson/albums/6079410227152958097/6079410228948829362?pid=6079410228948829362&oid=110417708449272621219))

## License
Copyright 2015 Stephan Köninger

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

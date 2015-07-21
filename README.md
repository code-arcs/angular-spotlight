# Angular Spotlight

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
 * Background of Material Design Theme is taken from Google's Material Design Guide

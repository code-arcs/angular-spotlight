# Angular Spotlight

Spotlight is _the_ awesome search feature of Mac OS X.
Now it is time to move this piece of software into the web area.

The final result of this project is to have an angular directive which consumes a list of result items coming from any search service one can imagine (Lucene, Elastic Search, ...).
The preliminary JSON format is as follows:

```
{
  "I am a category" : {
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
  ...
}
```

The current implementation takes name and items attributes to create the result list as seen in the picture below.

All rights regarding the design, concept and of course the name "Spotlight" are probably Trademarks of Apple Inc. 
The background image which is used to illustrate to transparency is taken from apfellike.com.

![](docs/screenshot-dark-theme.png)

## Configuration

Tbd. We want to allow users to set custom search functions (oh really?...) as well as custom icons which are displayed along the search result in the list of results.
We currently include a standard default icon taken from famfamfam's icon set.

## Themes

Angular Spotlight currently includes two themes: Dark and Light. 
This is - of course - due to the dark and light themes available on Mac OS.
Thanks to Lukas @Pandaros for adding the light theme - much appreciated! :)

![](docs/screenshot-light-theme.png)
![](docs/screenshot-dark-theme.png)

## Planned Features
 * We are going to include another theme which complies to Google's Material Design Guidelines (Thanks to @Pandaros)
 * The layout of the details pane is going to be customizable and will change depending on the result item type (e.g. wikipedia). This allows one to create individual detail views for any kind of result item which fits the needs of the selected item (e.g. preview images, display maps, ...)

## Third Party Libs
 * We use icons from famfamfam's icon library located at http://famfamfam.com.
 * We adopted the behavior, look and feel from Apple's Spotlight from Mac OS.
 * Implements InputGrow Feature implemented by James Padolsey 

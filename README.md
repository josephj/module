module
======

A YUI implementation of "[Scalable JavaScript Application Architecture](http://www.slideshare.net/nzakas/scalable-javascript-application-architecture)" theory by Nicholoas Zakas. 

## Features

### Sandboxing

The main theory is that every module should be a sandbox and live on its own.
The instance provides useful attributes and methods for developer to work.

```javascript
YUI.add("module1", function (Y) {

    var module1 = new Y.module({
        selector: "#module1",
        init: function () {
            // Initial settings.
        },
        on: {
            // Triggers when this dom element is contentready.
            viewload: function () {
                module.log("viewload() is executed.");
                var node = this.get("node");
                // Bind events.
            }
        }
    });

}, "VERSION", {
    requires: ["module"]
});
```

### Loose Coupling

You can make cross-module communication by listening and broadcating model.
This approach is great for loose coupling. 

* Module 1:

    ```javascript
    module1.listen("need-love", function (name, id, data) {
        console.log(name); // The message name.
        console.log(id);   // The caller id.
        console.log(data); // The data that caller provides.
        // Check data to see if you want to have next step.
    });
    ```

* Module 2:

    ```javascript
    module2.broadcast("need-love", {
        "gender": "male",
        "hobbies": ["jogging", "movie"]
    });
    ```

### Page-level Control

Sometimes you may need to implement a feature that doesn't belongs to any view module.
However, you still want to use the listen/broadcast model to make interaction between different modules.
Y.ModuleManager is the right one to help.

```javascript
var manager = new Y.ModuleManager(attrs); // It's a singleton. All instances are the same.
manager.broadcast("playing", data);
manager.listen("seek", handler)
```

### Extensible

Developer can choose to require the extensions they need to have more useful attributes and methods.

* module-intl - For translation.

    ```javascript
    module.getTrans(<key>, <default_string>);
    ```
* module-analytics - For Google Analytics.

    ```javascript
    module.trackPageView(<path>);
    module.trackEvent(<category>, <action>, <label>);
    ```
* module-dialog - For custom dialogs.

    ```javascript
    module.alert(<msg>, <callback>);
    module.confirm(<msg>, <callback>);
    ```
  * You can even transform the module itself to a dialog.      
    
    ```javascript
    new Y.Module({
        selector: "#foo",
        dialog: true
    });
    ```

## Examples

### JavaScript Modular Platform

This example shows the concept of cross-module interactions.
Be aware the library used there is the elder version. 
I will update it recently.

* URL: http://josephj.com/project/javascript-platform-yui-demo/
* Github: https://github.com/josephj/javascript-platform-yui-demo

### ModuleDialog Extension

A very convenient way to create custom alert and confirm UIs.

* URL: http://lab.josephj.com/2013/module/sample/demo-dialog.html
* GitHub: https://github.com/miiicasa/module/blob/master/sample/demo-dialog.html

## Questions?

Someone said I should use custom event (Y.fire and Y.on) to achieve cross-module communication. 
Indeed it works but it only solves one problem. What this theory solves is about team work,
you need to make some constrait to developer to prevent everyone can do something wild. 

Also, I find it's a really great foundation for us to build necessary extensions. 
It helps us to have swift methods and consistent UIs very easily.
Sometimes it's dangerous that everyone calls native YUI or jQuery methods.
It might produce thousands implementations for one simple feature.

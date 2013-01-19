module
======

A YUI implementation of "Scalable JavaScript Application Architecture" theory by Nicholoas Zakas. 

## Features

### Sandboxing

The main theory is that every module should be a sandbox and live on its own.
The instance provides useful attributes and methods for developer to work.

```
YUI.add("module1", function (Y) {

    var module1 = new Y.module({
        selector: "#module1",
        init: function () {
            // Initial settings.
        },
        on: {
            // Triggers when the dom is contentready.
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
````javascript
module1.listen("need-love", function (name, id, data) {
    console.log(name); // The message name.
    console.log(id);   // The caller id.
    console.log(data); // The data that caller provides.
    // Check data to see if you want to have next step.
});
````
* Module 2:
````javascript
module2.broadcast("need-love", {
    "gender": "male",
    "hobbies": ["jogging", "movie"]
});
````

### Extensible



Sandboxes can 'listen' for a specific message.
While a sandbox broadcasts this specific message, 

However, if it's necessary to have interaction between different sandboxes, 


## Classes

* Y.ModuleManager - A singleton to manage all sandbox instances. It matches listening and broadcasting sandboxes. 

* Y.Module - It creates a sandbox instance.

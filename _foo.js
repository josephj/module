YUI.add("_foo", function (Y) {

    var _node;

    var module = new Y.Module({
        "selector": "#foo",
        "events": {
            "click": {
            }
        }
    });

    module.on("viewload", function (e) {
        var that = this;
        _node = self.get("node");
    });

});

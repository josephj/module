YUI.add("_foo", function (Y) {

    var _node,
        _api;

    _api = new Y.Module({
        id: "foo",
        init: function () {
            var that = this;
            that.listen("say-hello", function (id, msg) {
                // that.log(id + " says " + msg);
            });
        },
        on: {
            viewload: function () {
                _node = this.get("node");
                _node.setStyle("background", "pink");
                this.broadcast("change-background", "red");
            },
            message: function (o) {
                _node.one("ul").append("<li>Received '" + o.name + "' message from '" + o.id + "'.</li>");
            }
        }
    });

}, "0.0.1", {requires: ["module", "node-style"]});

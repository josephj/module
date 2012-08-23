YUI.add("_foo", function (Y) {

    var _node,
        _module;

    _module = new Y.Module({
        selector: "#foo",
        init: function () {
            _module = this;
            _module.listen("say-hello", function (id, msg) {
                // that.log(id + " says " + msg);
            });
        },
        on: {
            viewload: function () {
                _node = _module.get("node");
                _node.setStyle("background", "pink");
                _module.broadcast("change-background", "red");
            },
            message: function (o) {
                _node.one("ul").append("<li>Received '" + o.name + "' message from '" + o.id + "'.</li>");
            }
        }
    });

}, "0.0.1", {requires: ["module", "node-style"]});

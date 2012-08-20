YUI.add("_foo", function (Y) {

    var module = new Y.Module({
        id: "foo",
        init: function () {
            this.listen("say-hello", function (id, msg) {
                this.log(id + " says " + msg);
            });
        },
        on: {
            viewload: function () {
                this.get("node").setStyle("background", "pink");
                alert(this.broadcast);
                this.broadcast("change-background", "red");
            },
            message: function () {
            }
        }
    });

}, "0.0.1", {requires: ["module", "node-style"]});

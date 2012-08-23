YUI.add("_bar", function (Y) {

    var module = new Y.Module({
        selector: "#bar",
        init: function () {
            var that = this;
            that.broadcast("say-hello", "hello");
            that.listen("change-background", function (name, id, data) {
                that.get("node").setStyle("background", "red");
            });
        },
        on: {
            viewload: function () {
                this.get("node").setStyle("background", "yellow");
            },
            message: function () {
            }
        }
    });


}, "0.0.1", {requires: ["module", "node-style"]});

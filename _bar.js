YUI.add("_bar", function (Y) {

    var module = new Y.Module({
        id: "bar",
        init: function () {
            this.listen("change-background", function (o) {
                this.get("node").setStyle("background", "red");
            });
        },
        on: {
            viewload: function () {
                this.get("node").setStyle("background", "yellow");
                this.broadcast("say-hello", "hello");
            },
            message: function () {
            }
        }
    });


}, "0.0.1", {requires: ["module", "node-style"]});

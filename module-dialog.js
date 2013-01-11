/*global YUI */
YUI.add("module-dialog", function (Y) {

    var _log,
        _panel,
        _panels,  // The Y.Panel instances array.
        //===========================
        // Shortcuts
        //===========================
        Lang = Y.Lang,
        //===========================
        // Constants
        //===========================
        DEFAULT_ATTR = {
            modal: true,
            visible: true,
            xy: [0, 0],
            zIndex: 4,
            hideOn: [
                {
                    eventName: "clickoutside"
                }
            ]
        },
        MODULE_ID = "module-dialog",
        _showPanel;

    /**
     * A convenient alias method for Y.log(<msg>, "info", "module-analytics");
     *
     * @method _log
     * @private
     */
    _log = function (msg, type, module) {
        type = type || "info";
        module = module || MODULE_ID;
        Y.log(msg, type, module);
    };

    /**
     * @method _showPanel
     * @param attr {Object} The config attribute.
     */
    _showPanel = function (attr) {
        var panel;
        if (!_panels.length) {
            panel = new Y.Panel(attr);
        }
        panel.on("visibleChange", function (e) {
            if (!e.newVal) {
                _panels.shift();
                panel.destroy();
            }
        });
        panel.show();
        _panels.push(panel);
    };

    /**
     * The module intl extension.
     *
     * Code sample:
     *
     *     YUI.add("<your module>", function (Y) {
     *
     *         _api = new Y.Module({
     *             selector: "#foo",
     *             init: function () {},
     *             on: {
     *                 viewload: function () {}
     *             },
     *             dialog: true  // Transform it to a dialog.
     *         });
     *
     *     }, "0.0.1", {
     *         requires: {
     *             "module",
     *             "module-dialog"
     *         }
     *     });
     *
     * @class ModelDialog
     */
    function ModuleDialog() {}

    ModuleDialog.ATTRS = {
        /**
         * Set true to transform this module to dialog.
         * It will maps our module structure.
         *
         * @attribute dialog
         * @type {Boolean}
         * @default false
         * @writeOnce
         */
        dialog: {
            value: false,
            validator: Lang.isBoolean,
            writeOnce: true
        }
    };

    ModuleDialog.prototype = {
        /**
         * Code Sample:
         *
         *     // Simple alert.
         *     _api.alert("Hello World!");
         *
         *     // Set a callback function if necessary.
         *     _api.alert("Hello World!", function () {
         *         // do something...
         *     });
         *
         *     // Customize the alert.
         *     _api.alert({
         *         "headerContent": "Cool Title",
         *         "bodyContent": "Cool Content",
         *         "buttons": {
         *         }
         *     });
         */
        "alert": function (msg, callback) {
        },
        /**
         * Code Sample:
         *
         *     // Simple confirm.
         *     _api.confirm("Are you sure to...", function (result) {
         *         if (result) { // Yes
         *             // do something...
         *         }
         *     });
         *
         *     // Set a callback function if necessary.
         *     _api.confirm("Hello World!", function () {
         *         // do something...
         *     });
         *
         *     // Customize the confirm.
         *     _api.confirm({
         *         "headerContent": "Cool Title",
         *         "bodyContent": "Cool Content"
         *     });
         *
         *  @method confirm
         *  @param msg {String|Object}
         *  @param callback {Function} The callback function.
         */
        "confirm": function (msg, callback) {
            var attr;
            if (Y.Lang.isObject(msg)) {
                attr = msg;
            } else {
                attr = {};
                attr.bodyContent = msg;
            }
            attr.buttons = [
                {
                    value: "Yes",
                    action: function (e) {
                        callback(true);
                    },
                    section: Y.WidgetStdMod.FOOTER
                },
                {
                    value: "No",
                    action: function (e) {
                        callback(true);
                        _panel.hide();
                    },
                    section: Y.WidgetStdMod.FOOTER
                }

            ];
            _showPanel(attr);
        },
        "open": function (msg, callback) {
            var attr;
            attr.hideOn = [{eventName: 'clickoutside'}];
        },
        "initializer": function (config) {
            var panel;
            if (config.dialog) {
                panel = new Y.Panel({
                });
            }
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModuleDialog]);

}, "0.0.1", {
    "requires": [
        "module",
        "panel"
    ]
});

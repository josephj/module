/*global YUI, document */
YUI.add("module-dialog", function (Y) {

    "use strict";

    // Create a plugin to augment Panel.hide to fire "autohide" event.
    function PanelPlugin() {
        PanelPlugin.superclass.constructor.apply(this, arguments);
    }
    PanelPlugin.NAME = "panel-autohide-plugin";
    PanelPlugin.NS = "autohide";
    Y.extend(PanelPlugin, Y.Plugin.Base, {
        initializer: function () {
            this.beforeHostMethod("hide", function (e) {
                var type = (e && e.type) ? e.type : null,
                    keyCode = (e && e.keyCode) ? e.keyCode : null;
                if (type === "key" && keyCode === 27) {
                    this.get("host").fire("autohide", {type: type});
                }
            });
        }
    });

    /**
     * Y.Module extension that provides convenient methods to create
     * custom alert and confirm dialog UI easily. Even better, you can transform
     * whole module to a panel directly.
     *
     * @module module
     * @submodule module-dialog
     */

    var _panel,
        _handler,
        //===========================
        // Shortcuts
        //===========================
        Lang = Y.Lang,
        //===========================
        // Constants
        //===========================
        DEFAULT_WIDTH = 400,
        DEFAULT_ATTR = {
            modal   : true,
            render  : true,
            visible : true,
            width   : DEFAULT_WIDTH,
            xy      : [0, 0],
            zIndex  : 4
            hideOn  : [
                {
                    node: Y.one("document"),
                    eventName: "key",
                    keyCode: "esc"
                }
            ]
        },
        WIDGET_CLASS_PREFIX = "yui3-widget-",
        DIALOG_CLASS = "yui3-module-dialog",
        MODULE_ID = "module-dialog",
        //===========================
        // Methods
        //===========================
        _log,
        _setMarkup,
        _showPanel;

    /**
     * A convenient alias method for Y.log(<msg>, "info", "module-dialog");
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
     * Set the class names which Y.Widget needs.
     *
     * @method _setMarkup
     * @private
     */
    _setMarkup = function (node) {
        node.addClass(DIALOG_CLASS);
        if (node.one(".hd")) {
            node.one(".hd").addClass(WIDGET_CLASS_PREFIX + "hd");
        }
        if (node.one(".bd")) {
            node.one(".bd").addClass(WIDGET_CLASS_PREFIX + "bd");
        }
        if (node.one(".ft")) {
            node.one(".ft").addClass(WIDGET_CLASS_PREFIX + "ft");
        }
    };

    /**
     * Shows the panel.
     * It creates YUI Panel instance for first time.
     *
     * @method _showPanel
     * @param attr {Object} The config attribute.
     * @param callback {Function} The callback function.
     * @param type {Object} The dialog type, it can be "alert" or "confirm".
     */
    _showPanel = function (attr, callback, type) {
        _log("_showPanel() is executed.");
        callback = callback || function () {};
        if (!_panel) {
            _panel = new Y.Panel(attr);
            _panel.plug(PanelPlugin);
            _panel.on("visibleChange", function (e) {
                if (e.newVal === false && _handler) {
                    _log("_handle is detached.");
                    _handler.detach();
                }
            });
        }

        attr.centered = true;
        _panel.setAttrs(attr);
        _panel.get("boundingBox").addClass(DIALOG_CLASS);
        _handler = _panel.on("autohide", function (e, callback, type) {
            if (type === "confirm") {
                callback(false);
            } else {
                callback();
            }
        }, _panel, callback, type);
        _panel.show();
    };

    /**
     * ModuleDialog is a extension of Module class.
     * This class makes module instance can create alert and confirm UI easily.
     * Even better, you can transform your module to a panel directly.
     *
     * @class ModelDialog
     * @constructor
     */
    function ModuleDialog() {
        this.lang = Y.Intl.get("module");
    }

    ModuleDialog.ATTRS = {
        /**
         * Indicate whether to transform this module to an YUI panel.
         *
         * @attribute dialog
         * @type {Boolean}
         * @writeOnce
         * @default false
         */
        dialog: {
            value: false,
            validator: Lang.isBoolean,
            writeOnce: true
        },
        /**
         * The dialog collections.
         *
         * @attribute dialog
         * @type {Array}
         * @readOnly
         */
        dialogs: {
            value: [],
            readOnly: true
        },
        /**
         * Indicate whether to show the module.
         * This only works when having dialog attribute set to true.
         *
         * @attribute visible
         * @type {Boolean}
         * @default false
         */
        visible: {
            value: false,
            validator: Y.Lang.isBoolean,
            readOnly: true
        },
        /**
         * When dialog is set to true, this will be the YUI Panel instance.
         *
         * @attribute panel
         * @type {Y.Panel}
         * @readOnly
         */
        panel: {
            value: null,
            readOnly: true
        },
        /**
         * Specify the dialog width.
         * It's only useful when dialog sets to true.
         *
         * @attribute width
         * @type {Number}
         * @writeOnce
         * @default 400
         */
        width: {
            value: DEFAULT_WIDTH,
            validator: Y.Lang.isNumber,
            writeOnce: true
        }
    };

    ModuleDialog.prototype = {
        /**
         * Specify the content node of your module.
         *
         * @property CONTENT_NODE
         * @type String | Node
         * @default ".mod-content"
         */
        CONTENT_NODE: ".mod-content",
        /**
         * Normalize the user config attributes for alert and confirm methods.
         *
         * @method _getAttrs
         * @param attr {Object} The config attribute.
         *                      It only accepts title and content attribute.
         * @param type {String} It can be "confirm" or "alert".
         * @param callback {Function} The callback function.
         * @private
         */
        _getAttrs: function (attr, type, callback) {
            attr = attr || {};
            type = (type === "confirm") ? "confirm" : "alert";
            callback = (Y.Lang.isFunction(callback)) ? callback : function () {};

            var title,
                content,
                that = this,
                i;

            // Get dialog title and content.
            if (Y.Lang.isObject(attr)) {

                // Only title and content is valid.
                for (i in attr) {
                    if (attr.hasOwnProperty(i)) {
                        if (i !== "title" && i !== "content") {
                            attr[i] = null;
                            delete attr[i];
                        }
                    }
                }
                if (attr.title) {
                    title = attr.title;
                    delete attr.title;
                }
                if (attr.content) {
                    content = attr.content;
                    delete attr.content;
                }
            } else if (Y.Lang.isString(attr)) {
                content = attr;
                attr = {};
            }
            if (!title) {
                title = (type === "confirm") ? that.lang.confirm_default_title : that.lang.alert_default_title;
            }
            attr.headerContent = '<h2>' + title + '</h2>';
            attr.bodyContent   = '<div class="content">' + content + "</div>";

            // Get dialog buttons.
            switch (type) {
            case "confirm":
                attr.buttons = [
                    {
                        value: that.lang.confirm_ok_button,
                        action: function (e) {
                            callback(true);
                            _panel.hide();
                        },
                        section: Y.WidgetStdMod.FOOTER
                    },
                    {
                        value: that.lang.confirm_cancel_button,
                        action: function (e) {
                            callback(false);
                            _panel.hide();
                        },
                        section: Y.WidgetStdMod.FOOTER
                    }
                ];
                break;
            case "alert":
                attr.buttons = [
                    {
                        value: that.lang.alert_button,
                        action: function (e) {
                            callback();
                            _panel.hide();
                        },
                        section: Y.WidgetStdMod.FOOTER
                    }
                ];
                break;
            case "inform":
                attr.hideOn = [];
                attr.buttons = [];
                break;
            }
            return Y.merge(DEFAULT_ATTR, attr);
        },
        /**
         * Custom UI replacement for window.alert.
         *
         * @method alert
         * @param msg {String|Object} The alert message.
         * @param callback {Function} The callback function.
         * @public
         */
        "alert": function (msg, callback) {
            _log("alert() is executed.");
            var that = this,
                attr;
            attr = that._getAttrs(msg, "alert", callback);
            _showPanel(attr, callback, "alert");
        },
        /**
         * Custom UI replacement for window.confirm.
         *
         * @method confirm
         * @param msg {String|Object}
         * @param callback {Function} The callback function.
         * @public
         */
        "confirm": function (msg, callback) {
            _log("confirm() is executed.");
            var that = this,
                attr;
            attr = that._getAttrs(msg, "confirm", callback);
            _showPanel(attr, callback, "confirm");
        },
        /**
         * @method info
         * @param msg {String|Object}
         * @param callback {Function} The callback function.
         * @public
         */
        "inform": function (msg, callback) {
            _log("inform() is executed.");
            var that = this,
                attr;
            attr = that._getAttrs(msg, "confirm", callback);
            _showPanel(attr, callback);
        },
        /**
         * Hide all _panel.
         * This method is particular designed for the 'inform' method because
         * it has no way to close itself.
         *
         * @method dismiss
         * @param msg {String|Object}
         * @public
         */
        "dismiss": function () {
            _log("dismiss() is executed.");
            _panel.hide();
        },
        /**
         * Make a customized dialog.
         * It's a shortcut method for creating a new Y.Panel instance.
         *
         * @method create
         * @param attr {Object}
         * @public
         * @return {Y.Panel} The Panel instance.
         */
        "_create": function (attr) {
            _log("create() is executed.");
            var panel = new Y.Panel(attr);
            panel.render(document.body);
            return panel;
        },
        /**
         * Make a customized dialog.
         * It's a shortcut method for creating a new Y.Panel instance.
         *
         * @method openDialog
         * @param html {String|Node} The module's node or HTML.
         * @param attr {Object} The Y.Panel attribute object.
         * @param name {Object} Provide name if you want to reuse the dialog.
         * @public
         * @return {Y.Panel} The Panel instance.
         */
        openDialog: function (html, attr, name) {
            _log("openDialog() is executed.");
            var that = this,
                node,
                cache,
                panel;

            // Use existing dialog.
            if (name && that.get("dialogs")[name]) {
                _log("openDialog() - You are using an existed dialog.");
                cache = that.get("dialogs")[name];
                panel = cache.instance;

                // Update Attributes.
                attr = Y.merge(cache.attr, attr);
                panel.setAttrs(attr);

                // Update HTML.
                node = Y.Node.create(html);
                html = (node.one(".hd")) ? node.one(".hd").getHTML() : "";
                panel.set("headerContent", html);
                html = (node.one(".bd")) ? node.one(".bd").getHTML() : "";
                panel.set("bodyContent", html);
                html = (node.one(".ft")) ? node.one(".ft").getHTML() : "";
                panel.set("footerContent", html);

                // Show panel if it's necessary.
                if (!panel.get("visible")) {
                    panel.show();
                }
                return panel;
            }

            attr = attr || {};
            attr = Y.merge({
                modal: true,
                centered: true,
                render: true,
                width: 660,
                zIndex: 3
            }, attr);

            node = Y.Node.create(html);
            node.addClass(DIALOG_CLASS + "-custom");
            _setMarkup(node);
            attr.boundingBox = node;
            attr.contentBox = node.one(".mod-content");

            panel = new Y.Panel(attr);
            panel.get("hideOn").push({"eventName": "clickoutside"});

            if (name) {
                // Save the reusable dialog.
                that.get("dialogs")[name] = {};
                that.get("dialogs")[name].html = html;
                that.get("dialogs")[name].instance = panel;
                that.get("dialogs")[name].attr = attr;
            } else {
                // Destroy use-once dialog.
                panel.on("visibleChange", function (e) {
                    var that = this;
                    if (e.prevVal && !e.newVal) {
                        _log("openDialog() - The dialog has been destroyed.");
                        that.destroy();
                    }
                });
            }

            return panel;
        },
        /**
         * Make the dialog visible.
         *
         * @method show
         * @public
         */
        "show": function () {
            var that = this,
                panel = that.get("panel");
            if (!panel) {
                return;
            }
            panel.set("centered", true);
            panel.show();
        },
        /**
         * Make the panel invisible.
         *
         * @method hide
         * @public
         */
        "hide": function () {
            var that = this,
                panel = that.get("panel");

            if (!panel) {
                return;
            }
            panel.hide();
        },
        /**
         * Designated initializer.
         * Transform module to dialog if having dialog atribute set to true.
         *
         * @method initializer
         * @public
         */
        "initializer": function (config) {
            // Don't do anything is not having dialog set to true.
            if (!config.dialog) {
                return;
            }

            var that = this,
                attr,
                node,
                panel;

            // Transform module to dialog.
            node = Y.one(that.get("selector"));
            _setMarkup(node);
            attr = Y.merge(DEFAULT_ATTR, {
                boundingBox: node,
                contentBox: node.one(that.CONTENT_NODE),
                visible: false,
                render: false,
                zIndex: 3,
                width: that.get("width")
            });
            panel = that._create(attr);
            panel.get("hideOn").push({
                eventName: "clickoutside"
            });
            panel.on("visibleChange", function (e) {
                that._set("visible", e.newVal);
            });
            that._set("panel", panel);
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModuleDialog]);

}, "0.0.1", {
    "requires": [
        "module",
        "panel",
        "plugin",
        "intl"
    ]
});

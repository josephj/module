/*global YUI, document */
YUI.add("module-dialog", function (Y) {

    "use strict";

    /**
     * An extension that provides ability to use
     * several predefined dialog UIs.
     *
     * @module module-dialog
     * @author josephj
     */

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
                if ((type === "key" && keyCode === 27) || type === "clickoutside") {
                    this.get("host").fire("autohide", {type: type});
                }
            });
        }
    });

    /**
     * The ModuleDialog class that provides convenient methods to
     * use several predefined dialog UIs.
     *
     * <ul>
     * <li>The `alert` method can replace standard `window.alert`.</li>
     * <li>The `confirm` method can replace standard `window.confirm`.</li>
     * <li>The `inform` method shows a simple text overlay
     * without header and buttons.</li>
     * </ul>
     *
     * @class ModuleDialog
     * @param config {Object} User configuration object
     */
    var _dialog, // Shared dialog instance for `alert`, `confirm`, and `inform`.
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
        },
        DIALOG_CLASS = "yui3-module-dialog",
        MODULE_ID = "module-dialog",
        WIDGET_CLASS_PREFIX = "yui3-widget-",
        //===========================
        // Methods
        //===========================
        _log,
        _setMarkup,
        _showDialog;

    /**
     * A convenient alias method for
     * Y.log(<msg>, "info", "module-dialog");
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
     * Sets the class names which Y.Panel needs.
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
     * Shows dialog UI.
     *
     * @method _showDialog
     * @param attr {Object} The config attribute.
     * @param callback {Function} The callback function.
     * @param type {Object} The dialog type, it can be "alert" or "confirm".
     */
    _showDialog = function (attr, callback, type) {
        _log("_showDialog() is executed.");
        callback = callback || function () {};
        if (!_dialog) {
            _dialog = new Y.Panel(attr);
            _dialog.plug(PanelPlugin);
            _dialog.on("visibleChange", function (e) {
                if (e.newVal === false && _handler) {
                    console.log(e, "warn");
                    _log("_handle is detached.");
                    _handler.detach();
                }
            });
        }

        _dialog.setAttrs(attr);
        _dialog.get("boundingBox").addClass(DIALOG_CLASS);
        _handler = _dialog.on("autohide", function (e, callback, type) {
            if (type === "confirm") {
                callback(false);
            } else {
                callback();
            }
        }, _dialog, callback, type);
        _dialog.set("centered", true);
        _dialog.show();
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
            validator: Lang.isBoolean,
            readOnly: true
        },
        /**
         * The shared Y.Panel instance that alert, confirm, and inform uses.
         *
         * @attribute sharePanel
         * @type {Y.Node}
         * @readOnly
         */
        sharePanel: {
            value: null,
            getter: function () {
                return _dialog;
            },
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
            validator: Lang.isNumber,
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
            callback = (Lang.isFunction(callback)) ? callback : function () {};

            var title,
                content,
                that = this,
                i;

            // Get dialog title and content.
            if (Lang.isObject(attr)) {

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
            } else if (Lang.isString(attr)) {
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
                            _dialog.hide();
                        },
                        section: Y.WidgetStdMod.FOOTER
                    },
                    {
                        value: that.lang.confirm_cancel_button,
                        action: function (e) {
                            callback(false);
                            _dialog.hide();
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
                            _dialog.hide();
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
         * Shows an alert dialog box.
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
            _showDialog(attr, callback, "alert");
        },
        /**
         * Shows a confirm dialog box.
         *
         * @method confirm
         * @public
         * @param msg {String|Object}
         * @param callback {Function} The callback function.
         */
        "confirm": function (msg, callback) {
            _log("confirm() is executed.");
            var that = this,
                attr;
            attr = that._getAttrs(msg, "confirm", callback);
            _showDialog(attr, callback, "confirm");
        },
        /**
         * Shows an overlay which doesn't have buttons and
         * user can't close it.
         *
         * @method info
         * @public
         * @param msg {String|Object}
         * @param callback {Function} The callback function.
         */
        inform: function (msg, callback) {
            _log("inform() is executed.");
            var that = this,
                attr;
            attr = that._getAttrs(msg, "inform", callback);
            _showDialog(attr, callback, "inform");
        },
        /**
         * Hides dialog which invoked by `alert`, `confirm`, or `inform`.
         * It's especially useful for `inform` because user can't close
         * an inform dialog.
         *
         * @method dismiss
         * @public
         */
        dismiss: function () {
            _log("dismiss() is executed.");
            _dialog.hide();
        },
        /**
         * Make a customized dialog.
         * It's a shortcut method for creating a new Y.Panel instance.
         *
         * @method create
         * @param attr {Object}
         * @protected
         * @return {Y.Panel} The Panel instance.
         */
        _createModuleDialog: function () {
            _log("_createModuleDialog() is executed.");
            var that = this,
                attr,
                node,
                panel;

            // Prepares for creating a panel.
            node = Y.one(that.get("selector"));
            attr = Y.merge(DEFAULT_ATTR, {
                boundingBox: node,
                contentBox: node.one(that.CONTENT_NODE),
                visible: that.get("visible"),
                render: false,
                zIndex: 3,
                width: that.get("width") || DEFAULT_WIDTH
            });
            _setMarkup(node);

            panel = new Y.Panel(attr);
            panel.get("hideOn").push({
                eventName: "clickoutside"
            });
            panel.on("visibleChange", function (e) {
                that._set("visible", e.newVal);
            });
            panel.render(document.body);
            that._set("panel", panel);

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
         * Shows this module which has Y.Panel applied.
         *
         * @method show
         * @public
         */
        show: function () {
            var that = this,
                panel = that.get("panel");
            if (!panel) {
                return;
            }
            panel.set("centered", true);
            panel.show();
        },
        /**
         * Hides this module which has Y.Panel applied.
         *
         * @method hide
         * @public
         */
        hide: function () {
            var that = this,
                panel = that.get("panel");

            if (!panel) {
                return;
            }
            panel.hide();
        },
        /**
         * Applies Y.Panel to current module while the dialog attribute
         * sets to true.
         *
         * @method initializer
         * @protected
         * @param config {Object} Configuration object literal for Y.Module
         */
        initializer: function (config) {

            // Don't do anything is not having dialog set to true.
            if (!config.dialog) {
                return;
            }

            var that = this,
                attr,
                node,
                panel;

            // Transform module to dialog.
            if (that.get("ready")) {
                that._createModuleDialog();
            } else {
                that.on("viewload", Y.bind(that._createModuleDialog, that));
            }
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

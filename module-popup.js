/*global YUI, document */
YUI.add("module-popup", function (Y) {

    "use strict";

    /**
     * An extension that provides ability to use
     * several predefined pop-up UIs.
     *
     * @module module-popup
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
     * The ModulePopup class that provides convenient methods to
     * use several predefined pop-up UIs.
     *
     * <ul>
     * <li>The `alert` method can replace standard `window.alert`.</li>
     * <li>The `confirm` method can replace standard `window.confirm`.</li>
     * <li>The `inform` method shows a simple text overlay
     * without header and buttons.</li>
     * </ul>
     *
     * @class ModulePopup
     * @param config {Object} User configuration object
     */
    var _popup, // Shared pop-up instance for `alert`, `confirm`, and `inform`.
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
        POPUP_CLASS = "yui3-module-popup",
        MODULE_ID = "module-popup",
        WIDGET_CLASS_PREFIX = "yui3-widget-",
        //===========================
        // Methods
        //===========================
        _log,
        _setMarkup,
        _showPopup;

    /**
     * A convenient alias method for
     * Y.log(<msg>, "info", "module-popup");
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
        node.addClass(POPUP_CLASS);
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
     * Shows pop-up UI.
     *
     * @method _showPopup
     * @param attr {Object} The config attribute.
     * @param callback {Function} The callback function.
     * @param type {Object} Popup type including `alert`, `confirm` and `inform`.
     */
    _showPopup = function (attr, callback, type) {
        _log("_showPopup() is executed.");
        callback = callback || function () {};
        if (!_popup) {
            _popup = new Y.Panel(attr);
            _popup.plug(PanelPlugin);
            _popup.on("visibleChange", function (e) {
                if (e.newVal === false && _handler) {
                    console.log(e, "warn");
                    _log("_handle is detached.");
                    _handler.detach();
                }
            });
        }

        _popup.setAttrs(attr);
        _popup.get("boundingBox").addClass(POPUP_CLASS);
        _handler = _popup.on("autohide", function (e, callback, type) {
            if (type === "confirm") {
                callback(false);
            } else {
                callback();
            }
        }, _popup, callback, type);
        _popup.set("centered", true);
        _popup.show();
    };

    /**
     * ModulePopup is a extension of Module class.
     * This class makes module instance can create alert and confirm UI easily.
     * Even better, you can transform your module to a panel directly.
     *
     * @class ModelDialog
     * @constructor
     */
    function ModulePopup() {
        this.lang = Y.Intl.get("module");
    }

    ModulePopup.ATTRS = {
        /**
         * Indicate whether to transform this module to an YUI panel.
         *
         * @attribute popuped
         * @type {Boolean}
         * @writeOnce
         * @default false
         */
        popuped: {
            value: false,
            validator: Lang.isBoolean,
            writeOnce: true
        },
        /**
         * The pop-up collections.
         *
         * @attribute popups
         * @type {Object}
         * @readOnly
         */
        popups: {
            value: {
                "customs" : [],   // Custom Pop-ups (createPopup)
                "default" : null, // Default Pop-up (alert, confirm, and info)
                "module"  : null  // Module Pop-up (popuped: true)
            },
            readOnly: true
        },
        /**
         * Indicate whether to show the module.
         * This only works when having `popuped` attribute set to true.
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
         * Specifies the popup width.
         * It's only useful when `popuped` sets to true.
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

    ModulePopup.prototype = {
        /**
         * Specify the content node of your module.
         *
         * @property CONTENT_NODE
         * @type String | Node
         * @default ".mod-content"
         */
        CONTENT_NODE: ".mod-content",
        /**
         * Make a customized popup.
         * It's a shortcut method for creating a new Y.Panel instance.
         *
         * @method _createModulePopup
         * @protected
         * @param attr {Object}
         * @return {Y.Panel} The Panel instance.
         */
        _createModulePopup: function () {
            _log("_createModulePopup() is executed.");
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

            // Get pop-up title and content.
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

            // Get pop-up buttons.
            switch (type) {
            case "confirm":
                attr.buttons = [
                    {
                        value: that.lang.confirm_ok_button,
                        action: function (e) {
                            callback(true);
                            _popup.hide();
                        },
                        section: Y.WidgetStdMod.FOOTER
                    },
                    {
                        value: that.lang.confirm_cancel_button,
                        action: function (e) {
                            callback(false);
                            _popup.hide();
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
                            _popup.hide();
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
         * Shows an alert pop-up box.
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
            _showPopup(attr, callback, "alert");
        },
        /**
         * Shows a confirm pop-up box.
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
            _showPopup(attr, callback, "confirm");
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
            _showPopup(attr, callback, "inform");
        },
        /**
         * Hides pop-up which invoked by `alert`, `confirm`, or `inform`.
         * It's especially useful for `inform` because user can't close
         * an inform pop-up.
         *
         * @method dismiss
         * @public
         */
        dismiss: function () {
            _log("dismiss() is executed.");
            _popup.hide();
        },
        /**
         * Creates a customized pop-up.
         * It's a shortcut method for creating a new Y.Panel instance.
         *
         * @method createPopup
         * @param html {String|Node} The module's node or HTML.
         * @param attr {Object} The Y.Panel attribute object.
         * @param name {Object} Provide name if you want to reuse the pop-up,
         *                      or it will be destroyed after user hides it.
         * @public
         * @return {Y.Panel} The Panel instance.
         */
        createPopup: function (html, attr, name) {
            _log("createPopup() is executed.");
            var that = this,
                node,
                cache,
                panel;

            // Use existing pop-up.
            if (name && that.get("popups").customs[name]) {
                _log("createPopup() - You are using an existed pop-up.");
                cache = that.get("popups").customs[name];
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
            node.addClass(POPUP_CLASS + "-custom");
            _setMarkup(node);
            attr.boundingBox = node;
            attr.contentBox = node.one(".mod-content");

            panel = new Y.Panel(attr);
            panel.get("hideOn").push({"eventName": "clickoutside"});

            if (name) {
                // Save the reusable popup.
                that.get("popups").customs[name] = {
                    attr     : attr,
                    html     : html,
                    instance : panel
                };
            } else {
                // Destroy use-once popup.
                panel.on("visibleChange", function (e) {
                    var that = this;
                    if (e.prevVal && !e.newVal) {
                        _log("createPopup() - The popup has been destroyed.");
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
         * Applies Y.Panel to current module while the `popuped` attribute
         * sets to true.
         *
         * @method initializer
         * @protected
         * @param config {Object} Configuration object literal for Y.Module
         */
        initializer: function (config) {

            // Don't do anything is not having popuped set to true.
            if (!config.popuped) {
                return;
            }

            var that = this,
                attr,
                node,
                panel;

            // Transforms module to popup.
            if (that.get("ready")) {
                that._createModulePopup();
            } else {
                that.on("viewload", Y.bind(that._createModulePopup, that));
            }
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModulePopup]);

}, "0.0.1", {
    "requires": [
        "module",
        "panel",
        "plugin",
        "intl"
    ]
});

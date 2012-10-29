/*global YUI */
YUI.add("module", function (Y) {

    var _timers    = {}, // Timers checking if contentready events are executed.
        _manager   = null,
        //===========================
        // Shortcuts
        //===========================
        Lang = Y.Lang,
        //===========================
        // Constants
        //===========================
        MODULE_ID = "Y.Module",
        //===========================
        // Private Methods
        //===========================
        _log;

    // Create the manager instance.
    _manager = new Y.ModuleManager();

    /**
     * A convenient alias method for Y.log(<msg>, "info", "Y.Module");
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
     * Code Sample:
     *
     *     var module = new Y.Module({
     *         selector: "#foo"
     *     });
     *     module.on("viewload", function (e) {
     *         _node = this.get("node");
     *     });
     *     module.broadcast();
     *     module.listen();
     *
     * @class Module
     */
    function Module() {
        Module.superclass.constructor.apply(this, arguments);
    }

    Module.NAME = "module";
    Module.ATTRS = {
        /**
         * Whether this module has a corresponded view.
         *
         * @attribute hasView
         * @type {String}
         * @writeOnce
         */
        hasView: {
            value: true,
            validator: Y.Lang.isBoolean,
            writeOnce: true
        },
        /**
         * The CSS selector for module outbox element.
         *
         * @attribute selector
         * @type {String}
         * @writeOnce
         */
        selector: {
            value: null,
            writeOnce: true
        },
        /**
         * The module initialization function.
         *
         * @attribute init
         * @type Function
         */
        init: {
            value: null,
            validator: Y.Lang.isFunction,
            writeOnce: true
        },
        /**
         * The module node.
         *
         * @attribute node
         * @type Y.Node
         * @readOnly
         */
        node: {
            value: null,
            readOnly: true
        },
        /**
         * The default binding events.
         * Current only viewload and message are acceptable.
         *
         * @attribute on
         * @type Object
         * @writeOnce
         */
        on: {
            value: {},
            validator: Y.Lang.isObject,
            setter: function (o) {
                if (!Y.Lang.isObject(o)) {
                    return false;
                }
                Y.each(o, function (value, key) {
                    if (key !== "viewload" && key !== "message") {
                        delete o[key];
                    }
                });
                return o;
            },
            writeOnce: true
        },
        /**
         * Whether the module's view node is ready to be accessed.
         *
         * @attribute ready
         * @type Boolean
         * @readOnly
         */
        ready: {
            value: false,
            readOnly: true
        },
        /**
         * The messege names this module listens to.
         *
         * @attribute listeners
         * @type String[]
         * @readOnly
         */
        listeners: {
            value: [],
            validator: Lang.isArray,
            getter: function () {
                var id = this.get("id");
                _manager.get("listeners")[id];
            },
            readOnly: true
        }
    };
    Y.extend(Module, Y.Base, {
        /**
         * Module broadcast method.
         *
         * @method broadcast
         * @public
         * @param name {String}  The message label name, e.g. switch-view.
         *                       You should use verb for first word and use hyphen.
         * @param data {Mixed}   The data you want transmit to module which subscribe
         *                       this message.
         */
        broadcast: function (name, data, callback) {
            var that = this,
                selector = that.get("selector");

            _log("broadcast() is executed. The '" +
                 selector + "' module broadcasts a '" +
                 name + "' message.");

            data = data || {};
            callback = callback || function () {};
            _manager.addBroadcaster(selector, name, data, callback);
        },
        /**
         * Destroy the module instance.
         *
         * @method destructor
         * @public
         * @param needRemove {Boolean} Set false if you want to remove this module
         */
        destructor: function (needRemove) {
            _log("destructor() is executed.");
            var that = this;
            needRemove = needRemove || false;
            if (needRemove) {
                that.get("node").remove();
            }
        },
        /**
         * Get the view node of this module.
         * The purpose of creating this method is to be consistent
         * with previous version.
         *
         * @method getViewNode
         * @public
         * @return {Y.Node} The view node of this module.
         */
        getViewNode: function () {
            return this.get("node");
        },
        /**
         * Register a specific message you want listen.
         *
         * @method listen
         * @public
         * @param name {String} The message name.
         * @param callback {Function} The function you want execute after listen
         *                            this event...
         *                            message name, id, data, callback
         */
        listen: function (name, callback) {
            var that = this,
                selector = this.get("selector");
            _log("listen() is executed. The '" +
                 selector + "' module is listening for '" +
                 name + "' message.");
            _manager.addListener(selector, name, callback);
        },
        /**
         * A convenient alias method for Y.log(<msg>, "info", "<id>");
         *
         * @method log
         * @public
         */
        log: function (msg, type, module) {
            var that = this;
            type = type || "info";
            module = module || that.get("selector");
            Y.log(msg, type, module);
        },
        /**
         * Initialize the module instance.
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {
            _log("initializer() is executed. " +
                 "The " + config.selector + " module.");
            var that = this,
                init;

            config = config || {};

            if (config.hasView !== false && !config.selector) {
                _log("initialiser() - You must provide selector attribute.", "error");
                return;
            }

            // Execute module initializer.
            init = config.init || function () {};
            _manager.register(that);

            //==================
            //  Publish events
            //==================
            /**
             * It is triggered when this module receives
             * the registered messeges.
             * NOTE - from previous 'onmessage' handler.
             *
             * @event message
             * @public
             */
            that.publish("message", {emitFacade: true});
            /**
             * Use contentready to check if module view is loaded.
             * You can only get node attribute after this event.
             * NOTE - from previous 'onviewload' handler.
             *
             * @event viewload
             * @public
             */
            that.publish("viewload", {emitFacade: true});
        }
    });
    Y.Module = Module;
}, "0.0.1", {requires: ["base", "node-base", "event-base", "module-manager"]});

YUI.add("module", function (Y) {

    var _modules   = [], // The registered modules.
        _listeners = {}, // The listening message from modules.
        _timers    = {}, // Timers checking if contentready events are executed.
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
        _addListener,
        _log,
        _match;

    // Create the manager instance.
    _manager = new Y.ModuleManager();

    /**
     * Let a module listen for a specific message.
     *
     * @method _addListener
     * @private
     * @param id      {String} ID of the module which wants to listen.
     * @param label   {String} Target message label name.
     * @param handler {String} Target message label name.
     * @return        {String} listener ID for future use (remove, update...)
     */
    _addListener = function (id, label, handler) {
        _log("_addListener('" + id + "', '" + label + "') is executed.");
        var mapId;

        handler = handler || function () {};
        mapId = Y.guid();
        if (!Lang.isUndefined(_listeners[id])) {
            _listeners[id] = {};
        }
        _listeners[id][label] = handler;
        return mapId;
    };

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
     * Match event and modules which subscribes the event.
     *
     * @method _match
     * @private
     * @param name {String} The message label name.
     * @param id   {String} The broadcasting module ID.
     * @param data {Object} The data which the broadcasting module
     *                      shares with the subscribers.
     */
    _match = function (name, id, data) {
        _log("_match('" + name + "', '" + id + "') is executed.");
        var modules = [], // The influenced modules.
            i,
            listener, // The shortcut for iteration.
            key;      // The message label name.

        // Check the origin if it's defined.
        if (name.indexOf(":") !== -1) {
            if (id !== name.split(":")[0]) {
                _log("match('" + name + "') the id you assigned " +
                     "('" + name.split(":")[0] + ") is not identical with " +
                     "current module id '" + id + "'. Stop execution.", "warn");
                return;
            }
        }

        // Find out modules which subscribe / listen for this message.
        name = name.split(":")[1];
        for (i in _listeners) {
            if (_listeners.hasOwnProperty(i)) {
                listener = _listeners[i];
                if (!listener.name && !listener[id + ":" + name]) {
                    continue;
                }

                // Get the message label name.
                if (listener[id + ":" + name]) {
                    key  = id + ":" + name;
                } else {
                    key = name;
                }

                // Prevent user handlers' error.
                try {
                    listener[key](name, id, data);
                    if (!Lang.isUndefined(_modules[i].onmessage)) {
                        _modules[i].onmessage(name, id, data);
                    }
                    modules.push(i);
                }
                catch (e) {
                    _log("_match('" + name + "', '" + id + "') fails - " +
                         "Error occurs in " + i + " module's onmessage method. " +
                         "The error message is '" + e.message + "'", "error");
                }
            }
        }
        _log("_match('" + name + "', '" + id + "', '<data>') is executed " +
             "successfully! There are " + modules.length + " modules being " +
             "influenced: '#" + modules.join(", #") + "'");
    };

    /**
     * Code Sample:
     *
     *     var module = new Y.Module({
     *         id: "#foo",
     *         strings: {
     *
     *         }
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
        init: {
            value: null,
            writeOnce: true
        },
        id: {
            value: null,
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
         * Current module status.
         *
         * @attribute state
         * @type String
         * @readOnly
         */
        state: {
            value: "init",
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
            readOnly: true
        }
    };
    Y.extend(Module, Y.Base, {
        /**
         * Register this module instance to manager.
         */
        _register: function () {
            var that = this;
            _manager.register(that);
        },
        /**
         * Handles contentready event of this module
         *
         * @method _handleReady
         * @private
         */
        _handleReady: function () {
            _log("_handleReady() is executed.");
            var that = this,
                id;
            node = Y.one("#" + that.get("id"));
            that._set("node", node);
            that.fire("viewload");
            that._set("ready", true);
            that._set("state", ready);
        },
        /**
         * Module broadcast method.
         *
         * @method broadcast
         * @public
         * @param name {String}  The message label name, e.g. switch-view.
         *                       You should use verb for first word and use hyphen.
         * @param data {Mixed}   The data you want transmit to module which subscribe
         *                       this message.
         * @param target {Array} The target modules you want make sure your message
         *                       being transmitted even it doesn't exist.
         */
        broadcast: function (name, data) {
            var that = this,
                id = that.get("id");
            _log("broadcast('" + name + "') for " + id + " is executed.");
            if (name.indexOf(":") !== -1) {
                if (name.split(":")[0] !== id) {
                    _log("broadcast('" + name + "') the id you assigned" +
                         "is not identical with current module id.", "warn");
                    return false;
                }
            } else {
                name = id + ":" + name;
            }
            _match(name, id, data);
        },
        /**
         * Destroy the module instance.
         *
         * @method destructor
         * @public
         * @param needRemove {Boolean} Set false if you want to remove this module
         */
        destructor: function (needRemove) {
            needRemove = (needRemove) ? needRemove : false;
            if (needRemove) {
                that.get("node").remove();
            }
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
            _log("listen() - " + name + " by #" + this.get("id"));
            var that = this,
                id = that.get("id"),
                listeners;
            listeners = _manager.get("listeners");

            if (listeners[id]) {
                listeners = listeners[that.get("id")];
            } else {
                listeners[id] = {};
                listeners = listeners[id];
            }
            listeners[name] = callback;
            // Deubg - Y.log(_manager.get("listeners"), "debug");
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
            module = module || "#" + that.get("id");
            Y.log(msg, type, module);
        },
        /**
         * Initialize the module instance.
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {
            _log("initializer() - #" + config.id + " module.");

            var that = this,
                init;

            config = config || {};
            config.on = config.on || {};

            // Execute module initializer.
            init = config.init || function () {};
            that._register();
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

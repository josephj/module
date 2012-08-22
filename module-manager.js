/**
 * The singleton which manages all registered modules.
 *
 *     var manager = new Y.ModuleManager();
 *
 * @module module-manager
 */
YUI.add("module-manager", function (Y) {

    var _instance,      // For singleton.
        _queue = [],    // The queued broadcasting messages.
        _waitTotal = 0, // The amount of modules which are not ready.
        //===========================
        // Constants
        //===========================
        MODULE_ID = "Y.ModuleManager",
        //===========================
        // Private Method
        //===========================
        _handleReadyChange,
        _handleModuleReady,
        _log;

    /**
     * Handle when contentready event is triggered.
     *
     * @method _handleModuleReady
     * @private
     */
    _handleModuleReady = function (manager) {
        var module = this, // The module instance.
            id;

        _log("#" + module.get("id") + " is ready.");
        node = Y.one("#" + module.get("id"));
        module._set("node", node);
        module._set("ready", true);
        module._set("state", "ready");
        module.fire("viewload");
        _waitTotal -= 1;
        if (_waitTotal === 0) {
            manager._set("ready", true);
        }
    };

    /**
     * Handle manager ready event.
     * It executes broadcasting queue one by one.
     *
     * @method _handleReadyChange
     * @private
     */
    _handleReadyChange = function () {
        _log("_handleReadyChange() is executed.");
        var that = this,
            o;
        while (o = _queue.shift()) {
            that._match(o.name, o.id, o.data, o.callback);
        }
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
     * The singleton which manages all registered modules.
     *
     * @constructor ModuleManager
     */
    function ModuleManager() {
        if (!_instance) {
            ModuleManager.superclass.constructor.apply(this, arguments);
            _instance = this;
        }
        return _instance;
    }

    ModuleManager.NAME = "module-manager";
    ModuleManager.ATTRS = {
        /**
         * The listeners maps which applied from different modules.
         *
         *     {
         *         "foo": {
         *             "foo:message1": callback1,
         *             "foo:message2": callback2
         *         },
         *         "bar": {
         *             "bar:messageA": callback1
         *         }
         *     }
         *
         * @attribute listeners
         * @type Object
         */
        listeners: {
            value: {},
            validator: Y.Lang.isObject
        },
        /**
         * The registered modules.
         *
         *     {
         *         "foo": <Y.Module instance>,
         *         "bar": <Y.Module instance>
         *     }
         *
         * @attribute modules
         * @type Object
         */
        modules: {
            value: {},
            validator: Y.Lang.isObject
        },
        /**
         * Whether the module platform has been built-up.
         *
         * @attribute ready
         * @type Boolean
         */
        ready: {
            value: false,
            readOnly: true
        }
    };

    Y.extend(ModuleManager, Y.Base, {
        /**
         * Match event and modules which subscribes the event.
         *
         *     _match("bar:say-hello", "bar);
         *
         * @method _match
         * @private
         * @param name {String} The message label name.
         * @param id   {String} The broadcasting module ID.
         * @param data {Object} The data which the broadcasting module
         *                      shares with the subscribers.
         */
        _match: function (name, id, data, callback) {
            _log("_match('" + name + "', '" + id + "') is executed.");
            var that = this,
                modules,   // The influenced modules.
                listeners,
                listener,  // The shortcut for iteration.
                cached,
                i,         // The listener's module ID.
                key;       // The message label name.

            cached    = [];
            modules   = that.get("modules");
            listeners = that.get("listeners");
            name      = name.split(":")[1];

            // Loop to find matched listeners.
            for (i in listeners) {
                if (listeners.hasOwnProperty(i)) {
                    listener = listeners[i];

                    // Ignore unmatched listener.
                    if (!listener[name] && !listener[id + ":" + name]) {
                        continue;
                    }

                    // Get the message name.
                    if (listener[id + ":" + name]) {
                        key  = id + ":" + name;
                    } else {
                        key = name;
                    }

                    // Prevent user handlers' error.
                    try {
                        listener[key](name, id, data);
                        modules[i].fire("message", {
                            name: name,
                            id: id,
                            data: data
                        });
                        cached.push(i);
                    } catch (e) {
                        _log("_match('" + name + "', '" + id + "') fails - " +
                             "Error occurs in " + i + " module's onmessage method. " +
                             "The error message is '" + e.message + "'", "error");
                    }
                }
            }
            /*
            _log("_match('" + name + "', '" + id + "', '<data>') is executed " +
                 "successfully! There are " + cached.length + " modules being " +
                 "influenced: '#" + cached.join(", #") + "'");
                */
            _log("#" + id + ":" + name + " -> #" + cached.join(", #"));
        },
        /**
         * Register a broadcasting message in manager.
         *
         * @method addBroadcaster
         * @param id {String} The module ID.
         * @param name {String} The message name.
         * @param data {String} The message data.
         * @param callback {Function} The callback function.
         */
        addBroadcaster: function (id, name, data, callback) {
            var that = this;
            data = data || {};
            callback = callback || {};
            // The prefix must be identical with module ID.
            if (name.indexOf(":") !== -1) {
                if (name.split(":")[0] !== id) {
                    _log("addBroadcaster() - The assigned ID ('" + name + "') " +
                         "is not identical with current module id.", "warn");
                    return false;
                }
            } else {
                name = id + ":" + name;
            }

            if (that.get("ready")) {
                _log("addBroadcaster() - The network is ready. Match this " +
                     "broadcaset message '" + name + "' with " +
                     "exisiting listeners.");
                that._match(name, id, data, callback);
            } else {
                _log("addBroadcaster() - The network is not ready. " +
                     "Keep this broadcaset message '" + name + "' in queue.",
                     "warn");
                _queue.push({
                    id: id,
                    name: name,
                    data: data,
                    callback: callback
                });
            }
        },
        /**
         * Let a module listen for a specific message.
         *
         * @method addListener
         * @public
         * @param id {String} ID of the module which wants to listen.
         * @param name {String} Target message label name.
         * @param callback {String} Target message label name.
         */
        addListener: function (id, name, callback) {
            _log("addListener('" + id + "', '" + name + "') is executed.");
            var that = this,
                listeners; // The shortcut for existing listeners.

            listeners = that.get("listeners");
            if (listeners[id]) {
                listeners[id][name] = callback;
            } else {
                listeners[id] = {};
                listeners[id][name] = callback;
            }
        },
        /**
         * Let the module manager can be able to broadcast to other modules.
         *
         * @method broadcast
         * @public
         */
        broadcast: function (name, data, callback) {
            _log("broadcast('" + name + "', <data>, <callback>) is executed.");
            var that = this;
        },
        initializer: function () {
            var that = this;
            that.on("readyChange", _handleReadyChange, that);
        },
        listen: function () {
        },
        register: function (module) {
            _log("register() #" + module.get("id") + " module.");
            var that = this,
                modules = that.get("modules");
            modules[module.get("id")] = module;
            try {
                module.get("init").call(module);
            } catch (e) {
                _log("module init fails - " +
                     "The error message is '" + e.message + "'", "error");
            }
        },
        start: function (module) {
            _log("start() #" + module.get("id") + " module.");
            var that = this,
                selector = "#" + module.get("id");
            if (!module.get("ready")) {
                _waitTotal += 1;
                Y.on("contentready", _handleModuleReady, selector, module, that);
            }
        },
        /**
         * Launch the module platform.
         *
         * @method startAll
         * @public
         */
        startAll: function () {
            _log("startAll() is executed.");
            var that = this;
                modules = that.get("modules");

            Y.each(modules, function (module) {
                that.start(module);
            });
        }
    });

    Y.ModuleManager = ModuleManager;

}, "0.0.1", {requires: ["base"]});


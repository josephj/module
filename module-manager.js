/**
 * The singleton which manages all registered modules.
 *
 *     var manager = new Y.ModuleManager();
 *
 * @module module-manager
 */
/*global YUI */
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
     * Handle when a module's contentready event is triggered.
     *
     * @method _handleModuleReady
     * @private
     */
    _handleModuleReady = function (manager) {
        var module = this, // The module instance.
            node,
            id;

        _log("_handleModuleReady() is executed. The '" +
             module.get("selector") + "' module is ready.");

        // Update this module's attribute and fires the viewload event.
        module._set("node", Y.one(module.get("selector")));
        module._set("ready", true);
        module.fire("viewload");

        // Check if all registered modules are ready.
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
        _log("_handleReadyChange() is executed. " +
             "The module network has been established.");
        var that = this,
            o = _queue.shift();
        while (o) {
            that._match(o.name, o.id, o.data, o.callback);
            o = _queue.shift();
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
                    var module = modules[i];
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
            _log(id + ":" + name + " -> " + cached.join(", #"));
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

            _log("addBroadcaster() is executed. The '" +
                 name + "' message by '" + id + "' module " +
                 "is walking through manager.");

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
                // Match this message with existing listeners.
                that._match(name, id, data, callback);
            } else {
                _log("addBroadcaster() - The network is not ready. " +
                     "Keep this message '" + name + "' in queue.",
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
        addListener: function (selector, name, callback) {
            var that = this,
                listeners; // The shortcut for existing listeners.

            _log("addListener() is executed. The listener for '" +
                 name + "' message by '" + selector + "' module " +
                 "is added to manager.");

            listeners = that.get("listeners");
            if (listeners[selector]) {
                listeners[selector][name] = callback;
            } else {
                listeners[selector] = {};
                listeners[selector][name] = callback;
            }
        },
        /**
         * Manager broadcasts a message to other modules.
         *
         * @method broadcast
         * @param name {String} The message name.
         * @param data {String} The belonging data.
         * @param callback {Function} The callback function.
         * @public
         */
        broadcast: function (name, data, callback) {
            _log("broadcast('*:" + name + "', <data>, <callback>) is executed.");
            var that = this;
            that.addBroadcaster("*", name, data, callback);
        },
        /**
         * The init method for Module Manager.
         * It just simply binds required events.
         *
         * @method initializer
         * @public
         */
        initializer: function () {
            var that = this;
            that.on("readyChange", _handleReadyChange, that);
        },
        /**
         * Manager listens for a specific message from modules.
         *
         * @method listen
         * @public
         * @param name {String} The message name.
         * @param callback {Function} The callback function.
         */
        listen: function (name, callback) {
            _log("broadcast('*:" + name + "', <data>, <callback>) is executed.");
            var that = this;
            that.addListener("*", name, callback);
        },
        /**
         * Let individual Y.Module instance registers so the module can be started.
         *
         * @method register
         * @public
         * @param module {Y.Module} The Y.Module instance.
         */
        register: function (module) {
            var that = this,
                modules = that.get("modules"),
                selector = module.get("selector");

            _log("register() - " + selector + " module.");

            try {
                module.get("init").call(module);
            } catch (e) {
                _log("register() - module registers fails because " +
                     "'" + e.message + "'", "error");
                return;
            }

            // Add this module to manager's 'modules' attribute.
            modules[selector] = module;
        },
        /**
         * Start a specific module.
         * It listens for contentready event to make sure the module is ready.
         *
         * @method start
         * @public
         * @param module {Y.Module} The module instance.
         */
        start: function (module) {
            _log("start() is executed. The manager starts the '" + module.get("selector") + "' module.");
            var that = this,
                selector = module.get("selector");
            if (!module.get("ready")) {
                _waitTotal += 1;
                Y.on("contentready", _handleModuleReady, selector, module, that);
            }
        },
        /**
         * Start all registered modules to launch the module network.
         *
         * @method startAll
         * @public
         */
        startAll: function () {
            _log("startAll() is executed. The manager starts all registered module.");
            var that = this,
                modules = that.get("modules");

            Y.each(modules, function (module) {
                that.start(module);
            });
        }
    });

    Y.ModuleManager = ModuleManager;

}, "0.0.1", {requires: ["base"]});


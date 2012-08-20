YUI.add("module-manager", function (Y) {

    var _instance,
        _log;

    /**
     * A convenient alias method for Y.log(<msg>, "info", "Y.Module");
     *
     * @method _log
     * @private
     */
    _log = function (msg, type, module) {
        type = type || "info";
        module = module || "Y.ModuleManager";
        Y.log(msg, type, module);
    };

    /**
     *
     * @class ModuleManager
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
         * All registered modules.
         *
         * @attribute modules
         * @type Object
         */
        modules: {
            value: {},
            validator: Y.Lang.isObject
        },
        listeners: {
            value: {}
        }
    };

    Y.extend(ModuleManager, Y.Base, {
        _platformReady: false,
        _nonReadyCount: 0,
        _queue: [],
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
        _match: function (name, id, data) {
            _log("_match('" + name + "', '" + id + "') is executed.");
            Y.log(id, "warn");
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
        },
        addBroadcaster: function (id, name, data, callback) {
            alert("add broadcast");
            _log("addBroadcaster('" + id + "', '" + name + "', <data>, <callback>) is executed.");
            if (name.indexOf(":") !== -1) {
                if (name.split(":")[0] !== id) {
                    _log("broadcast('" + name + "') the id you assigned" +
                         "is not identical with current module id.", "warn");
                    return false;
                }
            } else {
                name = id + ":" + name;
            }

            if (that._platformReady) {
                alert("ready");
                that._match(name, id, data, callback);
            } else {
                alert("not ready");
                that._queue.push({
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
            _log("_addListener('" + id + "', '" + name + "') is executed.");
            var that = this,
                listeners;
            listeners = that.get("listeners");
            if (listeners[id]) {
                listeners = listeners[that.get("id")];
            } else {
                listeners[id] = {};
                listeners = listeners[id];
            }
            listeners[name] = callback;
        },
        broadcast: function () {
        },
        initializer: function () {
            var that = this;
            that.on("runQueue", function (e) {
                var that = this;
                var o;
                Y.log(that._queue, "warn");
                while (o = that._queue.shift()) {
                    that._match(o.name, o.id, o.data, o.callback);
                }
            });
        },
        listen: function () {
        },
        register: function (module) {
            _log("register() - #" + module.get("id") + " module.");
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
            _log("start() - #" + module.get("id") + " module.");
            var that = this;
            Y.on("contentready", function () {
                _log("contentready - #" + module.get("id"));

                var that = this,
                    id;
                node = Y.one("#" + module.get("id"));
                module._set("node", node);
                module.fire("viewload");
                module._set("ready", true);
                module._set("state", "ready");
                that._nonReadyCount -= 1;
                if (that._nonReadyCount === 0) {
                    that._platformReady = true;
                    that.fire("runQueue");
                }
            }, "#" + module.get("id"), that);
        },
        /**
         */
        startAll: function () {
            _log("startAll() is executed.");
            var that = this;
                modules = that.get("modules");

            Y.each(modules, function (module) {
                if (!module.get("ready")) {
                    that._nonReadyCount += 1;
                    that.start(module);
                }
            });
        }
    });

    Y.ModuleManager = ModuleManager;

}, "0.0.1", {requires: ["base"]});


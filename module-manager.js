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
        },
    };

    Y.extend(ModuleManager, Y.Base, {
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
            Y.on("contentready", function () {
                var that = this,
                    id;
                node = Y.one("#" + that.get("id"));
                that._set("node", node);
                that.fire("viewload");
                that._set("ready", true);
                that._set("state", "ready");
            }, "#" + module.get("id"), module);
        },
        startAll: function () {
            _log("startAll() is executed.");
            var that = this;
                modules = that.get("modules");

            Y.each(modules, function (module) {
                if (!module.get("ready")) {
                    that.start(module);
                }
            });
        },
        listen: function () {
        },
        broadcast: function () {
        }
    });

    Y.ModuleManager = ModuleManager;

}, "0.0.1", {requires: ["base"]});


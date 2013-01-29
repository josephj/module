/*global YUI */
YUI.add("module-list", function (Y) {

    var MODULE_ID = "module-list",
        _log;

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
    function ModuleList() {
        ModuleList.superclass.constructor.apply(this, arguments);
    }

    ModuleList.NAME = "module-list";
    ModuleList.ATTRS = {
        selectors: {
            value: [],
            writeOnce: true,
            validator: Y.Lang.isArray
        },
        modules: {
            value: [],
            validator: Y.Lang.isArray,
            readOnly: true
        }
    };

    Y.extend(ModuleList, Y.Base, {
        /**
         * Initialize the module instance.
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {
            _log("initializer() is executed");

            var that = this;
            config = config || {};

            if (!config.selectors) {
                _log("initializer() - You must provide selectors attribute.", "error");
                return;
            }

            Y.each(config.selectors, function (selector) {
                var o,      // New config object for individual module.
                    module; // Module instance.

                o = Y.merge(config);
                delete o.selectors;
                o.selector = selector;
                module = new Y.Module(o);
                that.get("modules").push(module);
            });
        }
    });

    Y.ModuleList = ModuleList;

}, "0.0.1", {
    "group"    : "mui",
    "js"       : "module/module-list.js",
    "requires" : [
        "base",
        "module"
    ]
});

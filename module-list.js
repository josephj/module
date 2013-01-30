/*global YUI */
YUI.add("module-list", function (Y) {

    /**
     * If you want to write single JavaScript file for multiple modules
     * with almost-same behavior, you can use `module-list` instead of `module`.
     *
     * ## Before
     *
     * ```javascript
     * new Y.Module({
     *     selector: "#foo",
     *     init: function () {},
     *     on: {
     *         viewload: function () { // do something }
     *     }
     * });
     * new Y.Module({
     *     selector: "#bar",
     *     init: function () {},
     *     on: {
     *         viewload: function () { // do same something }
     *     }
     *  });
     * ```
     *
     * ## After
     *
     * ```javascript
     * new Y.ModuleList({
     *     selectors: ["#foo", "#bar"],
     *     init: function () {},
     *     on: {
     *         viewload: function () { // do something }
     *     }
     * });
     * ```
     *
     * @module module-list
     */

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
     *     var modules = new Y.ModuleList({
     *         selectors: ["#foo", "#bar"],
     *         on: {
     *             viewload: function (e) {
     *                 var node = this.get("node");
     *             }
     *         }
     *     });
     *
     * @constructor ModuleList
     */
    function ModuleList() {
        ModuleList.superclass.constructor.apply(this, arguments);
    }

    ModuleList.NAME = "module-list";
    ModuleList.ATTRS = {
        /**
         * The CSS selectors of matched modules.
         * Currently it only supports ID selectors.
         *
         * @attribute selectors
         * @type {Array}
         * @writeOnce
         */
        selectors: {
            value: [],
            writeOnce: true,
            validator: Y.Lang.isArray
        },
        /**
         * The Y.Module collection in this ModuleList.
         *
         * @attribute modules
         * @type {Array}
         * @readOnly
         */
        modules: {
            value: [],
            validator: Y.Lang.isArray,
            readOnly: true
        }
    };

    Y.extend(ModuleList, Y.Base, {
        /**
         * Initialize the ModuleList instance.
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {
            _log("initializer() is executed");

            var that = this;
            config = config || {};

            if (!config.selectors || !Y.Lang.isArray(config.selectors)) {
                _log("initializer() - You must provide selectors attribute.", "error");
                return;
            }

            Y.each(config.selectors, function (selector) {
                var o;      // New config object for individual module.
                o = Y.clone(config);
                delete o.selectors;
                o.selector = selector;
                that.get("modules").push(new Y.Module(o));
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

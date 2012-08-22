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
         *
         * @method _register
         * @private
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
                id,
                node;
            node = Y.one("#" + that.get("id"));
            that._set("node", node);
            that.fire("viewload");
            that._set("ready", true);
            that._set("state", "ready");
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
         */
        broadcast: function (name, data, callback) {
            var that = this,
                id = that.get("id");

            data = data || {};
            callback = callback || function () {};
            _manager.addBroadcaster(id, name, data, callback);
        },
        /**
         * Destroy the module instance.
         *
         * @method destructor
         * @public
         * @param needRemove {Boolean} Set false if you want to remove this module
         */
        destructor: function (needRemove) {
            var that = this;
            needRemove = needRemove || false;
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
            var that = this;
            _log("listen() - " + name + " by #" + this.get("id"));
            _manager.addListener(that.get("id"), name, callback);
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

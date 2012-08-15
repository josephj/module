YUI.add("module", function (Y) {

    var _manager, // The Y.ModuleManager instance.
        _log;

    /**
     * A convenient alias method for Y.log(<msg>, "info", "Y.Module");
     *
     * @method _log
     * @private
     */
    _log = function (msg, type, module) {
        type = type || "info";
        module = module || "Y.Module";
        Y.log(msg, type, module);
    };

    /**
     * Code Sample:
     *
     *     var module = new Y.Module({
     *         selector: "#foo",
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
    /**
     * The poll interval in millionseconds.
     *
     * @property POLL_INTERVAL
     * @type int
     * @static
     * @final
     */
    Module.POLL_INTERVAL = 40;
    /**
     * The number of times we should look for element that are not
     * in the DOM at the time the event is requested after the document
     * has been loaded.
     *
     * @property POLL_RETRYS
     * @type int
     * @static
     * @final
     */
    Module.POLL_RETRYS = 1000;

    Module.ATTRS = {
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
         * The selector for module.
         * It will be used on contentready.
         *
         * @attribute selector
         */
        selector: {
            value: null,
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
            value: null,
            validator: Y.Lang.isArray,
            readOnly: true
        }
    };

    Y.extend(Module, Y.Base, {
        _retryCount: Module.POLL_RETRYS,
        _handleReady: function () {
            var that = this;
            node = Y.one(that.get("selector"));
            that._set("node", node);
            that._set("ready", true);
            that.fire("viewload", {
                node: node
            });
        },
        _poll: function () {
            var that = this;
            if (!that.get("ready") && that._retryCount > 0) {
                that._retryCount = that._retryCount - 1;
                Y.later(that.POLL_INTERVAL, that, that._poll);
                return;
            } else if (that._retryCount === 0) {
                Y.log("Sorry the module doesn't exists.", "warn");
            }
        }
        /**
         * Register the message you want listen.
         *
         * @method
         * @public
         * @param name {String} The message name.
         * @param callback {Function} The function you want execute after listen
         *                            this event...
         *                            message name, id, data, callback
         */
        listen: function (name, callback) {
            callback.call(that);
        },
        broadcast: function (name, data) {

        },
        getTrans: function (key, defaultMessage, token) {

        },
        /**
         *
         * @method initializer
         * @public
         */
        initializer: function (config) {

            var that = this;
            config = config || {};

            Y.on("contentready", that._handleReady, that.get("selector"), that);

            // Make polling to detect if module fails to load.
            that._poll();

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
        },
        /**
         *
         */
        destructor: function () {
        },
    });

    Y.Module = Module;

}, "0.0.1", {require: ["node-base", "event-base"]});

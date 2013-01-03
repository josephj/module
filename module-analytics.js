/*global YUI, window */
/**
 * An extension for Y.Module which lets
 * module instance can apply Google Analytics
 *
 * @module module-analytics
 * @requires base-build, module
 */
YUI.add("module-analytics", function (Y) {

    var _tracker,
        _log,
        _getTracker,
        MODULE_ID = "module-analytics";

    /**
     * A convenient alias method for Y.log(<msg>, "info", "module-analytics");
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
     * Get the tracker instance.
     *
     * @method _getTracker
     * @private
     * @return {Boolean} false if ga.js is not installed.
     */
    _getTracker = function () {
        if (!window._gaq) {
            return false;
        }

        if (!_tracker) {
            _tracker = window._gaq;
        }

        return _tracker;
    };

    /**
     * The module intl extension.
     *
     * @class ModelIntl
     */
    function ModuleAnalytics() {}

    ModuleAnalytics.prototype = {
        /**
         * Track an event for Google Analytics.
         *
         * @method trackEvent
         * @public
         * @param category {String} The group of objects you want to track.
         * @param action {String} The ype of user interaction for the object.
         * @param label {String} Provide additional dimensions to the event data. (Optional)
         * @param value {String} Provide numerical data about the user event. (Optional)
         * @param noninteraction {String} true if indicates that the event hit will not be used in bounce-rate calculation.
         * @return {Boolean} false if GA doesn't exist.
         */
        trackEvent: function (category, action, label, value, noninteraction) {

            // Get tracker instance.
            _tracker = _getTracker();
            if (!_tracker) {
                _log("_getTracker() - You must have the ga.js tracking code " +
                     "installed on this page.", "error");
                return false;
            }

            _log("trackEvent() is executed.");

            // Add arguments.
            var args = ["_trackEvent"];
            Y.each(arguments, function (arg) {
                args.push(arg);
            });

            // Add exception handling for third-party code.
            try {
                _tracker.push(args);
            } catch (e) {
                Y.error(e.message, e, {
                    "module": "module-analytics",
                    "fnName": "trackEvent"
                });
            }
            return true;
        },
        /**
         * Track an event for Google Analytics.
         *
         * @method trackPageview
         * @public
         * @param path {String} Optional parameter to indicate what page URL
         *                      to track metrics under. When using this option,
         *                      use a beginning slash (/) to indicate the page URL.
         * @return {Boolean} false if GA doesn't exist.
         */
        trackPageview: function (path) {

            path = path || "";

            //  Make sure the path has a beginning slash.
            if (path && path.substr(0, 1) !== "/") {
                _log("trackPageview() - You must use a beginning slash " +
                     "for path parameter.", "warn");
                return false;
            }

            // Get tracker instance.
            _tracker = _getTracker();
            if (!_tracker) {
                _log("_getTracker() - You must have the ga.js tracking code " +
                     "installed on this page.", "error");
                return false;
            }

            try {
                _tracker.push(["_trackPageview", path]);
            } catch (e) {
                Y.error(e.message, e, {
                    "module": "module-analytics",
                    "fnName": "trackPageview"
                });
            }

            _log("_trackPageview() is executed. " +
                 "The '" + path + "' page view is tracked");
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModuleAnalytics]);

}, "0.0.1", {
    "group"    : "mui",
    "js"       : "module/module-analytics.js",
    "requires" : [
        "base-build",
        "module"
    ]
});

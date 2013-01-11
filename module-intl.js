/*global YUI, window */
/**
 * An extension for Y.Module which lets
 * module instance can get translation strings.
 *
 * @module module-intl
 * @requires base-build, module, intl, substitute
 */
YUI.add("module-intl", function (Y) {

    var _log,
        MODULE_ID = "module-intl";

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
     * The module intl extension.
     *
     * @class ModelIntl
     */
    function ModuleIntl() {}

    ModuleIntl.ATTRS = {
        /**
         * Module must define its lang module before executing getTrans.
         *
         * @attribute langModule
         * @type String
         */
        langModule: {
            value: null
        },
        /**
         * The active language tag.
         *
         * @attribute langTag
         * @type String
         */
        langTag: {
            valueFn: function () {
                var lang = Y.config.lang;
                if (!lang) {
                    return "en-US";
                }
                if (Y.Lang.isString(lang)) {
                    lang = Y.Lang.trim(lang.split(",")[0]);
                } else if (Y.Lang.isArray(lang)) {
                    lang = lang[0];
                }
                return lang;
            }
        },
        /**
         *  The translation collection for this language module.
         *
         *  @attribute trans
         *  @type Object
         */
        trans: {
            value: null,
            validator: Y.Lang.isObject
        },
        transReplace: {
            valueFn: function () {
                var replace = Y.config.transReplace;
                return (replace && Y.Lang.isArray(replace)) ? replace : [];
            },
            validator: Y.Lang.isArray
        }
    };

    ModuleIntl.prototype = {
        /**
         * Get translation according to current language module and tag.
         *
         * @method getTrans
         * @public
         * @param key {String} The trnalation key.
         * @param value {String} The default value.
         * @param token {Object} The replace token object.
         */
        getTrans: function (key, value, token) {
            _log("getTrans() is executed.");
            var that = this,
                trans,   // The translation strings in same module.
                tag,     // The language tag.
                text,
                result,
                id,      // The module ID. It could also be class name.
                module;  // The language module.

            value  = value || "";
            tag    = that.get("langTag");
            module = that.get("langModule");

            // The Y.Module instance must define langModule attribute.
            if (!module) {
                _log("getTrans() - Skip because langModule attribute " +
                     "is not defined.", "warn");
                return "";
            }

            // Get tranlation resource array.
            trans = that.get("trans");
            if (!trans) {
                trans = Y.Intl.get(module) || {};
                that._set("trans", trans);
            }

            // Full language key is composed by module name, div id, and key.
            id  = that.get("selector").replace("#", "").replace(".", "");
            id = id.replace(/-/g, "_");
            key = [module, id, key].join("-");

            // Return default value if trans for this key doesn't exist.
            text = trans[key];
            if (!text) {
                _log("getTrans() - This language key '" + key +
                     "' has not been translated yet.", "warn");
                value = (token) ? Y.substitute(value, token) : value;
                return value;
            }

            result = (token) ? Y.substitute(text, token) : text;

            Y.each(that.get("transReplace"), function (o) {
                result = result.replace(o.from, o.to);
            });
            return result;
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModuleIntl]);

}, "0.0.1", {
    "group"    : "mui",
    "js"       : "module/module-intl.js",
    "requires" : [
        "base-build",
        "module",
        "intl",
        "substitute"
    ]
});

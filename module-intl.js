/*global YUI */
YUI.add("module-intl", function (Y) {

    var _log,
        MODULE_ID = "Y.ModuleIntl";

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
     */
    function ModuleIntl() {}

    ModuleIntl.ATTRS = {
        langModule: {
            value: null
        },
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
        trans: {
            value: null,
            validator: Y.Lang.isObject
        }
    };

    ModuleIntl.prototype = {
        getTrans: function (key, value, token) {
            _log("getTrans() is executed.");
            var that = this,
                trans,   // The translation strings in same module.
                tag,     // The language tag.
                text,
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
            key = [module, id, key].join("-");

            // Return default value if trans for this key doesn't exist.
            text = trans[key];
            if (!text) {
                _log("getTrans() - This language key '" + key +
                     "' has not been translated yet.", "warn");
                return value;
            }

            return (token) ? Y.substitute(text, token) : text;
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModuleIntl]);

}, "0.0.1", {requires: ["base-build", "module", "intl", "substitute"]});

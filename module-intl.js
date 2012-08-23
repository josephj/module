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
            value: ""
        },
        langTag: {
            value: Y.config.lang,
            setter: function (value) {
            }
        },
        trans: {
            value: null,
            validator: Y.Lang.isObject
        }
    };

    ModuleIntl.prototype = {
        initializer: function () {
            _log("initializer() is executed.");
            var that = this,
                module = that.get("langModule"),
                tag = that.get("langTag");

            if (!module || !tag) {
                return;
            }

            Y.use("lang/" + module + "_" + tag, function (Y) {
                Y.Intl.setLang(module, tag);
                that._set("trans", Y.Intl.get(module));
                Y.log('hi');
            });

        },
        getTrans: function (key, value, token) {
            _log("getTrans() is executed.");
            var that = this,
                isExist,
                trans,
                tag,
                token,
                text,
                id,
                module; // The language module.

            tag = that.get("langTag");
            token = token || null;
            value = value || "";
            module = that.get("langModule");
            id = that.get("selector").replace("#", "").replace(".", "");

            // Make sure module name has been defined.
            if (!that.get("langModule")) {
                _log("getTrans() fails because module is not defined.", "error");
                return;
            }

            // Get tranlation resource array.
            trans = that.get("trans");

            if (!trans) {
                Y.use("lang/" + module + "_" + tag, function (Y) {
                    Y.Intl.setLang(module, tag);
                    that._set("trans", Y.Intl.get(module));
                    that.getTrans.apply(that, [key, value, token]);
                });
                return;
            }

            // Full language key is composed by module name, div id, and key.
            key = [module, id, key].join("-");

            // Check if the key exists in language resource.
            isExist =  (trans[key]) ? true : false;
            if (isExist) {
                text = trans[key];
            } else {
                _log("getTrans() - This language key '" + key +
                     "' has not been translated yet.", "warn");
                text = value;
            }

            if (token) {
                text = Y.substitute(text, token);
            }
            return text;
        }
    };

    Y.Module = Y.Base.mix(Y.Module, [ModuleIntl]);

}, "0.0.1", {requires: ["base-build", "module", "intl", "substitute"]});

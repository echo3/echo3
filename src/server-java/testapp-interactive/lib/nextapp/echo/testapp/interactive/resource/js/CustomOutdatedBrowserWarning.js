/**
 * Custom outdated browser warning implementation
 */
CustomOutdatedBrowserWarning = Core.extend(Echo.Client.OutdatedBrowserWarning, {
    $static: {

        boot: function(client) {
            client.setOutdatedBrowserWarning(new CustomOutdatedBrowserWarning());
        }
    },

    $load: function() {
        Echo.Boot.addInitMethod(this.boot);
    },

    /** Container div */
    _div: null,

    /** Anchor element within the container div used to dismiss the warning */
    _aClose: null,

    /** Creates a new DefaultWaitIndicator. */
    $construct: function() {
        this._div = document.createElement("div");
        this._div.id = "outdatedBrowserHint";

        // Style the message window
        this._div.style.cssText = "border: 4px solid red; position:relative; z-index:32767; left: 10px; top: 10px; width: 300px; height: 100px; overflow:hidden; " +
            "background-color:white;color:black;text-align:center;padding:10px";

        // Anchor element that can be clicked to dismiss the warning
        this._aClose = document.createElement("a");
        this._aClose.style.cssText = "text-decoration: underline; cursor: pointer; color: blue;";
        this._aClose.setAttribute("onClick", "document.getElementById('"+this._div.id+"').parentNode.removeChild(document.getElementById('"+this._div.id+"')); return false;");
    },

    /** @see Echo.Client.OutdatedBrowserWarning#show */
    show: function(client) {
        if (client.configuration && client.configuration["OutdatedBrowserWarning.Text"]) {
            this._div.innerHTML = client.configuration["OutdatedBrowserWarning.Text"];
        } else {
            this._div.innerHTML = 'I am a custom outdated browser warning. It seems you are using an outdated browser. Please consider upgrading: ' +
                '<a href="http://whatbrowser.org">http://whatbrowser.org</a> ';
        }

        if (client.configuration && client.configuration["OutdatedBrowserWarning.CloseText"]) {
            this._aClose.innerHTML = client.configuration["OutdatedBrowserWarning.CloseText"];
        } else {
            this._aClose.innerHTML = "Click to dismiss the warning";
        }

        this._div.appendChild(this._aClose);

        // Insert div as the first child of the parent element of the application root element (usually the body)
        client.domainElement.parentNode.insertBefore(this._div, client.domainElement);
    },

    /** @see Echo.Client.OutdatedBrowserWarning#dispose */
    dispose: function(client) {
        if (this._div && this._div.parentNode) {
            this._div.parentNode.removeChild(this._div);
        }
        this._div = null;
    }
});

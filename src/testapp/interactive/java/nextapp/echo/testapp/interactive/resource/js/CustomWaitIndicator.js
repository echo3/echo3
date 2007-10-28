/**
 * @class Default wait indicator implementation.
 */
CustomWaitIndicator = Core.extend(EchoRemoteClient.WaitIndicator, {

    $static: {
    
        boot: function(client) {
            client.setWaitIndicator(new CustomWaitIndicator());
        }
    },
    
    $staticConstruct: function() {
        EchoBoot.addInitMethod(this.boot);
    },

    $construct: function() {
        this._divElement = document.createElement("div");
        this._divElement.style.cssText = "display: none; z-index: 32767; position: absolute; top: 30px; right: 30px; width: 200px;"
                 + " padding: 20px; border: 1px outset #000000; background-color: #000000; color: #00ff00; text-align: center;";
        this._divElement.appendChild(document.createTextNode("LOADING"));
        this._fadeRunnable = new Core.Scheduler.Runnable(new Core.MethodRef(this, this._tick), 50, true);
        document.body.appendChild(this._divElement);
    },
    
    activate: function() {
        this._divElement.style.display = "block";
        Core.Scheduler.add(this._fadeRunnable);
        this._opacity = 0;
    },
    
    deactivate: function() {
        this._divElement.style.display = "none";
        Core.Scheduler.remove(this._fadeRunnable);
    },
    
    _tick: function() {
        ++this._opacity;
        // Formula explained:
        // this._opacity starts at 0 and is incremented forever.
        // First operation is to modulo by 40 then subtract 20, result ranges from -20 to 20.
        // Next take the absolute value, result ranges from 20 to 0 to 20.
        // Divide this value by 30, so the range goes from 2/3 to 0 to 2/3.
        // Subtract that value from 1, so the range goes from 1/3 to 1 and back.
        var opacityValue = 1 - ((Math.abs((this._opacity % 40) - 20)) / 30);
        if (!WebCore.Environment.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            this._divElement.style.opacity = opacityValue;
        }
    }
});

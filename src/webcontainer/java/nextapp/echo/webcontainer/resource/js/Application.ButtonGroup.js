/**
 * RadioButton group.
 * 
 * @param id {String} the id
 */
EchoApp.ButtonGroup = function(id) {
	this._id = id;
	this._buttonArray = new Array();
};

/**
 * Gets the id of this button group.
 * 
 * @return the id.
 * @type {String}
 */
EchoApp.ButtonGroup.prototype.getId = function() {
    return this._id;
};

/**
 * Gets the amount of buttons contained by this button group.
 * 
 * @return the number of buttons.
 * @type {Number}
 */
EchoApp.ButtonGroup.prototype.size = function() {
    return this._buttonArray.length;
};

/**
 * Adds the specified button to this button group.
 *
 * @param button {EchoRender.ComponentSync.ToggleButton} the button
 */
EchoApp.ButtonGroup.prototype.add = function(button) {
    this._buttonArray.push(button);
};

/**
 * Deselects all buttons in this button group.
 */
EchoApp.ButtonGroup.prototype.deselect = function() {
    for (var i = 0; i < this._buttonArray.length; ++i) {
        this._buttonArray[i].setSelected(false);
    }
};

/**
 * Removes the specified button from this button group.
 * 
 * @param button {EchoRender.ComponentSync.ToggleButton} the button
 */
EchoApp.ButtonGroup.prototype.remove = function(button) {
    // Find index of button in array.
    var arrayIndex = -1;
    for (var i = 0; i < this._buttonArray.length; ++i) {
        if (this._buttonArray[i] == button) {
            arrayIndex = i;
            break;
        }
    }
    
    if (arrayIndex == -1) {
        // Button does not exist in group.
        throw new Error("No such button: " + button.component.renderId);
    }
    
    if (this._buttonArray.length == 1) {
        // Array will now be empty.
        this._buttonArray = new Array();
    } else {
        // Buttons remain, remove button from button group.
        this._buttonArray[arrayIndex] = this._buttonArray[this._buttonArray.length - 1];
        this._buttonArray.length = this._buttonArray.length - 1;
    }
};

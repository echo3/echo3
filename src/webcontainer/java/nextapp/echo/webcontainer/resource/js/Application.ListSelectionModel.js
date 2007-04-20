/**
 * Minimalistic representation of ListSelectionModel.
 * 
 * @param {Number} selectionMode the selectionMode
 * @constructor
 */
EchoApp.ListSelectionModel = function(selectionMode) {
    this._selectionState = new Array();
    this._selectionMode = selectionMode;
};

/**
 * Value for selection mode setting indicating single selection.
 * 
 * @type Number
 * @final
 */
EchoApp.ListSelectionModel.SINGLE_SELECTION = 0;

/**
 * Value for selection mode setting indicating multiple selection.
 * 
 * @type Number
 * @final
 */
EchoApp.ListSelectionModel.MULTIPLE_SELECTION = 2;

/**
 * Returns the selection mode. 
 * 
 * @return the selection mode
 * @type Number
 */
EchoApp.ListSelectionModel.prototype.getSelectionMode = function() {
    return this._selectionMode;
};

/**
 * Returns whether the model is in single-selection mode. 
 * 
 * @return true if in single-selection mode
 * @type Boolean
 */
EchoApp.ListSelectionModel.prototype.isSingleSelection = function() {
    return this._selectionMode == EchoApp.ListSelectionModel.SINGLE_SELECTION;
};

/**
 * Determines whether an index is selected.
 * 
 * @param {Number} index the index
 * @return true if the index is selected
 * @type Boolean
 */
EchoApp.ListSelectionModel.prototype.isSelectedIndex = function(index) {
    if (this._selectionState.length <= index) {
        return false;
    } else {
        return this._selectionState[index];
    }
};

/**
 * Sets the selection state of the given index.
 * 
 * @param {Number} index the index
 * @param {Boolean} selected the new selection state
 */
EchoApp.ListSelectionModel.prototype.setSelectedIndex = function(index, selected) {
    this._selectionState[index] = selected;
};

/**
 * Gets a comma-delimited list containing the selected indices.
 * 
 * @return the list
 * @type String
 */
EchoApp.ListSelectionModel.prototype.getSelectionString = function() {
    var selection = "";
    for (var i = 0; i < this._selectionState.length; i++) {
        if (this._selectionState[i]) {
            if (selection.length > 0) {
                selection += ",";
            }
            selection += i;
        }
    }
    return selection;
};
/**
 * @class Remote Table implementation.
 */
Echo.Sync.RemoteTable = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("RemoteTable", this);
        Echo.ComponentFactory.registerType("RT", this);
    },

    componentType: "RemoteTable",

    $virtual: {
        
        /**
         * Programatically performs a button action.
         */
        doAction: function() {
            this.fireEvent({type: "action", source: this, data: this.get("actionCommand")});
        }
    }
});

/**
 * Component rendering peer: RemoteTable
 */
Echo.Sync.RemoteTableSync = Core.extend(Echo.Render.ComponentSync, {
    
    //FIXME setting selection mode on existing table causes exception "this.selctionModel has no properties".
    
    $static: {
    
        _HEADER_ROW: -1,
        
        _supportedPartialProperties: ["selection"]
    },
    
    $load: function() {
        Echo.Render.registerPeer("RemoteTable", this);
    },
    
    $construct: function() {
        this.selectionModel = null;
        this.lastSelectedIndex = null;
    },
    
    renderAdd: function(update, parentElement) {
        this._columnCount = this.component.render("columnCount");
        this._rowCount = this.component.render("rowCount");
        this._selectionEnabled = this.component.render("selectionEnabled");
        this._rolloverEnabled = this.component.render("rolloverEnabled");
        
        this._defaultInsets = this.component.render("insets", 0);
        this._defaultCellPadding = Echo.Sync.Insets.toCssValue(this._defaultInsets);
        
        this._headerVisible = this.component.get("headerVisible");
    
        if (this._selectionEnabled) {
            this.selectionModel = new Echo.Sync.RemoteTable.ListSelectionModel(
                    parseInt(this.component.get("selectionMode")));
        }
        
        this._tableElement = document.createElement("table");
        this._tableElement.id = this.component.renderId;
        
        var width = this.component.render("width");
        if (width && Core.Web.Env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && Echo.Sync.Extent.isPercent(width)) {
            this._renderPercentWidthByMeasure = parseInt(width);
            width = null;
        }
    
        this._tableElement.style.borderCollapse = "collapse";
        if (this._selectionEnabled) {
            this._tableElement.style.cursor = "pointer";
        }
        Echo.Sync.Color.renderFB(this.component, this._tableElement);
        Echo.Sync.Font.render(this.component.render("font"), this._tableElement);
        var border = this.component.render("border");
        if (border) {
            Echo.Sync.Border.render(border, this._tableElement);
            if (border.size && !Core.Web.Env.QUIRK_CSS_BORDER_COLLAPSE_INSIDE) {
                this._tableElement.style.margin = (Echo.Sync.Extent.toPixels(border.size, false) / 2) + "px";
            }
        }
        if (width) {
            this._tableElement.style.width = width;
        }
        
        this._tbodyElement = document.createElement("tbody");
        
        if (this.component.render("columnWidth")) {
            // If any column widths are set, render colgroup.
            var columnPixelAdjustment;
            if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
                var pixelInsets = Echo.Sync.Insets.toPixels(this._defaultInsets);
                columnPixelAdjustment = pixelInsets.left + pixelInsets.right;
            }
            
            var colGroupElement = document.createElement("colgroup");
            var renderRelative = !Core.Web.Env.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS;
            for (var i = 0; i < this._columnCount; ++i) {
                var colElement = document.createElement("col");
                var width = this.component.renderIndex("columnWidth", i); 
                if (width != null) {
                    if (Echo.Sync.Extent.isPercent(width)) {
                        colElement.width = parseInt(width) + (renderRelative ? "*" : "%");
                    } else {
                        var columnPixels = Echo.Sync.Extent.toPixels(width, true);
                        if (columnPixelAdjustment) {
                            colElement.width = columnPixels - columnPixelAdjustment;
                        } else {
                            colElement.width = columnPixels;
                        }
                    }
                }
                colGroupElement.appendChild(colElement);
            }
            this._tableElement.appendChild(colGroupElement);
        }
        
        this._tableElement.appendChild(this._tbodyElement);
        
        parentElement.appendChild(this._tableElement);
        
        var trPrototype = this._createRowPrototype();
        
        if (this._headerVisible) {
            this._tbodyElement.appendChild(this._renderRow(update, Echo.Sync.RemoteTableSync._HEADER_ROW, trPrototype));
        }
        for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
            this._tbodyElement.appendChild(this._renderRow(update, rowIndex, trPrototype));
        }
        
        if (this._selectionEnabled) {
            this._setSelectedFromProperty(this.component.get("selection"), false);
        }
        
        this._addEventListeners();
    },
    
    /**
     * Renders an appropriate style for a row (i.e. selected or deselected).
     *
     * @param rowIndex {Number} the index of the row
     */
    _renderRowStyle: function(rowIndex) {
        var tableRowIndex = rowIndex + (this._headerVisible ? 1 : 0);
        if (tableRowIndex >= this._tbodyElement.childNodes.length) {
            return;
        }
        var selected = this._selectionEnabled && this.selectionModel.isSelectedIndex(rowIndex);
        var trElement = this._tbodyElement.childNodes[tableRowIndex];
        var tdElement = trElement.firstChild;
        
        var columnIndex = 0;
        
        while (tdElement) {
            if (selected) {
                Echo.Sync.Font.render(this.component.render("selectionFont"), tdElement);
                Echo.Sync.Color.render(this.component.render("selectionForeground"), tdElement, "color");
                Echo.Sync.Color.render(this.component.render("selectionBackground"), tdElement, "background");
                Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), tdElement);
            } else {
                tdElement.style.color = "";
                tdElement.style.backgroundColor = "";
                tdElement.style.backgroundImage = "";
                
                var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) 
                        * this._columnCount + columnIndex);
                var layoutData = child.render("layoutData");

                if (layoutData) {
                    Echo.Sync.Color.render(layoutData.background, tdElement, "backgroundColor");
                    Echo.Sync.FillImage.render(layoutData.backgroundImage, tdElement);
                }
            
            }
            tdElement = tdElement.nextSibling;
            ++columnIndex;
        }
    },
    
    /**
     * Renders a single row.
     *
     * @param update the update
     * @param rowIndex {Number} the index of the row
     * @param trPrototype {Element} a TR element containing the appropriate number of TD elements with default
     *        styles applied (This is created by _renderRowStyle().  Providing this attribute is optional,
     *        and is specified for performance reasons.  If omitted one is created automatically.)
     */
    _renderRow: function(update, rowIndex, trPrototype) {
        var trElement = trPrototype ? trPrototype.cloneNode(true) : this._createRowPrototype();
        
        var tdElement = trElement.firstChild;
        var columnIndex = 0;
        
        while (columnIndex < this._columnCount) {
            var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * this._columnCount + columnIndex);
            var layoutData = child.render("layoutData");
            
            if (layoutData) {
                Echo.Sync.Color.render(layoutData.background, tdElement, "backgroundColor");
                Echo.Sync.FillImage.render(layoutData.backgroundImage, tdElement);
                Echo.Sync.Alignment.render(layoutData.alignment, tdElement, true, this.component);
                Echo.Sync.Insets.render(layoutData.insets, tdElement, "padding");
            }
    
            Echo.Render.renderComponentAdd(update, child, tdElement);
            
            ++columnIndex;
            tdElement = tdElement.nextSibling;
        }
        return trElement;
    },
    
    _createRowPrototype: function() {
        var trElement = document.createElement("tr");
    
        var tdPrototype = document.createElement("td");
        Echo.Sync.Border.render(this.component.render("border"), tdPrototype);
        tdPrototype.style.overflow = "hidden";
        tdPrototype.style.padding = this._defaultCellPadding;
    
        for (var columnIndex = 0; columnIndex < this._columnCount; columnIndex++) {
            var tdElement = tdPrototype.cloneNode(false);
            trElement.appendChild(tdElement);
        }
        return trElement;
    },
    
    renderDisplay: function() {
        if (this._renderPercentWidthByMeasure) {
            this._tableElement.style.width = "";
            var percentWidth = (this._tableElement.parentNode.offsetWidth * this._renderPercentWidthByMeasure) / 100;
            this._tableElement.style.width = percentWidth + "px";
        }
    },
    
    renderUpdate: function(update) {
        if (!update.hasUpdatedLayoutDataChildren() && !update.getAddedChildren() && !update.getRemovedChildren()) {
            if (Core.Arrays.containsAll(Echo.Sync.RemoteTableSync._supportedPartialProperties, 
                    update.getUpdatedPropertyNames(), true)) {
                // partial update
                if (this._selectionEnabled) {
                    var selectionUpdate = update.getUpdatedProperty("selection");
                    if (selectionUpdate) {
                        this._setSelectedFromProperty(selectionUpdate.newValue, true);
                    }
                }
                return false;
            }
        }
        // full update
        var element = this._tableElement;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    renderDispose: function(update) {
        if (this._rolloverEnabled || this._selectionEnabled) {
            var trElement = this._tbodyElement.firstChild;
            if (this._headerVisible) {
                trElement = trElement.nextSibling;
            }
            while (trElement) {
                Core.Web.Event.removeAll(trElement);
                trElement = trElement.nextSibling;
            }
        }
        this._tableElement = null;
        this._tbodyElement = null;
    },
    
    _getRowIndex: function(element) {
        var testElement = this._tbodyElement.firstChild;
        var index = this._headerVisible ? -1 : 0;
        while (testElement) {
            if (testElement == element) {
                return index;
            }
            testElement = testElement.nextSibling;
            ++index;
        }
        return -1;
    },
    
    /**
     * Sets the selection state based on the given selection property value.
     *
     * @param {String} value the value of the selection property
     * @param {Boolean} clearPrevious if the previous selection state should be overwritten
     */
    _setSelectedFromProperty: function(value, clearPrevious) {
        if (value == this.selectionModel.getSelectionString()) {
            return;
        }
        if (clearPrevious) {
            this._clearSelected();
        }
        var selectedIndices = value.split(",");
        for (var i = 0; i < selectedIndices.length; i++) {
            if (selectedIndices[i] == "") {
                continue;
            }
            this._setSelected(parseInt(selectedIndices[i]), true);
        }
    },
    
    /**
     * Sets the selection state of a table row.
     *
     * @param {Number} rowIndex the index of the row
     * @param {Boolean} newValue the new selection state
     */
    _setSelected: function(rowIndex, newValue) {
        this.selectionModel.setSelectedIndex(rowIndex, newValue);
        this._renderRowStyle(rowIndex);
    },
    
    /**
     * Deselects all selected rows.
     */
    _clearSelected: function() {
        for (var i = 0; i < this._rowCount; ++i) {
            if (this.selectionModel.isSelectedIndex(i)) {
                this._setSelected(i, false);
            }
        }
    },
    
    // action & event handling
    
    /**
     * Adds event listeners.
     */
    _addEventListeners: function() {
        if (!this.component.isRenderEnabled()) {
            return;
        }
        
        if (this._selectionEnabled || this._rolloverEnabled) {
            if (this._rowCount == 0) {
                return;
            }
            var mouseEnterLeaveSupport = Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            var rowOffset = (this._headerVisible ? 1 : 0);
            var rolloverEnterRef = Core.method(this, this._processRolloverEnter);
            var rolloverExitRef = Core.method(this, this._processRolloverExit);
            var clickRef = Core.method(this, this._processClick);
            
            for (var rowIndex = 0; rowIndex < this._rowCount; ++rowIndex) {
                var trElement = this._tableElement.rows[rowIndex + rowOffset];
                if (this._rolloverEnabled) {
                    Core.Web.Event.add(trElement, enterEvent, rolloverEnterRef, false);
                    Core.Web.Event.add(trElement, exitEvent, rolloverExitRef, false);
                }
                if (this._selectionEnabled) {
                    Core.Web.Event.add(trElement, "click", clickRef, false);
                    Core.Web.Event.Selection.disable(trElement);
                }
            }
        }
    },
    
    _doAction: function() {
        this.component.doAction();
    },
    
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        var trElement = e.registeredTarget;
        var rowIndex = this._getRowIndex(trElement);
        if (rowIndex == -1) {
            return;
        }
        
        Core.Web.DOM.preventEventDefault(e);
    
        if (this.selectionModel.getSelectionMode() == Echo.Sync.RemoteTable.ListSelectionModel.SINGLE_SELECTION 
                || !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
            this._clearSelected();
        }
    
        if (!this.selectionModel.getSelectionMode() == Echo.Sync.RemoteTable.ListSelectionModel.SINGLE_SELECTION 
                && e.shiftKey && this.lastSelectedIndex != -1) {
            var startIndex;
            var endIndex;
            if (this.lastSelectedIndex < rowIndex) {
                startIndex = this.lastSelectedIndex;
                endIndex = rowIndex;
            } else {
                startIndex = rowIndex;
                endIndex = this.lastSelectedIndex;
            }
            for (var i = startIndex; i <= endIndex; ++i) {
                this._setSelected(i, true);
            }
        } else {
            this.lastSelectedIndex = rowIndex;
            this._setSelected(rowIndex, !this.selectionModel.isSelectedIndex(rowIndex));
        }
        
        this.component.set("selection", this.selectionModel.getSelectionString());
        
        this._doAction();
    },
    
    _processRolloverEnter: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        var trElement = e.registeredTarget;
        var rowIndex = this._getRowIndex(trElement);
        if (rowIndex == -1) {
            return;
        }
        
        for (var i = 0; i < trElement.cells.length; ++i) {
            var cell = trElement.cells[i];
            Echo.Sync.Font.render(this.component.render("rolloverFont"), cell);
            Echo.Sync.Color.render(this.component.render("rolloverForeground"), cell, "color");
            Echo.Sync.Color.render(this.component.render("rolloverBackground"), cell, "background");
            Echo.Sync.FillImage.render(this.component.render("rolloverBackgroundImage"), cell); 
        }
    },
    
    _processRolloverExit: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        var trElement = e.registeredTarget;
        var rowIndex = this._getRowIndex(trElement);
        if (rowIndex == -1) {
            return;
        }
    
        this._renderRowStyle(rowIndex);
    }
});

/**
 * @class Minimalistic representation of ListSelectionModel.
 */
Echo.Sync.RemoteTable.ListSelectionModel = Core.extend({

    $static: {
    
        /**
         * Value for selection mode setting indicating single selection.
         * 
         * @type Number
         * @final
         */
        SINGLE_SELECTION: 0,
        
        /**
         * Value for selection mode setting indicating multiple selection.
         * 
         * @type Number
         * @final
         */
        MULTIPLE_SELECTION: 2
    },
    
    /**
     * Property class name.
     * @type String
     * @final
     */
    className: "ListSelectionModel",

    /**
     * Creates a ListSelectionModel.
     * 
     * @param {Number} selectionMode the selectionMode
     * @constructor
     *
     */
    $construct: function(selectionMode) {
        this._selectionState = [];
        this._selectionMode = selectionMode;
    },
    
    /**
     * Returns the selection mode. 
     * 
     * @return the selection mode
     * @type Number
     */
    getSelectionMode: function() {
        return this._selectionMode;
    },
    
    /**
     * Determines whether an index is selected.
     * 
     * @param {Number} index the index
     * @return true if the index is selected
     * @type Boolean
     */
    isSelectedIndex: function(index) {
        if (this._selectionState.length <= index) {
            return false;
        } else {
            return this._selectionState[index];
        }
    },
    
    /**
     * Sets the selection state of the given index.
     * 
     * @param {Number} index the index
     * @param {Boolean} selected the new selection state
     */
    setSelectedIndex: function(index, selected) {
        this._selectionState[index] = selected;
    },
    
    /**
     * Gets a comma-delimited list containing the selected indices.
     * 
     * @return the list
     * @type String
     */
    getSelectionString: function() {
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
    }
});

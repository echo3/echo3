// FIXME handle enabled/disabled state

/**
 * @class Remote Table implementation.
 */
EchoAppRender.RemoteTable = Core.extend(EchoApp.Component, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("RemoteTable", this);
        EchoApp.ComponentFactory.registerType("RT", this);
    },

    componentType: "RemoteTable"
});

/**
 * Component rendering peer: RemoteTable
 */
EchoAppRender.RemoteTableSync = Core.extend(EchoRender.ComponentSync, {
    
    //FIXME setting selection mode on existing table causes exception "this.selctionModel has no properties".
    
    $static: {
    
        _HEADER_ROW: -1,
        
        _supportedPartialProperties: ["selection"]
    },
    
    $load: function() {
        EchoRender.registerPeer("RemoteTable", this);
    },
    
    $construct: function() {
        this.selectionModel = null;
        this.lastSelectedIndex = null;
    },
    
    renderAdd: function(update, parentElement) {
        this._columnCount = this.component.getRenderProperty("columnCount");
        this._rowCount = this.component.getRenderProperty("rowCount");
        this._selectionEnabled = this.component.getRenderProperty("selectionEnabled");
        this._rolloverEnabled = this.component.getRenderProperty("rolloverEnabled");
        
        this._defaultInsets = this.component.getRenderProperty("insets");
        if (!this._defaultInsets) {
            this._defaultInsets = new EchoApp.Insets(0);
        }
        this._defaultCellPadding = EchoAppRender.Insets.toCssValue(this._defaultInsets);
        
        this._headerVisible = this.component.getProperty("headerVisible");
    
        if (this._selectionEnabled) {
            this.selectionModel = new EchoAppRender.RemoteTableSync.ListSelectionModel(
                    parseInt(this.component.getProperty("selectionMode")));
        }
        
        this._tableElement = document.createElement("table");
        
        var width = this.component.getRenderProperty("width");
        if (width && WebCore.Environment.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && width.units == "%") {
            this._renderPercentWidthByMeasure = width.value;
            width = null;
        }
    
        this._tableElement.style.borderCollapse = "collapse";
        if (this._selectionEnabled) {
            this._tableElement.style.cursor = "pointer";
        }
        EchoAppRender.Color.renderFB(this.component, this._tableElement);
        EchoAppRender.Font.renderDefault(this.component, this._tableElement);
        var border = this.component.getRenderProperty("border");
        if (border) {
            EchoAppRender.Border.render(border, this._tableElement);
            if (border.size && !WebCore.Environment.QUIRK_CSS_BORDER_COLLAPSE_INSIDE) {
                this._tableElement.style.margin = (EchoAppRender.Extent.toPixels(border.size, false) / 2) + "px";
            }
        }
        if (width) {
            this._tableElement.style.width = width;
        }
        
        this._tbodyElement = document.createElement("tbody");
        
        if (this.component.getRenderProperty("columnWidth")) {
            // If any column widths are set, render colgroup.
            var columnPixelAdjustment;
            if (WebCore.Environment.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
                var pixelInsets = EchoAppRender.Insets.toPixels(this._defaultInsets);
                columnPixelAdjustment = pixelInsets.left + pixelInsets.right;
            }
            
            var colGroupElement = document.createElement("colgroup");
            var renderRelative = !WebCore.Environment.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS;
            for (var i = 0; i < this._columnCount; ++i) {
                var colElement = document.createElement("col");
                var width = this.component.getRenderIndexedProperty("columnWidth", i); 
                if (width != null) {
                    if (width.units == "%") {
                        colElement.width = width.value + (renderRelative ? "*" : "%");
                    } else {
                        var columnPixels = WebCore.Measure.extentToPixels(width.value, width.units, true);
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
            this._tbodyElement.appendChild(this._renderRow(update, EchoAppRender.RemoteTableSync._HEADER_ROW, trPrototype));
        }
        for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
            this._tbodyElement.appendChild(this._renderRow(update, rowIndex, trPrototype));
        }
        
        if (this._selectionEnabled) {
            this._setSelectedFromProperty(this.component.getProperty("selection"), false);
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
        while (tdElement) {
            if (selected) {
                // FIXME
                //EchoCssUtil.restoreOriginalStyle(cell);
                //EchoCssUtil.applyTemporaryStyle(cell, this.selectionStyle);
                EchoAppRender.Font.renderComponentProperty(this.component, "selectionFont", null, tdElement);
                EchoAppRender.Color.renderComponentProperty(this.component, "selectionForeground", null, tdElement, "color");
                EchoAppRender.Color.renderComponentProperty(this.component, "selectionBackground", null, tdElement, "background");
                EchoAppRender.FillImage.renderComponentProperty(this.component, "selectionBackgroundImage", null, tdElement);
            } else {
                // FIXME
                //EchoCssUtil.restoreOriginalStyle(cell);
                tdElement.style.color = "";
                tdElement.style.backgroundColor = "";
                tdElement.style.backgroundImage = "";
            }
            tdElement = tdElement.nextSibling;
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
            var layoutData = child.getRenderProperty("layoutData");
            
            if (layoutData) {
                EchoAppRender.Color.renderComponentProperty(layoutData, "background", null, tdElement, "backgroundColor");
                EchoAppRender.FillImage.renderComponentProperty(layoutData, "backgroundImage", null, tdElement);
                EchoAppRender.Alignment.renderComponentProperty(layoutData, "alignment", null, tdElement, true, this.component);
                EchoAppRender.Insets.renderComponentProperty(layoutData, "insets", this._defaultInsets, tdElement, "padding");
            }
    
            EchoRender.renderComponentAdd(update, child, tdElement);
            
            ++columnIndex;
            tdElement = tdElement.nextSibling;
        }
        return trElement;
    },
    
    _createRowPrototype: function() {
        var trElement = document.createElement("tr");
    
        var tdPrototype = document.createElement("td");
        EchoAppRender.Border.render(this.component.getRenderProperty("border"), tdPrototype);
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
    		if (Core.Arrays.containsAll(EchoAppRender.RemoteTableSync._supportedPartialProperties, update.getUpdatedPropertyNames(), true)) {
    		    // partial update
    			var selectionUpdate = update.getUpdatedProperty("selection");
    			if (selectionUpdate) {
    				this._setSelectedFromProperty(selectionUpdate.newValue, true);
    			}
    		    return false;
    		}
    	}
        // full update
        var element = this._tableElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
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
                WebCore.EventProcessor.removeAll(trElement);
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
        /*
        if (!this.component.getRenderProperty("enabled")) {
        	return;
        }
        */
        
        if (this._selectionEnabled || this._rolloverEnabled) {
            if (this._rowCount == 0) {
                return;
            }
            var mouseEnterLeaveSupport = WebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
            var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
            var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
            var rowOffset = (this._headerVisible ? 1 : 0);
            var rolloverEnterRef = Core.method(this, this._processRolloverEnter);
            var rolloverExitRef = Core.method(this, this._processRolloverExit);
            var clickRef = Core.method(this, this._processClick);
            
            for (var rowIndex = 0; rowIndex < this._rowCount; ++rowIndex) {
                var trElement = this._tableElement.rows[rowIndex + rowOffset];
                if (this._rolloverEnabled) {
                    WebCore.EventProcessor.add(trElement, enterEvent, rolloverEnterRef, false);
                    WebCore.EventProcessor.add(trElement, exitEvent, rolloverExitRef, false);
                }
                if (this._selectionEnabled) {
                    WebCore.EventProcessor.add(trElement, "click", clickRef, false);
                    WebCore.EventProcessor.addSelectionDenialListener(trElement);
                }
            }
        }    
    },
    
    _doAction: function() {
        //FIXME fire from component.
        this.component.fireEvent(new Core.Event("action", this.component));
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
        
        WebCore.DOM.preventEventDefault(e);
    
        if (this.selectionModel.getSelectionMode() == EchoAppRender.RemoteTableSync.ListSelectionModel.SINGLE_SELECTION 
                || !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
            this._clearSelected();
        }
    
        if (!this.selectionModel.getSelectionMode() == EchoAppRender.RemoteTableSync.ListSelectionModel.SINGLE_SELECTION 
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
        
        this.component.setProperty("selection", this.selectionModel.getSelectionString());
        
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
            // FIXME
            //EchoCssUtil.applyTemporaryStyle(cell, this.rolloverStyle);
            EchoAppRender.Font.renderComponentProperty(this.component, "rolloverFont", null, cell);
            EchoAppRender.Color.renderComponentProperty(this.component, "rolloverForeground", null, cell, "color");
            EchoAppRender.Color.renderComponentProperty(this.component, "rolloverBackground", null, cell, "background");
            EchoAppRender.FillImage.renderComponentProperty(this.component, "rolloverBackgroundImage", null, cell); 
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
EchoAppRender.RemoteTableSync.ListSelectionModel = Core.extend({

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

// FIXME handle enabled/disabled state

/**
 * Component rendering peer: RemoteTable
 */
EchoRender.ComponentSync.RemoteTable = function() {
    this.selectionModel = null;
    this.lastSelectedIndex = null;
};

EchoRender.ComponentSync.RemoteTable.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.RemoteTable._HEADER_ROW = -1;

/**
 * A string of periods used for the IE 100% table width workaround.
 */
EchoRender.ComponentSync.RemoteTable._SIZING_DOTS = ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . "
            + ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ";

EchoRender.ComponentSync.RemoteTable._supportedPartialProperties = new Array("selection");

EchoRender.ComponentSync.RemoteTable.prototype.renderAdd = function(update, parentElement) {
    this._columnCount = this.component.getRenderProperty("columnCount");
    this._rowCount = this.component.getRenderProperty("rowCount");
    this._selectionEnabled = this.component.getRenderProperty("selectionEnabled");
    this._rolloverEnabled = this.component.getRenderProperty("rolloverEnabled");
    
    this._defaultInsets = this.component.getRenderProperty("insets");
    if (!this._defaultInsets) {
        this._defaultInsets = new EchoApp.Property.Insets(0);
    }
    this._defaultCellPadding = EchoRender.Property.Insets.toCssValue(this._defaultInsets);
    
    this._headerVisible = this.component.getProperty("headerVisible");

    if (this._selectionEnabled) {
        this.selectionModel = new EchoApp.ListSelectionModel(parseInt(this.component.getProperty("selectionMode")));
    }
    
    this._tableElement = document.createElement("table");
    this._tableElement.id = this.component.renderId;
    
    var width = this.component.getRenderProperty("width");
    var render100PercentWidthWorkaround = false;
    if (width && EchoWebCore.Environment.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && width.value == 100 && width.units == "%") {
        width = null;
        render100PercentWidthWorkaround = true;
    }

    this._tableElement.style.borderCollapse = "collapse";
    if (this._selectionEnabled) {
        this._tableElement.style.cursor = "pointer";
    }
    EchoRender.Property.Color.renderFB(this.component, this._tableElement);
    EchoRender.Property.Font.renderDefault(this.component, this._tableElement);
    var border = this.component.getRenderProperty("border");
    if (border) {
        EchoRender.Property.Border.render(border, this._tableElement);
        if (border.size && !EchoWebCore.Environment.QUIRK_CSS_BORDER_COLLAPSE_INSIDE) {
            this._tableElement.style.margin = (EchoRender.Property.Extent.toPixels(border.size, false) / 2) + "px";
        }
    }
    if (width) {
        this._tableElement.style.width = width;
    }
    
    this._tbodyElement = document.createElement("tbody");
    
    if (this.component.getRenderProperty("columnWidth")) {
        // If any column widths are set, render colgroup.
        var columnPixelAdjustment;
        if (EchoWebCore.Environment.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
            var pixelInsets = EchoRender.Property.Insets.toPixels(this._defaultInsets);
            columnPixelAdjustment = pixelInsets.left + pixelInsets.right;
        }
        
        var colGroupElement = document.createElement("colgroup");
        var renderRelative = !EchoWebCore.Environment.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS;
        for (var i = 0; i < this._columnCount; ++i) {
            var colElement = document.createElement("col");
            var width = this.component.getRenderIndexedProperty("columnWidth", i); 
            if (width != null) {
                if (width.units == "%") {
                    colElement.width = width.value + (renderRelative ? "*" : "%");
                } else {
                    var columnPixels = EchoWebCore.Render.extentToPixels(width.value, width.units, true);
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
        this._tbodyElement.appendChild(this._renderRow(update, EchoRender.ComponentSync.RemoteTable._HEADER_ROW, trPrototype));
    }
    for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
        this._tbodyElement.appendChild(this._renderRow(update, rowIndex, trPrototype));
    }
    if (render100PercentWidthWorkaround) {
        this._render100PercentWidthWorkaround();
    }
    
    if (this._selectionEnabled) {
        this._setSelectedFromProperty(this.component.getProperty("selection"), false);
    }
    
    this._addEventListeners();
};

/**
 * Renders the IE 100% table width workaround, only call this method when the workaround should be applied.
 */
EchoRender.ComponentSync.RemoteTable.prototype._render100PercentWidthWorkaround = function() {
    if (this._tableElement.rows.length == 0) {
        return;
    }
    var columns = this._tableElement.rows[0].cells;
    for (var i = 0; i < columns.length; ++i) {
        var sizingDivElement = document.createElement("div");
        sizingDivElement.style.fontSize = "50px";
        sizingDivElement.style.height = "0px";
        sizingDivElement.style.overflow = "hidden";
        sizingDivElement.appendChild(document.createTextNode(EchoRender.ComponentSync.RemoteTable._SIZING_DOTS));
        columns[i].appendChild(sizingDivElement);
    }
};

/**
 * Renders an appropriate style for a row (i.e. selected or deselected).
 *
 * @param rowIndex {Number} the index of the row
 */
EchoRender.ComponentSync.RemoteTable.prototype._renderRowStyle = function(rowIndex) {
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
            EchoRender.Property.Font.renderComponentProperty(this.component, "selectionFont", null, tdElement);
            EchoRender.Property.Color.renderComponentProperty(this.component, "selectionForeground", null, tdElement, "color");
            EchoRender.Property.Color.renderComponentProperty(this.component, "selectionBackground", null, tdElement, "background");
            EchoRender.Property.FillImage.renderComponentProperty(this.component, "selectionBackgroundImage", null, tdElement);
        } else {
            // FIXME
            //EchoCssUtil.restoreOriginalStyle(cell);
            tdElement.style.color = "";
            tdElement.style.backgroundColor = "";
            tdElement.style.backgroundImage = "";
        }
        tdElement = tdElement.nextSibling;
    }
};

/**
 * Renders a single row.
 *
 * @param update the update
 * @param rowIndex {Number} the index of the row
 * @param trPrototype {Element} a TR element containing the appropriate number of TD elements with default
 *        styles applied (This is created by _renderRowStyle().  Providing this attribute is optional,
 *        and is specified for performance reasons.  If omitted one is created automatically.)
 */
EchoRender.ComponentSync.RemoteTable.prototype._renderRow = function(update, rowIndex, trPrototype) {
    var trElement = trPrototype ? trPrototype.cloneNode(true) : this._createRowPrototype();
    
    if (rowIndex != EchoRender.ComponentSync.RemoteTable._HEADER_ROW && (this._selectionEnabled || this._rolloverEnabled)) {
        trElement.id = this.component.renderId + "_tr_" + rowIndex; 
    }
    
    var tdElement = trElement.firstChild;
    var columnIndex = 0;
    
    while (columnIndex < this._columnCount) {
        var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * this._columnCount + columnIndex);
        var layoutData = child.getRenderProperty("layoutData");
        
        if (layoutData) {
            EchoRender.Property.Color.renderComponentProperty(layoutData, "background", null, tdElement, "backgroundColor");
            EchoRender.Property.FillImage.renderComponentProperty(layoutData, "backgroundImage", null, tdElement);
            EchoRender.Property.Alignment.renderComponentProperty(layoutData, "alignment", null, tdElement, true, this.component);
            EchoRender.Property.Insets.renderComponentProperty(layoutData, "insets", this._defaultInsets, tdElement, "padding");
        }

        EchoRender.renderComponentAdd(update, child, tdElement);
        
        ++columnIndex;
        tdElement = tdElement.nextSibling;
    }
    return trElement;
};

EchoRender.ComponentSync.RemoteTable.prototype._createRowPrototype = function() {
    var trElement = document.createElement("tr");

    var tdPrototype = document.createElement("td");
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), tdPrototype);
    tdPrototype.style.overflow = "hidden";
    tdPrototype.style.padding = this._defaultCellPadding;

    for (var columnIndex = 0; columnIndex < this._columnCount; columnIndex++) {
        var tdElement = tdPrototype.cloneNode(false);
        trElement.appendChild(tdElement);
    }
    return trElement;
};

EchoRender.ComponentSync.RemoteTable.prototype.renderUpdate = function(update) {
	if (!update.hasUpdatedLayoutDataChildren() && !update.getAddedChildren() && !update.getRemovedChildren()) {
		if (EchoCore.Arrays.containsAll(EchoRender.ComponentSync.RemoteTable._supportedPartialProperties, update.getUpdatedPropertyNames(), true)) {
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
};

EchoRender.ComponentSync.RemoteTable.prototype.renderDispose = function(update) {
    if (this._rolloverEnabled || this._selectionEnabled) {
        var trElement = this._tbodyElement.firstChild;
        if (this._headerVisible) {
            trElement = trElement.nextSibling;
        }
        while (trElement) {
            EchoWebCore.EventProcessor.removeAll(trElement);
            trElement.id = "";
            trElement = trElement.nextSibling;
        }
    }
    this._tableElement.id = "";
    this._tableElement = null;
    this._tbodyElement = null;
};

EchoRender.ComponentSync.RemoteTable.prototype._getRowIndex = function(element) {
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
};

/**
 * Sets the selection state based on the given selection property value.
 *
 * @param {String} value the value of the selection property
 * @param {Boolean} clearPrevious if the previous selection state should be overwritten
 */
EchoRender.ComponentSync.RemoteTable.prototype._setSelectedFromProperty = function(value, clearPrevious) {
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
};

/**
 * Sets the selection state of a table row.
 *
 * @param {Number} rowIndex the index of the row
 * @param {Boolean} newValue the new selection state
 */
EchoRender.ComponentSync.RemoteTable.prototype._setSelected = function(rowIndex, newValue) {
    this.selectionModel.setSelectedIndex(rowIndex, newValue);
    this._renderRowStyle(rowIndex);
};

/**
 * Deselects all selected rows.
 */
EchoRender.ComponentSync.RemoteTable.prototype._clearSelected = function() {
    for (var i = 0; i < this._rowCount; ++i) {
        if (this.selectionModel.isSelectedIndex(i)) {
            this._setSelected(i, false);
        }
    }
};

// action & event handling

/**
 * Adds event listeners.
 */
EchoRender.ComponentSync.RemoteTable.prototype._addEventListeners = function() {
    /*
    if (!this.component.getRenderProperty("enabled")) {
    	return;
    }
    */
    
    if (this._selectionEnabled || this._rolloverEnabled) {
        if (this._rowCount == 0) {
            return;
        }
        var mouseEnterLeaveSupport = EchoWebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
        var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
        var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
        var rowOffset = (this._headerVisible ? 1 : 0);
        var rolloverEnterRef = new EchoCore.MethodRef(this, this._processRolloverEnter);
        var rolloverExitRef = new EchoCore.MethodRef(this, this._processRolloverExit);
        var clickRef = new EchoCore.MethodRef(this, this._processClick);
        
        for (var rowIndex = 0; rowIndex < this._rowCount; ++rowIndex) {
            var trElement = this._tableElement.rows[rowIndex + rowOffset];
            if (this._rolloverEnabled) {
                EchoWebCore.EventProcessor.add(trElement, enterEvent, rolloverEnterRef, false);
                EchoWebCore.EventProcessor.add(trElement, exitEvent, rolloverExitRef, false);
            }
            if (this._selectionEnabled) {
                EchoWebCore.EventProcessor.add(trElement, "click", clickRef, false);
                EchoWebCore.EventProcessor.addSelectionDenialListener(trElement);
            }
        }
    }    
};

EchoRender.ComponentSync.RemoteTable.prototype._doAction = function() {
    this.component.fireEvent(new EchoCore.Event(this.component, "action"));
};

EchoRender.ComponentSync.RemoteTable.prototype._processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var trElement = e.registeredTarget;
    var rowIndex = this._getRowIndex(trElement);
    if (rowIndex == -1) {
        return;
    }
    
    EchoWebCore.DOM.preventEventDefault(e);

    if (this.selectionModel.isSingleSelection() || !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
        this._clearSelected();
    }

    if (!this.selectionModel.isSingleSelection() && e.shiftKey && this.lastSelectedIndex != -1) {
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
};

EchoRender.ComponentSync.RemoteTable.prototype._processRolloverEnter = function(e) {
    if (!this.component.isActive()) {
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
        EchoRender.Property.Font.renderComponentProperty(this.component, "rolloverFont", null, cell);
        EchoRender.Property.Color.renderComponentProperty(this.component, "rolloverForeground", null, cell, "color");
        EchoRender.Property.Color.renderComponentProperty(this.component, "rolloverBackground", null, cell, "background");
        EchoRender.Property.FillImage.renderComponentProperty(this.component, "rolloverBackgroundImage", null, cell); 
    }
};

EchoRender.ComponentSync.RemoteTable.prototype._processRolloverExit = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var trElement = e.registeredTarget;
    var rowIndex = this._getRowIndex(trElement);
    if (rowIndex == -1) {
        return;
    }

    this._renderRowStyle(rowIndex);
};

EchoRender.registerPeer("RemoteTable", EchoRender.ComponentSync.RemoteTable);
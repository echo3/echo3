// FIXME handle enabled/disabled state

/**
 * Component rendering peer: Table
 */
EchoRender.ComponentSync.Table = function() {
    this.selectionModel = null;
    this.lastSelectedIndex = null;
};

EchoRender.ComponentSync.Table.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Table._HEADER_ROW = -1;

/**
 * A string of periods used for the IE 100% table width workaround.
 */
EchoRender.ComponentSync.Table._SIZING_DOTS = ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . "
            + ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ";

EchoRender.ComponentSync.Table.prototype.renderAdd = function(update, parentElement) {
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
    
    var tableElement = document.createElement("table");
    tableElement.id = this.component.renderId;
    tableElement.style.tableLayout = "fixed";
    
    var width = this.component.getRenderProperty("width");
    var render100PercentWidthWorkaround = false;
    if (width && EchoWebCore.Environment.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && width.value == 100 && width.units == "%") {
        width = null;
        render100PercentWidthWorkaround = true;
    }
    this._renderMainStyle(tableElement, width);
    
    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    parentElement.appendChild(tableElement);
    
    var trPrototype = this._createRowPrototype();
    
    
    // FIXME render colgroup if needed
    
    if (this._headerVisible) {
        tbodyElement.appendChild(this._renderRow(update, EchoRender.ComponentSync.Table._HEADER_ROW, trPrototype));
    }
    for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
        tbodyElement.appendChild(this._renderRow(update, rowIndex, trPrototype));
    }
    if (render100PercentWidthWorkaround) {
        this._render100PercentWidthWorkaround(tableElement);
    }
    
    if (this._selectionEnabled) {
        var selectedIndices = EchoCore.tokenizeString(this.component.getProperty("selection"), ",");
        for (var i = 0; i < selectedIndices.length; i++) {
            if (selectedIndices[i] == "") {
                continue;
            }
            this._setSelected(parseInt(selectedIndices[i]), true, tableElement);
        }
    }
    
    this._addEventListeners(tableElement);
};

/**
 * Renders the main style.
 *
 * @param element the main element
 * @param width {Number} the width to use
 */
EchoRender.ComponentSync.Table.prototype._renderMainStyle = function(element, width) {
    element.style.borderCollapse = "collapse";
    if (this._selectionEnabled) {
        element.style.cursor = "pointer";
    }
    EchoRender.Property.Color.renderFB(this.component, element);
    EchoRender.Property.Font.renderDefault(this.component, element);
    var border = this.component.getRenderProperty("border");
    if (border) {
        EchoRender.Property.Border.render(border, element);
        if (border.size && !EchoWebCore.Environment.QUIRK_CSS_BORDER_COLLAPSE_INSIDE) {
            element.style.margin = (EchoRender.Property.Extent.toPixels(border.size, false) / 2) + "px";
        }
    }
    if (width) {
        element.style.width = width;
    }
};

/**
 * Renders the IE 100% table width workaround, only call this method when the workaround should be applied.
 *
 * @param element the main element
 */
EchoRender.ComponentSync.Table.prototype._render100PercentWidthWorkaround = function(element) {
    if (element.rows.length == 0) {
        return;
    }
    var columns = element.rows[0].cells;
    for (var i = 0; i < columns.length; ++i) {
        var sizingDivElement = document.createElement("div");
        sizingDivElement.style.fontSize = "50px";
        sizingDivElement.style.height = "0px";
        sizingDivElement.style.overflow = "hidden";
        sizingDivElement.appendChild(document.createTextNode(EchoRender.ComponentSync.Table._SIZING_DOTS));
        columns[i].appendChild(sizingDivElement);
    }
};

/**
 * Renders an appropriate style for a row (i.e. selected or deselected).
 *
 * @param rowIndex {Number} the index of the row
 * @param tableElement the table element, may be null
 */
EchoRender.ComponentSync.Table.prototype._renderRowStyle = function(rowIndex, tableElement) {
    var selected = this._selectionEnabled && this.selectionModel.isSelectedIndex(rowIndex);
    if (!tableElement) {
    	tableElement = document.getElementById(this.component.renderId);
    }
    var trElement = tableElement.rows[rowIndex + (this._headerVisible ? 1 : 0)];
    
    for (var i = 0; i < trElement.cells.length; ++i) {
        var cell = trElement.cells[i];
        if (selected) {
            // FIXME
            //EchoCssUtil.restoreOriginalStyle(cell);
            //EchoCssUtil.applyTemporaryStyle(cell, this.selectionStyle);
            EchoRender.Property.Font.renderComponentProperty(this.component, "selectionFont", null, cell);
            EchoRender.Property.Color.renderComponentProperty(this.component, "selectionForeground", null, cell, "color");
            EchoRender.Property.Color.renderComponentProperty(this.component, "selectionBackground", null, cell, "background");
            EchoRender.Property.FillImage.renderComponentProperty(this.component, "selectionBackgroundImage", null, cell); 
        } else {
            // FIXME
            //EchoCssUtil.restoreOriginalStyle(cell);
            cell.style.color = "";
            cell.style.backgroundColor = "";
            cell.style.backgroundImage = "";
        }
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
EchoRender.ComponentSync.Table.prototype._renderRow = function(update, rowIndex, trPrototype) {
    var trElement = trPrototype ? trPrototype.cloneNode(true) : this._createRowPrototype();
    if (rowIndex == EchoRender.ComponentSync.Table._HEADER_ROW) {
        trElement.id = this.component.renderId + "_tr_header";
    } else {
        trElement.id = this.component.renderId + "_tr_" + rowIndex; 
    }
    
    var tdElement = trElement.firstChild;
    var columnIndex = 0;
    
    while (columnIndex < this._columnCount) {
        tdElement.id = this.component.renderId + "_cell_" + columnIndex;
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

EchoRender.ComponentSync.Table.prototype._createRowPrototype = function() {
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

EchoRender.ComponentSync.Table.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

EchoRender.ComponentSync.Table.prototype.renderDispose = function(update) {
    var tableElement = document.getElementById(this.component.renderId);
    for (var i = 0; i < tableElement.rows.length; ++i) {
        EchoWebCore.EventProcessor.removeAll(tableElement.rows[i]);
    }
};

EchoRender.ComponentSync.Table.prototype._getRowIndex = function(element) {
    var stringIndex = element.id.lastIndexOf("_tr_") + 4;
    return parseInt(element.id.substring(stringIndex));
};

/**
 * Sets the selection state of a table row.
 *
 * @param {Number} rowIndex the index of the row
 * @param {Boolean} newValue the new selection state
 * @param tableElement the table element, may be null
 */
EchoRender.ComponentSync.Table.prototype._setSelected = function(rowIndex, newValue, tableElement) {
    this.selectionModel.setSelectedIndex(rowIndex, newValue);
    this._renderRowStyle(rowIndex, tableElement);
};

/**
 * Deselects all selected rows.
 * 
 * @param tableElement the table element, may be null
 */
EchoRender.ComponentSync.Table.prototype._clearSelected = function(tableElement) {
    for (var i = 0; i < this._rowCount; ++i) {
        if (this.selectionModel.isSelectedIndex(i)) {
            this._setSelected(i, false, tableElement);
        }
    }
};

// action & event handling

/**
 * Adds event listeners.
 *
 * @param tableElement the table element
 */
EchoRender.ComponentSync.Table.prototype._addEventListeners = function(tableElement) {
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
            var trElement = tableElement.rows[rowIndex + rowOffset];
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

EchoRender.ComponentSync.Table.prototype._doAction = function() {
    this.component.fireEvent(new EchoCore.Event(this.component, "action"));
};

EchoRender.ComponentSync.Table.prototype._processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var trElement = e.registeredTarget;
    var rowIndex = this._getRowIndex(trElement);
    if (rowIndex == -1) {
        return;
    }
    
    EchoWebCore.DOM.preventEventDefault(e);

    var tableElement = trElement.parentNode.parentNode;
    
    if (this.selectionModel.isSingleSelection() || !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
        this._clearSelected(tableElement);
    }

    if (e.shiftKey && this.lastSelectedIndex != -1) {
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
            this._setSelected(i, true, tableElement);
        }
    } else {
        this.lastSelectedIndex = rowIndex;
        this._setSelected(rowIndex, !this.selectionModel.isSelectedIndex(rowIndex), tableElement);
    }
    
    this.component.setProperty("selection", this.selectionModel.getSelectionString());
    
    this._doAction();
};

EchoRender.ComponentSync.Table.prototype._processRolloverEnter = function(e) {
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

EchoRender.ComponentSync.Table.prototype._processRolloverExit = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var trElement = e.registeredTarget;
    var rowIndex = this._getRowIndex(trElement);
    if (rowIndex == -1) {
        return;
    }

    var tableElement = trElement.parentNode.parentNode;
    
    this._renderRowStyle(rowIndex, tableElement);
};

EchoRender.registerPeer("Table", EchoRender.ComponentSync.Table);
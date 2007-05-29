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

EchoRender.ComponentSync.Table.prototype.getContainerElement = function(component) {
    return this._childIdToElementMap[component.renderId];
};

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
    
    this._tableElement = document.createElement("table");
    this._tableElement.id = this.component.renderId;
    this._tableElement.style.tableLayout = "fixed";
    
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
    
    this._childIdToElementMap = new Object();

    var trPrototype = this._createRowPrototype();
    
    if (this._headerVisible) {
        this._tbodyElement.appendChild(this._renderRow(update, EchoRender.ComponentSync.Table._HEADER_ROW, trPrototype));
    }
    for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
        this._tbodyElement.appendChild(this._renderRow(update, rowIndex, trPrototype));
    }
    if (render100PercentWidthWorkaround) {
        this._render100PercentWidthWorkaround();
    }
    
    if (this._selectionEnabled) {
        var selectedIndices = EchoCore.tokenizeString(this.component.getProperty("selection"), ",");
        for (var i = 0; i < selectedIndices.length; i++) {
            if (selectedIndices[i] == "") {
                continue;
            }
            this._setSelected(parseInt(selectedIndices[i]), true);
        }
    }
    
    this._addEventListeners();
};

/**
 * Renders the IE 100% table width workaround, only call this method when the workaround should be applied.
 */
EchoRender.ComponentSync.Table.prototype._render100PercentWidthWorkaround = function() {
    if (this._tableElement.rows.length == 0) {
        return;
    }
    var columns = this._tableElement.rows[0].cells;
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
 */
EchoRender.ComponentSync.Table.prototype._renderRowStyle = function(rowIndex) {
    var selected = this._selectionEnabled && this.selectionModel.isSelectedIndex(rowIndex);
    var trElement = this._tableElement.rows[rowIndex + (this._headerVisible ? 1 : 0)];
    
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
    
    if (rowIndex != EchoRender.ComponentSync.Table._HEADER_ROW && (this._selectionEnabled || this._rolloverEnabled)) {
        trElement.id = this.component.renderId + "_tr_" + rowIndex; 
    }
    
    var tdElement = trElement.firstChild;
    var columnIndex = 0;
    
    while (columnIndex < this._columnCount) {
        var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * this._columnCount + columnIndex);
        this._childIdToElementMap[child.renderId] = tdElement;
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
    this._childIdToElementMap = null;
};

EchoRender.ComponentSync.Table.prototype._getRowIndex = function(element) {
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
 * Sets the selection state of a table row.
 *
 * @param {Number} rowIndex the index of the row
 * @param {Boolean} newValue the new selection state
 * @param tableElement the table element, may be null
 */
EchoRender.ComponentSync.Table.prototype._setSelected = function(rowIndex, newValue) {
    this.selectionModel.setSelectedIndex(rowIndex, newValue);
    this._renderRowStyle(rowIndex);
};

/**
 * Deselects all selected rows.
 */
EchoRender.ComponentSync.Table.prototype._clearSelected = function() {
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
EchoRender.ComponentSync.Table.prototype._addEventListeners = function() {
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

    if (this.selectionModel.isSingleSelection() || !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
        this._clearSelected(this._tableElement);
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
            this._setSelected(i, true, this._tableElement);
        }
    } else {
        this.lastSelectedIndex = rowIndex;
        this._setSelected(rowIndex, !this.selectionModel.isSelectedIndex(rowIndex), this._tableElement);
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

    this._renderRowStyle(rowIndex);
};

EchoRender.registerPeer("Table", EchoRender.ComponentSync.Table);
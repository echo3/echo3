/**
  Remote Table component.
 */
Echo.Sync.RemoteTable = Core.extend(Echo.Component, {

    $static: {
        
        /** 
         * Default selection background color.  Used only when no selection style properties have been set.
         * @type Color
         */
        DEFAULT_SELECTION_BACKGROUND: "#00006f",

        /** 
         * Default selection foreground color.  Used only when no selection style properties have been set.
         * @type Color
         */
        DEFAULT_SELECTION_FOREGROUND: "#ffffff"
    },
    
    $load: function() {
        Echo.ComponentFactory.registerType("RemoteTable", this);
        Echo.ComponentFactory.registerType("RT", this);
    },

    /** @see Echo.Component#compnoentType */
    componentType: "RemoteTable",

    $virtual: {
        
        /**
         * Programmatically performs a button action.
         */
        doAction: function() {
            this.fireEvent({type: "action", source: this, data: this.get("actionCommand")});
        }
    }
});

/**
 * Component rendering peer: RemoteTable.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.RemoteTableSync = Core.extend(Echo.Render.ComponentSync, {
    
    $static: {
    
        /**
         * Constant describing header row index.
         * @type Number
         */
        _HEADER_ROW: -1,
        
        /**
         * Array of properties which may be updated without full re-render.
         * @type Array
         */
        _supportedPartialProperties: ["selection"]
    },
    
    $load: function() {
        Echo.Render.registerPeer("RemoteTable", this);
    },
    
    /**
     * Flag indicating that no selection styling attributes have been set, thus default highlight should be used.
     * @type Boolean
     */
    _useDefaultSelectionStyle: false,
    
    /**
     * Array of column width settings.
     * @type Array
     */
    _columnWidths: null,
    
    /** Constructor. */
    $construct: function() {
        this.selectionModel = null;
        this.lastSelectedIndex = null;
    },
    
    /**
     * Adds event listeners.
     */
    _addEventListeners: function() {
        if (!this.component.isRenderEnabled()) {
            return;
        }
        
        if (this._selectionEnabled || this._rolloverEnabled) {
            if (this._rowCount === 0) {
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
                var tr = this._table.rows[rowIndex + rowOffset];
                if (this._rolloverEnabled) {
                    Core.Web.Event.add(tr, enterEvent, rolloverEnterRef, false);
                    Core.Web.Event.add(tr, exitEvent, rolloverExitRef, false);
                }
                if (this._selectionEnabled) {
                    Core.Web.Event.add(tr, "click", clickRef, false);
                    Core.Web.Event.Selection.disable(tr);
                }
            }
        }
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
    
    /**
     * Creates a prototype TR element for the rendered table, containing style information
     * and TD elements representing the table cells.  This prototype may be cloned to
     * quickly generate the table DOM.
     * 
     * @return the prototype TR row element hierarchy
     * @type Element
     */
    _createRowPrototype: function() {
        var tr = document.createElement("tr");
    
        var tdPrototype = document.createElement("td");
        Echo.Sync.Border.render(this.component.render("border"), tdPrototype);
        tdPrototype.style.padding = this._defaultCellPadding;
    
        for (var columnIndex = 0; columnIndex < this._columnCount; columnIndex++) {
            var td = tdPrototype.cloneNode(false);
            tr.appendChild(td);
        }
        return tr;
    },

    /**
     * Returns the table row index of the given TR element,
     * accounting for header visibility.
     * 
     * @param {Element} element the TR table row element
     * @return the index of the specified row, or -1 if it cannot be found
     * @type Number
     */
    _getRowIndex: function(element) {
        var testElement = this._tbody.firstChild;
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
     * Processes a mouse click event on the table.
     */
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        var tr = e.registeredTarget;
        var rowIndex = this._getRowIndex(tr);
        if (rowIndex == -1) {
            return;
        }
        
        Core.Web.DOM.preventEventDefault(e);
    
        if (this.selectionModel.getSelectionMode() == Echo.Sync.RemoteTable.ListSelectionModel.SINGLE_SELECTION || 
                !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
            this._clearSelected();
        }
    
        if (!this.selectionModel.getSelectionMode() == Echo.Sync.RemoteTable.ListSelectionModel.SINGLE_SELECTION && 
                e.shiftKey && this.lastSelectedIndex != -1) {
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
        
        this.component.doAction();
    },
    
    /**
     * Processes a mouse rollover enter event on a table row.
     */
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        var tr = e.registeredTarget;
        var rowIndex = this._getRowIndex(tr);
        if (rowIndex == -1) {
            return;
        }
        
        for (var i = 0; i < tr.cells.length; ++i) {
            var cell = tr.cells[i];
            Echo.Sync.Font.renderClear(this.component.render("rolloverFont"), cell);
            Echo.Sync.Color.render(this.component.render("rolloverForeground"), cell, "color");
            Echo.Sync.Color.render(this.component.render("rolloverBackground"), cell, "background");
            Echo.Sync.FillImage.render(this.component.render("rolloverBackgroundImage"), cell); 
        }
    },
    
    /**
     * Processes a mouse rollover exit event on a table row.
     */
    _processRolloverExit: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        var tr = e.registeredTarget;
        var rowIndex = this._getRowIndex(tr);
        if (rowIndex == -1) {
            return;
        }
    
        this._renderRowStyle(rowIndex);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._columnCount = parseInt(this.component.render("columnCount"), 10);
        this._rowCount = parseInt(this.component.render("rowCount"), 10);
        this._selectionEnabled = this.component.render("selectionEnabled");
        this._rolloverEnabled = this.component.render("rolloverEnabled");
        
        this._useDefaultSelectionStyle = this._selectionEnabled && !this.component.render("selectionForeground") &&
                !this.component.render("selectionBackground") && !this.component.render("selectionBackgroundImage") &&
                !this.component.render("selectionFont");
        
        this._defaultInsets = this.component.render("insets", 0);
        this._defaultPixelInsets = Echo.Sync.Insets.toPixels(this._defaultInsets);
        this._defaultCellPadding = Echo.Sync.Insets.toCssValue(this._defaultInsets);
        
        this._headerVisible = this.component.get("headerVisible");
    
        if (this._selectionEnabled) {
            this.selectionModel = new Echo.Sync.RemoteTable.ListSelectionModel(
                    parseInt(this.component.get("selectionMode"), 10));
        }
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.display = "table";
        this._div.style.overflow = "hidden";
        Echo.Sync.RoundedCorner.render(this.component.render("radius"), this._div);
        Echo.Sync.BoxShadow.render(this.component.render("boxShadow"), this._div);
        
        this._table = document.createElement("table");
        this._table.style.borderCollapse = "collapse";
        if (this._selectionEnabled) {
            this._table.style.cursor = "pointer";
        }
        Echo.Sync.renderComponentDefaults(this.component, this._table);
        
        var border = this.component.render("border");
        if (border) {
            Echo.Sync.Border.render(border, this._table);
            if (border.size && !Core.Web.Env.QUIRK_CSS_BORDER_COLLAPSE_INSIDE) {
                this._table.style.margin = (Echo.Sync.Extent.toPixels(border.size, false) / 2) + "px";
            }
        }

        var width = this.component.render("width");
        if (width) {
            this._div.style.width = width;
            this._table.style.width = "100%";
            // Render percent widths using measuring for IE to avoid potential horizontal scrollbars.
            if (Core.Web.Env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && Echo.Sync.Extent.isPercent(width)) {
                this._div.style.zoom = 1;
            }
        }
        
        this._tbody = document.createElement("tbody");
        
        if (this.component.render("columnWidth")) {
            this._columnWidths = [];
            // If any column widths are set, render colgroup.
            var columnPixelAdjustment = 0;
            if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
                columnPixelAdjustment = this._defaultPixelInsets.left + this._defaultPixelInsets.right;
            }
            
            var colGroupElement = document.createElement("colgroup");
            for (var i = 0; i < this._columnCount; ++i) {
                var colElement = document.createElement("col");
                width = this.component.renderIndex("columnWidth", i); 
                if (width != null) {
                    if (Echo.Sync.Extent.isPercent(width)) {
                        colElement.style.width = width.toString();
                    } else {
                        var columnPixels = Echo.Sync.Extent.toPixels(width, true);
                        this._columnWidths[i] = columnPixels - columnPixelAdjustment;
                        colElement.style.width = this._columnWidths[i] + "px";
                    }
                }
                colGroupElement.appendChild(colElement);
            }
            this._table.appendChild(colGroupElement);
        }
        
        this._table.appendChild(this._tbody);
        this._div.appendChild(this._table);
        parentElement.appendChild(this._div);
        
        var trPrototype = this._createRowPrototype();
        
        if (this._headerVisible) {
            this._tbody.appendChild(this._renderRow(update, Echo.Sync.RemoteTableSync._HEADER_ROW, trPrototype));
        }
        for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
            this._tbody.appendChild(this._renderRow(update, rowIndex, trPrototype));
        }
        
        if (this._selectionEnabled) {
            this._setSelectedFromProperty(this.component.get("selection"), false);
        }
        
        this._addEventListeners();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._columnWidths = null;
        if (this._rolloverEnabled || this._selectionEnabled) {
            var tr = this._tbody.firstChild;
            if (this._headerVisible) {
                tr = tr.nextSibling;
            }
            while (tr) {
                Core.Web.Event.removeAll(tr);
                tr = tr.nextSibling;
            }
        }
        this._table = null;
        this._tbody = null;
    },
    
    /**
     * Renders an appropriate style for a row (i.e. selected or deselected).
     *
     * @param {Number} rowIndex the index of the row
     */
    _renderRowStyle: function(rowIndex) {
        var tableRowIndex = rowIndex + (this._headerVisible ? 1 : 0);
        if (tableRowIndex >= this._tbody.childNodes.length) {
            return;
        }
        var selected = this._selectionEnabled && this.selectionModel.isSelectedIndex(rowIndex);
        var tr = this._tbody.childNodes[tableRowIndex];
        var td = tr.firstChild;
        
        var columnIndex = 0;
        
        while (td) {
            if (selected) {
                if (this._useDefaultSelectionStyle) {
                    Echo.Sync.Color.render(Echo.Sync.RemoteTable.DEFAULT_SELECTION_FOREGROUND, td, "color");
                    Echo.Sync.Color.render(Echo.Sync.RemoteTable.DEFAULT_SELECTION_BACKGROUND, td, "background");
                } else {
                    Echo.Sync.Font.renderClear(this.component.render("selectionFont"), td);
                    Echo.Sync.Color.render(this.component.render("selectionForeground"), td, "color");
                    Echo.Sync.Color.render(this.component.render("selectionBackground"), td, "background");
                    Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), td);
                }
            } else {
                td.style.color = "";
                td.style.backgroundColor = "";
                td.style.backgroundImage = "";
                Echo.Sync.Font.renderClear(null, td);
                
                var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * 
                        this._columnCount + columnIndex);
                var layoutData = child.render("layoutData");

                if (layoutData) {
                    Echo.Sync.Color.render(layoutData.background, td, "backgroundColor");
                    Echo.Sync.FillImage.render(layoutData.backgroundImage, td);
                }
            
            }
            td = td.nextSibling;
            ++columnIndex;
        }
    },
    
    /**
     * Renders a single row.
     *
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Number} rowIndex the index of the row
     * @param {Element} trPrototype a TR element containing the appropriate number of TD elements with default
     *        styles applied (This is created by _renderRowStyle().  Providing this attribute is optional,
     *        and is specified for performance reasons.  If omitted one is created automatically.)
     * @return the created row
     * @type Element
     */
    _renderRow: function(update, rowIndex, trPrototype) {
        var tr = trPrototype ? trPrototype.cloneNode(true) : this._createRowPrototype();
        
        var td = tr.firstChild;
        var columnIndex = 0;
        
        while (columnIndex < this._columnCount) {
            var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * this._columnCount + columnIndex);
            var layoutData = child.render("layoutData");
            
            if (layoutData) {
                if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING && this._columnWidths && 
                        this._columnWidths[columnIndex]) { 
                    var cellInsets = Echo.Sync.Insets.toPixels(layoutData.insets);
                    if (this._defaultPixelInsets.left + this._defaultPixelInsets.right < cellInsets.left + cellInsets.right) {
                        td.style.width = (this._columnWidths[columnIndex] - cellInsets.left - cellInsets.right) + "px";
                    }
                }
                Echo.Sync.Insets.render(layoutData.insets, td, "padding");
                Echo.Sync.Alignment.render(layoutData.alignment, td, true, this.component);
                Echo.Sync.FillImage.render(layoutData.backgroundImage, td);
                Echo.Sync.Color.render(layoutData.background, td, "backgroundColor");
            }
    
            Echo.Render.renderComponentAdd(update, child, td);
            
            ++columnIndex;
            td = td.nextSibling;
        }
        return tr;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
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
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
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
            if (selectedIndices[i] === "") {
                continue;
            }
            this._setSelected(parseInt(selectedIndices[i], 10), true);
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
    }
});

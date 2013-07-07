/**
 * Component rendering peer: Grid.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.Grid = Core.extend(Echo.Render.ComponentSync, {

    $static: {

        /**
         * Creates a prototype rendering of the basic DOM structure of a Grid which may be cloned
         * for enhanced rendering performance.
         * 
         * @return the prototype DOM hierarchy
         * @type Element
         */
        _createPrototypeTable: function() {
            var div = document.createElement("div");
            div.style.display = "table";
            div.style.overflow = "hidden";
            
            var table = document.createElement("table");
            table.style.outlineStyle = "none";
            table.tabIndex = "-1";
            table.style.borderCollapse = "collapse";
            
            var colGroup = document.createElement("colgroup");
            table.appendChild(colGroup);
        
            table.appendChild(document.createElement("tbody"));
            
            div.appendChild(table);
            
            return div;
        },
        
        /**
         * Performs processing on layout of grid, determining rendered cell sizes, and
         * eliminating conflicting row/column spans.
         * 
         * This object describes coordinates in terms of x and y, rather than column/row.
         * The translation between x/y and column/row varies based on the grid's orientation.
         * For horizontally oriented grids, the x-axis represents columns and the y-axis rows.
         * For vertically oriented grids, the x-axis represents rows and the y-axis columns.
         */
        Processor: Core.extend({
        
            $static: {
            
                /**
                 * Representation of a single cell of the grid.
                 */
                Cell: Core.extend({
                    
                    /** 
                     * The number of cells spanned in the x direction
                     * @type Number
                     */
                    xSpan: null,
                    
                    /** 
                     * The number of cells spanned in the y direction. 
                     * @type Number
                     */
                    ySpan: null,
                    
                    /** 
                     * The index of the child component within the Grid parent. 
                     * @type Number
                     */
                    index: null,
                    
                    /** 
                     * The child component.
                     * @type Echo.Component 
                     */
                    component: null,
                    
                    /**
                     * Creates a new cell.
                     * 
                     * @param {Echo.Component} component the component
                     * @param {Number} index the index of the component within the Grid parent
                     * @param {Number} xSpan the number of cells spanned in the x direction
                     * @param {Number} ySpan the number of cells spanned in the y direction
                     */
                    $construct: function(component, index, xSpan, ySpan) {
                        this.component = component;
                        this.index = index;
                        this.xSpan = xSpan;
                        this.ySpan = ySpan;
                    }
                })
            },
            
            /**
             * Two dimensional array which contains <code>Cell</code>s.
             * Each index of this array contains an array which represents a y-index of the grid.
             * Each index in a contained arrays represents a cell of the grid.
             * @type Array
             */
            cellArrays: null,
            
            /**
             * The Grid being rendered.
             * @type Echo.Grid
             */
            grid: null,
            
            /** 
             * The size of the grid's x-axis.
             * @type Number
             */ 
            gridXSize: null,
            
            /** 
             * The size of the grid's x-axis.
             * @type Number
             */ 
            gridYSize: null,
            
            /**
             * Array of extents representing cell sizes on x-axis.
             * @type Array
             */
            xExtents: null,
            
            /**
             * Array of extents representing cell sizes on y-axis.
             * @type Array
             */
            yExtents: null,
            
            /**
             * Flag indicating whether the grid is horizontally oriented.
             * @type Boolean
             */
            horizontalOrientation: null,
            
            /**
             * Creates a new Processor instance.
             * 
             * @param {Echo.Grid} grid the supported grid
             */
            $construct: function(grid) {
                this.grid = grid;
                this.cellArrays = [];
                this.horizontalOrientation = grid.render("orientation") != Echo.Grid.ORIENTATION_VERTICAL;
                
                var cells = this.createCells();
                if (cells == null) {
                    // Special case: empty Grid.
                    this.gridXSize = 0;
                    this.gridYSize = 0;
                    return;
                }
            
                
                this.renderCellMatrix(cells);
                
                this.calculateExtents();
                
                this.reduceY();
                this.reduceX();
            },
            
            /**
             * Adds two extents.
             * 
             * @param {#Extent} a the first extent
             * @param {#Extent} b the second extent
             * @param {Boolean} flag indicating whether extents are horizontal
             * @return the sum of the extents
             * @type #Extent
             */
            addExtents: function(a, b, horizontal) {
                var ap = Echo.Sync.Extent.isPercent(a), bp = Echo.Sync.Extent.isPercent(b);
                if (ap || bp) {
                    if (ap && bp) {
                        // Both are percents, add them.
                        return (parseFloat(a) + parseFloat(b)) + "%";
                    } else {
                        // One extent is percent, the other is not: return the percent extent.
                        return ap ? a : b;
                    }
                } else {
                    return Echo.Sync.Extent.toPixels(a) + Echo.Sync.Extent.toPixels(b);
                }
            },
            
            /**
             * Calculates sizes of columns and rows.
             */
            calculateExtents: function() {
                var i,
                    xProperty = this.horizontalOrientation ? "columnWidth" : "rowHeight",
                    yProperty = this.horizontalOrientation ? "rowHeight" : "columnWidth";
                
                this.xExtents = [];
                for (i = 0; i < this.gridXSize; ++i) {
                    this.xExtents.push(this.grid.renderIndex(xProperty, i));
                }
            
                this.yExtents = [];
                for (i = 0; i < this.gridYSize; ++i) {
                    this.yExtents.push(this.grid.renderIndex(yProperty, i));
                }
            },
            
            /**
             * Creates array of <code>Cell</code> instances representing child components of the grid.
             * 
             * @return the array of <code>Cell</code> instances
             * @type Array
             */
            createCells: function() {
                var childCount = this.grid.getComponentCount();
                if (childCount === 0) {
                    // Abort if Grid is empty.
                    return null;
                }
                
                var cells = [];
                for (var i = 0; i < childCount; ++i) {
                    var child = this.grid.getComponent(i);
                    var layoutData = child.render("layoutData");
                    if (layoutData) {
                        var xSpan = this.horizontalOrientation ? layoutData.columnSpan : layoutData.rowSpan; 
                        var ySpan = this.horizontalOrientation ? layoutData.rowSpan : layoutData.columnSpan; 
                        cells.push(new Echo.Sync.Grid.Processor.Cell(child, i, xSpan ? xSpan : 1, ySpan ? ySpan : 1));
                    } else {
                        cells.push(new Echo.Sync.Grid.Processor.Cell(child, i, 1, 1));
                    }
                }
                return cells;
            },
            
            /**
             * Returns an array representing the cells at the specified y-index.
             * If no array currently exists, one is created.
             * 
             * @param {Integer} y the y-index
             * @return the array of cells.
             * @type Array
             */
            _getCellArray: function(y) {
                while (y >= this.cellArrays.length) {
                    this.cellArrays.push([]);
                }
                return this.cellArrays[y]; 
            },
            
            /**
             * Returns the number of columns that should be rendered.
             * 
             * @return the number of rendered columns
             * @type Integer
             */
            getColumnCount: function() {
                return this.horizontalOrientation ? this.gridXSize : this.gridYSize;
            },
            
            /**
             * Returns the cell that should be rendered at the
             * specified position.
             * 
             * @param {Integer} column the column index
             * @param {Integer} row the row index
             * @return the cell
             * @type Echo.Sync.Grid.Processor.Cell
             */
            getCell: function(column, row) {
                if (this.horizontalOrientation) {
                    return this.cellArrays[row][column];
                } else {
                    return this.cellArrays[column][row];
                }
            },
            
            /**
             * Returns the number of rows that should be rendered.
             * 
             * @return the number of rendered rows
             * @type Integer
             */
            getRowCount: function() {
                return this.horizontalOrientation ? this.gridYSize : this.gridXSize;
            },
            
            /**
             * Remove duplicates from the x-axis where all cells simply
             * "span over" a given x-axis coordinate. 
             */
            reduceX: function() {
                // Determine duplicate cell sets on x-axis.
                var xRemoves = [], 
                    x = 1, 
                    y, 
                    length = this.cellArrays[0].length;
                while (x < length) {
                    y = 0;
                    var identical = true;
                    while (y < this.cellArrays.length) {
                        if (this.cellArrays[y][x] != this.cellArrays[y][x - 1]) {
                            identical = false;
                            break;
                        }
                        ++y;
                    }
                    if (identical) {
                        xRemoves[x] = true;
                    }
                    ++x;
                }
                
                // If no reductions are necessary on the x-axis, do nothing.
                if (xRemoves.length === 0) {
                    return;
                }
                
                for (var removedX = this.gridXSize - 1; removedX >= 1; --removedX) {
                    if (!xRemoves[removedX]) {
                        continue;
                    }
                    
                    for (y = 0; y < this.gridYSize; ++y) {
                        if (y === 0 || this.cellArrays[y][removedX - 1] != this.cellArrays[y - 1][removedX - 1]) {
                            // Reduce x-span, taking care not to reduce it multiple times if cell has a y-span.
                            if (this.cellArrays[y][removedX - 1] != null) {
                                --this.cellArrays[y][removedX - 1].xSpan;
                            }
                        }
                        this.cellArrays[y].splice(removedX, 1);
                    }
                    
                    var removedXExtent = this.xExtents.splice(removedX, 1)[0];

                    if (removedXExtent) {
                        this.xExtents[removedX - 1] = this.addExtents(this.xExtents[removedX - 1], removedXExtent,
                                this.horizontalOrientation ? true : false);
                    }
                    
                    --this.gridXSize;
                }
            },
            
            /**
             * Remove duplicates from the y-axis where all cells simply
             * "span over" a given y-axis coordinate. 
             */
            reduceY: function() {
                var yRemoves = [],
                    y = 1,
                    x,
                    size = this.cellArrays.length,
                    previousCellArray,
                    currentCellArray = this.cellArrays[0];
                
                while (y < size) {
                    previousCellArray = currentCellArray;
                    currentCellArray = this.cellArrays[y];
                    
                    x = 0;
                    var identical = true;
                    
                    while (x < currentCellArray.length) {
                        if (currentCellArray[x] != previousCellArray[x]) {
                            identical = false;
                            break;
                        }
                        ++x;
                    }
                    if (identical) {
                        yRemoves[y] = true;
                    }
                    
                    ++y;
                }
                
                // If no reductions are necessary on the y-axis, do nothing.
                if (yRemoves.length === 0) {
                    return;
                }
                
                for (var removedY = this.gridYSize - 1; removedY >= 0; --removedY) {
                    if (!yRemoves[removedY]) {
                        continue;
                    }
                    
                    // Shorten the y-spans of the cell array that will be retained to 
                    // reflect the fact that a cell array is being removed.
                    var retainedCellArray = this.cellArrays[removedY - 1];
                    for (x = 0; x < this.gridXSize; ++x) {
                        if (x === 0 || retainedCellArray[x] != retainedCellArray[x - 1]) {
                            // Reduce y-span, taking care not to reduce it multiple times if cell has an x-span.
                            if (retainedCellArray[x] != null) {
                                --retainedCellArray[x].ySpan;
                            }
                        }
                    }
                    
                    // Remove the duplicate cell array.
                    this.cellArrays.splice(removedY, 1);
                    
                    // Remove size data for removed row, add value to previous if necessary.
                    var removedYExtent = this.yExtents.splice(removedY, 1)[0];
                    if (removedYExtent) {
                        this.yExtents[removedY - 1] = this.addExtents(this.yExtents[removedY - 1], removedYExtent,
                                this.horizontalOrientation ? false : true);
                    }
                    
                    // Decrement the grid size to reflect cell array removal.
                    --this.gridYSize;
                }
            },
            
            /**
             * Iterates over cells to create the cell matrix, adjusting column and row spans as of cells to ensure
             * that no overlap occurs between column and row spans.
             * Additionally determines actual y-size of grid.   
             * 
             * @param {Array} cells array of <code>Echo.Sync.Grid.Processor.Cell</code> instances 
             */
            renderCellMatrix: function(cells) {
                this.gridXSize = parseInt(this.grid.render("size", 2), 10);
                var x = 0, 
                    y = 0,
                    xIndex,
                    yIndex,
                    yCells = this._getCellArray(y);
                
                for (var componentIndex = 0; componentIndex < cells.length; ++componentIndex) {
                    
                    // Set x-span to fill remaining size in the event SPAN_FILL has been specified or if the cell would
                    // otherwise extend past the specified size.
                    if (cells[componentIndex].xSpan == Echo.Grid.SPAN_FILL || cells[componentIndex].xSpan > this.gridXSize - x) {
                        cells[componentIndex].xSpan = this.gridXSize - x;
                    }
                    
                    // Set x-span of any cell INCORRECTLY set to negative value to 1 (note that SPAN_FILL has already been handled).
                    if (cells[componentIndex].xSpan < 1) {
                        cells[componentIndex].xSpan = 1;
                    }
                    // Set y-span of any cell INCORRECTLY set to negative value (or more likely SPAN_FILL) to 1.
                    if (cells[componentIndex].ySpan < 1) {
                        cells[componentIndex].ySpan = 1;
                    }
                    
                    if (cells[componentIndex].xSpan != 1 || cells[componentIndex].ySpan != 1) {
                        // Scan to ensure no y-spans are blocking this x-span.
                        // If a y-span is blocking, shorten the x-span to not
                        // interfere.
                        for (xIndex = 1; xIndex < cells[componentIndex].xSpan; ++xIndex) {
                            if (yCells[x + xIndex] != null) {
                                // Blocking component found.
                                cells[componentIndex].xSpan = xIndex;
                                break;
                            }
                        }
                        for (yIndex = 0; yIndex < cells[componentIndex].ySpan; ++yIndex) {
                            var yIndexCells = this._getCellArray(y + yIndex);
                            for (xIndex = 0; xIndex < cells[componentIndex].xSpan; ++xIndex) {
                                yIndexCells[x + xIndex] = cells[componentIndex];
                            }
                        }
                    }
                    yCells[x] = cells[componentIndex];
            
                    if (componentIndex < cells.length - 1) {
                        // Move rendering cursor.
                        var nextRenderPointFound = false;
                        while (!nextRenderPointFound) {
                            if (x < this.gridXSize - 1) {
                                ++x;
                            } else {
                                // Move cursor to next line.
                                x = 0;
                                ++y;
                                yCells = this._getCellArray(y);
                                
                            }
                            nextRenderPointFound = yCells[x] == null;
                        }
                    }
                }
            
                // Store actual 'y' dimension.
                this.gridYSize = this.cellArrays.length;
            }
        })
    },
    
    $load: function() {
        this._prototypeTable = this._createPrototypeTable();
        Echo.Render.registerPeer("Grid", this);
    },
    
    /**
     * The number of columns.
     * @type Number
     */
    _columnCount: null,
    
    /**
     * The number of rows.
     * @type Number
     */
    _rowCount: null,
    
    /**
     * Processes a key press event (for focus navigation amongst child cells.
     */
    clientKeyDown: function(e) { 
        var focusPrevious,
            focusedComponent,
            focusFlags,
            focusChild;
        switch (e.keyCode) {
        case 37:
        case 39:
            focusPrevious = this.component.getRenderLayoutDirection().isLeftToRight() ? e.keyCode == 37 : e.keyCode == 39;
            focusedComponent = this.client.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT) ||
                        (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
                    focusChild = this.client.application.focusManager.findInParent(this.component, focusPrevious);
                    if (focusChild) {
                        this.client.application.setFocusedComponent(focusChild);
                        Core.Web.DOM.preventEventDefault(e.domEvent);
                        return false;
                    }
                }
            }
            break;
        case 38:
        case 40:
            focusPrevious = e.keyCode == 38;
            focusedComponent = this.client.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP) ||
                        (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
                    focusChild = this.client.application.focusManager.findInParent(this.component, focusPrevious,
                            this._columnCount);
                    if (focusChild) {
                        this.client.application.setFocusedComponent(focusChild);
                        Core.Web.DOM.preventEventDefault(e.domEvent);
                        return false;
                    }
                }
            }
            break;
        }
        return true;
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        var gridProcessor = new Echo.Sync.Grid.Processor(this.component),
            defaultInsets = Echo.Sync.Insets.toCssValue(this.component.render("insets", 0)),
            defaultPixelInsets,
            defaultBorder = this.component.render("border", ""),
            width = this.component.render("width"),
            height = this.component.render("height"),
            td,
            columnIndex;
        defaultPixelInsets = Echo.Sync.Insets.toPixels(defaultInsets);
        
        this._columnCount = gridProcessor.getColumnCount();
        this._rowCount = gridProcessor.getRowCount();
        
        this._div = Echo.Sync.Grid._prototypeTable.cloneNode(true);
        this._div.id = this.component.renderId;
        
        var table = this._div.firstChild;
        
        Echo.Sync.renderComponentDefaults(this.component, table);
        Echo.Sync.Border.render(defaultBorder, table);
        Echo.Sync.BoxShadow.render(this.component.render("boxShadow"), this._div);
        Echo.Sync.RoundedCorner.render(this.component.render("radius"), this._div);
        
        table.style.padding = defaultInsets; 
        
        // Render percent widths using measuring for IE to avoid potential horizontal scrollbars.
        if (width && Core.Web.Env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && Echo.Sync.Extent.isPercent(width)) {
            this._div.style.zoom = 1;
        }
        
        // Set overall width/height.
        if (width) {
            table.style.width = "100%";
            if (Echo.Sync.Extent.isPercent(width)) {
                this._div.style.width = width;
            } else {
                this._div.style.width = Echo.Sync.Extent.toCssValue(width, true);
            }
        }
        if (height) {
            table.style.height = "100%";
            if (Echo.Sync.Extent.isPercent(height)) {
                this._div.style.height = height;
            } else {
                this._div.style.height = Echo.Sync.Extent.toCssValue(height, false);
            }
        }

        // Render column widths into colgroup element.
        var colGroup = table.firstChild;
        for (columnIndex = 0; columnIndex < this._columnCount; ++columnIndex) {
            var col = document.createElement("col");
            width = gridProcessor.xExtents[columnIndex];
            if (width != null) {
                if (Echo.Sync.Extent.isPercent(width)) {
                    col.style.width = width.toString();
                } else {
                    var widthValue = Echo.Sync.Extent.toPixels(width, true);
                    if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING) {
                        widthValue -= defaultPixelInsets.left + defaultPixelInsets.right;
                        if (widthValue < 0) {
                            widthValue = 0;
                        }
                    }
                    col.style.width = widthValue + "px";
                }
            }
            colGroup.appendChild(col);
        }
        
        var tbody = colGroup.nextSibling;
        
        var size = parseInt(this.component.render("size", 2), 10);
        
        var tr;
        var renderedComponentIds = {};
        
        var xSpan, ySpan;
        if (gridProcessor.horizontalOrientation) {
            xSpan = "colSpan";
            ySpan = "rowSpan"; 
        } else {
            xSpan = "rowSpan";
            ySpan = "colSpan"; 
        }
        
        var tdPrototype = document.createElement("td");
        Echo.Sync.Border.render(defaultBorder, tdPrototype);
        tdPrototype.style.padding = defaultInsets;
        
        // Render grid layout.
        for (var rowIndex = 0; rowIndex < this._rowCount; ++rowIndex) {
            tr = document.createElement("tr");
            height = gridProcessor.yExtents[rowIndex];
            if (height) {
                tr.style.height = Echo.Sync.Extent.toCssValue(height, false);
            }
            tbody.appendChild(tr);
            
            for (columnIndex = 0; columnIndex < this._columnCount; ++columnIndex) {
                var cell = gridProcessor.getCell(columnIndex, rowIndex);
                if (cell == null) {
                    td = document.createElement("td");
                    tr.appendChild(td);
                    continue;
                }
                if (renderedComponentIds[cell.component.renderId]) {
                    // Cell already rendered.
                    continue;
                }
                renderedComponentIds[cell.component.renderId] = true;
                
                td = tdPrototype.cloneNode(false);
                
                if (cell.xSpan > 1) {
                    td.setAttribute(xSpan, cell.xSpan);
                }
                if (cell.ySpan > 1) {
                    td.setAttribute(ySpan, cell.ySpan);
                }
                
                var layoutData = cell.component.render("layoutData");
                if (layoutData) {
                    var columnWidth = gridProcessor.xExtents[columnIndex];
                    if (Core.Web.Env.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING && columnWidth && 
                            !Echo.Sync.Extent.isPercent(columnWidth)) { 
                        var cellInsets = Echo.Sync.Insets.toPixels(layoutData.insets);
                        if (defaultPixelInsets.left + defaultPixelInsets.right < cellInsets.left + cellInsets.right) {
                            td.style.width = (Echo.Sync.Extent.toPixels(columnWidth) - 
                                    (cellInsets.left + cellInsets.right)) + "px";
                        }
                    }
                    Echo.Sync.Insets.render(layoutData.insets, td, "padding");
                    Echo.Sync.Alignment.render(layoutData.alignment, td, true, this.component);
                    Echo.Sync.FillImage.render(layoutData.backgroundImage, td);
                    Echo.Sync.Color.render(layoutData.background, td, "backgroundColor");
                }
                
                Echo.Render.renderComponentAdd(update, cell.component, td);
    
                tr.appendChild(td);
            }
        }
        
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

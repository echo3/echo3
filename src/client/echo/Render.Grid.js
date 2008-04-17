/**
 * Component rendering peer: Grid
 */
Echo.Sync.Grid = Core.extend(Echo.Render.ComponentSync, {

    $static: {

        _createPrototypeTable: function() {
            var table = document.createElement("table");
            table.style.outlineStyle = "none";
            table.tabIndex = "-1";
            table.style.borderCollapse = "collapse";
            
            var colGroup = document.createElement("colgroup");
            table.appendChild(colGroup);
        
            table.appendChild(document.createElement("tbody"));
            
            return table;
        },
        
        Processor: Core.extend({
        
            $static: {
            
                Cell: Core.extend({
                    $construct: function(component, index, xSpan, ySpan) {
                        this.component = component;
                        this.index = index;
                        this.xSpan = xSpan;
                        this.ySpan = ySpan;
                    }
                })
            },
        
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
            
            calculateExtents: function() {
                var xProperty = this.horizontalOrientation ? "columnWidth" : "rowHeight";
                var yProperty = this.horizontalOrientation ? "rowHeight" : "columnWidth";
                
                this.xExtents = [];
                for (var i = 0; i < this.gridXSize; ++i) {
                    this.xExtents.push(this.grid.renderIndex(xProperty, i));
                }
            
                this.yExtents = [];
                for (var i = 0; i < this.gridYSize; ++i) {
                    this.yExtents.push(this.grid.renderIndex(yProperty, i));
                }
            },
            
            createCells: function() {
                var childCount = this.grid.getComponentCount();
                if (childCount == 0) {
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
             * @type {Array}
             */
            _getCellArray: function(y) {
                while (y >= this.cellArrays.length) {
                    this.cellArrays.push(new Array(this.gridXSize));
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
                var xRemoves = [];
                var x = 1;
                var length = this.cellArrays[0].length;
                while (x < length) {
                    var y = 0;
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
                if (xRemoves.length == 0) {
                    return;
                }
                
                for (var removedX = this.gridXSize - 1; removedX >= 0; --removedX) {
                    if (!xRemoves[removedX]) {
                        continue;
                    }
                    
                    for (var y = 0; y < this.gridYSize; ++y) {
                        if (y == 0 || this.cellArrays[y][removedX - 1] != this.cellArrays[y - 1][removedX - 1]) {
                            // Reduce x-span, taking care not to reduce it multiple times if cell has a y-span.
                            if (this.cellArrays[y][removedX - 1] != null) {
                                --this.cellArrays[y][removedX - 1].xSpan;
                            }
                        }
                        for (x = removedX; x < this.gridXSize - 1; ++x) {
                            this.cellArrays[y][x] = this.cellArrays[y][x + 1];
                        }
                    }
                    
                    //FIXME. Add extent-size recalc.
                    
                    --this.gridXSize;
                }
            },
            
            /**
             * Remove duplicates from the y-axis where all cells simply
             * "span over" a given y-axis coordinate. 
             */
            reduceY: function() {
                var yRemoves = [];
                var y = 1;
                
                var size = this.cellArrays.length;
                var previousCellArray;
                var currentCellArray = this.cellArrays[0];
                
                while (y < size) {
                    previousCellArray = currentCellArray;
                    currentCellArray = this.cellArrays[y];
                    
                    var x = 0;
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
                if (yRemoves.length == 0) {
                    return;
                }
                
                for (var removedY = this.gridYSize - 1; removedY >= 0; --removedY) {
                    if (!yRemoves[removedY]) {
                        continue;
                    }
                    
                    // Shorten the y-spans of the cell array that will be retained to 
                    // reflect the fact that a cell array is being removed.
                    var retainedCellArray = this.cellArrays[removedY - 1];
                    for (var x = 0; x < this.gridXSize; ++x) {
                        if (x == 0 || retainedCellArray[x] != retainedCellArray[x - 1]) {
                            // Reduce y-span, taking care not to reduce it multiple times if cell has an x-span.
                            if (retainedCellArray[x] != null) {
                                --retainedCellArray[x].ySpan;
                            }
                        }
                    }
                    
                    // Remove the duplicate cell array.
                    this.cellArrays.splice(removedY, 1);
                    
                    //FIXME. insert code here for extent adjustment.
                    
                    // Decrement the grid size to reflect cell array removal.
                    --this.gridYSize;
                }
            },
            
            renderCellMatrix: function(cells) {
                this.gridXSize = parseInt(this.grid.render("size", 2));
                var x = 0, y = 0;
                var yCells = this._getCellArray(y);
                
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
                        for (var xIndex = 1; xIndex < cells[componentIndex].xSpan; ++xIndex) {
                            if (yCells[x + xIndex] != null) {
                                // Blocking component found.
                                cells[componentIndex].xSpan = xIndex;
                                break;
                            }
                        }
                        for (var yIndex = 0; yIndex < cells[componentIndex].ySpan; ++yIndex) {
                            var yIndexCells = this._getCellArray(y + yIndex);
                            for (var xIndex = 0; xIndex < cells[componentIndex].xSpan; ++xIndex) {
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
    
    _columnCount: null,
    
    _rowCount: null,
    
    _processKeyPress: function(e) { 
        switch (e.keyCode) {
        case 37:
        case 39:
            var focusPrevious = e.keyCode == 37;
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                var focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT)
                        || (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
                    var focusChild = this.component.application.focusManager.findInParent(this.component, focusPrevious);
                    if (focusChild) {
                        this.component.application.setFocusedComponent(focusChild);
                        Core.Web.DOM.preventEventDefault(e);
                        return false;
                    }
                }
            }
            break;
        case 38:
        case 40:
            var focusPrevious = e.keyCode == 38;
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                var focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP)
                        || (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
                    var focusChild = this.component.application.focusManager.findInParent(this.component, focusPrevious,
                            this._columnCount);
                    if (focusChild) {
                        this.component.application.setFocusedComponent(focusChild);
                        Core.Web.DOM.preventEventDefault(e);
                        return false;
                    }
                }
            }
            break;
        }
        return true;
    },

    renderAdd: function(update, parentElement) {
        var gridProcessor = new Echo.Sync.Grid.Processor(this.component);
        
        this._columnCount = gridProcessor.getColumnCount();
        this._rowCount = gridProcessor.getRowCount();
        
        var defaultInsets = Echo.Sync.Insets.toCssValue(this.component.render("insets", 0));
        var defaultBorder = this.component.render("border", "");
    
        this._table = Echo.Sync.Grid._prototypeTable.cloneNode(true);
        this._table.id = this.component.renderId;
        
        Echo.Sync.Color.renderFB(this.component, this._table);
        Echo.Sync.Border.render(defaultBorder, this._table);
        Echo.Sync.Font.render(this.component.render("font"), this._table);
        this._table.style.padding = defaultInsets;
    
        var width = this.component.render("width");
        
        if (width && Core.Web.Env.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR && Echo.Sync.Extent.isPercent(width)) {
            this._renderPercentWidthByMeasure = parseInt(width);
            width = null;
        }
        
        if (width) {
            if (Echo.Sync.Extent.isPercent(width)) {
                this._table.style.width = width;
            } else {
                this._table.style.width = Echo.Sync.Extent.toCssValue(width, true);
            }
        }
        
        var height = this.component.render("height");
        if (height) {
            if (Echo.Sync.Extent.isPercent(height)) {
                this._table.style.height = height;
            } else {
                this._table.style.height = Echo.Sync.Extent.toCssValue(height, false);
            }
        }
        
        var colGroup = this._table.firstChild;
        for (var columnIndex = 0; columnIndex < this._columnCount; ++columnIndex) {
            var col = document.createElement("col");
            var width = gridProcessor.xExtents[columnIndex];
            if (width != null) {
                if (Echo.Sync.Extent.isPercent(width)) {
                    col.width = width.toString();
                } else {
                    col.width = Echo.Sync.Extent.toCssValue(width, true);
                }
            }
            colGroup.appendChild(col);
        }
        
        var tbody = colGroup.nextSibling;
        
        var size = parseInt(this.component.render("size", 2));
        
        var tr;
        var height;
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
        tdPrototype.style.overflow = "hidden";
        
        for (var rowIndex = 0; rowIndex < this._rowCount; ++rowIndex) {
            tr = document.createElement("tr");
            height = gridProcessor.yExtents[rowIndex];
            if (height) {
                tr.style.height = Echo.Sync.Extent.toCssValue(height, false);
            }
            tbody.appendChild(tr);
            
            for (var columnIndex = 0; columnIndex < this._columnCount; ++columnIndex) {
                var cell = gridProcessor.getCell(columnIndex, rowIndex);
                if (cell == null) {
                    var td = document.createElement("td");
                    tr.appendChild(td);
                    continue;
                }
                if (renderedComponentIds[cell.component.renderId]) {
                    // Cell already rendered.
                    continue;
                }
                renderedComponentIds[cell.component.renderId] = true;
                
                var td = tdPrototype.cloneNode(false);
                
                if (cell.xSpan > 1) {
                    td.setAttribute(xSpan, cell.xSpan);
                }
                if (cell.ySpan > 1) {
                    td.setAttribute(ySpan, cell.ySpan);
                }
                
                var layoutData = cell.component.render("layoutData");
                if (layoutData) {
                    Echo.Sync.Insets.render(layoutData.insets, td, "padding");
                    Echo.Sync.Alignment.render(layoutData.alignment, td, true, this.component);
                    Echo.Sync.FillImage.render(layoutData.backgroundImage, td);
                    Echo.Sync.Color.render(layoutData.background, td, "backgroundColor");
                }
                
                Echo.Render.renderComponentAdd(update, cell.component, td);
    
                tr.appendChild(td);
            }
        }
        
        Core.Web.Event.add(this._table, 
                Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                Core.method(this, this._processKeyPress), false);

        parentElement.appendChild(this._table);
    },
    
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._table);
        this._table = null;
    },
    
    renderDisplay: function() {
        if (this._renderPercentWidthByMeasure) {
            this._table.style.width = "";
            var percentWidth = (this._table.parentNode.offsetWidth * this._renderPercentWidthByMeasure) / 100;
            this._table.style.width = percentWidth + "px";
        }
    },
    
    renderUpdate: function(update) {
        var element = this._table;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});

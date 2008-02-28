/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.app;

import java.util.EventListener;
import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.event.TableColumnModelEvent;
import nextapp.echo.app.event.TableColumnModelListener;
import nextapp.echo.app.event.TableModelEvent;
import nextapp.echo.app.event.TableModelListener;
import nextapp.echo.app.list.DefaultListSelectionModel;
import nextapp.echo.app.list.ListSelectionModel;
import nextapp.echo.app.table.DefaultTableCellRenderer;
import nextapp.echo.app.table.DefaultTableColumnModel;
import nextapp.echo.app.table.DefaultTableModel;
import nextapp.echo.app.table.TableCellRenderer;
import nextapp.echo.app.table.TableColumn;
import nextapp.echo.app.table.TableColumnModel;
import nextapp.echo.app.table.TableModel;

/**
 * A component used to display data in a tabular format.
 *
 * @see nextapp.echo.app.table
 */
public class Table extends Component {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * The default renderer for table cells. 
     */
    public static final TableCellRenderer DEFAULT_TABLE_CELL_RENDERER = new DefaultTableCellRenderer();

    public static final String PROPERTY_ACTION_COMMAND = "actionCommand";
    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_ROLLOVER_BACKGROUND = "rolloverBackground";
    public static final String PROPERTY_ROLLOVER_BACKGROUND_IMAGE = "rolloverBackgroundImage";
    public static final String PROPERTY_ROLLOVER_ENABLED = "rolloverEnabled";
    public static final String PROPERTY_ROLLOVER_FONT = "rolloverFont";
    public static final String PROPERTY_ROLLOVER_FOREGROUND = "rolloverForeground";
    public static final String PROPERTY_SELECTION_BACKGROUND = "selectionBackground";
    public static final String PROPERTY_SELECTION_BACKGROUND_IMAGE = "selectionBackgroundImage";
    public static final String PROPERTY_SELECTION_ENABLED = "selectionEnabled";
    public static final String PROPERTY_SELECTION_FONT = "selectionFont";
    public static final String PROPERTY_SELECTION_FOREGROUND= "selectionForeground";
    public static final String PROPERTY_WIDTH = "width";
    
    public static final String INPUT_ACTION = "action";

    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String AUTO_CREATE_COLUMNS_FROM_MODEL_CHANGED_PROPERTY = "autoCreateColumnsFromModel";
    public static final String COLUMN_MODEL_CHANGED_PROPERTY = "columnModel";
    public static final String DEFAULT_HEADER_RENDERER_CHANGED_PROPERTY = "defaultHeaderRenderer";
    public static final String DEFAULT_RENDERER_CHANGED_PROPERTY = "defaultRenderer";
    public static final String HEADER_VISIBLE_CHANGED_PROPERTY = "headerVisible";
    public static final String MODEL_CHANGED_PROPERTY = "model";
    public static final String SELECTION_CHANGED_PROPERTY = "selection";
    public static final String SELECTION_MODEL_CHANGED_PROPERTY = "selectionModel";
    
    public static final int HEADER_ROW = -1;
    
    private boolean autoCreateColumnsFromModel;
    private boolean headerVisible = true;
    private TableModel model;
    private TableColumnModel columnModel;
    private boolean valid;
    private Map defaultRendererMap = new HashMap();
    private TableCellRenderer defaultHeaderRenderer;
    private ListSelectionModel selectionModel;
    private boolean suppressChangeNotifications;
    
    /**
     * Listener to monitor changes to model.
     */
    private TableModelListener modelListener = new TableModelListener() {
        
        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;

        /**
         * @see nextapp.echo.app.event.TableModelListener#tableChanged(nextapp.echo.app.event.TableModelEvent)
         */
        public void tableChanged(TableModelEvent e) {
            invalidate();
            if ((e == null || e.getType() == TableModelEvent.STRUCTURE_CHANGED) && isAutoCreateColumnsFromModel()) {
                createDefaultColumnsFromModel();
            }
        }
    };
    
    /**
     * Listener to monitor changes to column model.
     */
    private TableColumnModelListener columnModelListener = new TableColumnModelListener() {

        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;

        /**
         * @see nextapp.echo.app.event.TableColumnModelListener#columnAdded(nextapp.echo.app.event.TableColumnModelEvent)
         */
        public void columnAdded(TableColumnModelEvent e) {
            invalidate();
        }

        /**
         * @see nextapp.echo.app.event.TableColumnModelListener#columnMoved(nextapp.echo.app.event.TableColumnModelEvent)
         */
        public void columnMoved(TableColumnModelEvent e) {            
            invalidate();
        }

        /**
         * @see nextapp.echo.app.event.TableColumnModelListener#columnRemoved(nextapp.echo.app.event.TableColumnModelEvent)
         */
        public void columnRemoved(TableColumnModelEvent e) {
            invalidate();
        }
    };

    /**
     * Local handler for list selection events.
     */
    private ChangeListener changeHandler = new ChangeListener() {
        
        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;
        
        /**
         * @see nextapp.echo.app.event.ChangeListener#stateChanged(nextapp.echo.app.event.ChangeEvent)
         */
        public void stateChanged(ChangeEvent e) {
            if (!suppressChangeNotifications) {
                firePropertyChange(SELECTION_CHANGED_PROPERTY, null, null);
            }
        }
    };
    
    /**
     * Creates a new <code>Table</code> with an empty
     * <code>DefaultTableModel</code>.
     */
    public Table() {
        this(new DefaultTableModel());
    }
    
    /**
     * Creates a new <code>Table</code> with a new
     * <code>DefaultTableModel</code> with the specified dimensions.
     *
     * @param columns the initial column count
     * @param rows the initial row count
     */
    public Table(int columns, int rows) {
        this(new DefaultTableModel(columns, rows));
    }
    
    /** 
     * Creates a <code>Table</code> using the supplied 
     * <code>TableModel</code>.
     *
     * @param model the initial model
     */
    public Table(TableModel model) {
        this(model, null);
    }
    
    /** 
     * Creates a <code>Table</code> with the supplied 
     * <code>TableModel</code> and the specified <code>TableColumnModel</code>.
     *
     * @param model the initial model
     * @param columnModel the initial column model
     */
    public Table(TableModel model, TableColumnModel columnModel) {
        super();

        if (columnModel == null) {
            setColumnModel(new DefaultTableColumnModel());
            setAutoCreateColumnsFromModel(true);
        } else {
            setColumnModel(columnModel);
        }
        setSelectionModel(new DefaultListSelectionModel());
        setModel(model);
    }
    
    /**
     * Returns the action command which will be provided in 
     * <code>ActionEvent</code>s fired by this 
     * <code>Table</code>.
     * 
     * @return the action command
     */
    public String getActionCommand() {
        return (String) getProperty(PROPERTY_ACTION_COMMAND);
    }
    
    /**
     * Adds an <code>ActionListener</code> to the <code>Table</code>.
     * <code>ActionListener</code>s will be invoked when the user
     * selects a row.
     * 
     * @param l the <code>ActionListener</code> to add
     */
    public void addActionListener(ActionListener l) {
        getEventListenerList().addListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, null, l);
    }

    /**
     * Creates a <code>TableColumnModel</code> based on the 
     * <code>TableModel</code>.  This method is invoked automatically when the 
     * <code>TableModel</code>'s structure changes if the 
     * <code>autoCreateColumnsFromModel</code> flag is set.
     */
    public void createDefaultColumnsFromModel() {
        if (model != null) {
            while (columnModel.getColumnCount() > 0) {
                columnModel.removeColumn(columnModel.getColumn(0));
            }
            
            int columnCount = model.getColumnCount();
            for (int index = 0; index < columnCount; ++index) {
                columnModel.addColumn(new TableColumn(index));
            }
        }
    }

    /**
     * Re-renders changed rows.
     */
    protected void doRender() {
        removeAll();
        int rowCount = model.getRowCount();
        int columnCount = columnModel.getColumnCount();
        
        TableColumn[] tableColumns = new TableColumn[columnCount];
        TableCellRenderer[] columnRenderers = new TableCellRenderer[columnCount];
        
        for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
            tableColumns[columnIndex] = columnModel.getColumn(columnIndex);
            
            TableCellRenderer renderer = tableColumns[columnIndex].getCellRenderer();
            if (renderer == null) {
                Class columnClass = model.getColumnClass(tableColumns[columnIndex].getModelIndex());
                renderer = getDefaultRenderer(columnClass);
                if (renderer == null) {
                    renderer = DEFAULT_TABLE_CELL_RENDERER;
                }
            }
            columnRenderers[columnIndex] = renderer;

        }

        if (isHeaderVisible()) {
            for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
                int modelColumnIndex = tableColumns[columnIndex].getModelIndex();
                Object headerValue = tableColumns[columnIndex].getHeaderValue();
                if (headerValue == null) {
                    headerValue = model.getColumnName(modelColumnIndex);
                }
                TableCellRenderer headerRenderer = tableColumns[columnIndex].getHeaderRenderer();
                if (headerRenderer == null) {
                    headerRenderer = defaultHeaderRenderer;
                    if (headerRenderer == null) {
                        headerRenderer = DEFAULT_TABLE_CELL_RENDERER;
                    }
                }
                Component renderedComponent 
                        = headerRenderer.getTableCellRendererComponent(this, headerValue, modelColumnIndex, HEADER_ROW);
                if (renderedComponent == null) {
                    renderedComponent = new Label();
                }
                add(renderedComponent);
            }
        }
        
        for (int rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
            for (int columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
                int modelColumnIndex = tableColumns[columnIndex].getModelIndex();
                Object modelValue = model.getValueAt(modelColumnIndex, rowIndex);
                Component renderedComponent 
                        = columnRenderers[columnIndex].getTableCellRendererComponent(this, modelValue, modelColumnIndex, rowIndex);
                if (renderedComponent == null) {
                    renderedComponent = new Label();
                }
                add(renderedComponent);
            }
        }
    }
    
    /**
     * Fires an action event to all listeners.
     */
    private void fireActionEvent() {
        if (!hasEventListenerList()) {
            return;
        }
        EventListener[] listeners = getEventListenerList().getListeners(ActionListener.class);
        ActionEvent e = null;
        for (int i = 0; i < listeners.length; ++i) {
            if (e == null) {
                e = new ActionEvent(this, (String) getRenderProperty(PROPERTY_ACTION_COMMAND));
            } 
            ((ActionListener) listeners[i]).actionPerformed(e);
        }
    }
    
    /**
     * Returns the <code>Border</code>.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) getProperty(PROPERTY_BORDER);
    }

    /** 
     * Returns the <code>TableColumnModel</code> describing this table's 
     * columns.
     *
     * @return the column model
     */
    public TableColumnModel getColumnModel() {
        return columnModel;
    }
    
    /**
     * Returns the default <code>TableCellRenderer</code> used to render
     * header cells.  The default header renderer will be used in the event 
     * that a <code>TableColumn</code> does not provide a specific header
     * renderer.
     * 
     * @return the <code>TableCellRenderer</code>
     */
    public TableCellRenderer getDefaultHeaderRenderer() {
        return defaultHeaderRenderer;
    }
    
    /**
     * Returns the default <code>TableCellRenderer</code> for the specified 
     * column class.  The default renderer will be used in the event that
     * a <code>TableColumn</code> does not provide a specific renderer.
     * 
     * @param columnClass the column <code>Class</code>
     * @return the <code>TableCellRenderer</code>
     */
    public TableCellRenderer getDefaultRenderer(Class columnClass) {
        return (TableCellRenderer) defaultRendererMap.get(columnClass);
    }
    
    /**
     * Returns the default cell insets.
     * 
     * @return the default cell insets
     */
    public Insets getInsets() {
        return (Insets) getProperty(PROPERTY_INSETS);
    }
    
    /**
     * Returns the <code>TableModel</code> being visualized by this 
     * <code>Table</code>.
     *
     * @return the model
     */
    public TableModel getModel() {
        return model;
    }
    
    /**
     * Return the rollover background color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the color
     */
    public Color getRolloverBackground() {
        return (Color) getProperty(PROPERTY_ROLLOVER_BACKGROUND);
    }

    /**
     * Return the rollover background image displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the background image
     */
    public FillImage getRolloverBackgroundImage() {
        return (FillImage) getProperty(PROPERTY_ROLLOVER_BACKGROUND_IMAGE);
    }

    /**
     * Return the rollover font displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the font
     */
    public Font getRolloverFont() {
        return (Font) getProperty(PROPERTY_ROLLOVER_FONT);
    }

    /**
     * Return the rollover foreground color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @return the color
     */
    public Color getRolloverForeground() {
        return (Color) getProperty(PROPERTY_ROLLOVER_FOREGROUND);
    }

    /**
     * Returns the row selection background color.
     * 
     * @return the background color
     */
    public Color getSelectionBackground() {
        return (Color) getProperty(PROPERTY_SELECTION_BACKGROUND);
    }

    /**
     * Returns the row selection background image.
     * 
     * @return the background image
     */
    public FillImage getSelectionBackgroundImage() {
        return (FillImage) getProperty(PROPERTY_SELECTION_BACKGROUND_IMAGE);
    }
    
    /**
     * Returns the row selection font.
     * 
     * @return the font
     */
    public Font getSelectionFont() {
        return (Font) getProperty(PROPERTY_SELECTION_FONT);
    }
    
    /**
     * Returns the row selection foreground color.
     * 
     * @return the foreground color
     */
    public Color getSelectionForeground() {
        return (Color) getProperty(PROPERTY_SELECTION_FOREGROUND);
    }
    
    /**
     * Returns the row selection model.
     * 
     * @return the selection model
     */
    public ListSelectionModel getSelectionModel() {
        return selectionModel;
    }
    
    /**
     * Returns the overall width of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) getProperty(PROPERTY_WIDTH);
    }
    
    /**
     * Determines the any <code>ActionListener</code>s are registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }

    /**
     * Marks the table as needing to be re-rendered.
     */
    protected void invalidate() {
        valid = false;
    }
    
    /**
     * Determines whether the <code>TableColumnModel</code> will be created
     * automatically from the <code>TableModel</code>.  If this flag is set,
     * changes to the <code>TableModel</code> will automatically cause the
     * <code>TableColumnModel</code> to be re-created.  This flag is true
     * by default unless a <code>TableColumnModel</code> is specified in the
     * constructor.
     *
     * @return true if the <code>TableColumnModel</code> will be created
     *         automatically from the <code>TableModel</code>
     */
    public boolean isAutoCreateColumnsFromModel() {
        return autoCreateColumnsFromModel;
    }

    /**
     * Determines if the table header is visible.
     * 
     * @return the header visibility state
     */
    public boolean isHeaderVisible() {
        return headerVisible;
    }
    
    /**
     * Determines if rollover effects are enabled.
     * 
     * @return true if rollover effects are enabled
     * @see #setRolloverEnabled(boolean)
     */
    public boolean isRolloverEnabled() {
        Boolean value = (Boolean) getProperty(PROPERTY_ROLLOVER_ENABLED);
        return value == null ? false : value.booleanValue();
    }

    /**
     * Determines if selection is enabled.
     * 
     * @return true if selection is enabled
     */
    public boolean isSelectionEnabled() {
        Boolean value = (Boolean) getProperty(PROPERTY_SELECTION_ENABLED); 
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        super.processInput(inputName, inputValue);
        if (inputName.equals(SELECTION_CHANGED_PROPERTY)) {
            setSelectedIndices((int[]) inputValue);
        } else if (INPUT_ACTION.equals(inputName)) {
            fireActionEvent();
        }
    }
    
    /**
     * Removes an <code>ActionListener</code> from the <code>Table</code>.
     * <code>ActionListener</code>s will be invoked when the user
     * selects a row.
     * 
     * @param l the <code>ActionListener</code> to remove
     */
    public void removeActionListener(ActionListener l) {
        if (!hasEventListenerList()) {
            return;
        }
        getEventListenerList().removeListener(ActionListener.class, l);
        // Notification of action listener changes is provided due to 
        // existence of hasActionListeners() method. 
        firePropertyChange(ACTION_LISTENERS_CHANGED_PROPERTY, l, null);
    }
    
    /**
     * Sets the action command which will be provided in
     * <code>ActionEvent</code>s fired by this 
     * <code>Table</code>.
     * 
     * @param newValue the new action command
     */
    public void setActionCommand(String newValue) {
        setProperty(PROPERTY_ACTION_COMMAND, newValue);
    }
    
    /**
     * Sets whether the <code>TableColumnModel</code> will be created
     * automatically from the <code>TableModel</code>.
     *
     * @param newValue true if the <code>TableColumnModel</code> should be 
     *         created automatically from the <code>TableModel</code>
     * @see #isAutoCreateColumnsFromModel()
     */
    public void setAutoCreateColumnsFromModel(boolean newValue) {
        boolean oldValue = autoCreateColumnsFromModel;
        autoCreateColumnsFromModel = newValue;
        
        if (!oldValue && newValue) {
            createDefaultColumnsFromModel();
        }
        
        firePropertyChange(AUTO_CREATE_COLUMNS_FROM_MODEL_CHANGED_PROPERTY, 
                Boolean.valueOf(oldValue), Boolean.valueOf(newValue));
    }

    /**
     * Sets the <code>Border</code>.
     * 
     * @param newValue the new border
     */
    public void setBorder(Border newValue) {
        setProperty(PROPERTY_BORDER, newValue);
    }
    
    /** 
     * Sets the <code>TableColumnModel</code> describing this table's 
     * columns.
     *
     * @param newValue the new column model
     */
    public void setColumnModel(TableColumnModel newValue) {
        invalidate();
        
        if (newValue == null) {
            throw new IllegalArgumentException("The model may not be null.");
        }
        
        TableColumnModel oldValue = columnModel;
        if (oldValue != null) {
            oldValue.removeColumnModelListener(columnModelListener);
        }
        columnModel = newValue;
        newValue.addColumnModelListener(columnModelListener);
        firePropertyChange(COLUMN_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the default <code>TableCellRenderer</code> used to render
     * header cells.  The default header renderer will be used in the event 
     * that a <code>TableColumn</code> does not provide a specific header
     * renderer.
     * 
     * @param newValue the <code>TableCellRenderer</code>
     */
    public void setDefaultHeaderRenderer(TableCellRenderer newValue) {
        invalidate();
        TableCellRenderer oldValue = defaultHeaderRenderer;
        defaultHeaderRenderer = newValue;
        firePropertyChange(DEFAULT_HEADER_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }

    /**
     * Sets the default <code>TableCellRenderer</code> for the specified 
     * column class.  The default renderer will be used in the event that
     * a <code>TableColumn</code> does not provide a specific renderer.
     * 
     * @param columnClass the column <code>Class</code>
     * @param newValue the <code>TableCellRenderer</code>
     */
    public void setDefaultRenderer(Class columnClass, TableCellRenderer newValue) {
        invalidate();
        if (newValue == null) {
            defaultRendererMap.remove(columnClass);
        } else {
            defaultRendererMap.put(columnClass, newValue);
        }
        firePropertyChange(DEFAULT_RENDERER_CHANGED_PROPERTY, null, null);
    }
    
    /**
     * Sets the visibility state of the table header.
     * 
     * @param newValue true if the header should be displayed
     */
    public void setHeaderVisible(boolean newValue) {
        invalidate();
        boolean oldValue = headerVisible;
        headerVisible = newValue;
        firePropertyChange(HEADER_VISIBLE_CHANGED_PROPERTY, Boolean.valueOf(oldValue), Boolean.valueOf(newValue));
    }
    
    /**
     * Sets the default cell insets.
     * 
     * @param newValue the new default cell insets
     */
    public void setInsets(Insets newValue) {
        setProperty(PROPERTY_INSETS, newValue);
    }
    
    /**
     * Sets the <code>TableModel</code> being visualized.
     * 
     * @param newValue the new model (may not be null)
     */
    public void setModel(TableModel newValue) {
        invalidate();
        
        if (newValue == null) {
            throw new IllegalArgumentException("The model may not be null.");
        }
        
        TableModel oldValue = model;
        if (oldValue != null) {
            oldValue.removeTableModelListener(modelListener);
        }
        model = newValue;
        newValue.addTableModelListener(modelListener);
        
        if (isAutoCreateColumnsFromModel()) {
            createDefaultColumnsFromModel();
        }
        
        firePropertyChange(MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the rollover background color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setRolloverBackground(Color newValue) {
        setProperty(PROPERTY_ROLLOVER_BACKGROUND, newValue);
    }

    /**
     * Sets the rollover background image displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new background image
     */
    public void setRolloverBackgroundImage(FillImage newValue) {
        setProperty(PROPERTY_ROLLOVER_BACKGROUND_IMAGE, newValue);
    }

    /**
     * Sets whether rollover effects are enabled when the mouse cursor is 
     * within the bounds of a row. Rollover properties have no effect unless 
     * this property is set to true. The default value is false.
     * 
     * @param newValue true if rollover effects should be enabled
     */
    public void setRolloverEnabled(boolean newValue) {
        setProperty(PROPERTY_ROLLOVER_ENABLED, new Boolean(newValue));
    }

    /**
     * Sets the rollover font displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setRolloverFont(Font newValue) {
        setProperty(PROPERTY_ROLLOVER_FONT, newValue);
    }

    /**
     * Sets the rollover foreground color displayed when the mouse is within
     * the bounds of a row.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setRolloverForeground(Color newValue) {
        setProperty(PROPERTY_ROLLOVER_FOREGROUND, newValue);
    }

    /**
     * Selects only the specified row indices.
     * 
     * @param selectedIndices the indices to select
     */
    private void setSelectedIndices(int[] selectedIndices) {
        // Temporarily suppress the Tables selection event notifier.
        suppressChangeNotifications = true;
        ListSelectionModel selectionModel = getSelectionModel();
        selectionModel.clearSelection();
        for (int i = 0; i < selectedIndices.length; ++i) {
            selectionModel.setSelectedIndex(selectedIndices[i], true);
        }
        // End temporary suppression.
        suppressChangeNotifications = false;
        firePropertyChange(SELECTION_CHANGED_PROPERTY, null, selectedIndices);
    }

    /**
     * Sets the row selection background color.
     * 
     * @param newValue the new background color
     */
    public void setSelectionBackground(Color newValue) {
        setProperty(PROPERTY_SELECTION_BACKGROUND, newValue);
    }
    
    /**
     * Sets the row selection background image.
     * 
     * @param newValue the new background image
     */
    public void setSelectionBackgroundImage(FillImage newValue) {
        setProperty(PROPERTY_SELECTION_BACKGROUND_IMAGE, newValue);
    }
    
    /**
     * Sets whether selection is enabled.
     * 
     * @param newValue true to enable selection
     */
    public void setSelectionEnabled(boolean newValue) {
        setProperty(PROPERTY_SELECTION_ENABLED, Boolean.valueOf(newValue));
    }

    /**
     * Sets the row selection foreground color.
     * 
     * @param newValue the new foreground color
     */
    public void setSelectionForeground(Color newValue) {
        setProperty(PROPERTY_SELECTION_FOREGROUND, newValue);
    }
    
    /**
     * Sets the row selection font.
     * 
     * @param newValue the new font
     */
    public void setSelectionFont(Font newValue) {
        setProperty(PROPERTY_SELECTION_FONT, newValue);
    }
    
    /**
     * Sets the row selection model.
     * The selection model may not be null.
     * 
     * @param newValue the new selection model
     */
    public void setSelectionModel(ListSelectionModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Selection model may not be null.");
        }
        ListSelectionModel oldValue = selectionModel;
        if (oldValue != null) {
            oldValue.removeChangeListener(changeHandler);
        }
        newValue.addChangeListener(changeHandler);
        selectionModel = newValue;
        firePropertyChange(SELECTION_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the overall width of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @param newValue the new width
     */
    public void setWidth(Extent newValue) {
        setProperty(PROPERTY_WIDTH, newValue);
    }
    
    /**
     * @see nextapp.echo.app.Component#validate()
     */
    public void validate() {
        super.validate();
        while (!valid) {
            valid = true;
            doRender();
        }
    }
}

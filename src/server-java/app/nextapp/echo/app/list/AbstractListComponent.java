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

package nextapp.echo.app.list;

import java.util.EventListener;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.Insets;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import nextapp.echo.app.event.ListDataEvent;
import nextapp.echo.app.event.ListDataListener;

/**
 * An abstract base class for list components.
 */
public abstract class AbstractListComponent extends Component {

    public static final String INPUT_ACTION = "action";

    public static final String PROPERTY_ACTION_COMMAND = "actionCommand";
    
    public static final String ACTION_LISTENERS_CHANGED_PROPERTY = "actionListeners";
    public static final String LIST_DATA_CHANGED_PROPERTY = "listData";
    public static final String LIST_MODEL_CHANGED_PROPERTY = "listModel";
    public static final String LIST_CELL_RENDERER_CHANGED_PROPERTY = "listCellRenderer";
    public static final String SELECTION_MODEL_CHANGED_PROPERTY = "listSelectionModel";
    public static final String SELECTION_CHANGED_PROPERTY = "listSelectionChanged";

    public static final String PROPERTY_BORDER = "border";
    public static final String PROPERTY_DISABLED_BACKGROUND = "disabledBackground";
    public static final String PROPERTY_DISABLED_BORDER = "disabledBorder";
    public static final String PROPERTY_DISABLED_FONT = "disabledFont";
    public static final String PROPERTY_DISABLED_FOREGROUND = "disabledForeground";
    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_INSETS = "insets";
    public static final String PROPERTY_ROLLOVER_BACKGROUND = "rolloverBackground";
    public static final String PROPERTY_ROLLOVER_ENABLED = "rolloverEnabled";
    public static final String PROPERTY_ROLLOVER_FONT = "rolloverFont";
    public static final String PROPERTY_ROLLOVER_FOREGROUND = "rolloverForeground";
    public static final String PROPERTY_TOOL_TIP_TEXT = "toolTipText";
    public static final String PROPERTY_WIDTH = "width";

    public static final DefaultListCellRenderer DEFAULT_LIST_CELL_RENDERER = new DefaultListCellRenderer();

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
            firePropertyChange(SELECTION_CHANGED_PROPERTY, null, null);
        }
    };

    /**
     * Local handler of <code>ListDataEvent</code>s.
     */
    private ListDataListener listDataHandler = new ListDataListener() { 
    
        /** Serial Version UID. */
        private static final long serialVersionUID = 20070101L;
    
        /**
         * @see nextapp.echo.app.event.ListDataListener#contentsChanged(nextapp.echo.app.event.ListDataEvent)
         */
        public void contentsChanged(ListDataEvent e) {
            firePropertyChange(LIST_DATA_CHANGED_PROPERTY, null, null);
        }

        /**
         * @see nextapp.echo.app.event.ListDataListener#intervalAdded(nextapp.echo.app.event.ListDataEvent)
         */
        public void intervalAdded(ListDataEvent e) {
            firePropertyChange(LIST_DATA_CHANGED_PROPERTY, null, null);
        }

        /**
         * @see nextapp.echo.app.event.ListDataListener#intervalRemoved(nextapp.echo.app.event.ListDataEvent)
         */
        public void intervalRemoved(ListDataEvent e) {
            firePropertyChange(LIST_DATA_CHANGED_PROPERTY, null, null);
        }
    };
    
    private ListCellRenderer listCellRenderer = DEFAULT_LIST_CELL_RENDERER;
    private ListModel model;
    private ListSelectionModel selectionModel;
    
    /**
     * Creates a new <code>AbstractListComponent</code> with default models.
     */
    public AbstractListComponent() {
        this(null, null);
    }
    
    /**
     * Creates a new <code>AbstractListComponent</code> with the specified 
     * models.
     * 
     * @param model the list data model
     * @param selectionModel the selection model
     */
    public AbstractListComponent(ListModel model, ListSelectionModel selectionModel) {
        super();
        if (model == null) {
            model = new DefaultListModel();
        }
        if (selectionModel == null) {
            selectionModel = new DefaultListSelectionModel();
        }
        setModel(model);
        setSelectionModel(selectionModel);
    }
    
    /**
     * Adds an <code>ActionListener</code> to the list component.
     * The <code>ActionListener</code> will be invoked when the user
     * selects an item.
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
     * Returns the action command which will be provided in 
     * <code>ActionEvent</code>s fired by this 
     * <code>AbstractListComponent</code>.
     * 
     * @return the action command
     */
    public String getActionCommand() {
        return (String) get(PROPERTY_ACTION_COMMAND);
    }
    
    /**
     * Returns the <code>Border</code> surrounding the list component.
     * 
     * @return the border
     */
    public Border getBorder() {
        return (Border) get(PROPERTY_BORDER);
    }
    
    /**
     * Returns the <code>ListCellRenderer</code> used to render items.
     * 
     * @return the renderer
     */
    public ListCellRenderer getCellRenderer() {
        return listCellRenderer;
    }
    
    /**
     * Returns the background color displayed when the component is 
     * disabled.
     * 
     * @return the color
     */
    public Color getDisabledBackground() {
        return (Color) get(PROPERTY_DISABLED_BACKGROUND);
    }

    /**
     * Returns the border displayed when the component is 
     * disabled.
     * 
     * @return the border
     */
    public Border getDisabledBorder() {
        return (Border) get(PROPERTY_DISABLED_BORDER);
    }

    /**
     * Returns the font displayed when the component is 
     * disabled.
     * 
     * @return the font
     */
    public Font getDisabledFont() {
        return (Font) get(PROPERTY_DISABLED_FONT);
    }

    /**
     * Returns the foreground color displayed when the component is 
     * disabled.
     * 
     * @return the color
     */
    public Color getDisabledForeground() {
        return (Color) get(PROPERTY_DISABLED_FOREGROUND);
    }

    /**
     * Returns the height.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) get(PROPERTY_HEIGHT);
    }
    
    /**
     * Returns the inset margin around between the list components border and content.
     * 
     * @return the inset margin
     */
    public Insets getInsets() {
        return (Insets) get(PROPERTY_INSETS);
    }
    
    /**
     * Returns the model.
     * 
     * @return the model
     */
    public ListModel getModel() {
        return model;
    }
    
    /**
     * Returns the rollover background.
     * 
     * @return the rollover background
     */
    public Color getRolloverBackground() {
        return (Color) get(PROPERTY_ROLLOVER_BACKGROUND);
    }
    
    /**
     * Returns the rollover font.
     * 
     * @return the rollover font
     */
    public Font getRolloverFont() {
        return (Font) get(PROPERTY_ROLLOVER_FONT);
    }
    
    /**
     * Returns the rollover foreground.
     * 
     * @return the rollover foreground
     */
    public Color getRolloverForeground() {
        return (Color) get(PROPERTY_ROLLOVER_FOREGROUND);
    }
    
    /**
     * Returns the selection model.
     * 
     * @return the selection model
     */
    public ListSelectionModel getSelectionModel() {
        return selectionModel;
    }
    
    /**
     * Returns the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @return the tool tip text
     */
    public String getToolTipText() {
        return (String) get(PROPERTY_TOOL_TIP_TEXT);
    }
    
    /**
     * Returns the width.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @return the width
     */
    public Extent getWidth() {
        return (Extent) get(PROPERTY_WIDTH);
    }
    
    /**
     * Determines the any <code>ActionListener</code>s are registered.
     * 
     * @return true if any action listeners are registered
     */
    public boolean hasActionListeners() {
        return hasEventListenerList() && getEventListenerList().getListenerCount(ActionListener.class) != 0;
    }
    
    /**
     * Determines if rollover effects are enabled.
     * 
     * @return true if rollover effects are enabled
     */
    public boolean isRolloverEnabled() {
        Boolean value = (Boolean) get(PROPERTY_ROLLOVER_ENABLED);
        return value == null ? false : value.booleanValue();
    }

    /**
     * This component does not support children.
     *
     * @see nextapp.echo.app.Component#isValidChild(nextapp.echo.app.Component)
     */
    public boolean isValidChild(Component child) {
        return false;
    }

    /**
     * @see nextapp.echo.app.Component#processInput(java.lang.String, java.lang.Object)
     */
    public void processInput(String inputName, Object inputValue) {
        super.processInput(inputName, inputValue);
        
        if (SELECTION_CHANGED_PROPERTY.equals(inputName)) {
            int[] selectedIndices = (int[]) inputValue;
            ListSelectionModel selectionModel = getSelectionModel();
            selectionModel.clearSelection();
            for (int i = 0; i < selectedIndices.length; ++i) {
                selectionModel.setSelectedIndex(selectedIndices[i], true);
            }
        } else if (INPUT_ACTION.equals(inputName)) {
            fireActionEvent();
        }
    }
    
    /**
     * Removes an <code>ActionListener</code> from the list component.
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
     * <code>AbstractListComponent</code>.
     * 
     * @param newValue the new action command
     */
    public void setActionCommand(String newValue) {
        set(PROPERTY_ACTION_COMMAND, newValue);
    }
    
    /**
     * Sets the <code>Border</code> surrounding the list component.
     * 
     * @param newValue the new <code>Border</code>
     */
    public void setBorder(Border newValue) {
        set(PROPERTY_BORDER, newValue);
    }
    
    /**
     * Sets the renderer for items.
     * The renderer may not be null (use <code>DEFAULT_LIST_CELL_RENDERER</code>
     * for default behavior).
     * 
     * @param newValue the new renderer
     */
    public void setCellRenderer(ListCellRenderer newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Cell Renderer may not be null.");
        }
        ListCellRenderer oldValue = listCellRenderer;
        listCellRenderer = newValue;
        firePropertyChange(LIST_CELL_RENDERER_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the background color displayed when the component is disabled.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setDisabledBackground(Color newValue) {
        set(PROPERTY_DISABLED_BACKGROUND, newValue);
    }

    /**
     * Sets the border displayed when the component is disabled.
     * 
     * @param newValue the new border
     */
    public void setDisabledBorder(Border newValue) {
        set(PROPERTY_DISABLED_BORDER, newValue);
    }

    /**
     * Sets the font displayed when the component is disabled.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setDisabledFont(Font newValue) {
        set(PROPERTY_DISABLED_FONT, newValue);
    }

    /**
     * Sets the foreground color displayed when the component is disabled.
     * 
     * @param newValue the new <code>Color</code>
     */
    public void setDisabledForeground(Color newValue) {
        set(PROPERTY_DISABLED_FOREGROUND, newValue);
    }

    /**
     * Sets the height.
     * This property only supports <code>Extent</code>s with
     * fixed (i.e., not percent) units.
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        set(PROPERTY_HEIGHT, newValue);
    }
    
    /**
     * Sets the inset margin around between the list components border and content.
     * 
     * @param newValue the new inset margin
     */
    public void setInsets(Insets newValue) {
        set(PROPERTY_INSETS, newValue);
    }
    
    /**
     * Sets the model.
     * The model may not be null.
     *
     * @param newValue the new model
     */
    public void setModel(ListModel newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Model may not be null.");
        }
        ListModel oldValue = model;
        if (oldValue != null) {
            oldValue.removeListDataListener(listDataHandler);
        }
        newValue.addListDataListener(listDataHandler);
        model = newValue;
        firePropertyChange(LIST_MODEL_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the rollover background.
     * 
     * @param newValue the new rollover background
     */
    public void setRolloverBackground(Color newValue) {
        set(PROPERTY_ROLLOVER_BACKGROUND, newValue);
    }
    
    /**
     * Sets whether rollover effects are enabled.
     * 
     * @param newValue the new rollover enabled state
     */
    public void setRolloverEnabled(boolean newValue) {
        set(PROPERTY_ROLLOVER_ENABLED, new Boolean(newValue));
    }
    
    /**
     * Sets the rollover font.
     * 
     * @param newValue the new rollover font
     */
    public void setRolloverFont(Font newValue) {
        set(PROPERTY_ROLLOVER_FONT, newValue);
    }
    
    /**
     * Sets the rollover foreground.
     * 
     * @param newValue the new rollover foreground
     */
    public void setRolloverForeground(Color newValue) {
        set(PROPERTY_ROLLOVER_FOREGROUND, newValue);
    }
    
    /**
     * Sets the selection model.
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
     * Sets the tool tip text (displayed when the mouse cursor is hovered 
     * over the component).
     * 
     * @param newValue the new tool tip text
     */
    public void setToolTipText(String newValue) {
        set(PROPERTY_TOOL_TIP_TEXT, newValue);
    }

    /**
     * Sets the width.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     *
     * @param newValue the new width 
     */
    public void setWidth(Extent newValue) {
        set(PROPERTY_WIDTH, newValue);
    }
}

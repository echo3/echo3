/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

package nextapp.echo.webcontainer.sync.component;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.Table;
import nextapp.echo.app.list.ListSelectionModel;
import nextapp.echo.app.table.TableModel;
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.*;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.util.ArrayIterator;

/**
 * Synchronization peer for <code>Table</code>s.
 * 
 * @author n.beekman
 */
public class TablePeer extends AbstractComponentSynchronizePeer {

    /**
     * Service for <code>ListSelectionModel</code>.
     */
    public static final Service LIST_SELECTION_MODEL_SERVICE = JavaScriptService.forResource("Echo.ListSelectionModel", 
            "/nextapp/echo/webcontainer/resource/js/Application.ListSelectionModel.js");
    private static final Service TABLE_SERVICE = JavaScriptService.forResource("Echo.Table", 
            "/nextapp/echo/webcontainer/resource/js/Render.Table.js");
    
    private static final String[] EVENT_TYPES_ACTION = new String[] { Table.INPUT_ACTION };
    
    private static final String PROPERTY_COLUMN_COUNT = "columnCount";
    private static final String PROPERTY_HEADER_VISIBLE = "headerVisible";
    private static final String PROPERTY_ROW_COUNT = "rowCount";
    private static final String PROPERTY_SELECTION = "selection";
    private static final String PROPERTY_SELECTION_MODE = "selectionMode";
    
    static {
        WebContainerServlet.getServiceRegistry().add(LIST_SELECTION_MODEL_SERVICE);
        WebContainerServlet.getServiceRegistry().add(TABLE_SERVICE);
    }
    
    public TablePeer() {
        super();
        addOutputProperty(PROPERTY_COLUMN_COUNT);
        addOutputProperty(PROPERTY_HEADER_VISIBLE);
        addOutputProperty(PROPERTY_ROW_COUNT);
        addOutputProperty(PROPERTY_SELECTION);
        addOutputProperty(PROPERTY_SELECTION_MODE);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return Table.class;
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(LIST_SELECTION_MODEL_SERVICE.getId());
        serverMessage.addLibrary(TABLE_SERVICE.getId());
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getImmediateEventTypes(Context, nextapp.echo.app.Component)
     */
    public Iterator getImmediateEventTypes(Context context, Component component) {
        Table table = (Table)component;
        if (table.hasActionListeners()) {
            return new ArrayIterator(EVENT_TYPES_ACTION);
        }
        return super.getImmediateEventTypes(context, component);
    }

    /**
     * @see ComponentSynchronizePeer#getPropertyClass(String)
     */
    public Class getPropertyClass(String propertyName) {
        if (PROPERTY_SELECTION.equals(propertyName)) {
            return String.class;
        }
        return super.getPropertyClass(propertyName);
    }
    
    /**
     * @see ComponentSynchronizePeer#getOutputProperty(Context, Component, String)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName) {
        Table table = (Table)component;
        if (PROPERTY_COLUMN_COUNT.equals(propertyName)) {
            return new Integer(table.getModel().getColumnCount());
        } else if (PROPERTY_HEADER_VISIBLE.equals(propertyName)) {
            return Boolean.valueOf(table.isHeaderVisible());
        } else if (PROPERTY_ROW_COUNT.equals(propertyName)) {
            return new Integer(table.getModel().getRowCount());
        } else if (PROPERTY_SELECTION.equals(propertyName)) {
            return getSelectionString(table.getSelectionModel(), table.getModel());
        } else if (PROPERTY_SELECTION_MODE.equals(propertyName)) {
            return new Integer(table.getSelectionModel().getSelectionMode());
        }
        return super.getOutputProperty(context, component, propertyName);
    }
    
    private static String getSelectionString(ListSelectionModel selectionModel, TableModel model) {
        String selection = "";
        int minimumIndex = selectionModel.getMinSelectedIndex();
        if (minimumIndex != -1) {
            int maximumIndex = selectionModel.getMaxSelectedIndex();
            if (maximumIndex > model.getRowCount() - 1) {
                maximumIndex = model.getRowCount() - 1;
            }
            for (int i = minimumIndex; i <= maximumIndex; ++i) {
                if (selectionModel.isSelectedIndex(i)) {
                    if (selection.length() > 0) {
                        selection += ",";
                    }
                    selection += Integer.toString(i);
                }
            }
        }
        return selection;
    }
    
    /**
     * @see ComponentSynchronizePeer#storeInputProperty(Context, Component, String, Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, Object newValue) {
        super.storeInputProperty(context, component, propertyName, newValue);
        if (PROPERTY_SELECTION.equals(propertyName)) {
            String[] tokens = ((String)newValue).split(",");
            int[] selectedIndices = new int[tokens.length];
            for (int i = 0; i < tokens.length; ++i) {
                selectedIndices[i] = Integer.parseInt(tokens[i]);
            }
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, Table.SELECTION_CHANGED_PROPERTY, selectedIndices);
        }
    }
}
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
import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.util.ArrayIterator;
import nextapp.echo.webcontainer.util.MultiIterator;

//FIXME have a renderState-like object register itself for
// tablecolumnmodel events and re-render sizes as required.

/**
 * Synchronization peer for <code>Table</code>s.
 * 
 * @author n.beekman
 */
public class TablePeer extends AbstractComponentSynchronizePeer {

    private static final Service TABLE_SERVICE = JavaScriptService.forResource("Echo.RemoteTable", 
            "/nextapp/echo/webcontainer/resource/js/Render.RemoteTable.js");
    
    private static final String PROPERTY_COLUMN_COUNT = "columnCount";
    private static final String PROPERTY_COLUMN_WIDTH = "columnWidth";
    private static final String PROPERTY_HEADER_VISIBLE = "headerVisible";
    private static final String PROPERTY_ROW_COUNT = "rowCount";
    private static final String PROPERTY_SELECTION = "selection";
    private static final String PROPERTY_SELECTION_MODE = "selectionMode";
    
    private static final String[] MODEL_CHANGED_UPDATE_PROPERTIES = new String[] { PROPERTY_ROW_COUNT, PROPERTY_COLUMN_COUNT };
    
    static {
        WebContainerServlet.getServiceRegistry().add(TABLE_SERVICE);
    }
    
    public TablePeer() {
        super();
        
        addOutputProperty(PROPERTY_COLUMN_COUNT);
        addOutputProperty(PROPERTY_COLUMN_WIDTH, true);
        addOutputProperty(PROPERTY_HEADER_VISIBLE);
        addOutputProperty(PROPERTY_ROW_COUNT);
        addOutputProperty(PROPERTY_SELECTION);
        addOutputProperty(PROPERTY_SELECTION_MODE);
        
        addEvent(new AbstractComponentSynchronizePeer.EventPeer(Table.INPUT_ACTION, Table.ACTION_LISTENERS_CHANGED_PROPERTY) {
            public boolean hasListeners(Context context, Component component) {
                return ((Table) component).hasActionListeners();
            }
        });
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
     */
    public String getClientComponentType() {
        return "RemoteTable";
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getComponentClass()
     */
    public Class getComponentClass() {
        return Table.class;
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getInputPropertyClass(String)
     */
    public Class getInputPropertyClass(String propertyName) {
        if (PROPERTY_SELECTION.equals(propertyName)) {
            return String.class;
        }
        return super.getInputPropertyClass(propertyName);
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        Table table = (Table)component;
        if (PROPERTY_COLUMN_COUNT.equals(propertyName)) {
            return new Integer(table.getModel().getColumnCount());
        } else if (PROPERTY_COLUMN_WIDTH.equals(propertyName)) {
            return table.getColumnModel().getColumn(propertyIndex).getWidth();
        } else if (PROPERTY_HEADER_VISIBLE.equals(propertyName)) {
            return Boolean.valueOf(table.isHeaderVisible());
        } else if (PROPERTY_ROW_COUNT.equals(propertyName)) {
            return new Integer(table.getModel().getRowCount());
        } else if (PROPERTY_SELECTION.equals(propertyName)) {
            return ListSelectionUtil.toString(table.getSelectionModel(), table.getModel().getRowCount());
        } else if (PROPERTY_SELECTION_MODE.equals(propertyName)) {
            return new Integer(table.getSelectionModel().getSelectionMode());
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputPropertyIndices(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String)
     */
    public Iterator getOutputPropertyIndices(Context context, Component component, String propertyName) {
        if (PROPERTY_COLUMN_WIDTH.equals(propertyName)) {
            final Iterator columnIterator = ((Table) component).getColumnModel().getColumns();
            return new Iterator() {
                private int i = 0;
            
                public boolean hasNext() {
                    return columnIterator.hasNext();
                }
            
                public Object next() {
                    columnIterator.next();
                    return new Integer(i++);
                }
            
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        } else {
            return super.getOutputPropertyIndices(context, component, propertyName);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getUpdatedOutputPropertyNames(
     *      nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component,
     *      nextapp.echo.app.update.ServerComponentUpdate)
     */
    public Iterator getUpdatedOutputPropertyNames(Context context, Component component, 
            ServerComponentUpdate update) {
        Iterator normalPropertyIterator = super.getUpdatedOutputPropertyNames(context, component, update);
        
        if (update.hasUpdatedProperty(Table.MODEL_CHANGED_PROPERTY)) {
            return new MultiIterator(
                    new Iterator[]{ normalPropertyIterator, new ArrayIterator(MODEL_CHANGED_UPDATE_PROPERTIES) });
        } else {
            return normalPropertyIterator;
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        super.init(context);
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(AbstractListComponentPeer.LIST_SELECTION_MODEL_SERVICE.getId());
        serverMessage.addLibrary(TABLE_SERVICE.getId());
    }
    
    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#storeInputProperty(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String, int, java.lang.Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int index, Object newValue) {
        if (PROPERTY_SELECTION.equals(propertyName)) {
            int[] selection = ListSelectionUtil.toIntArray((String) newValue);
            ClientUpdateManager clientUpdateManager = (ClientUpdateManager) context.get(ClientUpdateManager.class);
            clientUpdateManager.setComponentProperty(component, Table.SELECTION_CHANGED_PROPERTY, selection);
        }
    }
}
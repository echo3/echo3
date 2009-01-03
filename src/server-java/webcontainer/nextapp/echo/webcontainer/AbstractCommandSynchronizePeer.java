/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
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

package nextapp.echo.webcontainer;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import nextapp.echo.app.Command;
import nextapp.echo.app.util.Context;

/**
 * Default abstract implementation of <code>CommandSynchronizePeer</code>.
 */
public abstract class AbstractCommandSynchronizePeer 
implements CommandSynchronizePeer {

    /**
     * A peer for rendering a non-indexed property of a <code>Command</code>.
     */
    public interface PropertyPeer {

        /**
         * Returns the property value.
         * 
         * @param context the relevant <code>Context</code>
         * @param command the <code>Command</code> being rendered
         */
        public Object getProperty(Context context, Command command);
    }
    
    /**
     * A peer for rendering an indexed property of a <code>Command</code>.
     */
    public interface IndexedPropertyPeer {
        
        /**
         * Returns an iterator of <code>Integer</code> objects indicating
         * which indices of the property are currently set.
         * 
         * @param context the relevant <code>Context</code>
         * @param command the <code>Command</code> being rendered
         * @return an iterator indicating indices of properties that are set.
         */
        public Iterator getPropertyIndices(Context context, Command command);
        
        /**
         * Returns the property value of a specific index.
         * 
         * @param context the relevant <code>Context</code>
         * @param command the <code>Command</code> being rendered
         * @param propertyIndex the property index
         * @return the property value.
         */
        public Object getProperty(Context context, Command command, int propertyIndex);
    }
    
    /**
     * Mapping between property names and <code>PropertyPeer</code>/<code>IndexedPropertyPeer</code>s.
     * Keys may be assigned null values to describe properties that will be rendered specially by the
     * extending class.
     */
    private Map propertyNameToPeerMap = null;
    
    /**
     * Set of property names which are indexed.
     */
    private Set indexedPropertyNameSet = null;
    
    /**
     * Adds a non-indexed property that will be rendered using a <code>PropertyPeer</code>.
     * 
     * @param propertyName the name of the property
     * @param propertyPeer the <code>PropertyPeer</code> which will render it
     */
    public void addProperty(String propertyName, PropertyPeer propertyPeer) {
        if (propertyNameToPeerMap == null) {
            propertyNameToPeerMap = new HashMap();
        }
        propertyNameToPeerMap.put(propertyName, propertyPeer);
    }
    
    /**
     * Adds an indexed property that will be rendered using an <code>IndexedPropertyPeer</code>.
     * 
     * @param propertyName the name of the property
     * @param propertyPeer the <code>IndexedPropertyPeer</code> which will render it
     */
    public void addProperty(String propertyName, IndexedPropertyPeer propertyPeer) {
        if (propertyNameToPeerMap == null) {
            propertyNameToPeerMap = new HashMap();
        }
        if (indexedPropertyNameSet == null) {
            indexedPropertyNameSet = new HashSet();
        }
        indexedPropertyNameSet.add(propertyName);
    }
    
    /**
     * Adds a property.  
     * Property names added via this method will be returned by the 
     * <code>getPropertyName()</code> method of this class.
     * If the indexed flag is set, the <code>isPropertyIndexed</code>
     * method will also return true for this property name
     * 
     * @param propertyName the property name to add
     * @param indexed a flag indicating whether the property is indexed
     */
    public void addProperty(String propertyName, boolean indexed) {
        if (propertyNameToPeerMap == null) {
            propertyNameToPeerMap = new HashMap();
        }
        propertyNameToPeerMap.put(propertyName, null);
        if (indexed) {
            if (indexedPropertyNameSet == null) {
                indexedPropertyNameSet = new HashSet();
            }
            indexedPropertyNameSet.add(propertyName);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#getClientCommandType()
     */
    public String getClientCommandType() {
        return getCommandClass().getName();
    }

    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#getProperty(nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Command, java.lang.String, int)
     */
    public Object getProperty(Context context, Command command, String propertyName, int propertyIndex) {
        if (propertyNameToPeerMap == null) {
            return null;
        }
        Object peer = propertyNameToPeerMap.get(propertyName);
        if (peer == null) {
            return null;
        }
        if (peer instanceof PropertyPeer) {
            return ((PropertyPeer) peer).getProperty(context, command);
        } else if (peer instanceof IndexedPropertyPeer) {
            return ((IndexedPropertyPeer) peer).getProperty(context, command, propertyIndex);
        } else {
            return null;
        }
    }

    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#getPropertyIndices(nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Command, java.lang.String)
     */
    public Iterator getPropertyIndices(Context context, Command command, String propertyName) {
        if (propertyNameToPeerMap == null) {
            return null;
        }
        Object peer = propertyNameToPeerMap.get(propertyName);
        if (peer == null) {
            return null;
        }
        if (peer instanceof IndexedPropertyPeer) {
            return ((IndexedPropertyPeer) peer).getPropertyIndices(context, command);
        } else {
            return null;
        }
    }

    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#getPropertyNames(nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Command)
     */
    public Iterator getPropertyNames(Context context, Command command) {
        if (propertyNameToPeerMap == null) {
            return Collections.EMPTY_SET.iterator();
        } else {
            return propertyNameToPeerMap.keySet().iterator();
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        // Do nothing.
    }

    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#isPropertyIndexed(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Command, java.lang.String)
     */
    public boolean isPropertyIndexed(Context context, Command command, String propertyName) {
        return indexedPropertyNameSet != null && indexedPropertyNameSet.contains(propertyName);
    }
}

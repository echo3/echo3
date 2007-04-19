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

package nextapp.echo.webcontainer;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.util.Context;

/**
 * Peer for synchronizing the state of server-side <code>Component</code>
 * objects with their equivalent client-side instances.
 * 
 * Note about <code>Context</code>s.
 * Any context passed to any method in a <code>ComponentSynchronizePeer</code>
 * must contain the following items:
 * 
 * <ul>
 *  <li><code>SerialContext</code></li>
 *  <li><code>Connection</code></li>
 *  <li><code>PropertyPeerFactory</code></li>
 *  <li><code>UserInstance</code></li>
 * </ul>
 */
public interface ComponentSynchronizePeer {
    
    /**
     * Returns the remote client component name.
     */
    public String getClientComponentType();
    
    /**
     * Returns the <code>Class</code> of <code>Component</code>
     * supported by this peer.
     * 
     * @return the <code>Class</code>
     */
    public Class getComponentClass();
    
    /**
     * Returns the <code>Class</code> of the specified input/output
     * property of the component.
     * 
     * @param propertyName the name of the property
     * @return the property <code>Class</code>
     */
    public Class getPropertyClass(String propertyName);

    /**
     * Determines the types of events which, when fired on the client,
     * result in immediate server notification. 
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the <code>Component</code> being rendered
     * @return an <code>Iterator</code> over a collection of <code>String</code>s
     *         of the remote client event type names
     */
    public Iterator getImmediateEventTypes(Context context, Component component);
    
    /**
     * Returns the value of a specific output property.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the <code>Component</code> being rendered
     * @param propertyName the name of the property being rendered
     * @return the property value
     */
    public Object getOutputProperty(Context context, Component component, String propertyName);
    
    /**
     * Returns an <code>Iterator</code> over the collection of names of all
     * output properties that should be rendered to the remote client. Only the
     * names of properties with non-default values should be returned.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @return an <code>Iterator</code> of property names
     */
    public Iterator getOutputPropertyNames(Context context, Component component);
    
    /**
     * Determines if the component type supports sending the specified property to the client.
     * This method is used to determine which changed properties will be sent to the client.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param propertyName the name of the property
     * @return true if the property is provided
     */
    public boolean hasOutputProperty(Context context, String propertyName);
    
    /**
     * Initializes the peer.
     * This method will be invoked prior to rendering a <b>specific</b>
     * <code>Component</code> for the first time.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     */
    public void init(Context context);
    
    /**
     * Processes a property update from the client.
     * Implementations must take care to implement appropriate security,
     * ensuring that the client may only modify specific properties of
     * a component that are user-mutable.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li><code>ClientMessage</code></li>
     *         <li><code>ClientUpdateManager</code></li>
     *        </ul>
     * @param component the updated <code>Component</code>
     * @param propertyName the name of the property
     * @param newValue the new value of the property
     */
    public void storeInputProperty(Context context, Component component, String propertyName, Object newValue);
}

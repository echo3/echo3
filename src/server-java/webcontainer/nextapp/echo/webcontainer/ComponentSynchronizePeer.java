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

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.update.ServerComponentUpdate;
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
     * Returns the remote client component type name.
     * 
     * @param mode a boolean flag indicating whether a component name (true) or style name (false) is being rendered
     * @return the client component type name
     */
    public String getClientComponentType(boolean mode);
    
    /**
     * Returns the <code>Class</code> of <code>Component</code>
     * supported by this peer.
     * 
     * @return the <code>Class</code>
     */
    public Class getComponentClass();
    
    /**
     * Returns the <code>Class</code> of the event data that will
     * be provided by the specified event type.
     * 
     * @param eventType the type of the event
     * @return the event data <code>Class</code>
     */
    public Class getEventDataClass(String eventType);

    /**
     * Determines the (client-side) types of events which, when fired on the client,
     * can result in immediate server notification.
     * This method should return ALL the types of ANY such events.
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
    public Iterator getEventTypes(Context context, Component component);
    
    /**
     * Returns the <code>Class</code> of the specified input
     * property of the component.
     * 
     * @param propertyName the name of the property
     * @return the property <code>Class</code>
     */
    public Class getInputPropertyClass(String propertyName);
    
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
     * @param propertyIndex the property index (only relevant for indexed properties, -1 will
     *        be provided for non-indexed properties)
     * @return the property value
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex);
    
    /**
     * Determines which indices of a particular property are set.
     * This method will only be invoked on properties where
     * <code>isOutputPropertyIndexed()</code> has returned true.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param propertyName the property name
     * @return an <code>Iterator</code> that returns the set indices in
     *         incrementing order as <code>Integer</code>s
     */
    public Iterator getOutputPropertyIndices(Context context, Component component, String propertyName);
    
    /**
     * Returns the name of the method that should be invoked to set the property
     * on the remote client.  If null is returned, the default "setProperty()" will
     * be invoked to store the property in the remote component's style.  This
     * default behavior should be used in almost cases.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param propertyName the property name
     * @return the property name
     */
    public String getOutputPropertyMethodName(Context context, Component component, String propertyName);
    
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
     * Returns an <code>Iterator</code> over the collection of names of all
     * output properties that should be rendered to the client to complete
     * the specified <code>update</code>.  Only the names of properties taht
     * have been updated by the <code>update</code> should be returned (including
     * those whose values have <strong>changed to null</strong>.  Client-specific
     * may be included as necessary.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param update the <code>ServerComponentUpdate</code> being rendered
     * @return an <code>Iterator</code> of property names to update on the client
     */
    public Iterator getUpdatedOutputPropertyNames(Context context, Component component, 
            ServerComponentUpdate update);
    
    /**
     * Determines if the specified component has any listeners registered of the 
     * specified event type.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param clientEventType the client-side event type
     * @return true if the server should be notified when the specified event type is
     *         fired on the client
     */
    public boolean hasListeners(Context context, Component component, String clientEventType);

    /**
     * Determines if any server-side listeners for a specific client-side event type have been
     * added or removed in the specified <code>ServerComponentUpdate</code>. 
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param update the <code>ServerComponentUpdate</code> to process
     * @param clientEventType the client-side event
     * @return true if any listeners of the specified event type have been added or removed
     *         on the server, thus potentially changing whether the client should or should
     *         not immediately contact the server when the specified event is fired
     */
    public boolean hasUpdatedListeners(Context context, Component component, ServerComponentUpdate update, 
            String clientEventType);

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
     * @param component the component being rendered
     */
    public void init(Context context, Component component);
    
    /**
     * Determines if the specified output property is indexed.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param propertyName the property name
     * @return true if the property is indexed
     */
    public boolean isOutputPropertyIndexed(Context context, Component component, String propertyName);
    
    /**
     * Determines if the specified property should be rendered-by-reference.
     * Properties that are rendered-by-reference will be specified in
     * the "init" section of the outgoing server message and referenced by an identifier each time
     * they are reused by components being rendered in that server message.  This results in 
     * a bandwidth savings in cases where it is likely that the same property will be reused by
     * multiple components (and assuming the rendered property value is reasonably large).
     * The property value must implement both <code>equals()</code> and <code>hashCode()</code> or
     * the same reference must be used for reference-based rendering to be effective.
     * Rendering-by-reference is often best used for rendering model properties, e.g., a
     * <code>ListModel</code> that might be used by several listboxes on the same screen.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param component the component
     * @param propertyName the property name
     * @return true if the property is rendered-by-reference
     */
    public boolean isOutputPropertyReferenced(Context context, Component component, String propertyName);
    
    /**
     * Processes an event received from the client.
     * Implementations must take care to implement appropriate security,
     * ensuring that the client may only fire specific appropriate events.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li><code>ClientMessage</code></li>
     *         <li><code>ClientUpdateManager</code></li>
     *        </ul>
     * @param component the updated <code>Component</code>
     * @param eventType the type of the event
     * @param eventData arbitrary component/event-specific event-related data
     */
    public void processEvent(Context context, Component component, String eventType, Object eventData);
    
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
     * @param propertyIndex the index of the property 
     *        (or -1 in the typical case of a non-indexed property)
     * @param newValue the new value of the property
     */
    public void storeInputProperty(Context context, Component component, String propertyName, 
            int propertyIndex, Object newValue);
}

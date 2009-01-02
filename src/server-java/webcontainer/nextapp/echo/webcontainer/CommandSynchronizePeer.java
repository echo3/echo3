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

import nextapp.echo.app.Command;
import nextapp.echo.app.util.Context;

/**
 * A stateless peer object used to render the given type of 
 * <code>nextapp.echo.app.Command</code> to the client.
 * <p>
 * A <strong>single</strong> instance of a given 
 * <code>CommandSynchronizePeer</code> will be created to synchronize the state 
 * of <strong>ALL</strong> instances of a particular class of 
 * <code>Command</code>.  Thus, it is not possible to
 * store information about a command's state in this object.
 */
public interface CommandSynchronizePeer {
    
    /**
     * Returns the remote client component name.
     */
    public String getClientCommandType();

    /**
     * Returns the <code>Class</code> of <code>Command</code>
     * supported by this peer.
     * 
     * @return the <code>Class</code>
     */
    public Class getCommandClass();
    
    /**
     * Returns the value of a specific property.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param command the <code>Command</code> being rendered
     * @param propertyName the name of the property being rendered
     * @param propertyIndex the property index (only relevant for indexed properties, -1 will
     *        be provided for non-indexed properties)
     * @return the property value
     */
    public Object getProperty(Context context, Command command, String propertyName, int propertyIndex);
    
    /**
     * Determines which indices of a particular property are set.
     * This method will only be invoked on properties where
     * <code>isPropertyIndexed()</code> has returned true.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param command the command
     * @param propertyName the property name
     * @return an <code>Iterator</code> that returns the set indices in
     *         incrementing order as <code>Integer</code>s
     */
    public Iterator getPropertyIndices(Context context, Command command, String propertyName);
    
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
     * @param command the command
     * @return an <code>Iterator</code> of property names
     */
    public Iterator getPropertyNames(Context context, Command command);
    
    /**
     * Initializes the peer.
     * This method will be invoked prior to rendering a <b>specific</b>
     * <code>Command</code> for the first time.
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
     * Determines if the specified output property is indexed.
     * 
     * @param context the relevant <code>Context</code>, provides 
     *        standard contextual information described in class description, in
     *        addition to the following:
     *        <ul>
     *         <li>ServerMessage</li>
     *        </ul>
     * @param command the command
     * @param propertyName the property name
     * @return true if the property is indexed
     */
    public boolean isPropertyIndexed(Context context, Command command, String propertyName);
}

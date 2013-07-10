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

import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.Component;
import nextapp.echo.app.util.PeerFactory;


/**
 * Factory for obtaining <code>XXXSynchronizePeer</code> implementations.
 */
public class SynchronizePeerFactory {

    /** Resource location of synchronization peer. */
    private static final String RESOURCE_NAME = "META-INF/nextapp/echo/SynchronizePeerBindings.properties";
    
    /** Peer factory for retrieving synchronization peers. */
    private static final PeerFactory peerFactory 
            = new PeerFactory(RESOURCE_NAME, Thread.currentThread().getContextClassLoader());

    /** Peer factory for retrieving synchronization peers. */
    private static final Map<Class, ComponentSynchronizePeer> peerRegistry = new HashMap<Class, ComponentSynchronizePeer>();

    /**
     * Non-instantiable class.
     */
    private SynchronizePeerFactory() { }
    
    /**
     * Retrieves the appropriate <code>CommandSynchronizePeer</code> for a given 
     * <code>Command</code> class.
     * 
     * @param commandClass the command class
     * @return the appropriate <code>CommandSynchronizePeer</code>
     */
    public static CommandSynchronizePeer getPeerForCommand(Class commandClass) {
        return (CommandSynchronizePeer) peerFactory.getPeerForObject(commandClass, true);
    }
    
    /**
     * Retrieves the appropriate <code>ComponentSynchronizePeer</code> for a given 
     * <code>Component</code> class.
     * 
     * @param componentClass the component class
     * @return the appropriate <code>ComponentSynchronizePeer</code>
     */
    public static ComponentSynchronizePeer getPeerForComponent(Class componentClass) {
        return getPeerForComponent(componentClass, true);
    }
    
    /**
     * Retrieves the appropriate <code>ComponentSynchronizePeer</code> for a given 
     * <code>Component</code> class.
     * 
     * @param componentClass the component class
     * @param searchSuperClasses flag indicating whether peers for superclasses should be returned if none
     *        can be found for the exact class.
     * @return the appropriate <code>ComponentSynchronizePeer</code>
     */
    public static ComponentSynchronizePeer getPeerForComponent(Class componentClass, boolean searchSuperClasses) {
        ComponentSynchronizePeer peer = peerRegistry.get(componentClass);
        if (peer == null) {
            peer = (ComponentSynchronizePeer) peerFactory.getPeerForObject(componentClass, searchSuperClasses);
        }
        return peer;
    }
    
    /**
     * Register manually a peer for a given component class
     * Peers do not have to be registered in SynchronizePeerBindings.properties
     * 
     * @param componentClass the component class
     * @param peer the peer corresponding to the component class
     */
    public static void registerSynchronizePeer(Class<? extends Component> componentClass, ComponentSynchronizePeer peer) {
        peerRegistry.put(componentClass, peer);
        peerFactory.registerPeer(componentClass, peer);
    }
}

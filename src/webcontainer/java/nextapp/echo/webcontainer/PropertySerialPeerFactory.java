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

import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.PeerFactory;

//FIXME.  This is a temporary class to be used in refactoring the peer stuff between app and webcontainer.
// this code will be exterminated.
//FIXME. replace with an XmlPropertyPeerFactory from app...that's the good one, with the 1-per-classloader stuff.

class PropertySerialPeerFactory 
implements PropertyPeerFactory {

    private static final String RESOURCE_NAME = "META-INF/nextapp/echo/SynchronizePeerBindings.properties";
    private static final PeerFactory peerFactory 
            = new PeerFactory(RESOURCE_NAME, Thread.currentThread().getContextClassLoader());

    public static final PropertySerialPeerFactory INSTANCE = new PropertySerialPeerFactory();
    
    /**
     * Retrieves the appropriate <code>PropertySynchronizePeer</code> for a given 
     * property class.
     * 
     * @param propertyClass the property class
     * @return the appropriate <code>PropertySynchronizePeer</code>
     */
    public SerialPropertyPeer getPeerForProperty(Class propertyClass) {
        return (SerialPropertyPeer) peerFactory.getPeerForObject(propertyClass, true);
    }
}

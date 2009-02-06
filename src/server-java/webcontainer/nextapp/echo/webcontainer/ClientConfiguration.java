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

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Application-specific client configuration settings.
 */
public class ClientConfiguration
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /**
     * Property name constant for the alert message which should be displayed in
     * the event that a server error occurs.
     */
    public static final String PROPERTY_MESSAGE_SERVER_ERROR = "Message.ServerError";

    /**
     * Property name constant for the URI which should be displayed in the event
     * that a server error occurs.
     */
    public static final String PROPERTY_URI_SERVER_ERROR = "URI.ServerError";

    /**
     * Property name constant for the alert message which should be displayed in
     * the event the session expires.
     */
    public static final String PROPERTY_MESSAGE_SESSION_EXPIRATION = "Message.SessionExpiration";

    /**
     * Property name constant for the URI which should be displayed in the event
     * the session expires.
     */
    public static final String PROPERTY_URI_SESSION_EXPIRATION = "URI.SessionExpiration";

    /**
     * Property name constant for message to display when client must be resynchronized.
     */
    public static final String PROPERTY_MESSAGE_RESYNC = "Message.Resync";
    
    /**
     * Property name constant for message to display when user attempts to perform operations and must wait.
     */
    public static final String PROPERTY_MESSAGE_WAIT = "Message.Wait";

    /**
     * Mapping from property names to property values.
     */
    private Map propertyMap = new HashMap();
    
    /**
     * Returns the value of the specified property.
     * 
     * @param name the name of the property
     * @return the property value (or null if the property is not set)
     */
    public String getProperty(String name) {
        return (String) propertyMap.get(name);
    }
    
    /**
     * Returns the names of all set properties.
     * 
     * @return the property names
     */
    public String[] getPropertyNames() {
        Set propertyNames = propertyMap.keySet();
        return (String[]) propertyNames.toArray(new String[propertyNames.size()]);
    }
         
    /**
     * Sets a property.
     * 
     * @param name the property name
     * @param value the property value
     */
    public void setProperty(String name, String value) {
        propertyMap.put(name, value);
    }
}

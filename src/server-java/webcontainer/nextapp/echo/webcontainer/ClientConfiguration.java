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
    private static final long serialVersionUID = 20130812L;

    /**
     * Property name constant for the alert message which should be displayed in
     * the event that a stop error occurs.
     */
    public static final String STOP_ERROR_MESSAGE = "StopError.Message";

    /**
     * Property name constant for the URI which should be displayed in the event
     * that a stop error occurs.  An alert message will not be shown if this value is set.
     */
    public static final String STOP_ERROR_URI = "StopError.URI";

    /**
     * Property name constant for boolean flag indicating whether application should automatically
     * be restarted in the event session expires.  An alert message will not be shown if this value is set.
     */
    public static final String SESSION_EXPIRATION_RESTART = "SessionExpiration.Restart";

    /**
     * Property name constant for boolean flag indicating whether the application should automatically
     * be restarted in the event a XMLHttpRequest response is invalid (non-2xx status codes, no XML in response).
     * This can happen if for example a web access management agent or proxy intercepts the AJAX request and returns
     * a login page instead.
     * An alert message will not be shown if this value is set.
     */
    public static final String INVALID_RESPONSE_RESTART = "InvalidResponse.Restart";

    /**
     * Property name constant for the URI which should be displayed in the event
     * a response is invalid. An alert message will not be shown if this value is set.
     */
    public static final String INVALID_RESPONSE_URI = "InvalidResponse.URI";
    
    /**
     * Property name constant for the alert message which should be displayed when
     * a network error occurs.
     */
    public static final String NETWORK_ERROR_MESSAGE = "NetworkError.Message";

    /**
     * Property name constant for the alert message which should be displayed in
     * the event the session expires.
     */
    public static final String SESSION_EXPIRATION_MESSAGE = "SessionExpiration.Message";

    /**
     * Property name constant for the URI which should be displayed in the event
     * the session expires.  An alert message will not be shown if this value is set.
     */
    public static final String SESSION_EXPIRATION_URI = "SessionExpiration.URI";

    /**
     * Property name constant for message to display when client must be resynchronized.
     */
    public static final String RESYNC_MESSAGE = "Resync.Message";
    
    /**
     * Property name constant for wait indicator text.
     */
    public static final String WAIT_INDICATOR_TEXT = "WaitIndicator.Text";

    /**
     * Property name constant for wait indicator foreground.  Must be a <code>Color</code> value.
     */
    public static final String WAIT_INDICATOR_FOREGROUND = "WaitIndicator.Foreground";

    /**
     * Property name constant for wait indicator background.  Must be a <code>Color</code> value.
     */
    public static final String WAIT_INDICATOR_BACKGROUND = "WaitIndicator.Background";

    /**
     * Property name constant for boolean flag indicating whether the warning message should *not* be displayed
     * in the browser even if the browser version is unsupported by the client-side JavaScript implementation.
     */
    public static final String OUTDATED_BROWSER_NO_WARNING = "OutdatedBrowserWarning.NoWarning";

    /**
     * Property name constant for message to display when an outdated browser version is detected.
     */
    public static final String OUTDATED_BROWSER_MESSAGE = "OutdatedBrowserWarning.Text";
    /**
     * Property name constant for the text in the anchor that can be clicked to close the message.
     */
    public static final String OUTDATED_BROWSER_CLOSE = "OutdatedBrowserWarning.CloseText";

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
    public Object getProperty(String name) {
        return propertyMap.get(name);
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
    public void setProperty(String name, Object value) {
        propertyMap.put(name, value);
    }
}

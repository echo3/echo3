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

/**
 * A description of the client browser environment.
 */
public class ClientProperties
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    // General Browser Properties
    
    /**
     * Width of the screen in pixels (integer).
     */
    public static final String SCREEN_WIDTH = "screenWidth";

    /**
     * Height of the screen in pixels (integer).
     */
    public static final String SCREEN_HEIGHT = "screenHeight";

    /**
     * Color depth of the screen in bits (integer).
     */
    public static final String SCREEN_COLOR_DEPTH = "screenColorDepth";
    
    /**
     * Flag indicating that the browser is a derivative of the Mozilla 
     * 1.0-1.8+ browser platform. 
     */
    public static final String BROWSER_MOZILLA = "browserMozilla";
    
    /**
     * Flag indicating that the browser is a derivative of the Google Chrome platform.
     */
    public static final String BROWSER_CHROME = "browserChrome";
    
    /**
     * Flag indicating that the browser is a derivative of the Mozilla
     * Firefox 1.0+ browser platform.
     */
    public static final String BROWSER_MOZILLA_FIREFOX = "browserMozillaFirefox";
    
    /**
     * Flag indicating that the browser is a derivative of the Microsoft
     * Internet Explorer browser platform.
     */
    public static final String BROWSER_INTERNET_EXPLORER = "browserInternetExplorer";
    
    /**
     * Flag indicating that the browser is a derivative of the KDE Konqueror
     * browser platform.
     */
    public static final String BROWSER_KONQUEROR = "browserKonqueror";
    
    /**
     * Flag indicating that the browser is a derivative of the Apple Safari
     * browser platform.
     */
    public static final String BROWSER_SAFARI = "browserSafari";
    
    /**
     * Flag indicating that the browser is a derivative of the Opera
     * browser platform.
     */
    public static final String BROWSER_OPERA = "browserOpera";
    
    /**
     * The major version number of the browser.
     */
    public static final String BROWSER_VERSION_MAJOR = "browserVersionMajor";
    
    /**
     * The minor version number of the browser.
     */
    public static final String BROWSER_VERSION_MINOR = "browserVersionMinor";
    
    /**
     * Flag indicating the layout engine is Mozilla Gecko.
     */
    public static final String ENGINE_GECKO = "engineGecko"; 

    /**
     * Flag indicating the layout engine is KHTML (from Konqueror).
     */
    public static final String ENGINE_KHTML = "engineKHTML"; 

    /**
     * Flag indicating the layout engine is MSHTML / Trident.
     */
    public static final String ENGINE_MSHTML = "engineMSHTML"; 

    /**
     * Flag indicating the layout engine is Presto (Opera).
     */
    public static final String ENGINE_PRESTO = "enginePresto"; 

    /**
     * The major version number of the layout engine.
     */
    public static final String ENGINE_VERSION_MAJOR = "engineVersionMajor";
    
    /**
     * The minor version number of the layout engine.
     */
    public static final String ENGINE_VERSION_MINOR = "engineVersionMinor";
    
    /**
     * Flag indicating the layout engine is WebKit.
     */
    public static final String ENGINE_WEBKIT = "engineWebKit"; 
    
    /**
     * The <code>Locale</code> of the client, derived from the language property.
     */
    public static final String LOCALES = "locales";
    
    /**
     * The client's navigator.appName property.
     */
    public static final String NAVIGATOR_APP_NAME = "navigatorAppName";

    /**
     * The client's navigator.appVersion property.
     */
    public static final String NAVIGATOR_APP_VERSION = "navigatorAppVersion";

    /**
     * The client's navigator.appCodeName property.
     */
    public static final String NAVIGATOR_APP_CODE_NAME = "navigatorAppCodeName";

    /**
     * The client's navigator.cookieEnabled property.
     */
    public static final String NAVIGATOR_COOKIE_ENABLED = "navigatorCookieEnabled";

    /**
     * The client's navigator.javaEnabled property.
     */
    public static final String NAVIGATOR_JAVA_ENABLED = "navigatorJavaEnabled";

    /**
     * The client's navigator.language (or navigator.userLanguage) property.
     */
    public static final String NAVIGATOR_LANGUAGE = "navigatorLanguage";

    /**
     * The client's navigator.platform property.
     */
    public static final String NAVIGATOR_PLATFORM = "navigatorPlatform";

    /**
     * The client's navigator.userAgent property.
     */
    public static final String NAVIGATOR_USER_AGENT = "navigatorUserAgent";

    /**
     * The client host.  Note this is the original host address used when the 
     * <code>ClientProperties</code> object was created, which is not 
     * necessarily the same as that making the current HTTP request. 
     */
    public static final String REMOTE_HOST = "remoteHost";
    
    /**
     * The client's time offset from UTC in minutes.
     */
    public static final String UTC_OFFSET = "utcOffset";
    
    private Map data = new HashMap();
    
    /**
     * Creates a new <code>ClientProperties</code> object.
     */
    public ClientProperties() {
        super();
    }
    
    /**
     * Returns the value of the specified property as an <code>Object</code>.
     *
     * @param propertyName the property name
     * @return the property value 
     */
    public Object get(String propertyName) {
        return data.get(propertyName);
    }
    
    /**
     * Returns a <code>boolean</code> property.  
     * If the property is not set, <code>false</code> is returned.
     * 
     * @param propertyName the property name
     * @return the property value
     */
    public boolean getBoolean(String propertyName) {
        Boolean value = (Boolean) data.get(propertyName);
        return value == null ? false : value.booleanValue();
    }
    
    /**
     * Returns a <code>int</code> property.  
     * If the property is not set, <code>nullValue</code> is returned.
     * 
     * @param propertyName the property name
     * @param nullValue the returned value when the property is not set
     * @return the property value
     */
    public int getInt(String propertyName, int nullValue) {
        Integer value = (Integer) data.get(propertyName);
        return value == null ? nullValue : value.intValue();
    }
    
    /**
     * Returns a <code>String</code> property.  
     * If the property is not set, <code>null</code> is returned.
     * 
     * @param propertyName the property name
     * @return the property value
     */
    public String getString(String propertyName) {
        Object value = data.get(propertyName);
        return value == null ? "" : value.toString();
    }
    
    /**
     * Returns an array of all property names which are set.
     * 
     * @return the array
     */
    public String[] getPropertyNames() {
        return (String[]) data.keySet().toArray(new String[data.size()]);
    }
    
    /**
     * Sets the value of the specified property.
     * 
     * @param propertyName the property name
     * @param propertyValue the property value
     */
    public void setProperty(String propertyName, Object propertyValue) {
        data.put(propertyName, propertyValue);
    }
    
    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        return "ClientProperties: " + data.toString();
    }
}

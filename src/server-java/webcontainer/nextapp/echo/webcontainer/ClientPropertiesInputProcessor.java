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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Element;

/**
 * <code>ClientMessage.Processor</code> which generates a
 * <code>ClientProperties</code> and assigns it to the
 * relevant <code>UserInstance</code>.
 */
public class ClientPropertiesInputProcessor
implements ClientMessage.Processor {

    /**
     * Mapping between property names and property classes,
     * used for deserialization and to disallow setting
     * of arbitrary properties.
     */
    private static final Map TYPE_MAP;
    static {
        Map m = new HashMap();
        m.put(ClientProperties.SCREEN_WIDTH, Integer.class);
        m.put(ClientProperties.SCREEN_HEIGHT, Integer.class);
        m.put(ClientProperties.SCREEN_COLOR_DEPTH, Integer.class);
        m.put(ClientProperties.UTC_OFFSET, Integer.class);
        m.put(ClientProperties.NAVIGATOR_APP_CODE_NAME, String.class);
        m.put(ClientProperties.NAVIGATOR_APP_NAME, String.class);
        m.put(ClientProperties.NAVIGATOR_APP_VERSION, String.class);
        m.put(ClientProperties.NAVIGATOR_COOKIE_ENABLED, Boolean.class);
        m.put(ClientProperties.NAVIGATOR_JAVA_ENABLED, Boolean.class);
        m.put(ClientProperties.NAVIGATOR_LANGUAGE, String.class);
        m.put(ClientProperties.NAVIGATOR_PLATFORM, String.class);
        m.put(ClientProperties.NAVIGATOR_USER_AGENT, String.class);

        m.put(ClientProperties.BROWSER_CHROME, Boolean.class);
        m.put(ClientProperties.BROWSER_OPERA, Boolean.class);
        m.put(ClientProperties.BROWSER_KONQUEROR, Boolean.class);
        m.put(ClientProperties.BROWSER_SAFARI, Boolean.class);
        m.put(ClientProperties.BROWSER_MOZILLA, Boolean.class);
        m.put(ClientProperties.BROWSER_MOZILLA_FIREFOX, Boolean.class);
        m.put(ClientProperties.BROWSER_INTERNET_EXPLORER, Boolean.class);
        m.put(ClientProperties.BROWSER_VERSION_MAJOR, Integer.class);
        m.put(ClientProperties.BROWSER_VERSION_MINOR, Integer.class);
        
        m.put(ClientProperties.ENGINE_GECKO, Boolean.class);
        m.put(ClientProperties.ENGINE_KHTML, Boolean.class);
        m.put(ClientProperties.ENGINE_MSHTML, Boolean.class);
        m.put(ClientProperties.ENGINE_PRESTO, Boolean.class);
        m.put(ClientProperties.ENGINE_WEBKIT, Boolean.class);
        m.put(ClientProperties.ENGINE_VERSION_MAJOR, Integer.class);
        m.put(ClientProperties.ENGINE_VERSION_MINOR, Integer.class);
        
        TYPE_MAP = Collections.unmodifiableMap(m);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ClientMessage.Processor#process(nextapp.echo.app.util.Context, org.w3c.dom.Element)
     */
    public void process(Context context, Element dirElement) 
    throws IOException {
        ClientProperties clientProperties = new ClientProperties();
        Connection conn = WebContainerServlet.getActiveConnection();
        
        Enumeration localeEnum = conn.getRequest().getLocales();
        List localeList = new ArrayList();
        while (localeEnum.hasMoreElements()) {
            localeList.add(localeEnum.nextElement());
        }
        clientProperties.setProperty(ClientProperties.LOCALES, localeList.toArray(new Locale[localeList.size()]));
        clientProperties.setProperty(ClientProperties.REMOTE_HOST, conn.getRequest().getRemoteHost());
        
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        Element[] pElements = DomUtil.getChildElementsByTagName(dirElement, "p");
        for (int i = 0; i < pElements.length; ++i) {
            try {
                String propertyName = pElements[i].getAttribute("n");
                Class propertyClass = (Class) TYPE_MAP.get(propertyName);
                if (propertyClass == null) {
                    throw new SynchronizationException("Illegal property in ClientProperties message: " + propertyName, null);
                }
                SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(propertyClass);
                if (propertyPeer == null) {
                	throw new IOException("Property peer for " + propertyClass + " not found - possibly not included in SynchronizePeerBindings.properties.");
                }
                Object propertyValue = propertyPeer.toProperty(context, propertyClass, pElements[i]);
                clientProperties.setProperty(propertyName, propertyValue);
            } catch (SerialException ex) {
                // Do nothing: if property is not valid, it will not be set.
            }
        }
        
        UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
        userInstance.setClientProperties(clientProperties);
    }
}

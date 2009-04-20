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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionActivationListener;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionEvent;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Component;
import nextapp.echo.app.TaskQueueHandle;
import nextapp.echo.app.update.ServerComponentUpdate;
import nextapp.echo.app.update.UpdateManager;
import nextapp.echo.webcontainer.util.IdTable;

/**
 * Object representing a single user-instance of an application hosted in the 
 * web application container.  This object is stored in the HttpSession.
 */
public class UserInstance 
implements HttpSessionActivationListener, HttpSessionBindingListener, Serializable {
    
    private abstract class SerializablePropertyChangeListener implements PropertyChangeListener, Serializable { }
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /** Default asynchronous monitor callback interval (in milliseconds). */
    private static final int DEFAULT_CALLBACK_INTERVAL = 500;
    
    /** Client configuration data property name. */ 
    public static final String PROPERTY_CLIENT_CONFIGURATION = "clientConfiguration";

    /**
     * Creates a new Web Application Container instance using the provided
     * client <code>Connection</code>.  The instance will automatically
     * be stored in the relevant <code>HttpSession</code>
     * 
     * @param conn the client/server <code>Connection</code> for which the 
     *        instance is being instantiated
     */
    public static void newInstance(Connection conn) {
        new UserInstance(conn);
    }

    /**
     * The <code>ApplicationInstance</code>.
     */
    private ApplicationInstance applicationInstance;
    
    /**
     * The default character encoding in which responses should be rendered.
     */
    private String characterEncoding = "UTF-8";
    
    /**
     * <code>ClientConfiguration</code> information containing 
     * application-specific client behavior settings.
     */
    private ClientConfiguration clientConfiguration;
    
    /**
     * A <code>ClientProperties</code> object describing the web browser
     * client.
     */
    private ClientProperties clientProperties;
    
    /**
     * Mapping between component instances and <code>RenderState</code> objects.
     */
    private Map componentToRenderStateMap = new HashMap();
    
    /**
     * <code>PropertyChangeListener</code> for supported <code>ApplicationInstance</code>.
     */
    private PropertyChangeListener applicationPropertyChangeListener = new SerializablePropertyChangeListener() {
    
        /**
         * @see java.beans.PropertyChangeListener#propertyChange(java.beans.PropertyChangeEvent)
         */
        public void propertyChange(PropertyChangeEvent e) {
            if (ApplicationInstance.STYLE_SHEET_CHANGED_PROPERTY.equals(e.getPropertyName())) {
                updatedPropertyNames.add(ApplicationInstance.STYLE_SHEET_CHANGED_PROPERTY);
            }
        }
    };
    
    /**
     * <code>IdTable</code> used to assign weakly-referenced unique 
     * identifiers to arbitrary objects.
     */
    private transient IdTable idTable;

    /**
     * Flag indicating whether initialization has occurred. 
     */
    private boolean initialized = false;

    /**
     * Flag indicating whether the application has been initialized, i.e., whether <code>ApplicationInstance.doInit()</code>
     * has been invoked.
     */
    private boolean applicationInitialized = false; 
        
    /**
     * Map containing HTTP URL parameters provided on initial HTTP request to application.
     */
    private Map initialRequestParameterMap;
    
    /**
     * Set of updated property names.
     */
    private Set updatedPropertyNames = new HashSet();
    
    /**
     * The URI of the servlet.
     */
    private String servletUri;
    
    /**
     * Reference to the <code>HttpSession</code> in which this
     * <code>UserInstance</code> is stored.
     */
    private transient HttpSession session;

    /**
     * Map of <code>TaskQueueHandle</code>s to callback intervals.
     */
    private transient Map taskQueueToCallbackIntervalMap;
    
    /**
     * The current transactionId.  Used to ensure incoming ClientMessages reflect
     * changes made by user against current server-side state of user interface.
     * This is used to eliminate issues that could be encountered with two
     * browser windows pointing at the same application instance.
     */
    private int transactionId = 0;
       
    /**
     * Creates a new <code>UserInstance</code>.
     * 
     * @param conn the client/server <code>Connection</code> for which the
     *        instance is being instantiated
     */
    public UserInstance(Connection conn) {
        super();
        conn.initUserInstance(this);
        initialRequestParameterMap = new HashMap(conn.getRequest().getParameterMap());
    }

    /**
     * Clears all <code>RenderState</code> information.
     */
    public void clearRenderStates() {
        componentToRenderStateMap.clear();
    }
    
    /**
     * Returns the corresponding <code>ApplicationInstance</code>
     * for this user instance.
     * 
     * @return the relevant <code>ApplicationInstance</code>
     */
    public synchronized ApplicationInstance getApplicationInstance() {
        return applicationInstance;
    }
    
    /**
     * Determines the application-specified asynchronous monitoring
     * service callback interval.
     * 
     * @return the callback interval, in milliseconds
     */
    public int getCallbackInterval() {
        if (taskQueueToCallbackIntervalMap == null || taskQueueToCallbackIntervalMap.size() == 0) {
            return DEFAULT_CALLBACK_INTERVAL;
        }
        Iterator it = taskQueueToCallbackIntervalMap.values().iterator();
        int returnInterval = Integer.MAX_VALUE;
        while (it.hasNext()) {
            int interval = ((Integer) it.next()).intValue();
            if (interval < returnInterval) {
                returnInterval = interval;
            }
        }
        return returnInterval;
    }

    /**
     * Returns the default character encoding in which responses should be
     * rendered.
     * 
     * @return the default character encoding in which responses should be
     *         rendered
     */
    public String getCharacterEncoding() {
        return characterEncoding;
    }
    
    /** 
     * The <code>ServerDelayMessage</code> displayed during client/server-interactions.
     * Retrieves the <code>ClientConfiguration</code> information containing application-specific client behavior settings.
     * 
     * @return the relevant <code>ClientProperties</code>
     */
    public ClientConfiguration getClientConfiguration() {
        return clientConfiguration;
    }
    
    /**
     * Retrieves the <code>ClientProperties</code> object providing
     * information about the client of this instance.
     * 
     * @return the relevant <code>ClientProperties</code>
     */
    public ClientProperties getClientProperties() {
        return clientProperties;
    }
    
    /**
     * Returns the client-side render id that should be used when rendering the
     * specified <code>Component</code>.
     * 
     * @param component the component 
     * @return the client-side render id
     */
    public String getClientRenderId(Component component) {
        return "C." + component.getRenderId();
    }
    
    /**
     * Retrieves the <code>Component</code> with the specified client-side render id.
     * 
     * @param clientRenderId client-side element render id, e.g., "C.42323"
     * @return the component (e.g., the component whose id is "42323")
     */
    public Component getComponentByClientRenderId(String clientRenderId) {
        try {
            return applicationInstance.getComponentByRenderId(clientRenderId.substring(2));
        } catch (IndexOutOfBoundsException ex) {
            throw new IllegalArgumentException("Invalid component element id: " + clientRenderId);
        }
    }

    /**
     * Returns the current transaction id.
     * 
     * @return the current transaction id
     */
    public int getCurrentTransactionId() {
        return transactionId;
    }

    /**
     * Retrieves the <code>IdTable</code> used by this 
     * <code>ContainerInstance</code> to assign weakly-referenced unique 
     * identifiers to arbitrary objects.
     * 
     * @return the <code>IdTable</code>
     */
    public IdTable getIdTable() {
        if (idTable == null) {
            idTable = new IdTable();
        }
        return idTable;
    }
    
    /**
     * Returns an immutable <code>Map</code> containing the HTTP form 
     * parameters sent on the initial request to the application.
     * 
     * @return the initial request parameter map
     */
    public Map getInitialRequestParameterMap() {
        return initialRequestParameterMap;
    }
    
    /**
     * Increments the current transaction id and returns it.
     * 
     * @return the current transaction id, after an increment
     */
    public int getNextTransactionId() {
        ++transactionId;
        return transactionId;
    }

    /**
     * Retrieves the <code>RenderState</code> of the specified
     * <code>Component</code>.
     * 
     * @param component the component
     * @return the rendering state
     */
    public RenderState getRenderState(Component component) {
        return (RenderState) componentToRenderStateMap.get(component);
    }

    /**
     * Returns the id of the HTML element that will serve as the Root component.
     * This element must already be present in the DOM when the application is
     * first rendered.
     * 
     * @return the element id
     */
    public String getRootHtmlElementId() {
        return "approot";
    }
    
    /**
     * Determines the URI to invoke the specified <code>Service</code>.
     * 
     * @param service the <code>Service</code>
     * @return the URI
     */
    public String getServiceUri(Service service) {
        return servletUri + "?" + WebContainerServlet.SERVICE_ID_PARAMETER + "=" + service.getId();
    }
    
    /**
     * Determines the URI to invoke the specified <code>Service</code> with
     * additional request parameters. The additional parameters are provided by
     * way of the <code>parameterNames</code> and <code>parameterValues</code>
     * arrays. The value of a parameter at a specific index in the
     * <code>parameterNames</code> array is provided in the
     * <code>parameterValues</code> array at the same index. The arrays must
     * thus be of equal length. Null values are allowed in the
     * <code>parameterValues</code> array, and in such cases only the parameter
     * name will be rendered in the returned URI.
     * 
     * @param service the <code>Service</code>
     * @param parameterNames the names of the additional URI parameters
     * @param parameterValues the values of the additional URI parameters
     * @return the URI
     */
    public String getServiceUri(Service service, String[] parameterNames, String[] parameterValues) {
        StringBuffer out = new StringBuffer(servletUri);
        out.append("?");
        out.append(WebContainerServlet.SERVICE_ID_PARAMETER);
        out.append("=");
        out.append(service.getId());
        for (int i = 0; i < parameterNames.length; ++i) {
            out.append("&");
            out.append(parameterNames[i]);
            if (parameterValues[i] != null) {
                out.append("=");
                out.append(parameterValues[i]);
            }
        }
        return out.toString();
    }

    /**
     * Returns the URI of the servlet managing this <code>UserInstance</code>.
     * 
     * @return the URI
     */
    public String getServletUri() {
        return servletUri;
    }

    /**
     * Returns the <code>HttpSession</code> containing this
     * <code>UserInstance</code>.
     * 
     * @return the <code>HttpSession</code>
     */
    public HttpSession getSession() {
        return session;
    }
    
    /**
     * Returns an iterator over updated property names.
     * Invoked by OutputProcessor.
     */
    Iterator getUpdatedPropertyNames() {
        if (updatedPropertyNames.size() == 0) {
            return Collections.EMPTY_SET.iterator();
        } else {
            Set updatedPropertyNames = this.updatedPropertyNames;
            this.updatedPropertyNames = new HashSet();
            return updatedPropertyNames.iterator();
        }
    }
    
   /**
     * Convenience method to retrieve the application's 
     * <code>UpdateManager</code>, which is used to synchronize
     * client and server states.
     * This method is equivalent to invoking
     * <code>getApplicationInstance().getUpdateManager()</code>.
     * 
     * @return the <code>UpdateManager</code>
     */
    public UpdateManager getUpdateManager() {
        return applicationInstance.getUpdateManager();
    }
    
    /**
     * Disposes of the <code>UserInstance</code>.
     */
    public void dispose() {
        if (applicationInstance != null) {
            try {
                ApplicationInstance.setActive(applicationInstance);
                applicationInstance.removePropertyChangeListener(applicationPropertyChangeListener);
                applicationInstance.dispose();
            } finally {
                ApplicationInstance.setActive(null);
            }
        }
    }

    /**
     * Initializes the <code>UserInstance</code>, creating an instance
     * of the target <code>ApplicationInstance</code>.
     * The <code>ApplicationInstance</code> will not be initialized until
     * <code>getApplicationInstance()</code> is invoked for the first time.
     *
     * @param conn the relevant <code>Connection</code>
     */
    public void init(Connection conn) {
        if (initialized) {
            throw new IllegalStateException("Attempt to invoke UserInstance.init() on initialized instance.");
        }
        WebContainerServlet servlet = (WebContainerServlet) conn.getServlet();
        applicationInstance = servlet.newApplicationInstance();
        applicationInstance.addPropertyChangeListener(applicationPropertyChangeListener);
        
        ContainerContext containerContext = new ContainerContextImpl(this);
        applicationInstance.setContextProperty(ContainerContext.CONTEXT_PROPERTY_NAME, containerContext);
        
        initialized = true;
    }

    /**
     * Determines if the <code>UserInstance</code> has been initialized, 
     * i.e., whether its <code>init()</code> method has been invoked.
     * 
     * @return true if the <code>UserInstance</code> is initialized
     */
    public boolean isInitialized() {
        return initialized;
    }
    
    /**
     * Prepares the <code>ApplicationInstance</code> for use, initializing the application if it has not been initialized 
     * previously.
     * 
     * @return the relevant <code>ApplicationInstance</code>
     */
    void prepareApplicationInstance() {
        if (!applicationInitialized) {
            synchronized (applicationInstance) {
                if (!applicationInitialized) {
                    try {
                        applicationInstance.doInit();
                    } finally {
                        applicationInitialized = true;
                    }
                }
            }
        }
    }
    
    /**
     * Removes all <code>RenderState</code>s whose components are not
     * registered.
     */
    public void purgeRenderStates() {
        ServerComponentUpdate[] updates = getUpdateManager().getServerUpdateManager().getComponentUpdates();

        Iterator it = componentToRenderStateMap.keySet().iterator();
        while (it.hasNext()) {
            Component component = (Component) it.next();
            if (!component.isRegistered() || !component.isRenderVisible()) {
                it.remove();
                continue;
            }

            for (int i = 0; i < updates.length; ++i) {
                if (updates[i].hasRemovedDescendant(component)) {
                    it.remove();
                    continue;
                }
            }
        }
    }

    /**
     * Removes the <code>RenderState</code> of the specified
     * <code>Component</code>.
     * 
     * @param component the component
     */
    public void removeRenderState(Component component) {
        componentToRenderStateMap.remove(component);
    }

    /**
     * @see javax.servlet.http.HttpSessionActivationListener#sessionDidActivate(javax.servlet.http.HttpSessionEvent)
     * 
     * Recreates reference to session.
     * Notifies <code>ApplicationInstance</code> of activation.
     */
    public void sessionDidActivate(HttpSessionEvent e) {
        session = e.getSession();
        if (applicationInstance != null) {
            applicationInstance.activate();
        }
    }

    /**
     * @see javax.servlet.http.HttpSessionActivationListener#sessionWillPassivate(javax.servlet.http.HttpSessionEvent)
     * 
     * Notifies <code>ApplicationInstance</code> of passivation.
     * Discards reference to session.
     */
    public void sessionWillPassivate(HttpSessionEvent e) {
        if (applicationInstance != null) {
            applicationInstance.passivate();
        }
        session = null;
    }
    
    /**
     * Sets the contained <code>ApplicationInstance</code> active or inactive.
     * 
     * @param active the new active state
     */
    void setActive(boolean active) {
        if (active) {
            ApplicationInstance.setActive(applicationInstance);
        } else {
            ApplicationInstance.setActive(null);
        }
    }

    /**
     * Sets the <code>ClientConfiguration</code> information containing
     * application-specific client behavior settings.
     * 
     * @param clientConfiguration the new <code>ClientConfiguration</code>
     */
    public void setClientConfiguration(ClientConfiguration clientConfiguration) {
        this.clientConfiguration = clientConfiguration;
        this.updatedPropertyNames.add(PROPERTY_CLIENT_CONFIGURATION);
    }

    /**
     * Stores the <code>ClientProperties</code> object that provides
     * information about the client of this instance.
     * 
     * @param clientProperties the relevant <code>ClientProperties</code>
     */
    void setClientProperties(ClientProperties clientProperties) {
        this.clientProperties = clientProperties;
    }

    /**
     * Sets the <code>RenderState</code> of the specified 
     * <code>Component</code>.
     * 
     * @param component the component
     * @param renderState the render state
     */
    public void setRenderState(Component component, RenderState renderState) {
        componentToRenderStateMap.put(component, renderState);
    }

    /**
     * Sets the URI of the servlet managing this <code>UserInstance</code>.
     * 
     * @param servletUri the URI
     */
    void setServletUri(String servletUri) {
        this.servletUri = servletUri;
    }

    /**
     * Sets the interval between asynchronous callbacks from the client to check
     * for queued tasks for a given <code>TaskQueue</code>.  If multiple 
     * <code>TaskQueue</code>s are active, the smallest specified interval should
     * be used.  The default interval is 500ms.
     * Application access to this method should be accessed via the 
     * <code>ContainerContext</code>.
     * 
     * @param taskQueue the <code>TaskQueue</code>
     * @param ms the number of milliseconds between asynchronous client 
     *        callbacks
     * @see nextapp.echo.webcontainer.ContainerContext#setTaskQueueCallbackInterval(nextapp.echo.app.TaskQueueHandle, int)
     */
    public void setTaskQueueCallbackInterval(TaskQueueHandle taskQueue, int ms) {
        if (taskQueueToCallbackIntervalMap == null) {
            taskQueueToCallbackIntervalMap = new WeakHashMap();
        }
        taskQueueToCallbackIntervalMap.put(taskQueue, new Integer(ms));
    }
    
    /**
     * Listener implementation of <code>HttpSessionBindingListener</code>.
     * Stores reference to session when invoked.
     * 
     * @see javax.servlet.http.HttpSessionBindingListener#valueBound(HttpSessionBindingEvent)
     */
    public void valueBound(HttpSessionBindingEvent e) {
        session = e.getSession();
    }

    /**
     * Listener implementation of <code>HttpSessionBindingListener</code>.
     * Disposes <code>ApplicationInstance</code>.
     * Removes reference to session when invoked.
     * 
     * @see javax.servlet.http.HttpSessionBindingListener#valueUnbound(HttpSessionBindingEvent)
     */
    public void valueUnbound(HttpSessionBindingEvent e) {
        dispose();
        session = null;
    }
}

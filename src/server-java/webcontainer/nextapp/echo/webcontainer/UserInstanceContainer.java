package nextapp.echo.webcontainer;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionActivationListener;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionEvent;

import nextapp.echo.webcontainer.service.StringVersionService;

/**
 * Container / manager of all <code>UserInstance<code> objects in the servlet session.
 */
public class UserInstanceContainer 
implements HttpSessionActivationListener, HttpSessionBindingListener, Serializable {
    
    /**
     * Creates a new Web Application Container instance using the provided
     * client <code>Connection</code>.  The instance will automatically
     * be stored in the relevant <code>HttpSession</code>
     * 
     * @param conn the client/server <code>Connection</code> for which the 
     *        instance is being instantiated
     */
    public static void newInstance(Connection conn) {
        new UserInstanceContainer(conn);
    }
    
    /**
     * Sequential <code>UserInstance</code> identifier generator.
     */
    private int nextUserInstanceId = 0;
    
    /**
     * Sequential initial request identifier generator. 
     */
    private int nextInitId = 0;
    
    /**
     * The default character encoding in which responses should be rendered.
     */
    private String characterEncoding = "UTF-8";
    
    /**
     * The URI of the servlet.
     */
    private String servletUri;
    
    /**
     * Mapping between client-generated unique browser window identifiers and <code>UserInstance</code> values.
     */
    private Map clientWindowIdToUserInstance = new HashMap();
    
    /**
     * Mapping between <code>UserInstance</code> identifiers and <code>UserInstance</code> values.
     */
    private Map idToUserInstance = new HashMap();
    
    /**
     * Mapping between initial request identifiers (as returned by <code>createInitId()</code>) and maps of initial
     * requested parameters retrieved from <code>HttpServletRequest.getParameterMap()</code>.
     */
    private Map initIdToInitialRequestParameterMap = new HashMap();
    
    /**
     * The containing <code>HttpSession</code>.
     */
    private transient HttpSession session;
    
    private boolean windowSpecificUserInstances;

    /**
     * Creates a new <code>UserInstance</code>.
     * 
     * @param conn the client/server <code>Connection</code> for which the
     *        instance is being instantiated
     */
    private UserInstanceContainer(Connection conn) {
        super();
        conn.initUserInstanceContainer(this);
        windowSpecificUserInstances = conn.getServlet().getInstanceMode() == WebContainerServlet.INSTANCE_MODE_WINDOW;
    }
    
    /**
     * Disposes of all contained <code>UserInstance</code>s.
     */
    private void dispose() {
        Iterator it = idToUserInstance.values().iterator();
        while (it.hasNext()) {
            UserInstance userInstance = (UserInstance) it.next();
            userInstance.dispose();
        }
    }
    
    /**
     * Creates an initial request identifier.
     * Stores request parameters provided by the connection, such that they may be assigned to the
     * later-generated <code>UserInstance</code> if required.
     * 
     * @param conn the <code>Connection</code>
     * @return a unique initial request identifier
     */
    public String createInitId(Connection conn) {
        Map parameterMap = new HashMap(conn.getRequest().getParameterMap());
        String initId = new Integer(nextInitId++).toString();
        initIdToInitialRequestParameterMap.put(initId, parameterMap);
        return initId;
    }
    
    /**
     * Creates or retrieves a <code>UserInstance</code> for the specified client window identifier and 
     * initial request identifier.  Invoked when a window is loaded for the first time or reloaded.
     * 
     * If a <code>UserInstance</code> exists for the specified <code>clientWindowId</code>, it is
     * returned.
     * 
     * If a <code>UserInstance</code> does not exist for the specified <code>clientWindowId</code>, one is
     * created and stored within this <code>UserInstanceContainer</code>.  The initial request parameters are
     * retrieved from the initialization-id-to-request-parameter-map and stored in the created
     * <code>UserInstance</code>.
     * 
     * @param clientWindowId the client-generated unique browser window identifier
     * @param initId the server-generated (by <code>createInitId()</code>) unique initialization
     *        request identifier
     * @return the existing or created <code>UserInstance</code>
     */
    synchronized UserInstance loadUserInstance(String clientWindowId, String initId) {
        if (!windowSpecificUserInstances) {
            clientWindowId = null;
        }
        UserInstance userInstance = (UserInstance) clientWindowIdToUserInstance.get(clientWindowId);
        if (userInstance == null) {
            String uiid;
            
            if (windowSpecificUserInstances) {
                uiid = new Integer(nextUserInstanceId++).toString();
            } else {
                uiid = null;
            }
            Map initialRequestParameterMap = (Map) initIdToInitialRequestParameterMap.remove(initId);
            userInstance = new UserInstance(this, uiid, clientWindowId, initialRequestParameterMap); 
            clientWindowIdToUserInstance.put(clientWindowId, userInstance);
            idToUserInstance.put(userInstance.getId(), userInstance);
        }
        return userInstance;
    }
    
    /**
     * Unloads a <code>UserInstance</code> from the container.
     * Disposes of the instance.
     * 
     * @param userInstance the instance to unload
     */
    synchronized void unloadUserInstance(UserInstance userInstance) {
        userInstance.dispose();
        clientWindowIdToUserInstance.remove(userInstance.getClientWindowId());
        idToUserInstance.remove(userInstance.getId());
    }
    
    /**
     * Retrieves an existing <code>UserInstance</code> by its assigned user instance identifier.
     * 
     * @param id the <code>UserInstance</code> identifier, i.e., value which would be returned by
     *        the <code>UserInstance</code>'s <code>getId()</code> method
     * @return the <code>UserInstnace</code>, or null if none exists
     */
    synchronized UserInstance getUserInstanceById(String id) {
        return (UserInstance) idToUserInstance.get(id);
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
     * Returns the <code>HttpSession</code> containing this
     * <code>UserInstanceContainer</code>.
     * 
     * @return the <code>HttpSession</code>
     */
    HttpSession getSession() {
        return session;
    }
    
    /**
     * Determines the URI to invoke the specified <code>Service</code>.
     * 
     * @param service the <code>Service</code>
     * @return the URI
     */
    public String getServiceUri(Service service, String userInstanceId) {
        StringBuffer out = new StringBuffer(getServletUri());
        out.append("?");
        out.append(WebContainerServlet.SERVICE_ID_PARAMETER);
        out.append("=");
        out.append(service.getId());
        if (service instanceof StringVersionService) {
            StringVersionService svs = (StringVersionService) service;
            if (svs.getVersionAsString() != null) {
                out.append("&v=");
                out.append(((StringVersionService)service).getVersionAsString());
            }
        }
        if (userInstanceId != null) {
            out.append("&");
            out.append(WebContainerServlet.USER_INSTANCE_ID_PARAMETER);
            out.append("=");
            out.append(userInstanceId);
        }
        return out.toString();
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
    public String getServiceUri(Service service, String userInstanceId, String[] parameterNames, String[] parameterValues) {
        StringBuffer out = new StringBuffer(getServletUri());
        out.append("?");
        out.append(WebContainerServlet.SERVICE_ID_PARAMETER);
        out.append("=");
        out.append(service.getId());
        if (service instanceof StringVersionService) {
            StringVersionService svs = (StringVersionService) service;
            if (svs.getVersionAsString() != null) {
                out.append("&v=");
                out.append(((StringVersionService)service).getVersionAsString());
            }
        }
        if (userInstanceId != null) {
            out.append("&");
            out.append(WebContainerServlet.USER_INSTANCE_ID_PARAMETER);
            out.append("=");
            out.append(userInstanceId);
        }
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
     * Returns the URI of the servlet managing this <code>UserInstanceContainer</code>.
     * 
     * @return the URI
     */
    public String getServletUri() {
        return servletUri;
    }
    
    /**
     * Sets the URI of the containing servlet.
     * 
     * @param servletUri the servlet URI
     */
    void setServletUri(String servletUri) {
        this.servletUri = servletUri;
    }

    /**
     * @see javax.servlet.http.HttpSessionActivationListener#sessionDidActivate(javax.servlet.http.HttpSessionEvent)
     * 
     * Recreates reference to session.
     * Notifies <code>ApplicationInstance</code> of activation.
     */
    public synchronized void sessionDidActivate(HttpSessionEvent e) {
        session = e.getSession();
        Iterator it = idToUserInstance.values().iterator();
        while (it.hasNext()) {
            UserInstance userInstance = (UserInstance) it.next();
            if (userInstance.getApplicationInstance() != null) {
                userInstance.getApplicationInstance().activate();
            }
        }
    }

    /**
     * @see javax.servlet.http.HttpSessionActivationListener#sessionWillPassivate(javax.servlet.http.HttpSessionEvent)
     * 
     * Notifies <code>ApplicationInstance</code> of passivation.
     * Discards reference to session.
     */
    public synchronized void sessionWillPassivate(HttpSessionEvent e) {
        Iterator it = idToUserInstance.values().iterator();
        while (it.hasNext()) {
            UserInstance userInstance = (UserInstance) it.next();
            if (userInstance.getApplicationInstance() != null) {
                userInstance.getApplicationInstance().passivate();
            }
        }
        session = null;
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

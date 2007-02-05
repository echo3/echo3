package nextapp.echo.webcontainer;


import java.io.IOException;



/**
 * An interface for objects that process <code>Connection</code>s, parsing an
 * HTTP request and producing an HTTP response. <br>
 * <br>
 * Every service is identified by a unique identifier.  When the client 
 * browser makes a request of the server and provides the identifier of this 
 * service, its <code>service()</code> method will be invoked.  Every request 
 * to an Echo application from a client browser will invoke a service.  
 */
public interface Service {
    
    /**
     * A value returned by <code>getVersion()</code> to indicate that a
     * service should not be cached.
     */
    public static final int DO_NOT_CACHE = -1;
    
    /**
     * Returns the unique identifier of this service.
     * 
     * @return The unique identifier of this service.
     */
    public String getId();

    /**
     * Returns the version of the service to be retrieved.  When a service is
     * requested with an updated version number, a non-cached copy will be used.
     * <code>getVersion()</code> should return distinct values whenever the 
     * service's content may have changed.
     *
     * @return The current version number of the service.
     */
    public int getVersion();
    
    /**
     * Services an HTTP request.  Information about the HTTP request as well
     * as methods for issuing a response are available from the provided
     * Connection object.
     *
     * @param conn A <code>Connection</code> object which wraps 
     *        <code>HttpServletRequest</code> and 
     *        <code>HttpServletResponse</code> objects and provides
     *        access to the facilities of the Echo application container.
     * @throws IOException in the event of errors related to processing the
     *         HTTP request or producing a response.
     */
    public void service(Connection conn)
    throws IOException;
}

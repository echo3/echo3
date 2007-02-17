package nextapp.echo.webcontainer;

import nextapp.echo.app.update.ClientUpdateManager;
import nextapp.echo.app.xml.XmlContext;

public interface InputContext extends XmlContext {
    
    /**
     * Returns the <code>Connection</code> to which the
     * <code>ServerMessage</code> is being rendered.
     * 
     * @return the connection 
     */
    public Connection getConnection();
    
    /**
     * Returns the <code>UserInstance</code> for which the rendering
     * is being performed.
     * 
     * @return the <code>UserInstance</code>
     */
    public UserInstance getUserInstance();
    
    public ClientUpdateManager getClientUpdateManager();
    
    /**
     * Returns the <code>ClientMessage</code> from which input should be processed.
     * 
     * @return the <code>ClientMessage</code>
     */
    public ClientMessage getClientMessage();
}
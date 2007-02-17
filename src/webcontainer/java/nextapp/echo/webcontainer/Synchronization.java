package nextapp.echo.webcontainer;

import java.io.IOException;

import nextapp.echo.app.ApplicationInstance;

/**
 * A single client-server synchronziation.
 */
public class Synchronization {

    private Connection conn;

    public Synchronization(Connection conn) {
        super();
        this.conn = conn;
    }
    
    public void process() 
    throws IOException {
        final UserInstance userInstance = conn.getUserInstance();
        
        synchronized(userInstance) {
            boolean initRequired = !userInstance.isInitialized();
            
            if (initRequired) {
                // Initialize user instance.
                userInstance.init(conn);
            }

            ApplicationInstance.setActive(userInstance.getApplicationInstance());
            try {
                if (!initRequired) {
                    // Process client input.
                    InputProcessor inputProcessor = new InputProcessor(conn);
                    inputProcessor.process();
                }
                
                // Render updates.
                OutputProcessor outputProcessor = new OutputProcessor(conn);
                outputProcessor.process();
            } finally {
                ApplicationInstance.setActive(null);
            }
        }
    }
}

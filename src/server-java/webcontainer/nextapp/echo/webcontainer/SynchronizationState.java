package nextapp.echo.webcontainer;

/**
 * State information pertaining to a specific synchronization.
 */
public interface SynchronizationState {

    /**
     * Determines if this synchronization has been determined to have come from an out-of-sync client.
     * 
     * @return true if the client is out of sync.
     */
    public boolean isOutOfSync();
    
    /**
     * Flags this synchronization as having come from an out-of-sync client.
     */
    public void setOutOfSync();
}

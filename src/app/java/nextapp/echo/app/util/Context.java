package nextapp.echo.app.util;

/**
 * Generic context object.
 * Specific contexts are obtained by inovking <code>get()</code> method. 
 */
public interface Context {

    /**
     * Returns a specific context, if supported, or null otherwise.
     * 
     * @param specificContextClass the <code>Class</code> of the specific context to return.
     * @return the specific context
     */
    public Object get(Class specificContextClass);
}

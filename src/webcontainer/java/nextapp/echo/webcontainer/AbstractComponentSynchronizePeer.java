package nextapp.echo.webcontainer;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import nextapp.echo.app.Component;
import nextapp.echo.app.util.Context;

public abstract class AbstractComponentSynchronizePeer 
implements ComponentSynchronizePeer {

    private Set additionalProperties = null;
    
    private String clientComponentType;

    public AbstractComponentSynchronizePeer() {
        super();
        clientComponentType = getComponentClass().getName();
        if (clientComponentType.startsWith("nextapp.echo.app.")) {
            // Use relative class name automatically for nextapp.echo.app objects.
            int lastDot = clientComponentType.lastIndexOf(".");
            clientComponentType = clientComponentType.substring(lastDot + 1);
        }
    }
    
    public void addOutputProperty(String propertyName) {
        if (additionalProperties == null) {
            additionalProperties = new HashSet();
        }
        additionalProperties.add(propertyName);
    }

    /**
     * Default implementation: return full class name if component is not in core Echo package.
     * Return relative name for base Echo classes.
     * Overriding this method is not generally recommended, due to potential client namespace issues.
     * 
     * @see nextapp.echo.webcontainer.YeOldeComponentSynchronizePeer#getClientComponentType()
     */
    public String getClientComponentType() {
        return clientComponentType;
    }
    
    /**
     * Returns the (most basic) supported component class.
     * 
     * @return the (most basic) supported component class
     */
    public abstract Class getComponentClass();
    
    /**
     * Default implmentation: return an empty iterator.
     * 
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getImmediateEventTypes(Component)
     */
    public Iterator getImmediateEventTypes(Component component) {
        return Collections.EMPTY_SET.iterator();
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getOutputProperty(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName) {
        return component.getLocalStyle().getProperty(propertyName);
    }

    /**
     * Default implementation: return the names of all properties currently set in the 
     * component's local <code>Style</code>.
     * 
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getOutputPropertyNames(nextapp.echo.app.Component)
     */
    public Iterator getOutputPropertyNames(Component component) {
        final Iterator styleIterator = component.getLocalStyle().getPropertyNames();
        final Iterator additionalPropertyIterator 
                = additionalProperties == null ? null : additionalProperties.iterator();
        
        return new Iterator() {
        
            /**
             * @see java.util.Iterator#hasNext()
             */
            public boolean hasNext() {
                return styleIterator.hasNext() || 
                        (additionalPropertyIterator != null && additionalPropertyIterator.hasNext());
            }
        
            /**
             * @see java.util.Iterator#next()
             */
            public Object next() {
                if (styleIterator.hasNext()) {
                    return styleIterator.next();
                } else {
                    return additionalPropertyIterator.next(); 
                }
            }
        
            /**
             * @see java.util.Iterator#remove()
             */
            public void remove() {
                throw new UnsupportedOperationException();
            }
        };
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getPropertyClass(java.lang.String)
     */
    public Class getPropertyClass(String propertyName) {
        return null;
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(Context)
     */
    public void init(Context context) {
        // Do nothing.
    }

    /**
     * Default implementation: do nothing, accept no input properties.
     * 
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String, java.lang.Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, Object newValue) {
        // Do nothing.
    }
}

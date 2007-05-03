package nextapp.echo.webcontainer;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import nextapp.echo.app.Component;
import nextapp.echo.app.reflect.ComponentIntrospector;
import nextapp.echo.app.reflect.IntrospectorFactory;
import nextapp.echo.app.util.Context;

public abstract class AbstractComponentSynchronizePeer 
implements ComponentSynchronizePeer {

    private Set additionalProperties = null;
    private Set stylePropertyNames = null;
    private Set indexedPropertyNames = null;
    private String clientComponentType;

    public AbstractComponentSynchronizePeer() {
        super();
        clientComponentType = getComponentClass().getName();
        if (clientComponentType.startsWith("nextapp.echo.app.")) {
            // Use relative class name automatically for nextapp.echo.app objects.
            int lastDot = clientComponentType.lastIndexOf(".");
            clientComponentType = clientComponentType.substring(lastDot + 1);
        }
        
        try {
            stylePropertyNames = new HashSet();
            indexedPropertyNames = new HashSet();
            Class componentClass = getComponentClass();
            ComponentIntrospector ci = (ComponentIntrospector) IntrospectorFactory.get(componentClass.getName(),
                    componentClass.getClassLoader());
            Iterator propertyNameIt = ci.getPropertyNames();
            while (propertyNameIt.hasNext()) {
                String propertyName = (String) propertyNameIt.next();
                if (ci.getStyleConstantName(propertyName) != null) {
                    stylePropertyNames.add(propertyName);
                    if (ci.isIndexedProperty(propertyName)) {
                        indexedPropertyNames.add(propertyName);
                    }
                }
            }
        } catch (ClassNotFoundException ex) {
            // Should never occur.
            throw new RuntimeException("Internal error.", ex);
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
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType()
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
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getImmediateEventTypes(Context, Component)
     */
    public Iterator getImmediateEventTypes(Context context, Component component) {
        return Collections.EMPTY_SET.iterator();
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getOutputProperty(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.Component, java.lang.String)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (propertyIndex == -1) {
            return component.getLocalStyle().getProperty(propertyName);
        } else {
            return component.getLocalStyle().getIndexedProperty(propertyName, propertyIndex);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getOutputPropertyIndices(nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String)
     */
    public Iterator getOutputPropertyIndices(Context context, Component component, String propertyName) {
        return component.getLocalStyle().getPropertyIndices(propertyName);
    }
    
    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#hasOutputProperty(nextapp.echo.app.util.Context, 
     *      java.lang.String)
     */
    public boolean hasOutputProperty(Context context, String propertyName) {
        if (stylePropertyNames.contains(propertyName)) {
            return true;
        } else {
            return additionalProperties == null ? false : additionalProperties.contains(propertyName);
        }
    }

    /**
     * Default implementation: return the names of all properties currently set in the 
     * component's local <code>Style</code>.
     * 
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getOutputPropertyNames(Context, nextapp.echo.app.Component)
     */
    public Iterator getOutputPropertyNames(Context context, Component component) {
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
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#isIndexedProperty(nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String)
     */
    public boolean isOutputPropertyIndexed(Context context, Component component, String propertyName) {
        return indexedPropertyNames.contains(propertyName);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#storeInputProperty(nextapp.echo.app.util.Context, 
     *      nextapp.echo.app.Component, java.lang.String, int, java.lang.Object)
     */
    public void storeInputProperty(Context context, Component component, String propertyName, int index, Object newValue) {
        // Do nothing.
    }
}

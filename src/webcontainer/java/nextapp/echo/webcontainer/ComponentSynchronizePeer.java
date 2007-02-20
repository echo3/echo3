package nextapp.echo.webcontainer;

import java.util.Iterator;

import nextapp.echo.app.Component;
import nextapp.echo.app.util.Context;

public interface ComponentSynchronizePeer {
    
    public String getClientComponentType();
    
    public Class getComponentClass();
    
    public Class getPropertyClass(String propertyName);

    public Iterator getImmediateEventTypes(Component component);
    
    public Object getOutputProperty(Context context, Component component, String propertyName);
    
    public Iterator getOutputPropertyNames(Component component);
    
    public void init(Context context);
    
    public void storeInputProperty(Context context, Component component, String propertyName, Object newValue);
}

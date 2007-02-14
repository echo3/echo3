package nextapp.echo.webcontainer;

import java.util.Iterator;

import nextapp.echo.app.Component;

public interface ComponentSynchronizePeer {
    
    public String getClientComponentType();
    
    public Class getComponentClass();
    
    public Class getPropertyClass(String propertyName);

    public Iterator getImmediateEventTypes(Component component);
    
    public Object getOutputProperty(OutputContext context, Component component, String propertyName);
    
    public Iterator getOutputPropertyNames(Component component);
    
    public void init(OutputContext context);
    
    public void storeInputProperty(InputContext context, Component component, String propertyName, Object newValue);
}

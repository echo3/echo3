package nextapp.echo.webcontainer;

import nextapp.echo.app.util.Context;

import org.w3c.dom.Element;

public interface PropertySynchronizePeer {

    public Object toProperty(Context context, Class objectClass, Element propertyElement);
    
    /**
     * The provided <code>Context</code> will contain the following child contexts:
     * <ul>
     *  <li>OutputContext</li>
     *  <li>XmlContxt</li>
     * </ul>
     * 
     * @param context contextual information
     * @param objectClass
     * @param propertyElement
     * @param propertyValue
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue);
}

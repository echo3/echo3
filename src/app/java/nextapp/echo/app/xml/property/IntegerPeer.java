package nextapp.echo.app.xml.property;

import nextapp.echo.app.xml.ComponentIntrospector;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

import org.w3c.dom.Element;

public class IntegerPeer 
implements XmlPropertyPeer {
    
    /**
     * @param classLoader the <code>ClassLoader</code> to use for introspection
     * @param objectClass the <code>Class</code> of object containing candidate 
     *        constant values
     * @param value the name of the constant value
     * @return an integer representing the constant value, or null if the 
     *         constant is not found.
     */
    public Integer introspectConstantValue(ClassLoader classLoader, Class objectClass, String value) 
    throws XmlException {
        try {
            ComponentIntrospector ci = ComponentIntrospector.forName(objectClass.getName(), classLoader);
            if (value.startsWith(objectClass.getName())) {
                // Remove class name if required.
                value = value.substring(objectClass.getName().length() + 1);
            }
            Object constantValue = ci.getConstantValue(value);
            if (constantValue instanceof Integer) {
                return (Integer) constantValue;
            } else {
                return null;
            }
        } catch (ClassNotFoundException ex) {
            // Should not occur.
            throw new XmlException("Object class not found.", ex);  
        }
    }

    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) 
    throws XmlException {
        String valueText = propertyElement.getAttribute("v");
        try {
            return new Integer(valueText);
        } catch (NumberFormatException ex) {
            return introspectConstantValue(context.getClassLoader(), objectClass, valueText);
        }
    }

    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "i");
        propertyElement.setAttribute("v", propertyValue.toString());
    }
}

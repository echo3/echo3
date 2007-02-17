package nextapp.echo.app.xml.property;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Iterator;

import org.w3c.dom.Element;

import nextapp.echo.app.LayoutData;
import nextapp.echo.app.Style;
import nextapp.echo.app.xml.ComponentIntrospector;
import nextapp.echo.app.xml.Serializer;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class LayoutDataPeer 
implements XmlPropertyPeer {
    
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) 
    throws XmlException {        
        try {
            String type = propertyElement.getAttribute("t");

            // Load properties from XML into Style.
            Serializer serializer = context.getSerializer();
            Style propertyStyle = serializer.loadStyle(type, propertyElement);
            
            // Instantiate LayoutData instance.
            Class propertyClass = Class.forName(type, true, context.getClassLoader());
            LayoutData layoutData = (LayoutData) propertyClass.newInstance();
            
            // Create introspector to analyze LayoutData class.
            ComponentIntrospector ci = ComponentIntrospector.forName(type, context.getClassLoader());
            
            // Set property values of LayoutData instance.
            Iterator it = propertyStyle.getPropertyNames();
            while (it.hasNext()) {
                String propertyName = (String) it.next();
                Method writeMethod = ci.getWriteMethod(propertyName);
                writeMethod.invoke(layoutData, new Object[]{propertyStyle.getProperty(propertyName)});
            }
            
            return layoutData;
        } catch (ClassNotFoundException ex) {
            throw new XmlException("Unable to process properties.", ex);
        } catch (XmlException ex) {
            throw new XmlException("Unable to process properties.", ex);
        } catch (InstantiationException ex) {
            throw new XmlException("Unable to process properties.", ex);
        } catch (IllegalAccessException ex) {
            throw new XmlException("Unable to process properties.", ex);
        } catch (IllegalArgumentException ex) {
            throw new XmlException("Unable to process properties.", ex);
        } catch (InvocationTargetException ex) {
            throw new XmlException("Unable to process properties.", ex);
        }
    }

    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        //TODO. Implement
    }
}

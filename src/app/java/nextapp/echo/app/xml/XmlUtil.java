package nextapp.echo.app.xml;

import org.w3c.dom.Element;

public class XmlUtil {
    
    //FIXME. this class needs a better name.

    public static void toXml(XmlContext context, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) {
        if (propertyValue != null) {
            Element childPropertyElement = context.getDocument().createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            XmlPeerFactory factory = XmlPeerFactory.forClassLoader(context.getClassLoader());
            factory.getPeerForProperty(propertyValue.getClass())
                    .toXml(context, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}

package nextapp.echo.app.xml;

import org.w3c.dom.Element;
import nextapp.echo.app.util.Context;

public class XmlUtil {
    
    //FIXME. this class needs a better name.

    public static void toXml(Context context, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) {
        if (propertyValue != null) {
            XmlContext xmlContext = (XmlContext) context.get(XmlContext.class);
            Element childPropertyElement = xmlContext.getDocument().createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            XmlPeerFactory factory = XmlPeerFactory.forClassLoader(xmlContext.getClassLoader());
            factory.getPeerForProperty(propertyValue.getClass())
                    .toXml(context, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}

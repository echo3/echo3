package nextapp.echo.webcontainer.sync;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.webcontainer.PropertySerialPeerFactory;

public class SyncUtil {

    public static void toXml(Context context, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) {
        if (propertyValue != null) {
            XmlContext xmlContext = (XmlContext) context.get(XmlContext.class);
            Document document = xmlContext.getDocument();       
            Element childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            
            PropertySerialPeerFactory propertyPeerFactory = (PropertySerialPeerFactory) context.get(PropertySerialPeerFactory.class);
            
            propertyPeerFactory.getPeerForProperty(propertyValue.getClass())
                    .toXml(context, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}

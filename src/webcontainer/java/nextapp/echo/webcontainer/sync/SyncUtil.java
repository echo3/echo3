package nextapp.echo.webcontainer.sync;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.SynchronizePeerFactory;

public class SyncUtil {

    public static void toXml(OutputContext out, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) {
        if (propertyValue != null) {
            Document document = out.getServerMessage().getDocument();       
            Element childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            SynchronizePeerFactory.getPeerForProperty(propertyValue.getClass())
                    .toXml(out, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}

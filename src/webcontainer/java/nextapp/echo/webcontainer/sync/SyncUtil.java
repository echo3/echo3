package nextapp.echo.webcontainer.sync;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.SynchronizePeerFactory;

public class SyncUtil {

    public static void toXml(Context context, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) {
        if (propertyValue != null) {
            OutputContext outputContext = (OutputContext) context.get(OutputContext.class);
            Document document = outputContext.getDocument();       
            Element childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            SynchronizePeerFactory.getPeerForProperty(propertyValue.getClass())
                    .toXml(context, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}

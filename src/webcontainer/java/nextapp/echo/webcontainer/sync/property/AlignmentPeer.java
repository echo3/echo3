package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class AlignmentPeer 
implements PropertySynchronizePeer {
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        //TODO. Implement.
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) {
        XmlContext xmlContext = (XmlContext) context.get(XmlContext.class);
        propertyElement.setAttribute("t", "Alignment");
        Alignment alignment = (Alignment) propertyValue;
        Element element = xmlContext.getDocument().createElement("a");
        switch (alignment.getHorizontal()) {
        case Alignment.LEADING:  element.setAttribute("h", "leading");  break;
        case Alignment.TRAILING: element.setAttribute("h", "trailing"); break;
        case Alignment.LEFT:     element.setAttribute("h", "left");     break;
        case Alignment.CENTER:   element.setAttribute("h", "center");   break;
        case Alignment.RIGHT:    element.setAttribute("h", "right");    break;
        }
        switch (alignment.getVertical()) {
        case Alignment.TOP:      element.setAttribute("v", "top");      break;
        case Alignment.CENTER:   element.setAttribute("v", "center");   break;
        case Alignment.BOTTOM:   element.setAttribute("v", "bottom");  break;
        }
        propertyElement.appendChild(element);
    }
}

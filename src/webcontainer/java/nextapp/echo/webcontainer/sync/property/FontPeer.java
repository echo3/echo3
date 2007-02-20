package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class FontPeer 
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
        OutputContext outputContext = (OutputContext) context.get(OutputContext.class);
        propertyElement.setAttribute("t", "Font");
        Font font = (Font) propertyValue;
        Element element = outputContext.getDocument().createElement("f");
        
        Font.Typeface typeface = font.getTypeface();
        while (typeface != null) {
            Element tfElement = outputContext.getDocument().createElement("tf");
            tfElement.setAttribute("n", typeface.getName());
            element.appendChild(tfElement);
            typeface = typeface.getAlternate();
        }
        
        Extent size = font.getSize();
        if (size != null) {
            element.setAttribute("sz", ExtentPeer.toString(size));
        }
        
        if (!font.isPlain()) {
            if (font.isBold()) {
                element.setAttribute("bo", "1");
            }
            if (font.isItalic()) {
                element.setAttribute("it", "1");
            }
            if (font.isUnderline()) {
                element.setAttribute("un", "1");
            }
            if (font.isOverline()) {
                element.setAttribute("ov", "1");
            }
            if (font.isLineThrough()) {
                element.setAttribute("lt", "1");
            }
        }
        propertyElement.appendChild(element);
    }
}

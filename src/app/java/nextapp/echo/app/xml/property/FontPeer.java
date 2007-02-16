package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.Font;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class FontPeer 
implements XmlPropertyPeer {
    
    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext,
     *      org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        // TODO. Implement.
        return null;
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Font");
        Font font = (Font) propertyValue;
        Element element = context.getDocument().createElement("f");
        
        Font.Typeface typeface = font.getTypeface();
        while (typeface != null) {
            Element tfElement = context.getDocument().createElement("tf");
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

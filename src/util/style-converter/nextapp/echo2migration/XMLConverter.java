package nextapp.echo2migration;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.regex.Pattern;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Converts Echo2 XML stylesheets/property data to the Echo3 format.
 * 
 * @author n.beekman
 */
public class XMLConverter {
    
    public static class Context {
        
        Document source;
        Document target;
        
        public Context(Document source, Document target) {
            super();
            this.source = source;
            this.target = target;
        }
        
        public Document getSourceDocument() {
            return source;
        }
        
        public Document getTargetDocument() {
            return target;
        }
    }
    
    private static final Pattern CONSTANT_PATTERN = Pattern.compile("(.*?\\.)?[A-Z_]+");

    private static final Map FILL_IMAGE_BORDER_MAP; 
    
    private static final Map PROPERTY_NAME_MAP;
    private static final Map TYPE_MAP;

    static {
        TYPE_MAP = new HashMap();
        TYPE_MAP.put("boolean", "b");
        TYPE_MAP.put("int", "i");
        TYPE_MAP.put("java.lang.Boolean", "b");
        TYPE_MAP.put("java.lang.Integer", "i");
        TYPE_MAP.put("java.lang.String", "s");
        
        FILL_IMAGE_BORDER_MAP = new HashMap();
        FILL_IMAGE_BORDER_MAP.put("top-left", new Integer(0));
        FILL_IMAGE_BORDER_MAP.put("top", new Integer(1));
        FILL_IMAGE_BORDER_MAP.put("top-right", new Integer(2));
        FILL_IMAGE_BORDER_MAP.put("left", new Integer(3));
        FILL_IMAGE_BORDER_MAP.put("right", new Integer(4));
        FILL_IMAGE_BORDER_MAP.put("bottom-left", new Integer(5));
        FILL_IMAGE_BORDER_MAP.put("bottom", new Integer(6));
        FILL_IMAGE_BORDER_MAP.put("bottom-right", new Integer(7));
        
        PROPERTY_NAME_MAP = new HashMap();
        PROPERTY_NAME_MAP.put("nextapp.echo2.extras.webcontainer.BorderPanePeer.ieAlphaRenderBorder", "ieAlphaRenderBorder");
        PROPERTY_NAME_MAP.put("nextapp.echo2.webcontainer.syncpeer.WindowPanePeer.ieAlphaRenderBorder", "ieAlphaRenderBorder");
        PROPERTY_NAME_MAP.put("nextapp.echo2.extras.webcontainer.TabPanePeer.lazyRenderEnabled", "lazyRenderEnabled");
        PROPERTY_NAME_MAP.put("nextapp.echo2.extras.webcontainer.AccordionPanePeer.lazyRenderEnabled", "lazyRenderEnabled");
    }

    private static void checkResourceExists(String resource) {
        if (XMLConverter.class.getResource(resource) == null) {
            Util.logWarning("Could not find resource: " + resource + " on the classpath");
        }
    }

    private static void convertAlignment(Context context, Element oldAlignment, Element property) {
        property.setAttribute("t", "Alignment");
        Element aElement = context.target.createElement("a");
        if (oldAlignment.hasAttribute("horizontal")) {
            aElement.setAttribute("h", oldAlignment.getAttribute("horizontal"));
        }
        if (oldAlignment.hasAttribute("vertical")) {
            aElement.setAttribute("v", oldAlignment.getAttribute("vertical"));
        }
        property.appendChild(aElement);
    }

    private static void convertBorder(Context context, Element oldBorder, Element property) {
        String size = oldBorder.getAttribute("size");
        if (size == null || size.length() == 0) {
            Util.logWarning("Size missing, defaulting to 1px");
            size = "1px";
        }
        String color = oldBorder.getAttribute("color");
        if (color == null || color.length() == 0) {
            Util.logWarning("Color missing, defaulting to black");
            color = "#000000";
        }
        String style = oldBorder.getAttribute("style");
        if (style == null || style.length() == 0) {
            style = "none";
        }
        property.setAttribute("t", "Border");
        property.appendChild(context.target.createTextNode(size + " " + style + " " + color));
    }

    private static Node convertFillImage(Context context, Element oldFillImage) {
        Element fillImage = context.target.createElement("fi");
        if (oldFillImage.hasAttribute("horizontal")) {
            fillImage.setAttribute("x", oldFillImage.getAttribute("horizontal"));
        }
        if (oldFillImage.hasAttribute("vertical")) {
            fillImage.setAttribute("y", oldFillImage.getAttribute("vertical"));
        }
        String repeat = oldFillImage.getAttribute("repeat");
        if ("horizontal".equals(repeat)) {
            repeat = "x";
        } else if ("vertical".equals(repeat)) {
            repeat = "y";
        } else if ("none".equals(repeat)) {
            repeat = "0";
        } else {
            repeat = null;
        }
        if (repeat != null) {
            fillImage.setAttribute("r", repeat);
        }
        NodeList childNodes = oldFillImage.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("image".equals(childNode.getNodeName())) {
                Element oldImage = DomUtil.getChildElementByTagName(oldFillImage, "image");
                String imageType = oldImage.getAttribute("type");
                if ("nextapp.echo2.app.ResourceImageReference".equals(imageType)) {
                    imageType = "r";
                } else {
                    Util.logWarning("Encountered image type " + imageType + ", assuming subclass of ResourceImageReference");
                }
                fillImage.setAttribute("t", imageType);
                fillImage.appendChild(convertResourceImage(context, oldImage));
            } else {
                fillImage.appendChild(context.target.importNode(childNode, true));
            }
        }
        return fillImage;
    }

    private static Node convertFillImageBorder(Context context, Element oldFillImageBorder) {
        Element fillImageBorder = context.target.createElement("fib");
        if (oldFillImageBorder.hasAttribute("content-insets")) {
            fillImageBorder.setAttribute("ci", convertInsets(context, oldFillImageBorder.getAttribute("content-insets")));
        }
        if (oldFillImageBorder.hasAttribute("border-insets")) {
            fillImageBorder.setAttribute("bi", convertInsets(context, oldFillImageBorder.getAttribute("border-insets")));
        }
        if (oldFillImageBorder.hasAttribute("color")) {
            fillImageBorder.setAttribute("bc", oldFillImageBorder.getAttribute("color"));
        }
        NodeList childNodes = oldFillImageBorder.getChildNodes();
        SortedMap fillImages = new TreeMap();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("border-part".equals(childNode.getNodeName())) {
                String position = ((Element)childNode).getAttribute("position");
                fillImages.put(FILL_IMAGE_BORDER_MAP.get(position), 
                        convertFillImage(context, DomUtil.getChildElementByTagName((Element)childNode, "fill-image")));
            }
        }
        // add null elements for missing images
        for (int i = 0; i < 8; i++) {
            if (!fillImages.containsKey(new Integer(i))) {
                fillImages.put(new Integer(i), context.target.createElement("null-fi"));
            }
        }
        int positionCounter = 0;
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("border-part".equals(childNode.getNodeName())) {
                fillImageBorder.appendChild((Node)fillImages.get(new Integer(positionCounter)));
                positionCounter++;
            } else {
                fillImageBorder.appendChild(context.target.importNode(childNode, true));
            }
        }
        for (int i = positionCounter; i < 8; i++) {
            fillImageBorder.appendChild((Node)fillImages.get(new Integer(i)));
        }
        return fillImageBorder;
    }
    
    private static void convertFont(Context context, Element oldFont, Element property) {
        property.setAttribute("t", "Font");
        Element fontElement = context.target.createElement("f");
        if (oldFont.hasAttribute("size")) {
            fontElement.setAttribute("sz", oldFont.getAttribute("size"));
        }
        if ("true".equals(oldFont.getAttribute("bold"))) {
            fontElement.setAttribute("bo", "1");
        }
        if ("true".equals(oldFont.getAttribute("italic"))) {
            fontElement.setAttribute("it", "1");
        }
        if ("true".equals(oldFont.getAttribute("underline"))) {
            fontElement.setAttribute("un", "1");
        }
        if ("true".equals(oldFont.getAttribute("overline"))) {
            fontElement.setAttribute("ov", "1");
        }
        if ("true".equals(oldFont.getAttribute("line-through"))) {
            fontElement.setAttribute("lt", "1");
        }
        List typefaces = new ArrayList();
        if (oldFont.hasAttribute("typeface")) {
            String typeface = Util.stripWhitespace(oldFont.getAttribute("typeface"));
            // specifying multiple typefaces using commas is not really allowed, but just in case
            if (typeface.indexOf(", ") != -1) {
                typefaces.addAll(Arrays.asList(typeface.split(", ")));
            } else if (typeface.indexOf(",") != -1) {
                typefaces.addAll(Arrays.asList(typeface.split(",")));
            } else {
                typefaces.add(typeface);
            }
        } else {
            NodeList childNodes = oldFont.getChildNodes();
            for (int i = 0; i < childNodes.getLength(); i++) {
                Node childNode = childNodes.item(i);
                if ("typeface".equals(childNode.getNodeName())) {
                    typefaces.add(((Element)childNode).getAttribute("name"));
                } else {
                    fontElement.appendChild(context.target.importNode(childNode, true));
                }
            }
        }
        for (int i = 0; i < typefaces.size(); i++) {
            Element tfElement = context.target.createElement("tf");
            tfElement.appendChild(context.target.createTextNode((String) typefaces.get(i)));
            fontElement.appendChild(tfElement);
        }
        property.appendChild(fontElement);
    }
    
    private static String convertInsets(Context context, String oldInsets) {
        oldInsets = Util.stripWhitespace(oldInsets);
        String[] extents = oldInsets.split(" ");
        switch (extents.length) {
        case 1:
            return oldInsets;
        case 2:
            return extents[1] + " " + extents[0];
        case 4:
            return extents[1] + " " + extents[2] + " " + extents[3] + " " + extents[0];
        }
        Util.logError("Insets could not be parsed: " + oldInsets + ", defaulting to 0px");
        return "0px";
    }

    private static void convertLayoutData(Context context, Element oldLayoutData, Element property) {
        property.setAttribute("t", oldLayoutData.getAttribute("type").replaceFirst("echo2", "echo"));
        NodeList childNodes = oldLayoutData.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("properties".equals(childNode.getNodeName())) {
                List propertyNodes = convertProperties(context, childNode);
                for (int j = 0; j < propertyNodes.size(); j++) {
                    property.appendChild((Node) propertyNodes.get(j));
                }
            } else if ("property".equals(childNode.getNodeName())) {
                Util.logWarning("Illegal location of property element, skipped");
            } else {
                property.appendChild(context.target.importNode(childNode, true));
            }
        }
    }

    private static Element convertNestedProperty(Context context, Element oldProperty) {
        Element property = context.target.createElement("p");
        property.setAttribute("n", oldProperty.getAttribute("name"));
        NodeList childNodes = oldProperty.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("border".equals(childNode.getNodeName())) {
                convertBorder(context, (Element) childNode, property);
            } else if ("fill-image-border".equals(childNode.getNodeName())) {
                property.setAttribute("t", "FillImageBorder");
                property.appendChild(convertFillImageBorder(context, (Element)childNode));
            } else if ("fill-image".equals(childNode.getNodeName())) {
                property.setAttribute("t", "FillImage");
                property.appendChild(convertFillImage(context, (Element)childNode));
            } else if ("resource-image-reference".equals(childNode.getNodeName())) {
                property.setAttribute("t", "ResourceImageReference");
                property.appendChild(convertResourceImageReference(context, (Element)childNode));
            } else if ("layout-data".equals(childNode.getNodeName())) {
                convertLayoutData(context, (Element) childNode, property);
            } else if ("alignment".equals(childNode.getNodeName())) {
                convertAlignment(context, (Element) childNode, property);
            } else if ("font".equals(childNode.getNodeName())) {
                convertFont(context, (Element) childNode, property);
            } else {
                property.appendChild(context.target.importNode(childNode, true));
            }
        }
        return property;
    }

    private static List convertProperties(Context context, Node oldProperties) {
        Util.logOutput("Converting properties");
        
        List properties = new ArrayList();
        NodeList propChildNodes = oldProperties.getChildNodes();
        for (int i = 0; i < propChildNodes.getLength(); i++) {
            Node propChildNode = propChildNodes.item(i);
            if ("property".equals(propChildNode.getNodeName())) {
                Node property = convertProperty(context, (Element) propChildNode);
                if (property == null) {
                    continue;
                }
                properties.add(property);
            } else {
                properties.add(context.target.importNode(propChildNode, true));
            }
        }
        return properties;
    }
    
    private static Node convertProperty(Context context, Element oldProperty) {
        if (oldProperty.hasAttribute("name")) {
            Util.logOutput("Converting property: " + oldProperty.getAttribute("name"));
            Element property;
            if (oldProperty.hasAttribute("value")) {
                property = convertSimpleProperty(context, oldProperty);
            } else {
                property = convertNestedProperty(context, oldProperty);
            }
            if (oldProperty.hasAttribute("position")) {
                property.setAttribute("x", oldProperty.getAttribute("position"));
            }
            return property;
        } else { 
            Util.logWarning("Encountered property without name, skipped");
            return null;
        }
    }

    private static Node convertResourceImage(Context context, Element oldImage) {
        if (oldImage.hasAttribute("value")) {
            Element image = context.target.createElement("i");
            String resource = oldImage.getAttribute("value");
            checkResourceExists(resource);
            image.setAttribute("r", resource);
            return image;
        } else {
            Element oldReference = DomUtil.getChildElementByTagName(oldImage, "resource-image-reference");
            return convertResourceImageReference(context, oldReference);
        }
    }
    
    private static Node convertResourceImageReference(Context context, Element oldImageReference) {
        Element image = context.target.createElement("i");
        String resource = oldImageReference.getAttribute("resource");
        if (oldImageReference.hasAttribute("content-type")) {
            image.setAttribute("t", oldImageReference.getAttribute("content-type"));
        }
        if (oldImageReference.hasAttribute("width")) {
            image.setAttribute("w", oldImageReference.getAttribute("width"));
        }
        if (oldImageReference.hasAttribute("height")) {
            image.setAttribute("h", oldImageReference.getAttribute("height"));
        }
        checkResourceExists(resource);
        image.setAttribute("r", resource);
        return image;
    }

    private static Element convertSimpleProperty(Context context, Element oldProperty) {
        Element property = context.target.createElement("p");
        String name = oldProperty.getAttribute("name");
        String value = oldProperty.getAttribute("value");
        if (PROPERTY_NAME_MAP.containsKey(name)) {
            name = (String) PROPERTY_NAME_MAP.get(name);
        }
        boolean renderValueAsContent = false;
        String type = null;
        if (oldProperty.hasAttribute("type")) {
            type = oldProperty.getAttribute("type");
            if (TYPE_MAP.containsKey(type)) {
                type = (String) TYPE_MAP.get(type);
            } else {
                // framework type
                type = type.replaceFirst("nextapp.echo2.app", "");
            }
        } else if (value.length() == 7 && value.startsWith("#")) {
            type = "Color";
            renderValueAsContent = true;
        } else if (CONSTANT_PATTERN.matcher(value).matches()) {
            // constant
            value = value.replaceFirst("echo2", "echo");
            type = "i";
            renderValueAsContent = true;
        }
        if ("Insets".equals(type) || name.equals("insets") || name.endsWith("Insets") 
                || name.equals("outsets") || name.endsWith("Outsets")) {
            value = convertInsets(context, value);
            if (type == null) {
                renderValueAsContent = true;
                type = "Insets";
            }
        } else if (type == null && (name.equals("width") || name.endsWith("Width") 
                || name.equals("height") || name.endsWith("Height") || name.endsWith("Position") 
                || name.endsWith("Spacing") || name.endsWith("Size") || name.endsWith("X") 
                || name.endsWith("Y") || name.endsWith("Margin"))) {
            type = "Extent";
            renderValueAsContent = true;
        } else if ("true".equalsIgnoreCase(value)) {
            if (type == null) {
                renderValueAsContent = true;
                type = "b";
            }
        } else if ("false".equalsIgnoreCase(value)) {
            if (type == null) {
                renderValueAsContent = true;
                type = "b";
            }
        } else if (type == null && Pattern.matches("\\d+", value)) {
            Util.logWarning("Type missing for property: " + name + ", defaulting to integer");
            renderValueAsContent = true;
            type = "i";
        }
        property.setAttribute("n", name);
        if (type != null) {
            property.setAttribute("t", type);
        } else {
            Util.logWarning("Could not determine type of property: " + name + (value == null ? "" : ", value: " + value));
        }
        if (renderValueAsContent) {
            property.appendChild(context.target.createTextNode(value));
        } else {
            property.setAttribute("v", value);
        }
        return property;
    }

    public static Node convertStyle(Context context, Element oldStyle) {
        Util.logOutput("Converting style: " + oldStyle.getAttribute("name"));
        
        Element style = context.target.createElement("s");
        style.setAttribute("n", oldStyle.getAttribute("name"));
        if (oldStyle.hasAttribute("base-name")) {
            style.setAttribute("b", oldStyle.getAttribute("base-name"));
        }
        if (oldStyle.hasAttribute("type")) {
            style.setAttribute("t", oldStyle.getAttribute("type").replaceFirst("echo2", "echo"));
        }
        NodeList childNodes = oldStyle.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("properties".equals(childNode.getNodeName())) {
                List propertyNodes = convertProperties(context, childNode);
                for (int j = 0; j < propertyNodes.size(); j++) {
                    style.appendChild((Node)propertyNodes.get(j));
                }
            } else if ("property".equals(childNode.getNodeName())) {
                Util.logWarning("Illegal location of property element, skipped");
            } else {
                style.appendChild(context.target.importNode(childNode, true));
            }
        }
        return style;
    }
}

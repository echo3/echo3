/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.app.serial;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Converts Echo2 XML stylesheets to the latest format.
 * 
 * @author n.beekman
 */
public class Echo2StyleSheetConverter {
    
    private static final Pattern CONSTANT_PATTERN = Pattern.compile("(.*?\\.)?[A-Z_]+");

    private static final Map TYPE_MAP;
    private static final Map FILL_IMAGE_BORDER_MAP;
    private static final Map PROPERTY_NAME_MAP;
    
    private static final boolean LOG_ENABLED = true; 

    private Document inputDoc;
    private Document outputDoc;

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
    
    public static void main(String[] args) {
        if (args == null || args.length != 2) {
            System.out.println("Usage: Echo2StyleSheetConverter [inputFileName] [outputFileName]");
            return;
        }
        File input = new File(args[0]);
        if (!input.exists()) {
            logError("Could not find input file: " + args[0]);
            return;
        }
        File output = new File(args[1]);
        if (output.exists()) {
            logError("Output file already exists: " + args[1]);
            return;
        }
        Echo2StyleSheetConverter converter = new Echo2StyleSheetConverter();
        try {
            converter.initialize(input);
            converter.convert();
            converter.write(output);
        } catch (Exception e) {
            logError("Conversion failed", e);
        }
    }
    
    private void initialize(File input) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        
        inputDoc = builder.parse(input);
        outputDoc = builder.newDocument();
    }
    
    private void write(File output) throws TransformerException {
        TransformerFactory tFactory = DomUtil.getTransformerFactory();
        Transformer transformer = tFactory.newTransformer();
        transformer.setOutputProperties(DomUtil.OUTPUT_PROPERTIES_INDENT);
        DOMSource source = new DOMSource(outputDoc);
        transformer.transform(source, new StreamResult(output));
    }
    
    private void convert() throws IOException {
        logOutput("Starting stylesheet conversion");
        
        Element styleSheet = outputDoc.createElement("ss");
        outputDoc.appendChild(styleSheet);
        
        NodeList childNodes = inputDoc.getDocumentElement().getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("style".equals(childNode.getNodeName())) {
                styleSheet.appendChild(convertStyle((Element)childNode));
            } else {
                styleSheet.appendChild(outputDoc.importNode(childNode, true));
            }
        }
    }

    private Node convertStyle(Element oldStyle) {
        logOutput("Converting style: " + oldStyle.getAttribute("name"));
        
        Element style = outputDoc.createElement("s");
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
                List propertyNodes = convertProperties(childNode);
                for (int j = 0; j < propertyNodes.size(); j++) {
                    style.appendChild((Node)propertyNodes.get(j));
                }
            } else if ("property".equals(childNode.getNodeName())) {
                logWarning("Illegal location of property element, skipped");
            } else {
                style.appendChild(outputDoc.importNode(childNode, true));
            }
        }
        return style;
    }

    private List convertProperties(Node oldProperties) {
        logOutput("Converting properties");
        
        List properties = new ArrayList();
        NodeList propChildNodes = oldProperties.getChildNodes();
        for (int i = 0; i < propChildNodes.getLength(); i++) {
            Node propChildNode = propChildNodes.item(i);
            if ("property".equals(propChildNode.getNodeName())) {
                Node property = convertProperty((Element)propChildNode);
                if (property == null) {
                    continue;
                }
                properties.add(property);
            } else {
                properties.add(outputDoc.importNode(propChildNode, true));
            }
        }
        return properties;
    }

    private Node convertProperty(Element oldProperty) {
        if (oldProperty.hasAttribute("name")) {
            logOutput("Converting property: " + oldProperty.getAttribute("name"));
            Element property;
            if (oldProperty.hasAttribute("value")) {
                property = convertSimpleProperty(oldProperty);
            } else {
                property = convertNestedProperty(oldProperty);
            }
            if (oldProperty.hasAttribute("position")) {
                property.setAttribute("x", oldProperty.getAttribute("position"));
            }
            return property;
        } else { 
            logWarning("Encountered property without name, skipped");
            return null;
        }
    }
    
    private Element convertSimpleProperty(Element oldProperty) {
        Element property = outputDoc.createElement("p");
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
            value = convertInsets(value);
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
            logWarning("Type missing for property: " + name + ", defaulting to integer");
            renderValueAsContent = true;
            type = "i";
        }
        property.setAttribute("n", name);
        if (type != null) {
            property.setAttribute("t", type);
        } else {
            logWarning("Could not determine type of property: " + name + (value == null ? "" : ", value: " + value));
        }
        if (renderValueAsContent) {
            property.appendChild(outputDoc.createTextNode(value));
        } else {
            property.setAttribute("v", value);
        }
        return property;
    }
    
    private Element convertNestedProperty(Element oldProperty) {
        Element property = outputDoc.createElement("p");
        property.setAttribute("n", oldProperty.getAttribute("name"));
        NodeList childNodes = oldProperty.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("border".equals(childNode.getNodeName())) {
                convertBorder((Element)childNode, property);
            } else if ("fill-image-border".equals(childNode.getNodeName())) {
                property.setAttribute("t", "FillImageBorder");
                property.appendChild(convertFillImageBorder((Element)childNode));
            } else if ("fill-image".equals(childNode.getNodeName())) {
                property.setAttribute("t", "FillImage");
                property.appendChild(convertFillImage((Element)childNode));
            } else if ("resource-image-reference".equals(childNode.getNodeName())) {
                property.setAttribute("t", "ResourceImageReference");
                property.appendChild(convertResourceImageReference((Element)childNode));
            } else if ("layout-data".equals(childNode.getNodeName())) {
                convertLayoutData((Element)childNode, property);
            } else if ("alignment".equals(childNode.getNodeName())) {
                convertAlignment((Element)childNode, property);
            } else if ("font".equals(childNode.getNodeName())) {
                convertFont((Element)childNode, property);
            } else {
                property.appendChild(outputDoc.importNode(childNode, true));
            }
        }
        return property;
    }

    
    private void convertFont(Element oldFont, Element property) {
        property.setAttribute("t", "Font");
        Element fontElement = outputDoc.createElement("f");
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
            String typeface = stripWhitespace(oldFont.getAttribute("typeface"));
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
                    fontElement.appendChild(outputDoc.importNode(childNode, true));
                }
            }
        }
        for (int i = 0; i < typefaces.size(); i++) {
            Element tfElement = outputDoc.createElement("tf");
            tfElement.setAttribute("n", (String)typefaces.get(i));
            fontElement.appendChild(tfElement);
        }
        property.appendChild(fontElement);
    }

    private void convertAlignment(Element oldAlignment, Element property) {
        property.setAttribute("t", "Alignment");
        Element aElement = outputDoc.createElement("a");
        if (oldAlignment.hasAttribute("horizontal")) {
            aElement.setAttribute("h", oldAlignment.getAttribute("horizontal"));
        }
        if (oldAlignment.hasAttribute("vertical")) {
            aElement.setAttribute("v", oldAlignment.getAttribute("vertical"));
        }
        property.appendChild(aElement);
    }

    private void convertBorder(Element oldBorder, Element property) {
        String size = oldBorder.getAttribute("size");
        if (size == null || size.length() == 0) {
            logWarning("Size missing, defaulting to 1px");
            size = "1px";
        }
        String color = oldBorder.getAttribute("color");
        if (color == null || color.length() == 0) {
            logWarning("Color missing, defaulting to black");
            color = "#000000";
        }
        String style = oldBorder.getAttribute("style");
        if (style == null || style.length() == 0) {
            style = "none";
        }
        property.setAttribute("t", "Border");
        property.appendChild(outputDoc.createTextNode(size + " " + style + " " + color));
    }

    private void convertLayoutData(Element oldLayoutData, Element property) {
        property.setAttribute("t", oldLayoutData.getAttribute("type").replaceFirst("echo2", "echo"));
        NodeList childNodes = oldLayoutData.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("properties".equals(childNode.getNodeName())) {
                List propertyNodes = convertProperties(childNode);
                for (int j = 0; j < propertyNodes.size(); j++) {
                    property.appendChild((Node) propertyNodes.get(j));
                }
            } else if ("property".equals(childNode.getNodeName())) {
                logWarning("Illegal location of property element, skipped");
            } else {
                property.appendChild(outputDoc.importNode(childNode, true));
            }
        }
    }

    private Node convertFillImage(Element oldFillImage) {
        Element fillImage = outputDoc.createElement("fi");
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
                    logWarning("Encountered image type " + imageType + ", assuming subclass of ResourceImageReference");
                }
                fillImage.setAttribute("t", imageType);
                fillImage.appendChild(convertResourceImage(oldImage));
            } else {
                fillImage.appendChild(outputDoc.importNode(childNode, true));
            }
        }
        return fillImage;
    }

    private Node convertResourceImage(Element oldImage) {
        if (oldImage.hasAttribute("value")) {
            Element image = outputDoc.createElement("i");
            String resource = oldImage.getAttribute("value");
            checkResourceExists(resource);
            image.setAttribute("r", resource);
            return image;
        } else {
            Element oldReference = DomUtil.getChildElementByTagName(oldImage, "resource-image-reference");
            return convertResourceImageReference(oldReference);
        }
    }

    private void checkResourceExists(String resource) {
        if (getClass().getResource(resource) == null) {
            logWarning("Could not find resource: " + resource + " on the classpath");
        }
    }

    private Node convertResourceImageReference(Element oldImageReference) {
        Element image = outputDoc.createElement("i");
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
    
    private Node convertFillImageBorder(Element oldFillImageBorder) {
        Element fillImageBorder = outputDoc.createElement("fib");
        if (oldFillImageBorder.hasAttribute("content-insets")) {
            fillImageBorder.setAttribute("ci", convertInsets(oldFillImageBorder.getAttribute("content-insets")));
        }
        if (oldFillImageBorder.hasAttribute("border-insets")) {
            fillImageBorder.setAttribute("bi", convertInsets(oldFillImageBorder.getAttribute("border-insets")));
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
                        convertFillImage(DomUtil.getChildElementByTagName((Element)childNode, "fill-image")));
            }
        }
        // add null elements for missing images
        for (int i = 0; i < 8; i++) {
            if (!fillImages.containsKey(new Integer(i))) {
                fillImages.put(new Integer(i), outputDoc.createElement("null-fi"));
            }
        }
        int positionCounter = 0;
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("border-part".equals(childNode.getNodeName())) {
                fillImageBorder.appendChild((Node)fillImages.get(new Integer(positionCounter)));
                positionCounter++;
            } else {
                fillImageBorder.appendChild(outputDoc.importNode(childNode, true));
            }
        }
        for (int i = positionCounter; i < 8; i++) {
            fillImageBorder.appendChild((Node)fillImages.get(new Integer(i)));
        }
        return fillImageBorder;
    }
    
    private String convertInsets(String oldInsets) {
        oldInsets = stripWhitespace(oldInsets);
        String[] extents = oldInsets.split(" ");
        switch (extents.length) {
        case 1:
            return oldInsets;
        case 2:
            return extents[1] + " " + extents[0];
        case 4:
            return extents[1] + " " + extents[2] + " " + extents[3] + " " + extents[0];
        }
        logError("Insets could not be parsed: " + oldInsets + ", defaulting to 0px");
        return "0px";
    }

    private String stripWhitespace(String input) {
        String output = input.trim();
        output = output.replace('\n', ' ');
        output = output.replace('\r', ' ');
        output = output.replace('\t', ' ');
        while (output.indexOf("  ") != -1) {
            output = output.replaceAll("  ", " ");
        }
        return output;
    }
    
    private static void logOutput(String message) {
        if (LOG_ENABLED) {
            System.out.println("INFO: " + message);
        }
    }
    
    private static void logWarning(String message) {
        if (LOG_ENABLED) {
            System.err.println("WARN: " + message);
        }
    }
    
    private static void logError(String message) {
        logError(message, null);
    }
    
    private static void logError(String message, Exception e) {
        if (LOG_ENABLED) {
            System.err.println("ERROR: " + message);
            if (e != null) {
                e.printStackTrace();
            }
        }
    }
}

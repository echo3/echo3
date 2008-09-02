package nextapp.echo2migration;

import java.io.File;
import java.io.IOException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import nextapp.echo.app.util.DomUtil;

/**
 * @author n.beekman
 */
public class StyleSheetConverter {
    
    private XMLConverter.Context context;
    
    public static void main(String[] args) {
        
        if (args == null || args.length != 2) {
            System.out.println("Usage: Echo2StyleSheetConverter [inputFileName] [outputFileName]");
            return;
        }
        
        File input = new File(args[0]);
        if (!input.exists()) {
            Util.logError("Could not find input file: " + args[0]);
            return;
        }
        File output = new File(args[1]);
        if (output.exists()) {
            Util.logError("Output file already exists: " + args[1]);
            return;
        }
        StyleSheetConverter converter = new StyleSheetConverter();
        try {
            converter.initialize(input);
            converter.convert();
            converter.write(output);
        } catch (Exception e) {
            Util.logError("Conversion failed", e);
        }
    }
    
    private void initialize(File input) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        
        context = new XMLConverter.Context(builder.parse(input), builder.newDocument());
    }
    
    private void write(File output) throws TransformerException {
        TransformerFactory tFactory = DomUtil.getTransformerFactory();
        Transformer transformer = tFactory.newTransformer();
        transformer.setOutputProperties(DomUtil.OUTPUT_PROPERTIES_INDENT);
        DOMSource source = new DOMSource(context.target);
        transformer.transform(source, new StreamResult(output));
    }
    
    private void convert() throws IOException {
        Util.logOutput("Starting stylesheet conversion");
        
        Element styleSheet = context.target.createElement("ss");
        context.target.appendChild(styleSheet);
        
        NodeList childNodes = context.source.getDocumentElement().getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node childNode = childNodes.item(i);
            if ("style".equals(childNode.getNodeName())) {
                styleSheet.appendChild(XMLConverter.convertStyle(context, (Element) childNode));
            } else {
                styleSheet.appendChild(context.target.importNode(childNode, true));
            }
        }
    }
}

package nextapp.echo.webcontainer;

import java.io.IOException;

import org.w3c.dom.Element;

import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

public class ClientPropertiesInputProcessor
implements ClientMessage.Processor {

    public void process(Context context, Element dirElement) 
    throws IOException {
        Element[] pElements = DomUtil.getChildElementsByTagName(dirElement, "p");
    }
}

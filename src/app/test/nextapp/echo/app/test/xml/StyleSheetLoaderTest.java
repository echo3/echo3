package nextapp.echo.app.test.xml;

import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.xml.StyleSheetLoader;

import junit.framework.TestCase;

public class StyleSheetLoaderTest extends TestCase {
    
    public void testLoad() 
    throws Exception {
        StyleSheet styleSheet = StyleSheetLoader.load("nextapp/echo/app/test/xml/Test.stylesheet.xml",
                Thread.currentThread().getContextClassLoader());
        assertNotNull(styleSheet);
        
        Style welcomePaneStyle = styleSheet.getStyle("WelcomePane", WindowPane.class, true);
        assertNotNull(welcomePaneStyle);
        assertEquals(Boolean.TRUE, welcomePaneStyle.getProperty(WindowPane.PROPERTY_RESIZABLE));
    }
}

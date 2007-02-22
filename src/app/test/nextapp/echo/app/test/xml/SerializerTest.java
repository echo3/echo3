package nextapp.echo.app.test.xml;

import junit.framework.TestCase;
import nextapp.echo.app.Border;
import nextapp.echo.app.serial.Serializer;

public class SerializerTest extends TestCase {

    public void testClassloader()
    throws Exception {
        Serializer serializer = Serializer.forClassLoader(Thread.currentThread().getContextClassLoader());
        assertEquals(Boolean.class, serializer.getClass("b"));
        assertEquals(Integer.class, serializer.getClass("i"));
        assertEquals(String.class, serializer.getClass("s"));
        
        assertEquals(Border.class, serializer.getClass("Border"));
    }
}

package nextapp.echo.app.test.xml;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.serial.SerialPeerFactory;
import nextapp.echo.app.serial.property.AlignmentPeer;
import nextapp.echo.app.serial.property.BooleanPeer;
import nextapp.echo.app.serial.property.BorderPeer;
import nextapp.echo.app.serial.property.ColorPeer;
import nextapp.echo.app.serial.property.ExtentPeer;
import nextapp.echo.app.serial.property.FillImagePeer;
import nextapp.echo.app.serial.property.InsetsPeer;
import nextapp.echo.app.serial.property.IntegerPeer;
import nextapp.echo.app.serial.property.StringPeer;
import junit.framework.TestCase;

public class PeerLoadTest extends TestCase {
    
    public void testPeerLoad() {
        SerialPeerFactory factory = SerialPeerFactory.forClassLoader(Thread.currentThread().getContextClassLoader());

        assertTrue(factory.getPeerForProperty(Boolean.class) instanceof BooleanPeer);
        assertTrue(factory.getPeerForProperty(Integer.class) instanceof IntegerPeer);
        assertTrue(factory.getPeerForProperty(String.class) instanceof StringPeer);

        assertTrue(factory.getPeerForProperty(Alignment.class) instanceof AlignmentPeer);
        assertTrue(factory.getPeerForProperty(Border.class) instanceof BorderPeer);
        assertTrue(factory.getPeerForProperty(Color.class) instanceof ColorPeer);
        assertTrue(factory.getPeerForProperty(Extent.class) instanceof ExtentPeer);
        assertTrue(factory.getPeerForProperty(Insets.class) instanceof InsetsPeer);
        assertTrue(factory.getPeerForProperty(FillImage.class) instanceof FillImagePeer);
    }
}

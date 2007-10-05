package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.util.Context;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public class ArcTest extends SplitPane {

    private static final Service ARC_TEST_COMPONENT_SERVICE = JavaScriptService.forResource("Test.Arc", 
            "/nextapp/echo/testapp/interactive/resource/js/ArcTestComponents.js");
    
    static {
        WebContainerServlet.getServiceRegistry().add(ARC_TEST_COMPONENT_SERVICE);
    }
    
    public class ArcTestComponent extends Component {
        
        public static final String PROPERTY_TEXT = "text";
        
        public String getText() {
            return (String) getProperty(PROPERTY_TEXT);
        }
        
        public void setText(String newValue) {
            setProperty(PROPERTY_TEXT, newValue);
        }
    }
    
    public static class ArcTestComponentPeer extends AbstractComponentSynchronizePeer {
    
        public ArcTestComponentPeer() {
            super();
            addRequiredComponentClass(Label.class);
        }
    
        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
         */
        public String getClientComponentType() {
            return "ArcTestComponent";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return ArcTestComponent.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
         */
        public void init(Context context) {
            super.init(context);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(ARC_TEST_COMPONENT_SERVICE.getId());
        }
    }

    private class ArcTestPane extends Component {
        
    }
    
    public static class ArcTestPanePeer extends AbstractComponentSynchronizePeer {
    
        public ArcTestPanePeer() {
            super();
            addRequiredComponentClass(Button.class);
            addRequiredComponentClass(Column.class);
            addRequiredComponentClass(ContentPane.class);
            addRequiredComponentClass(Label.class);
            addRequiredComponentClass(Row.class);
            addRequiredComponentClass(WindowPane.class);
        }
    
        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
         */
        public String getClientComponentType() {
            return "ArcTestPane";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return ArcTestPane.class;
        }

        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
         */
        public void init(Context context) {
            super.init(context);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(ARC_TEST_COMPONENT_SERVICE.getId());
        }
    }

    public class ArcTestContainer extends Component {
        
    }
    
    public static class ArcTestContainerPeer extends AbstractComponentSynchronizePeer {
    
        public ArcTestContainerPeer() {
            super();
            addRequiredComponentClass(ContentPane.class);
            addRequiredComponentClass(WindowPane.class);
        }
    
        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getClientComponentType()
         */
        public String getClientComponentType() {
            return "ArcTestContainer";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return ArcTestContainer.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
         */
        public void init(Context context) {
            super.init(context);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(ARC_TEST_COMPONENT_SERVICE.getId());
        }
    }
    
    
    
    private Column testColumn;
    private ArcTestComponent arcTestComponent;
    private ArcTestContainer arcTestContainer;
    
    public ArcTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");

        SplitPaneLayoutData splitPaneLayoutData;

        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        controlsColumn.addButton("Change Background Color of Container", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                testColumn.setBackground(StyleUtil.randomColor());
            }
        });

        controlsColumn.addButton("Set component text: null", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                arcTestComponent.setText(null);
            }
        });

        controlsColumn.addButton("Set component text: \"text\"", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                arcTestComponent.setText("text");
            }
        });
        
        controlsColumn.addButton("Add to Container", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                arcTestContainer.add(new Label("TEST"));
            }
        });

        controlsColumn.addButton("Remove from Container", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                if (arcTestContainer.getComponentCount() > 0) {
                    arcTestContainer.remove(arcTestContainer.getComponentCount() - 1);
                }
            }
        });

        testColumn = new Column();
        testColumn.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testColumn.setLayoutData(splitPaneLayoutData);
        add(testColumn);
        
        arcTestComponent = new ArcTestComponent();
        testColumn.add(arcTestComponent);
        
        testColumn.add(new ArcTestPane());
        
        arcTestContainer = new ArcTestContainer();
        testColumn.add(arcTestContainer);
    }
}

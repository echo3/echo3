package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.TextArea;
import nextapp.echo.app.TextField;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;

public class FocusTest extends SplitPane {

    private static final int TEST_SIZE = 6;

    private Column testColumn;
    
    private Column focusColumn;
    private Row focusRow;
    private Grid focusGrid1;
    private TextField focusTextField;
    private TextArea focusTextArea;

    public FocusTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");

        SplitPaneLayoutData splitPaneLayoutData;

        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);

        testColumn = new Column();
        testColumn.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testColumn.setLayoutData(splitPaneLayoutData);
        add(testColumn);

        createFocusColumn();
        
        controlsColumn.add(new Label("Column Test"));
        for (int i = 0; i < TEST_SIZE; ++i) {
            final int index = i;
            controlsColumn.addButton("Focus " + i, new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().setFocusedComponent(focusColumn.getComponent(index));
                }
            });
        }
        
        createFocusRow();
        
        controlsColumn.add(new Label("Row Test"));
        for (int i = 0; i < TEST_SIZE; ++i) {
            final int index = i;
            controlsColumn.addButton("Focus " + i, new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().setFocusedComponent(focusColumn.getComponent(index));
                }
            });
        }

        createFocusGrid1();
        
        focusTextField = new TextField();
        controlsColumn.addButton("Focus TextField", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(focusTextField);
            }
        });
        testColumn.add(focusTextField);
        
        focusTextArea = new TextArea();
        controlsColumn.addButton("Focus TextArea", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(focusTextArea);
            }
        });
        testColumn.add(focusTextArea);
    }
    
    private void createFocusColumn() {
        focusColumn = new Column();
        for (int i = 0; i < TEST_SIZE; ++i) {
            final Button button = new Button("0");
            button.setStyleName("Default");
            button.addActionListener(new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    button.setText(Integer.toString(Integer.parseInt(button.getText()) + 1));
                }
            });
            focusColumn.add(button);
        }
        testColumn.add(focusColumn);
    }

    private void createFocusRow() {
        focusRow = new Row();
        for (int i = 0; i < TEST_SIZE; ++i) {
            final Button button = new Button("0");
            button.setStyleName("Default");
            button.addActionListener(new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    button.setText(Integer.toString(Integer.parseInt(button.getText()) + 1));
                }
            });
            focusRow.add(button);
        }
        testColumn.add(focusRow);
    }

    private void createFocusGrid1() {
        focusGrid1 = new Grid(TEST_SIZE);
        for (int i = 0; i < TEST_SIZE * TEST_SIZE; ++i) {
            final Button button = new Button("0");
            button.setStyleName("Default");
            button.addActionListener(new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    button.setText(Integer.toString(Integer.parseInt(button.getText()) + 1));
                }
            });
            focusGrid1.add(button);
        }
        testColumn.add(focusGrid1);
    }
}

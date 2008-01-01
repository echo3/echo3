package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Row;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.StyleUtil;

public class ReparentTest extends SplitPane {

    private Row testRow;
    
    private Column parentA;
    private Column parentB;
    private Button movingButton;
    
    public ReparentTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");

        SplitPaneLayoutData splitPaneLayoutData;

        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        controlsColumn.addButton("Reparent!", new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                if (movingButton.getParent() == parentA) {
                    parentB.add(movingButton);
                } else {
                    parentA.add(movingButton);
                }
            }
        });

        testRow = new Row();
        testRow.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testRow.setLayoutData(splitPaneLayoutData);
        add(testRow);
        
        parentA = new Column();
        parentA.setBorder(new Border(1, Color.BLUE, Border.STYLE_OUTSET));
        parentA.setBackground(Color.BLUE);
        parentA.setInsets(new Insets(15));
        testRow.add(parentA);
        
        parentB = new Column();
        parentB.setBorder(new Border(1, Color.GREEN, Border.STYLE_OUTSET));
        parentB.setBackground(Color.GREEN);
        parentB.setInsets(new Insets(15));
        testRow.add(parentB);
        
        movingButton = new Button("I move.");
        movingButton.setBorder(new Border(1, Color.CYAN, Border.STYLE_OUTSET));
        movingButton.setBackground(Color.CYAN);
        movingButton.setInsets(new Insets(15));
        movingButton.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                movingButton.setBackground(StyleUtil.randomBrightColor());
                movingButton.setBorder(new Border(1, movingButton.getBackground(), Border.STYLE_OUTSET));
            }
        });
        parentA.add(movingButton);
    }
}

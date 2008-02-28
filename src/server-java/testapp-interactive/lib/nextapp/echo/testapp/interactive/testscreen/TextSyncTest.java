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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Column;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.TextArea;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.text.StringDocument;
import nextapp.echo.testapp.interactive.ButtonColumn;

public class TextSyncTest extends SplitPane {
    
    public TextSyncTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");

        SplitPaneLayoutData splitPaneLayoutData;
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);

        final Column testColumn = new Column();
        testColumn.setCellSpacing(new Extent(15));
        splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(15));
        testColumn.setLayoutData(splitPaneLayoutData);
        add(testColumn);
        
        Label testLabel = new Label("This test is used to evaluate the capability of TextComponents to continue receiving "
                + "user input during server interactions.  This capability is critical as server-pushed operations may be "
                + "taking place while the user is typing (which would otherwise result in typed characters silently being "
                + "dropped if they were typed at the exact instant that the server were performing a synchronization. "
                + "To use this test, focus the text field, click one of the test buttons and begin typing during the "
                + "synchronization operation.  Verify using the debug pane that the input is being handled correctly for each "
                + "scenario.");
        testColumn.add(testLabel);
        
        final TextArea textArea = new TextArea(new StringDocument(), null, 40, 8);
        textArea.setBorder(new Border(1, Color.BLUE, Border.STYLE_SOLID));
        testColumn.add(textArea);
        
        controlsColumn.addButton("3 Second Server Interaction Delay", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException ex) { }
            }
        });
        
        controlsColumn.addButton("3 Second Server Interaction Delay; Set Text", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException ex) { }
                textArea.getDocument().setText("The text value has been reset.");
            }
        });
        
        controlsColumn.addButton("3 Second Server Interaction Delay; Remove Text Area", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException ex) { }
                testColumn.remove(textArea);
            }
        });
        
        controlsColumn.addButton("3 Second Server Interaction Delay; Add Component", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException ex) { }
                testColumn.add(new Label("Added test label."));
            }
        });
    }
}

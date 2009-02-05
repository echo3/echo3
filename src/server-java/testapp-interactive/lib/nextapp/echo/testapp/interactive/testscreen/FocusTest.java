/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
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

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.ListBox;
import nextapp.echo.app.Row;
import nextapp.echo.app.SelectField;
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
    private SelectField focusSelectField;
    private ListBox focusListBox;

    public FocusTest() {
        super();
        setStyleName("TestControls");

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
        
        focusSelectField = new SelectField(new Object[]{ "One", "Two", "Three" });
        controlsColumn.addButton("Focus SelectField", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(focusSelectField);
            }
        });
        testColumn.add(focusSelectField);
        
        focusListBox = new ListBox(new Object[]{ "One", "Two", "Three" });
        controlsColumn.addButton("Focus ListBox", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(focusListBox);
            }
        });
        testColumn.add(focusListBox);
        
        createWackyFocusRow();
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

    private void createWackyFocusRow() {
        focusRow = new Row();
        for (int i = 0; i < TEST_SIZE; ++i) {
            final Button button = new Button();
            button.setRenderId("wackyfocus_" + i);
            int nextId = (int) (Math.random() * TEST_SIZE);
            int previousId = (int) (Math.random() * TEST_SIZE);
            button.setFocusNextId("wackyfocus_" + nextId);
            button.setFocusPreviousId("wackyfocus_" + previousId);
            button.setStyleName("Default");
            button.setText("<" + previousId + " | " + nextId + ">");
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

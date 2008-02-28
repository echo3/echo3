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

import nextapp.echo.app.Button;
import nextapp.echo.app.CheckBox;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.IllegalChildException;
import nextapp.echo.app.Label;
import nextapp.echo.app.ListBox;
import nextapp.echo.app.PasswordField;
import nextapp.echo.app.RadioButton;
import nextapp.echo.app.Row;
import nextapp.echo.app.SelectField;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.TextArea;
import nextapp.echo.app.TextField;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.list.DefaultListModel;
import nextapp.echo.app.list.ListModel;
import nextapp.echo.testapp.interactive.InteractiveApp;

/**
 * A test to ensure proper rendering when arbitrary components are 
 * user-selected together in parent child relationships. 
 */
public class HierarchyTest extends SplitPane {
    
    private abstract class ComponentEntry {
        
        public abstract String getName();
        
        public abstract Component  newInstance(); 
        
        public String toString() {
            return getName();
        }
    }
    
    private ComponentEntry buttonEntry = new ComponentEntry(){
        public String getName() {
            return "Button";
        }

        public Component newInstance() {
            Button button = new Button("Button");
            button.setStyleName("Default");
            return button;
        }
    };

    private ComponentEntry checkBoxEntry = new ComponentEntry(){
        public String getName() {
            return "CheckBox";
        }

        public Component newInstance() {
            CheckBox checkBox = new CheckBox("CheckBox");
            checkBox.setStyleName("Default");
            return checkBox;
        }
    };

    private ComponentEntry columnEntry = new ComponentEntry(){
        public String getName() {
            return "Column";
        }

        public Component newInstance() {
            Column column = new Column();
            return column;
        }
    };
    
    private ComponentEntry contentPaneEntry = new ComponentEntry(){
        public String getName() {
            return "ContentPane";
        }

        public Component newInstance() {
            ContentPane contentPane = new ContentPane();
            return contentPane;
        }
    };
    
    private ComponentEntry gridEntry = new ComponentEntry(){
        public String getName() {
            return "Grid";
        }

        public Component newInstance() {
            Grid grid = new Grid();
            return grid;
        }
    };
    
    private ComponentEntry labelEntry = new ComponentEntry(){
        public String getName() {
            return "Label";
        }

        public Component newInstance() {
            return new Label("Label");
        }
    };

    private ComponentEntry listBoxEntry = new ComponentEntry(){
        public String getName() {
            return "ListBox";
        }

        public Component newInstance() {
            ListBox listBox = new ListBox(new String[]{"alpha", "bravo", "charlie", "delta"});
            listBox.setStyleName("Default");
            return listBox;
        }
    };

    private ComponentEntry passwordFieldEntry = new ComponentEntry(){
        public String getName() {
            return "PasswordField";
        }

        public Component newInstance() {
            PasswordField passwordField = new PasswordField();
            passwordField.setStyleName("Default");
            passwordField.setText("Password");
            return passwordField;
        }
    };
    
    private ComponentEntry radioButtonEntry = new ComponentEntry(){
        public String getName() {
            return "RadioButton";
        }

        public Component newInstance() {
            RadioButton radioButton = new RadioButton("RadioButton");
            radioButton.setStyleName("Default");
            return radioButton;
        }
    };
    
    private ComponentEntry rowEntry = new ComponentEntry(){
        public String getName() {
            return "Row";
        }

        public Component newInstance() {
            Row row = new Row();
            return row;
        }
    };

    private ComponentEntry selectFieldEntry = new ComponentEntry(){
        public String getName() {
            return "SelectField";
        }

        public Component newInstance() {
            SelectField selectField = new SelectField(new String[]{"alpha", "bravo", "charlie", "delta"});
            selectField.setStyleName("Default");
            return selectField;
        }
    };

    private ComponentEntry splitPaneEntry = new ComponentEntry(){
        public String getName() {
            return "SplitPane";
        }

        public Component newInstance() {
            SplitPane splitPane = new SplitPane();
            splitPane.setStyleName("DefaultResizable");
            return splitPane;
        }
    };
    
    private ComponentEntry textAreaEntry = new ComponentEntry(){
        public String getName() {
            return "TextArea";
        }

        public Component newInstance() {
            TextArea textArea = new TextArea();
            textArea.setStyleName("Default");
            textArea.setText("TextArea");
            return textArea;
        }
    };
    
    private ComponentEntry textFieldEntry = new ComponentEntry(){
        public String getName() {
            return "TextField";
        }

        public Component newInstance() {
            TextField textField = new TextField();
            textField.setStyleName("Default");
            textField.setText("TextField");
            return textField;
        }
    };
    
    private ComponentEntry windowPaneEntry = new ComponentEntry(){
        public String getName() {
            return "WindowPane";
        }

        public Component newInstance() {
            WindowPane windowPane = new WindowPane();
            windowPane.setStyleName("Default");
            return windowPane;
        }
    };
    
    private ListModel componentListModel = new DefaultListModel(new Object[]{
            "(None)",
            buttonEntry,
            checkBoxEntry,
            columnEntry,
            contentPaneEntry,
            gridEntry,
            labelEntry,
            listBoxEntry,
            passwordFieldEntry,
            radioButtonEntry,
            rowEntry,
            selectFieldEntry,
            splitPaneEntry,
            textAreaEntry, 
            textFieldEntry, 
            windowPaneEntry
    });
                
    private Component parentComponentInstance;
    private Component[] childComponentInstances;
    private SelectField parentSelectField;
    private SelectField[] childSelectFields;
    private ContentPane testPane;

    public HierarchyTest() {
        super(SplitPane.ORIENTATION_HORIZONTAL, new Extent(250, Extent.PX));
        setStyleName("DefaultResizable");
        
        Column controlGroupsColumn = new Column();
        controlGroupsColumn.setCellSpacing(new Extent(5));
        controlGroupsColumn.setStyleName("TestControlsColumn");
        add(controlGroupsColumn);
        
        Column parentSelectColumn = new Column();
        controlGroupsColumn.add(parentSelectColumn);
        
        parentSelectColumn.add(new Label("Parent"));
                        
        parentSelectField = new SelectField(componentListModel);
        parentSelectField.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                if (parentSelectField.getSelectedItem() instanceof ComponentEntry) {
                    parentComponentInstance = ((ComponentEntry) parentSelectField.getSelectedItem()).newInstance();
                } else {
                    parentComponentInstance = null;
                }
                update();
            }
        });
        parentSelectColumn.add(parentSelectField);
        
        childSelectFields = new SelectField[4];
        childComponentInstances = new Component[4];
        for (int i = 0; i < childSelectFields.length; ++i) {
            Column childSelectColumn = new Column();
            controlGroupsColumn.add(childSelectColumn);
            
            childSelectColumn.add(new Label("Child #" + i));
                            
            final int childNumber = i;
            childSelectFields[i] = new SelectField(componentListModel);
            childSelectFields[i].addActionListener(new ActionListener(){
                public void actionPerformed(ActionEvent e) {
                    if (childSelectFields[childNumber].getSelectedItem() instanceof ComponentEntry) {
                        childComponentInstances[childNumber] 
                                = ((ComponentEntry) childSelectFields[childNumber].getSelectedItem()).newInstance();
                    } else {
                        childComponentInstances[childNumber] = null;
                    }
                    update();
                }
            });
            childSelectColumn.add(childSelectFields[i]);
        } 
        
        testPane = new ContentPane();
        add(testPane);
    }
    
    public void update() {
        testPane.removeAll();
        if (parentComponentInstance == null) {
            return;
        }
        parentComponentInstance.removeAll();
        for (int i = 0; i < childComponentInstances.length; ++i) {
            if (childComponentInstances[i] != null) {
                try {
                    parentComponentInstance.add(childComponentInstances[i]);
                } catch (IllegalChildException ex) {
                    InteractiveApp.getApp().consoleWrite(ex.toString());
                }
            }
        }
        testPane.add(parentComponentInstance);
    }
}

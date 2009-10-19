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

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.CheckBox;
import nextapp.echo.app.Color;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Column;
import nextapp.echo.app.ListBox;
import nextapp.echo.app.PasswordField;
import nextapp.echo.app.RadioButton;
import nextapp.echo.app.SelectField;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.Table;
import nextapp.echo.app.TextArea;
import nextapp.echo.app.TextField;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.button.ButtonGroup;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.list.ListSelectionModel;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.InteractiveApp;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;

/**
 * Interactive test for <code>WindowPane</code>s.
 */
public class WindowPaneExamplesTest extends SplitPane {
    
    private class WindowTestControls extends ButtonColumn {
        
        private WindowTestControls(String targetName, final ContentPane targetContentPane) {
            add(new Label(targetName));
            addButton("Add Test Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    targetContentPane.add(createTestWindow("Test"));
                }
            });
            addButton("Add Label Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    targetContentPane.add(createSimpleWindow("Simple"));
                }
            });
            addButton("Add GlassBlue Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("GlassBlue");
                    windowPane.setStyleName("GlassBlue");
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add TransGreen Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("TransGreen");
                    windowPane.setStyleName("TransGreen");
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add Borderless Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("Borderless");
                    windowPane.setStyleName("Borderless");
                    windowPane.setMaximizeEnabled(true);
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add Modal Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createModalWindow("Modal");
                    windowPane.setModal(true);
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add Three Modal Windows", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    for (int i = 0; i < 3; ++i) {
                        WindowPane windowPane = createModalWindow("3Modal");
                        windowPane.setModal(true);
                        targetContentPane.add(windowPane);
                    }
                }
            });
            addButton("Add Modal Window In A Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane w1 = new WindowPane();
                    w1.setStyleName("Default");
                    w1.setWidth(new Extent(650));
                    w1.setHeight(new Extent(450));
                    w1.setTitle("Just A Window");
                    targetContentPane.add(w1);
                    
                    ContentPane c1 = new ContentPane();
                    final Button b1 = new Button("Click me:");
                    b1.setStyleName("Default");
                    b1.addActionListener(new ActionListener() {
                        public void actionPerformed(ActionEvent e) {
                            b1.setText(b1.getText() + "!");
                        }
                    });
                    c1.add(b1);

                    w1.add(c1);
                    
                    WindowPane w2 = new WindowPane();
                    w2.setStyleName("Default");
                    final Button b2 = new Button("Click me:");
                    b2.setStyleName("Default");
                    b2.addActionListener(new ActionListener() {
                        public void actionPerformed(ActionEvent e) {
                            b2.setText(b2.getText() + "!");
                        }
                    });
                    w2.add(b2);
                    
                    w2.setTitle("But this one is modal.");
                    w2.setModal(true);
                    
                    c1.add(w2);
                }
            });
            addButton("Add Modal Window In A Modal Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane w1 = new WindowPane();
                    w1.setStyleName("Default");
                    w1.setWidth(new Extent(650));
                    w1.setHeight(new Extent(450));
                    w1.setTitle("This Window is Modal");
                    w1.setModal(true);
                    targetContentPane.add(w1);
                    
                    ContentPane c1 = new ContentPane();
                    final Button b1 = new Button("Click me:");
                    b1.setStyleName("Default");
                    b1.addActionListener(new ActionListener() {
                        public void actionPerformed(ActionEvent e) {
                            b1.setText(b1.getText() + "!");
                        }
                    });
                    c1.add(b1);

                    w1.add(c1);
                    
                    WindowPane w2 = new WindowPane();
                    w2.setStyleName("Default");
                    final Button b2 = new Button("Click me:");
                    b2.setStyleName("Default");
                    b2.addActionListener(new ActionListener() {
                        public void actionPerformed(ActionEvent e) {
                            b2.setText(b2.getText() + "!");
                        }
                    });
                    w2.add(b2);
                    
                    w2.setTitle("This Window is also Modal.");
                    w2.setModal(true);
                    
                    c1.add(w2);
                }
            });
            addButton("Add Constrained Size Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("Constrained");
                    windowPane.setMinimumWidth(new Extent(400));
                    windowPane.setMaximumWidth(new Extent(500));
                    windowPane.setMinimumHeight(new Extent(200));
                    windowPane.setMaximumHeight(new Extent(280));
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add Default-Border Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    final WindowPane windowPane = new WindowPane();
                    positionWindowPane(windowPane);
                    windowPane.setTitle("Default-Border Window #" + windowNumber++);
                    targetContentPane.add(windowPane);
                    
                    Column windowPaneColumn = new Column();
                    windowPane.add(windowPaneColumn);
                    windowPaneColumn.add(new Label("First Name:"));
                    windowPaneColumn.add(new TextField());
                    windowPaneColumn.add(new Label("Last Name:"));
                    windowPaneColumn.add(new TextField());
                }
            });
            addButton("Add Immovable Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("Immovable");
                    windowPane.setMovable(false);
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add Fixed Size Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("Fixed Size");
                    windowPane.setResizable(false);
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add Immovable Fixed Size Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = createSimpleWindow("Immovable Fixed Size");
                    windowPane.setMovable(false);
                    windowPane.setResizable(false);
                    targetContentPane.add(windowPane);
                }
            });
            addButton("Add SplitPane Window (No Close Icon)", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    final WindowPane windowPane = new WindowPane();
                    windowPane.setClosable(false);
                    positionWindowPane(windowPane);
                    targetContentPane.add(windowPane);
                    windowPane.setTitle("SplitPane Window #" + windowNumber++);
                    windowPane.setTitleInsets(new Insets(10, 5));
                    windowPane.setStyleName("Default");
                    windowPane.setTitleBackground(new Color(0x2f2f4f));
                    windowPane.setWidth(new Extent(500, Extent.PX));
                    windowPane.setHeight(new Extent(300, Extent.PX));
                    SplitPane splitPane = new SplitPane(SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP, true);
                    SplitPaneLayoutData splitPaneLayoutData;
                    
                    Button okButton = new Button("Ok");
                    okButton.addActionListener(new ActionListener() {
                        /**
                         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
                         */
                        public void actionPerformed(ActionEvent e) {
                            windowPane.getParent().remove(windowPane);
                        }
                    });
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0x5f5f9f));
                    splitPaneLayoutData.setInsets(new Insets(8));
                    splitPaneLayoutData.setAlignment(new Alignment(Alignment.CENTER, Alignment.DEFAULT));
                    splitPaneLayoutData.setOverflow(SplitPaneLayoutData.OVERFLOW_HIDDEN);
                    okButton.setLayoutData(splitPaneLayoutData);
                    okButton.setWidth(new Extent(100));
                    okButton.setStyleName("Default");
                    splitPane.add(okButton);
                    
                    Label contentLabel = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0xefefff));
                    contentLabel.setLayoutData(splitPaneLayoutData);
                    splitPane.add(contentLabel);
                    
                    windowPane.add(splitPane);
                }
            });
    
            addButton("Add Multiple SplitPane Nautilus Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    final WindowPane windowPane = new WindowPane();
                    windowPane.setStyleName("Default");
                    windowPane.setWidth(new Extent(500, Extent.PX));
                    windowPane.setHeight(new Extent(500, Extent.PX));
                    windowPane.setTitle("SP Nautilus Window #" + windowNumber++);
                    windowPane.add(new SplitPaneNestedTest(new Extent(50)));
                    positionWindowPane(windowPane);
                    targetContentPane.add(windowPane);
                }
            });
            
            addButton("Add Multiple SplitPane Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    final WindowPane windowPane = new WindowPane();
                    positionWindowPane(windowPane);
                    targetContentPane.add(windowPane);
                    windowPane.setTitle("Multiple SplitPane Window #" + windowNumber++);
                    windowPane.setTitleInsets(new Insets(10, 5));
                    windowPane.setStyleName("Default");
                    windowPane.setTitleBackground(new Color(0x2f2f4f));
                    windowPane.setWidth(new Extent(700, Extent.PX));
                    windowPane.setHeight(new Extent(500, Extent.PX));
                    
                    SplitPane splitPane1 = new SplitPane(SplitPane.ORIENTATION_HORIZONTAL, new Extent(100));
                    splitPane1.setStyleName("DefaultResizable");
                    SplitPaneLayoutData splitPaneLayoutData;
                    
                    Label label;
                    
                    label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0x3fbf5f));
                    splitPaneLayoutData.setInsets(new Insets(5));
                    label.setLayoutData(splitPaneLayoutData);
                    splitPane1.add(label);

                    SplitPane splitPane2 = new SplitPane(SplitPane.ORIENTATION_VERTICAL, new Extent(120));
                    splitPane2.setStyleName("DefaultResizable");
                    
                    SplitPane splitPane3 = new SplitPane(SplitPane.ORIENTATION_HORIZONTAL, new Extent(200));
                    splitPane3.setStyleName("DefaultResizable");
                    splitPane2.add(splitPane3);
                    
                    SplitPane splitPane4 = new SplitPane(SplitPane.ORIENTATION_HORIZONTAL, new Extent(300));
                    splitPane4.setStyleName("DefaultResizable");
                    splitPane2.add(splitPane4);
                    
                    label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0x5f3fbf));
                    splitPaneLayoutData.setInsets(new Insets(5));
                    label.setLayoutData(splitPaneLayoutData);
                    splitPane3.add(label);
                    
                    label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0x3f5fbf));
                    splitPaneLayoutData.setInsets(new Insets(5));
                    label.setLayoutData(splitPaneLayoutData);
                    splitPane3.add(label);
                    
                    label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0xbf5f3f));
                    splitPaneLayoutData.setInsets(new Insets(5));
                    label.setLayoutData(splitPaneLayoutData);
                    splitPane4.add(label);
                    
                    label = new Label(StyleUtil.QUASI_LATIN_TEXT_1);
                    splitPaneLayoutData = new SplitPaneLayoutData();
                    splitPaneLayoutData.setBackground(new Color(0xbf3f5f));
                    splitPaneLayoutData.setInsets(new Insets(5));
                    label.setLayoutData(splitPaneLayoutData);
                    splitPane4.add(label);
    
                    splitPane1.add(splitPane2);
                    
                    windowPane.add(splitPane1);
                }
            });

            addButton("Add Mozilla TextField Quirk Workaround Test Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    targetContentPane.add(createMozillaTextFieldQuirkTestWindow());
                }
            });
            
            addButton("Add init() Bug-Fix Test Window", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane windowPane = new WindowPane();
                    windowPane.add(new Column() {
                        public void init() {
                            super.init();
                            add(new Label("Test"));
                        }
                        public void dispose() {
                            removeAll();
                            super.dispose();
                        }
                    });
                    targetContentPane.add(windowPane);
                }
            });
            
            addButton("Add Z-Index Test Windows", new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    WindowPane top = createSimpleWindow("Top");
                    targetContentPane.add(top);
                    WindowPane bottom = createSimpleWindow("Bottom");
                    targetContentPane.add(bottom);
                    WindowPane middle = createSimpleWindow("Middle");
                    targetContentPane.add(middle);

                    top.setZIndex(10);
                    bottom.setZIndex(8);
                    middle.setZIndex(9);
                }
            });
        }
    }

    /**
     * Counter used to position new <code>WindowPane</code>s on the screen.
     */
    private int nextPosition = 0;
    
    /**
     * Counter used to assign somewhat unique titles.
     */
    private int windowNumber = 0;

    public WindowPaneExamplesTest() {
        super();
        setStyleName("TestControls");
        
        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setCellSpacing(new Extent(5));
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        ContentPane contentPane = new ContentPane();
        add(contentPane);
        
        final Column contentColumn = new Column();
        contentPane.add(contentColumn);
        
        WindowTestControls windowTestControls;
        windowTestControls = new WindowTestControls("Root Level", InteractiveApp.getApp().getDefaultWindow().getContent());
        controlsColumn.add(windowTestControls);
        windowTestControls = new WindowTestControls("Embedded", contentPane);
        controlsColumn.add(windowTestControls);
        
        Column componentSamplerControlsColumn = new Column();
        componentSamplerControlsColumn.add(new Label("Component \"Sampler\""));
        controlsColumn.add(componentSamplerControlsColumn);

        Button button;

        button = new Button("Add Component Sampler to Embedded ContentPane");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                addComponentSampler(contentColumn, false);
            }
        });
        componentSamplerControlsColumn.add(button);

        button = new Button("Add \"Modal Launching\" Component Sampler to Embedded ContentPane");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                addComponentSampler(contentColumn, true);
            }
        });
        componentSamplerControlsColumn.add(button);

        button = new Button("Clear Embedded ContentPane");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                contentColumn.removeAll();
            }
        });
        componentSamplerControlsColumn.add(button);
    }
    
    private void addComponentSampler(Column contentColumn, boolean launchModals) {
        Column componentSamplerColumn = new Column();
        if (launchModals) {
            componentSamplerColumn.setBorder(new Border(new Extent(5, Extent.PX), new Color(0xffafaf), Border.STYLE_INSET));
        } else {
            componentSamplerColumn.setBorder(new Border(new Extent(5, Extent.PX), new Color(0xafafff), Border.STYLE_INSET));
        }
        componentSamplerColumn.setInsets(new Insets(10));
        componentSamplerColumn.setCellSpacing(new Extent(1));
        contentColumn.add(componentSamplerColumn);
        
        for (int i = 1; i <= 3; ++i) {
            Button button = new Button("Button #" + i);
            button.setStyleName("Default");
            componentSamplerColumn.add(button);
            if (launchModals && i == 1) {
                button.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent e) {
                        getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                    }
                });
            }
        }
        
        ButtonGroup buttonGroup = new ButtonGroup();
        for (int i = 1; i <= 3; ++i) {
            RadioButton radioButton = new RadioButton("RadioButton #" + i);
            radioButton.setGroup(buttonGroup);
            radioButton.setStyleName("Default");
            componentSamplerColumn.add(radioButton);
            if (launchModals && i == 1) {
                radioButton.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent e) {
                        getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                    }
                });
            }
        }
        
        for (int i = 1; i <= 3; ++i) {
            CheckBox checkBox = new CheckBox("CheckBox #" + i);
            checkBox.setStyleName("Default");
            componentSamplerColumn.add(checkBox);
            if (launchModals && i == 1) {
                checkBox.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent e) {
                        getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                    }
                });
            }
        }
        
        Table table = new Table(TableTest.createEmployeeTableModel());
        table.setBorder(new Border(new Extent(2), new Color(0xafffcf), Border.STYLE_GROOVE));
        table.setInsets(new Insets(15, 5));
        table.setSelectionEnabled(true);
        table.setSelectionBackground(new Color(0xffcfaf));
        table.setRolloverEnabled(true);
        table.setRolloverBackground(new Color(0xafefff));
        if (launchModals) {
            table.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(table);
        
        TextField textField = new TextField();
        textField.setText("Hello");
        if (launchModals) {
            textField.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(textField);
        
        PasswordField passwordField = new PasswordField();
        passwordField.setText("Hello");
        if (launchModals) {
            passwordField.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(passwordField);
        
        TextArea textArea = new TextArea();
        textArea.setText("Hello");
        if (launchModals) {
            textArea.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(textArea);
        
        ListBox listBox = new ListBox(ListBoxTest.NUMBERS);
        if (launchModals) {
            listBox.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(listBox);

        listBox= new ListBox(ListBoxTest.NUMBERS);
        listBox.setSelectionMode(ListSelectionModel.MULTIPLE_SELECTION);
        if (launchModals) {
            listBox.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(listBox);

        SelectField selectField = new SelectField(ListBoxTest.NUMBERS);
        if (launchModals) {
            selectField.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    getApplicationInstance().getDefaultWindow().getContent().add(createComponentSamplerModalTestWindow());
                }
            });
        }
        componentSamplerColumn.add(selectField);
    }
    
    private WindowPane createComponentSamplerModalTestWindow() {
        WindowPane windowPane = createSimpleWindow("Component Sampler Modal Test Window");
        windowPane.setModal(true);
        return windowPane;
    }
    
    private WindowPane createModalWindow(String name) {
        final WindowPane windowPane = new WindowPane();
        positionWindowPane(windowPane);
        windowPane.setTitle(name + " Window #" + windowNumber++);
        windowPane.setTitleInsets(new Insets(10, 5));
        windowPane.setTitleBackground(new Color(0x2f2f4f));
        windowPane.setInsets(new Insets(10));
        windowPane.setWidth(new Extent(500));
        windowPane.setHeight(new Extent(280));
        windowPane.setStyleName("Default");
        
        ButtonColumn column = new ButtonColumn();
        windowPane.add(column);

        column.addButton("Add Modal Window", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                ContentPane contentPane = (ContentPane) windowPane.getParent();
                WindowPane newWindowPane = createModalWindow("YetAnotherModal");
                newWindowPane.setModal(true);
                contentPane.add(newWindowPane);
            }
        });
        
        return windowPane;
    }

    private WindowPane createMozillaTextFieldQuirkTestWindow() {
       final WindowPane windowPane = new WindowPane();
       //positionWindowPane(windowPane);
       windowPane.setTitle("****Bug F1047 Window #" + windowNumber++);
       windowPane.setStyleName("Default");

       final Column mainColumn = new Column();
       
       Grid grid = new Grid();
       mainColumn.add(grid);
       
       grid.add(new Label("User"));
       TextField tf = new TextField();
       tf.setText("This Text will render somewhere");
       grid.add(tf);
       grid.add(new Label("Subject"));
       tf = new TextField();
       tf.setText("BLANK OUT THIS FIELD!!!");
       grid.add(tf);
       grid.add(new Label("Message"));
       grid.add(new TextArea());
       grid.add(new Label("Stuff"));
       grid.add(new ListBox(new Object[]{"one", "two", "three"}));
       grid.add(new Label("Things"));
       grid.add(new SelectField(new Object[]{"four", "five", "six"}));
       
       Button okButton = new Button("Ok");
       okButton.addActionListener(new ActionListener() {
           public void actionPerformed(ActionEvent e) {
               Column errorColumn = new Column();
               errorColumn.add(new Label("Did Mozilla break?"));
               errorColumn.add(new Label("Did Mozilla break?"));
               mainColumn.add(errorColumn, 0);
               //**** UNCOMMENT THE FOLLWOING LINE FOR "FIXING" THIS BUG
               //windowPane.setHeight(windowPane.getHeight());
           }
       });
       grid.add(okButton);
       windowPane.add(mainColumn);
       return windowPane;
    }    
    
    
    private WindowPane createSimpleWindow(String name) {
        WindowPane windowPane = new WindowPane();
        positionWindowPane(windowPane);
        windowPane.setTitle(name + " Window #" + windowNumber++);
        windowPane.setTitleInsets(new Insets(10, 5));
        windowPane.setInsets(new Insets(10));
        windowPane.setWidth(new Extent(500));
        windowPane.setHeight(new Extent(280));
        windowPane.setStyleName("Default");
        windowPane.add(new Label(StyleUtil.QUASI_LATIN_TEXT_1));
        return windowPane;
    }
    
    /**
     * Creates a 'Test Window' that contains buttons which may be used to 
     * configure various aspects of the window.
     * 
     * @param name the window name
     * @return the created window
     */
    private WindowPane createTestWindow(String name) {
        final WindowPane windowPane = new WindowPane();
        positionWindowPane(windowPane);
        windowPane.setTitle(name + " Window #" + windowNumber++);
        windowPane.setTitleInsets(new Insets(10, 5));
        windowPane.setTitleBackground(new Color(0x2f2f4f));
        windowPane.setInsets(new Insets(10));
        windowPane.setWidth(new Extent(500));
        windowPane.setHeight(new Extent(280));
        windowPane.setStyleName("Default");
        
        ButtonColumn column = new ButtonColumn();
        windowPane.add(column);
        
        column.addButton("Set Icon 16", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setIcon(Styles.ICON_16_TEST);
            }
        });
        
        column.addButton("Set Icon 24", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setIcon(Styles.ICON_24_MAIL_COMPOSE);
            }
        });
        
        column.addButton("Set Icon 64", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setIcon(Styles.ICON_64_INFORMATION);
            }
        });
        
        column.addButton("Clear Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setIcon(null);
            }
        });
        
        column.addButton("Set Close Icon (and appropriate Icon Insets)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setCloseIcon(Styles.ICON_24_NO);
                windowPane.setCloseIconInsets(new Insets(4, 2));
            }
        });
        
        column.addButton("Clear Close Icon", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setCloseIcon(null);
                windowPane.setCloseIconInsets(null);
            }
        });
        
        column.addButton("Set Style Name = Default", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setStyleName("Default");
            }
        });
        
        column.addButton("Clear Style Name", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                windowPane.setStyleName(null);
            }
        });
        
        return windowPane;
    }
    
    private void positionWindowPane(WindowPane windowPane) {
        Extent positionExtent = new Extent(nextPosition, Extent.PX);
        windowPane.setPositionX(positionExtent);
        windowPane.setPositionY(positionExtent);
        nextPosition += 20;
        if (nextPosition > 200) {
            nextPosition = 0;
        }
    }
}

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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.PasswordField;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.TextArea;
import nextapp.echo.app.TextField;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.event.DocumentEvent;
import nextapp.echo.app.event.DocumentListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.testapp.interactive.ButtonColumn;
import nextapp.echo.testapp.interactive.InteractiveApp;
import nextapp.echo.testapp.interactive.StyleUtil;
import nextapp.echo.testapp.interactive.Styles;
import nextapp.echo.webcontainer.sync.component.TextComponentPeer;

public class TextComponentTest extends SplitPane {
    
    public static int toInt(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }
    
    /**
     * Writes <code>ActionEvent</code>s to console.
     */
    private ActionListener actionListener = new ActionListener() {

        /**
         * @see nextapp.echo.app.event.ActionListener#actionPerformed(nextapp.echo.app.event.ActionEvent)
         */
        public void actionPerformed(ActionEvent e) {
            ((InteractiveApp) getApplicationInstance()).consoleWrite(e.toString());
        }
    };
    
    /**
     * Writes <code>ActionEvent</code>s to console.
     */
    private DocumentListener documentListener = new DocumentListener() {
        
        /**
         * @see nextapp.echo.app.event.DocumentListener#documentUpdate(nextapp.echo.app.event.DocumentEvent)
         */
        public void documentUpdate(DocumentEvent e) {
            ((InteractiveApp) getApplicationInstance()).consoleWrite(e.toString());
        }
    };
    
    private TextField textField;
    private PasswordField passwordField;
    private TextArea textArea;
    
    private void setContainer(Component container, boolean inset) {
        if (getComponentCount() > 1) {
            remove(1);
        }
        add(container);
        
        if (inset) {
            SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
            splitPaneLayoutData.setInsets(new Insets(15));
            container.setLayoutData(splitPaneLayoutData);
        }
        
        container.removeAll();
        
        container.add(textField);
        container.add(passwordField);
        container.add(textArea);
    }
    
    public TextComponentTest() {
        super();
        setStyleName("TestControls");

        ButtonColumn controlsColumn = new ButtonColumn();
        controlsColumn.setStyleName("TestControlsColumn");
        add(controlsColumn);
        
        textField = new TextField();
        textField.setBorder(new Border(1, Color.BLUE, Border.STYLE_SOLID));
        
        passwordField = new PasswordField();
        passwordField.setBorder(new Border(1, Color.BLUE, Border.STYLE_SOLID));
        
        textArea = new TextArea();
        textArea.setBorder(new Border(1, Color.BLUE, Border.STYLE_SOLID));
        
        Column testColumn = new Column();
        testColumn.setCellSpacing(new Extent(15));
        setContainer(testColumn, true);
        
        controlsColumn.addButton("Set Container = Column", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                Column column = new Column();
                column.setCellSpacing(new Extent(15));
                setContainer(column, true);
            }
        });
        
        controlsColumn.addButton("Set Container = Column, No Inset", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                Column column = new Column();
                setContainer(column, false);
            }
        });
        
        controlsColumn.addButton("Set Container = Column w/ Border", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                Column column = new Column();
                column.setCellSpacing(new Extent(15));
                column.setBorder(new Border(1, new Color(0x007f00), Border.STYLE_SOLID));
                setContainer(column, true);
            }
        });
        
        controlsColumn.addButton("Set Container = 100% Wide Grid w/ Border", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                Grid grid = new Grid();
                grid.setWidth(new Extent(100, Extent.PERCENT));
                grid.setSize(1);
                grid.setBorder(new Border(1, new Color(0x007f00), Border.STYLE_SOLID));
                setContainer(grid, true);
            }
        });
        
        controlsColumn.addButton("Width -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setWidth(null);
                passwordField.setWidth(null);
                textArea.setWidth(null);
            }
        });
        controlsColumn.addButton("Width -> 500px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setWidth(new Extent(500, Extent.PX));
                passwordField.setWidth(new Extent(500, Extent.PX));
                textArea.setWidth(new Extent(500, Extent.PX));
            }
        });
        controlsColumn.addButton("Width -> 100%", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setWidth(new Extent(100, Extent.PERCENT));
                passwordField.setWidth(new Extent(100, Extent.PERCENT));
                textArea.setWidth(new Extent(100, Extent.PERCENT));
            }
        });
        controlsColumn.addButton("Height -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setHeight(null);
                passwordField.setHeight(null);
                textArea.setHeight(null);
            }
        });
        controlsColumn.addButton("Height -> 300px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setHeight(new Extent(300, Extent.PX));
                passwordField.setHeight(new Extent(300, Extent.PX));
                textArea.setHeight(new Extent(300, Extent.PX));
            }
        });
        
        controlsColumn.addButton("Set StyleName = Default", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                textField.setStyleName("Default");
                passwordField.setStyleName("Default");
                textArea.setStyleName("Default");
            }
        });
        
        controlsColumn.addButton("Set StyleName = Null", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                textField.setStyleName(null);
                passwordField.setStyleName(null);
                textArea.setStyleName(null);
            }
        });
        
        controlsColumn.addButton("Query TextField State", new ActionListener(){
        
            public void actionPerformed(ActionEvent e) {
                ((InteractiveApp) getApplicationInstance()).consoleWrite("TextField Value:" + textField.getText());
            }
        });
        
        controlsColumn.addButton("Set Text to Multiple Lines", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String text = "This\nis\na\ntest.";
                textField.getDocument().setText(text);
                passwordField.getDocument().setText(text);
                textArea.getDocument().setText(text);
            }
        });
        
        controlsColumn.addButton("Test HTML Encoding", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String text = "<b>this should NOT be bold</b>";
                textField.getDocument().setText(text);
                passwordField.getDocument().setText(text);
                textArea.getDocument().setText(text);
            }
        });
        
        controlsColumn.addButton("Test Whitespace Encoding", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String text = "   There   are   three   spaces   leading,   trailing,   "
                        + "and   between   each   word.   ";
                textField.getDocument().setText(text);
                passwordField.getDocument().setText(text);
                textArea.getDocument().setText(text);
            }
        });
        controlsColumn.addButton("Integer++", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setText(Integer.toString(toInt(textField.getText()) + 1));
                passwordField.setText(Integer.toString(toInt(passwordField.getText()) + 1));
                textArea.setText(Integer.toString(toInt(textArea.getText()) + 1));
            }
        });
        controlsColumn.addButton("Integer--", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setText(Integer.toString(toInt(textField.getText()) - 1));
                passwordField.setText(Integer.toString(toInt(passwordField.getText()) - 1));
                textArea.setText(Integer.toString(toInt(textArea.getText()) - 1));
            }
        });
        controlsColumn.addButton("Toggle ToolTip Text", new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                if (textField.getToolTipText() == null) {
                    textField.setToolTipText("This is a tool tip.");
                    passwordField.setToolTipText("This is a tool tip.");
                    textArea.setToolTipText("This is a tool tip.");
                } else {
                    textField.setToolTipText(null);
                    passwordField.setToolTipText(null);
                    textArea.setToolTipText(null);
                }
            }
        });
        controlsColumn.addButton("Add ActionListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.addActionListener(actionListener);
                passwordField.addActionListener(actionListener);
                textArea.addActionListener(actionListener);
            }
        });
        controlsColumn.addButton("Remove ActionListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.removeActionListener(actionListener);
                passwordField.removeActionListener(actionListener);
                textArea.removeActionListener(actionListener);
            }
        });
        controlsColumn.addButton("Add DocumentListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.getDocument().addDocumentListener(documentListener);
                passwordField.getDocument().addDocumentListener(documentListener);
                textArea.getDocument().addDocumentListener(documentListener);
            }
        });
        controlsColumn.addButton("Remove DocumentListener", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.getDocument().removeDocumentListener(documentListener);
                passwordField.getDocument().removeDocumentListener(documentListener);
                textArea.getDocument().removeDocumentListener(documentListener);
            }
        });

        controlsColumn.addButton("Horizontal Scroll = 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setHorizontalScroll(new Extent(0));
                passwordField.setHorizontalScroll(new Extent(0));
                textArea.setHorizontalScroll(new Extent(0));
            }
        });
        
        controlsColumn.addButton("Horizontal Scroll = 100px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setHorizontalScroll(new Extent(100));
                passwordField.setHorizontalScroll(new Extent(100));
                textArea.setHorizontalScroll(new Extent(100));
            }
        });
        
        controlsColumn.addButton("Vertical Scroll = 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setVerticalScroll(new Extent(0));
                passwordField.setVerticalScroll(new Extent(0));
                textArea.setVerticalScroll(new Extent(0));
            }
        });
        
        controlsColumn.addButton("Vertical Scroll = 100px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setVerticalScroll(new Extent(100));
                passwordField.setVerticalScroll(new Extent(100));
                textArea.setVerticalScroll(new Extent(100));
            }
        });
        
        controlsColumn.addButton("Change Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.randomBorder();
                textField.setBorder(border);
                passwordField.setBorder(border);
                textArea.setBorder(border);
            }
        });
        controlsColumn.addButton("Set Border = null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setBorder(null);
                passwordField.setBorder(null);
                textArea.setBorder(null);
            }
        });
        controlsColumn.addButton("Change Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = textField.getBorder();
                if (border == null) {
                    return;
                }
                border = new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle());
                textField.setBorder(border);
                passwordField.setBorder(border);
                textArea.setBorder(border);
            }
        });
        controlsColumn.addButton("Change Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.nextBorderSize(textField.getBorder());
                if (border == null) {
                    return;
                }
                textField.setBorder(border);
                passwordField.setBorder(border);
                textArea.setBorder(border);
            }
        });
        controlsColumn.addButton("Change Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.nextBorderStyle(textField.getBorder());
                if (border == null) {
                    return;
                }
                textField.setBorder(border);
                passwordField.setBorder(border);
                textArea.setBorder(border);
            }
        });
        controlsColumn.addButton("Set BoxShadow", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setBoxShadow(StyleUtil.getBoxShadow());
                passwordField.setBoxShadow(StyleUtil.getBoxShadow());
                textArea.setBoxShadow(StyleUtil.getBoxShadow());
            }
        });
        controlsColumn.addButton("Clear BoxShadow", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setBoxShadow(null);
                passwordField.setBoxShadow(null);
                textArea.setBoxShadow(null);
            }
        });
        controlsColumn.addButton("Set Radius", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setRadius(new Insets(10));
                passwordField.setRadius(new Insets(10));
                textArea.setRadius(new Insets(10));
            }
        });
        controlsColumn.addButton("Clear Radius", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setRadius(null);
                passwordField.setRadius(null);
                textArea.setRadius(null);
            }
        });
        controlsColumn.addButton("Toggle Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                FillImage backgroundImage = textField.getBackgroundImage();
                if (backgroundImage == null) {
                    textField.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                    passwordField.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                    textArea.setBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                } else {
                    textField.setBackgroundImage(null);
                    passwordField.setBackgroundImage(null);
                    textArea.setBackgroundImage(null);
                }
            }
        });
        controlsColumn.addButton("Set Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Color color = StyleUtil.randomColor();
                textField.setForeground(color);
                passwordField.setForeground(color);
                textArea.setForeground(color);
            }
        });
        controlsColumn.addButton("Clear Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setForeground(null);
                passwordField.setForeground(null);
                textArea.setForeground(null);
            }
        });
        controlsColumn.addButton("Set Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Color color = StyleUtil.randomColor();
                textField.setBackground(color);
                passwordField.setBackground(color);
                textArea.setBackground(color);
            }
        });
        controlsColumn.addButton("Clear Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setBackground(null);
                passwordField.setBackground(null);
                textArea.setBackground(null);
            }
        });
        controlsColumn.addButton("Change Disabled Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.randomBorder();
                textField.setDisabledBorder(border);
                passwordField.setDisabledBorder(border);
                textArea.setDisabledBorder(border);
            }
        });
        controlsColumn.addButton("Change Disabled Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = textField.getDisabledBorder();
                if (border == null) {
                    return;
                }
                border = new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle());
                textField.setDisabledBorder(border);
                passwordField.setDisabledBorder(border);
                textArea.setDisabledBorder(border);
            }
        });
        controlsColumn.addButton("Change Disabled Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.nextBorderSize(textField.getDisabledBorder());
                if (border == null) {
                    return;
                }
                textField.setDisabledBorder(border);
                passwordField.setDisabledBorder(border);
                textArea.setDisabledBorder(border);
            }
        });
        controlsColumn.addButton("Change Disabled Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.nextBorderStyle(textField.getDisabledBorder());
                if (border == null) {
                    return;
                }
                textField.setDisabledBorder(border);
                passwordField.setDisabledBorder(border);
                textArea.setDisabledBorder(border);
            }
        });
        controlsColumn.addButton("Toggle Disabled Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                FillImage backgroundImage = textField.getDisabledBackgroundImage();
                if (backgroundImage == null) {
                    textField.setDisabledBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                    passwordField.setDisabledBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                    textArea.setDisabledBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                } else {
                    textField.setDisabledBackgroundImage(null);
                    passwordField.setDisabledBackgroundImage(null);
                    textArea.setDisabledBackgroundImage(null);
                }
            }
        });
        controlsColumn.addButton("Set Disabled Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Color color = StyleUtil.randomColor();
                textField.setDisabledForeground(color);
                passwordField.setDisabledForeground(color);
                textArea.setDisabledForeground(color);
            }
        });
        controlsColumn.addButton("Clear Disabled Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setDisabledForeground(null);
                passwordField.setDisabledForeground(null);
                textArea.setDisabledForeground(null);
            }
        });
        controlsColumn.addButton("Set Disabled Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Color color = StyleUtil.randomColor();
                textField.setDisabledBackground(color);
                passwordField.setDisabledBackground(color);
                textArea.setDisabledBackground(color);
            }
        });
        controlsColumn.addButton("Clear Disabled Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setDisabledBackground(null);
                passwordField.setDisabledBackground(null);
                textArea.setDisabledBackground(null);
            }
        });
        controlsColumn.addButton("Change Read-Only Border (All Attributes)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.randomBorder();
                textField.setReadOnlyBorder(border);
                passwordField.setReadOnlyBorder(border);
                textArea.setReadOnlyBorder(border);
            }
        });
        controlsColumn.addButton("Change Read-Only Border Color", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = textField.getReadOnlyBorder();
                if (border == null) {
                    return;
                }
                border = new Border(border.getSize(), StyleUtil.randomColor(), border.getStyle());
                textField.setReadOnlyBorder(border);
                passwordField.setReadOnlyBorder(border);
                textArea.setReadOnlyBorder(border);
            }
        });
        controlsColumn.addButton("Change Read-Only Border Size", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.nextBorderSize(textField.getReadOnlyBorder());
                if (border == null) {
                    return;
                }
                textField.setReadOnlyBorder(border);
                passwordField.setReadOnlyBorder(border);
                textArea.setReadOnlyBorder(border);
            }
        });
        controlsColumn.addButton("Change Read-Only Border Style", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Border border = StyleUtil.nextBorderStyle(textField.getReadOnlyBorder());
                if (border == null) {
                    return;
                }
                textField.setReadOnlyBorder(border);
                passwordField.setReadOnlyBorder(border);
                textArea.setReadOnlyBorder(border);
            }
        });
        controlsColumn.addButton("Toggle Read-Only Background Image", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                FillImage backgroundImage = textField.getReadOnlyBackgroundImage();
                if (backgroundImage == null) {
                    textField.setReadOnlyBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                    passwordField.setReadOnlyBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                    textArea.setReadOnlyBackgroundImage(Styles.BG_SHADOW_LIGHT_BLUE);
                } else {
                    textField.setReadOnlyBackgroundImage(null);
                    passwordField.setReadOnlyBackgroundImage(null);
                    textArea.setReadOnlyBackgroundImage(null);
                }
            }
        });
        controlsColumn.addButton("Set Read-Only Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Color color = StyleUtil.randomColor();
                textField.setReadOnlyForeground(color);
                passwordField.setReadOnlyForeground(color);
                textArea.setReadOnlyForeground(color);
            }
        });
        controlsColumn.addButton("Clear Read-Only Foreground", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setReadOnlyForeground(null);
                passwordField.setReadOnlyForeground(null);
                textArea.setReadOnlyForeground(null);
            }
        });
        controlsColumn.addButton("Set Read-Only Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                Color color = StyleUtil.randomColor();
                textField.setReadOnlyBackground(color);
                passwordField.setReadOnlyBackground(color);
                textArea.setReadOnlyBackground(color);
            }
        });
        controlsColumn.addButton("Clear Read-Only Background", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setReadOnlyBackground(null);
                passwordField.setReadOnlyBackground(null);
                textArea.setReadOnlyBackground(null);
            }
        });
        controlsColumn.addButton("Set MaximumLength=10", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setMaximumLength(10);
                passwordField.setMaximumLength(10);
                textArea.setMaximumLength(10);
            }
        });
        controlsColumn.addButton("Clear MaximumLength", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setMaximumLength(-1);
                passwordField.setMaximumLength(-1);
                textArea.setMaximumLength(-1);
            }
        });
        controlsColumn.addButton("Insets -> null", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setInsets(null);
                passwordField.setInsets(null);
                textArea.setInsets(null);
            }
        });
        controlsColumn.addButton("Insets -> 0px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setInsets(new Insets(0));
                passwordField.setInsets(new Insets(0));
                textArea.setInsets(new Insets(0));
            }
        });
        controlsColumn.addButton("Insets -> 5px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setInsets(new Insets(5));
                passwordField.setInsets(new Insets(5));
                textArea.setInsets(new Insets(5));
            }
        });
        controlsColumn.addButton("Insets -> 10/20/30/40px", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.setInsets(new Insets(10, 20, 30, 40));
                passwordField.setInsets(new Insets(10, 20, 30, 40));
                textArea.setInsets(new Insets(10, 20, 30, 40));
            }
        });

        controlsColumn.addButton("Toggle Enabled", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                boolean enabled = !textField.isEnabled();
                textField.setEnabled(enabled);
                passwordField.setEnabled(enabled);
                textArea.setEnabled(enabled);
            }
        });
        controlsColumn.addButton("Toggle Editable", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                boolean editable = !textField.isEditable();
                textField.setEditable(editable);
                passwordField.setEditable(editable);
                textArea.setEditable(editable);
            }
        });
        controlsColumn.addButton("Focus TextField", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(textField);
            }
        });
        controlsColumn.addButton("Focus PasswordField", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(passwordField);
            }
        });
        controlsColumn.addButton("Focus TextArea", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                getApplicationInstance().setFocusedComponent(textArea);
            }
        });
        controlsColumn.addButton("Sync Mode: On Action", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_MODE, 
                        new Integer(TextComponentPeer.SYNC_ON_ACTION));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_MODE, 
                        new Integer(TextComponentPeer.SYNC_ON_ACTION));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_MODE, 
                        new Integer(TextComponentPeer.SYNC_ON_ACTION));
            }
        });
        controlsColumn.addButton("Sync Mode: On Change", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_MODE, 
                        new Integer(TextComponentPeer.SYNC_ON_CHANGE));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_MODE, 
                        new Integer(TextComponentPeer.SYNC_ON_CHANGE));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_MODE, 
                        new Integer(TextComponentPeer.SYNC_ON_CHANGE));
            }
        });
        controlsColumn.addButton("Sync Delay: 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(0));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(0));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(0));
            }
        });
        controlsColumn.addButton("Sync Delay: 500", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(500));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(500));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(500));
            }
        });
        controlsColumn.addButton("Sync Delay: 1000", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(1000));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(1000));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(1000));
            }
        });
        controlsColumn.addButton("Sync Delay: 3000", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(3000));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(3000));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_DELAY, new Integer(3000));
            }
        });
        controlsColumn.addButton("Sync Initial Delay: 0", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(0));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(0));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(0));
            }
        });
        controlsColumn.addButton("Sync Initial Delay: 500", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(500));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(500));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(500));
            }
        });
        controlsColumn.addButton("Sync Initial Delay: 1000", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(1000));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(1000));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(1000));
            }
        });
        controlsColumn.addButton("Sync Initial Delay: 3000", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                textField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(3000));
                passwordField.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(3000));
                textArea.set(TextComponentPeer.PROPERTY_SYNC_INITIAL_DELAY, new Integer(3000));
            }
        });
        controlsColumn.addButton("Launch Modal Dialog", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                WindowPane modalWindow = new WindowPane();
                modalWindow.setStyleName("Default");
                modalWindow.setTitle("Blocking Modal WindowPane");
                modalWindow.setModal(true);
                InteractiveApp.getApp().getDefaultWindow().getContent().add(modalWindow);
            }
        });
    }
}

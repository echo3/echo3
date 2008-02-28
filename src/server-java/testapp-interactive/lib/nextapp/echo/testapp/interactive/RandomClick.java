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

package nextapp.echo.testapp.interactive;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Component;
import nextapp.echo.app.Window;
import nextapp.echo.app.button.AbstractButton;

/**
 * Provides capability to randomly click any on-screen button.
 */
public class RandomClick {
    
    /**
     * A <code>Collection</code> containing the text of buttons which should 
     * not be clicked.
     */
    private static final Collection BUTTON_BLACKLIST;
    static {
        Collection blacklist = new HashSet();
        
        // Ghost test is also protected using other means, but no reason to bother with it.
        blacklist.add("Push (Ghost Test)");
        
        // Exception test deliberately throws exceptions...not what we're looking for.
        blacklist.add("Exception");
        
        // Don't recursively start random click test.
        blacklist.add("Random Click");
        
        // Delay test skews ghost-test based performance test results.
        blacklist.add("Delay");
        
        // Contains buttons to deliberately throw exceptions and invalidate sessions.  Not good.
        blacklist.add("Client Configuration");
        
        // Client exceptions are bad too.
        blacklist.add("Client Exception");

        // Command test might do a redirect, killing the ghost test.
        blacklist.add("Command");
        
        // Demo visitors might think the application broke if the style sheet gets set to null.
        blacklist.add("No Style Sheet");
        
        // Image test skews ghost-test based performance test results (AWTImageReference).
        blacklist.add("Image");
        
        // Text Sync has delay buttons.
        blacklist.add("Text Sync");
        
        // Do not add modal windows.
        blacklist.add("Add Modal Window");
        blacklist.add("Add Three Modal Windows");
        blacklist.add("Add \"Modal Launching\" Component Sampler to Embedded ContentPane");
        
        BUTTON_BLACKLIST = Collections.unmodifiableCollection(blacklist);
    }
    
    /**
     * Retrieves all buttons currently displayed in the user-interface and 
     * programmatically clicks one.
     */
    public static void clickRandomButton() {
        Window window = ApplicationInstance.getActive().getDefaultWindow();
        List buttonList = new ArrayList();
        findButtons(buttonList, window);
        AbstractButton button = (AbstractButton) buttonList.get((int) (buttonList.size() * Math.random()));
        button.doAction();
    }
    
    /**
     * Recursively finds <code>Button</code>s in the hierarchy whose parent
     * is <code>component</code> and adds them to the
     * <code>foundButtons</code> collection.
     * 
     * @param foundButtons the <code>Collection</code> to which
     *        <code>Button</code>s will be added
     * @param component the root <code>Component</code> of the hierarchy to
     *        search
     */
    private static void findButtons(Collection foundButtons, Component component) {
        if (component instanceof AbstractButton && !BUTTON_BLACKLIST.contains(((AbstractButton) component).getText())
                && component.isRenderEnabled()) {
            foundButtons.add(component);
        }
        Component[] children = component.getComponents();
        for (int i = 0; i < children.length; ++i) {
            findButtons(foundButtons, children[i]);
        }
    }
    
    /** Non-instantiable class. */
    private RandomClick() { }
}

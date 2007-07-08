/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

package nextapp.echo.webcontainer.sync.component;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.app.Component;
import nextapp.echo.app.Font;
import nextapp.echo.app.list.AbstractListComponent;
import nextapp.echo.app.list.ListCellRenderer;
import nextapp.echo.app.list.ListModel;
import nextapp.echo.app.list.StyledListCell;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.serial.property.ColorPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

public abstract class AbstractListComponentPeer extends AbstractComponentSynchronizePeer  {

    private class ListData {

        private ListModel model;
        private ListCellRenderer renderer;
        private AbstractListComponent listComponent;

        ListData(AbstractListComponent component) {
            super();
            this.listComponent = component;
            this.model = component.getModel();
            this.renderer = component.getCellRenderer();
        }

        /**
         * @see java.lang.Object#equals(java.lang.Object)
         */
        public boolean equals(Object o) {
            if (!(o instanceof ListData)) {
                return false;
            }
            ListData that = (ListData) o;

            if (!(this.model == that.model 
                    || (this.model != null && this.model.equals(that.model)))) {
                return false;
            }

            if (!(this.renderer == that.renderer 
                    || (this.renderer != null && this.renderer.equals(that.renderer)))) {
                return false;
            }

            return true;
        }

        /**
         * @see java.lang.Object#hashCode()
         */
        public int hashCode() {
            return (model == null ? 0 : model.hashCode()) | (renderer == null ? 0 : renderer.hashCode());
        }
    }

    public static class ListDataPeer 
    implements SerialPropertyPeer {

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context, 
         *      java.lang.Class, org.w3c.dom.Element)
         */
        public Object toProperty(Context context, Class objectClass, Element propertyElement) 
        throws SerialException {
            throw new UnsupportedOperationException();
        }

        /**
         * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context, 
         *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
         */
        public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
        throws SerialException {
            SerialPropertyPeer fontPeer = null;
            SerialContext serialContext = ((SerialContext) context.get(SerialContext.class));
            Document document = serialContext.getDocument();
            ListData listData = (ListData) propertyValue; 
            propertyElement.setAttribute("t", "RemoteListData");
            int size = listData.model.size();
            for (int i = 0; i < size; ++i) {
                Element eElement = document.createElement("e");
                Object value = listData.model.get(i);
                eElement.setAttribute("t", value.toString());
                propertyElement.appendChild(eElement);

                Object cell = listData.renderer.getListCellRendererComponent(listData.listComponent, value, i);

                if (cell instanceof StyledListCell) {
                    StyledListCell styledCell = (StyledListCell) cell;
                    if (styledCell.getBackground() != null) {
                        eElement.setAttribute("b", ColorPeer.toString(styledCell.getBackground()));
                    }
                    if (styledCell.getForeground() != null) {
                        eElement.setAttribute("f", ColorPeer.toString(styledCell.getForeground()));
                    }
                    if (styledCell.getFont() != null) {
                        if (fontPeer == null) {
                            PropertyPeerFactory propertyPeerFactory 
                            = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
                            fontPeer = propertyPeerFactory.getPeerForProperty(Font.class);
                        }
                        Element fontElement = document.createElement("p");
                        eElement.appendChild(fontElement);
                        fontPeer.toXml(context, Font.class, fontElement, styledCell.getFont());
                    }
                }
            }
        }
    }

    private static final Service LIST_COMPONENT_SERVICE = JavaScriptService.forResources("Echo.ListComponent",
            new String[] { "/nextapp/echo/webcontainer/resource/js/Render.List.js",
                           "/nextapp/echo/webcontainer/resource/js/RemoteClient.List.js" });

    static {
        WebContainerServlet.getServiceRegistry().add(LIST_COMPONENT_SERVICE);
    }

    private static final String PROPERTY_DATA = "data";

    public AbstractListComponentPeer() {
        super();
        addOutputProperty(PROPERTY_DATA);
        setOutputPropertyReferenced(PROPERTY_DATA, true);
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputProperty(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String, int)
     */
    public Object getOutputProperty(Context context, Component component, String propertyName, int propertyIndex) {
        if (PROPERTY_DATA.equals(propertyName)) {
            return new ListData((AbstractListComponent) component);
        }
        return super.getOutputProperty(context, component, propertyName, propertyIndex);
    }

    /**
     * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context)
     */
    public void init(Context context) {
        ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
        serverMessage.addLibrary(LIST_COMPONENT_SERVICE.getId());
    }

    /**
     * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getOutputPropertyMethodName(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Component, java.lang.String)
     */
    public String getOutputPropertyMethodName(Context context, Component component, String propertyName) {
        if (PROPERTY_DATA.equals(propertyName)) {
            return "updateListData";
        }
        return super.getOutputPropertyMethodName(context, component, propertyName);
    }
}

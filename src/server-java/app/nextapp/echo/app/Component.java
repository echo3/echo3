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

package nextapp.echo.app;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

import nextapp.echo.app.event.EventListenerList;

/**
 * A representation of an Echo component. This is an abstract base class from
 * which all Echo components are derived.
 * <p>
 * A hierarchy of <code>Component</code> objects is used to represent the
 * state of an application's user interface. A <code>Component</code> may have
 * a single parent <code>Component</code> and may contain zero or more child
 * <code>Component</code>s. Certain <code>Component</code>s may limit the
 * number or type(s) of children which may be added to them, and may even
 * establish requirements for what type(s) of parent <code>Component</code>s
 * they may be added to. In the event that an application attempts to add a
 * child <code>Component</code> to a parent <code>Component</code> in spite
 * of these requirements, an <code>IllegalChildException</code> is thrown.
 * 
 * <h3>Properties and Styles</h3>
 * <p>
 * The state of a single <code>Component</code> is represented by its
 * properties. Properties can be categorized into two types: "style" and
 * "non-style". Style properties are generally used to represent the
 * "look-and-feel" of a Component--information such as colors, fonts, location,
 * and borders. "Non-style" properties are generally used to represent
 * non-stylistic information such as data models, selection models, and locale.
 * <p>
 * "Style Properties" have a special definition because they may be stored in
 * <code>Style</code> or <code>StyleSheet</code> objects instead of as
 * properties of a specific <code>Component</code> instance. Property values
 * contained in a relevant <code>Style</code> or <code>StyleSheet</code>
 * will be used for rendering when the property values are not specified by a
 * <code>Component</code> itself. Style properties are identified by the
 * presence of a public static constant name in a <code>Component</code>
 * implementation with the prefix <code>PROPERTY_</code>. In the base
 * <code>Component</code> class itself there are several examples of style
 * properties, such as <code>PROPERTY_BACKGROUND</code>,<code>PROPERTY_FONT</code>
 * and <code>PROPERTY_LAYOUT_DATA</code>. The rendering application container
 * will use the <code>Component.getRenderProperty()</code> and
 * <code>Component.getRenderIndexedProperty()</code> to retrieve the values of
 * stylistic properties, in order that their values might be obtained from
 * the <code>Component</code>'s shared <code>Style</code> or the
 * <code>ApplicationInstance</code>'s <code>StyleSheet</code> in the event
 * they are not directly set in the <code>Component</code>.
 * <p>
 * A <code>Component</code> implementation should not store the values of
 * style properties as instance variables. Rather, the values of style
 * properties should be stored in the local <code>Style</code> instance, by
 * way of the <code>set()</code> method. The
 * <code>get()</code> method may be used to obtain the value of such
 * properties. Only style properties should be stored using these methods;
 * properties such as models should never be stored using the
 * <code>get()</code>/<code>set()</code> interface.
 * 
 * <h3>Events</h3>
 * <p>
 * Many <code>Component</code>s will provide the capability to register
 * <code>EventListener</code>s to notify interested parties when various
 * state changes occur. The base <code>Component</code> class provides an
 * <code>EventListenerList</code> as a convenient and memory efficient means
 * of storing such listeners. The internal <code>EventListenerList</code> may
 * be obtained using the <code>getEventListenerList()</code> method. The
 * <code>EventListenerList</code> is lazy-created and will only be
 * instantiated on the first invocation of the
 * <code>getEventListenerList()</code> method. If the intent is only to
 * inquire about the state of event listeners without necessarily forcing
 * instantiation of an <code>EventListenerList</code>, the
 * <code>hasEventListenerList()</code> should be queried prior to invoking
 * <code>getEventListenerList()</code>.
 */
public abstract class Component 
implements RenderIdSupport, Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;
    
    /**
     * <code>ArrayList</code> capacity for child storage.
     */
    private static final int CHILD_LIST_CAPACITY = 3;

    /**
     * Empty array returned by <code>getComponents()</code> when a
     * <code>Component</code> has no children.
     */
    private static final Component[] EMPTY_COMPONENT_ARRAY = new Component[0];

    /**
     * Flag indicating the <code>Component</code> is currently in the process of being disposed.
     */
    private static final int FLAG_DISPOSE_IN_PROGRESS = 0x20;
    
    /**
     * Flag indicating the <code>Component</code> is enabled.
     */
    private static final int FLAG_ENABLED = 0x1;
    
    /**
     * Flag indicating the <code>Component</code> is visible.
     */
    private static final int FLAG_VISIBLE = 0x2;
    
    /**
     * Flag indicating the <code>Component</code> will participate in the 
     * focus traversal order.
     */
    private static final int FLAG_FOCUS_TRAVERSAL_PARTICIPANT= 0x4;
    
    /**
     * Flag indicating that the <code>Component</code> is currently undergoing
     * initialization.
     */
    private static final int FLAG_INIT_IN_PROGRESS = 0x10;
    
    /**
     * Flag indicating that the <code>Component</code>  is initialized.
     */
    private static final int FLAG_INITIALIZED = 0x40;
    
    /**
     * Flag indicating that the <code>Component</code> is currently undergoing
     * registration to an <code>ApplicationInstance</code>.
     */
    private static final int FLAG_REGISTERING = 0x8;
    
    /** 
     * Property change event name for immediate children being made visible/invisible.
     * When used, the <code>newValue</code> of the event will represent a child made visible,
     * OR the <code>oldValue</code> will represent a child made invisible.
     */
    public static final String CHILD_VISIBLE_CHANGED_PROPERTY = "childVisible";

    /** 
     * Property change event name for immediate children being added/removed.
     * When used, the <code>newValue</code> of the event will represent an added child,
     * OR the <code>oldValue</code> will represent a removed child.
     */
    public static final String CHILDREN_CHANGED_PROPERTY = "children";

    /** Property change event name for enabled state changes. */
    public static final String ENABLED_CHANGED_PROPERTY = "enabled";

    /** Property change event name for next focus traversal component changes. */
    public static final String FOCUS_NEXT_ID_CHANGED_PROPERTY = "focusNextId";

    /** Property change event name for previous focus traversal component changes. */
    public static final String FOCUS_PREVIOUS_ID_CHANGED_PROPERTY = "focusPreviousId";
    
    /** Property change event name for focus traversal participation changes. */
    public static final String FOCUS_TRAVERSAL_PARTICIPANT_CHANGED_PROPERTY = "focusTraversalParticipant";
    
    /** Property change event name for layout direction changes. */
    public static final String LAYOUT_DIRECTION_CHANGED_PROPERTY = "layoutDirection";

    /** Property change event name for locale changes. */
    public static final String LOCALE_CHANGED_PROPERTY = "locale";

    /** Property change event name for referenced <code>Style</code> changes. */
    public static final String STYLE_CHANGED_PROPERTY = "style";

    /** Property change event name for named <code>Style</code> changes. */
    public static final String STYLE_NAME_CHANGED_PROPERTY = "styleName";
    
    /** Property change event name for visibility changes. */
    public static final String VISIBLE_CHANGED_PROPERTY = "visible";
    
    public static final String PROPERTY_BACKGROUND = "background";
    public static final String PROPERTY_FONT = "font";
    public static final String PROPERTY_FOREGROUND = "foreground";
    public static final String PROPERTY_LAYOUT_DATA = "layoutData";
    
    /**
     * Verifies a character can be used as initial character in a renderId
     * Character must be a (7-bit ASCII) letter.
     * 
     * @param ch the character to verify
     * @return true if the character is a (7-bit ASCII) letter.
     */
    private static final boolean isRenderIdStart(char ch) {
        return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
    }
    
    /**
     * Verifies a character can be used as a non-initial character in a renderId.
     * Character must be a (7-bit ASCII) letter, digit, or underscore.
     * 
     * @param ch the character to verify
     * @return true if the character is a (7-bit ASCII) letter, digit, or underscore.
     */
    private static final boolean isRenderIdPart(char ch) {
        return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_';
    }
    
    /** The <code>ApplicationInstance</code> to which the component is registered. */
    private ApplicationInstance applicationInstance;
    
    /** 
     * An ordered collection of references to child components.
     * This object is lazily instantiated. 
     */
    private List children;
    
    /**
     * Boolean flags for this component, including enabled state, visibility, 
     * focus traversal participation, and focus traversal index.
     * Multiple booleans are wrapped in a single integer
     * to save memory, since many <code>Component</code>instances will be 
     * created.
     */
    private int flags;
    
    /** 
     * A  user-defined identifier for this component.
     * This identifier is not related in any way to <code>renderId</code>. 
     */
    private String id;
    
    /** 
     * The layout direction of the component.
     * This property is generally unset, as layout direction information is 
     * normally inherited from the <code>ApplicationInstance</code> or from 
     * an ancestor <code>Component</code> in the hierarchy. 
     */
    private LayoutDirection layoutDirection;
    
    /** Listener storage. */
    private EventListenerList listenerList;

    /** 
     * The locale of the component.
     * This property is generally unset, as locale information is normally
     * inherited from the <code>ApplicationInstance</code> or from an ancestor
     * <code>Component</code> in the hierarchy. 
     */
    private Locale locale;
    
    /** Local style data storage for properties directly set on component itself. */
    private MutableStyle localStyle;
    
    /** The parent component. */
    private Component parent;
    
    /** 
     * The property change event dispatcher.
     * This object is lazily instantiated. 
     */
    private PropertyChangeSupport propertyChangeSupport;
    
    /** 
     * A application-wide unique identifier for this component. 
     * This identifier is not related in any way to <code>id</code>. 
     */
    private String renderId;
    
    /** Shared style. */
    private Style sharedStyle;
    
    /** Name of style to use from application style sheet */
    private String styleName;
    
    /** Render id of previous focus traversal component. */
    private String focusPreviousId;

    /** Render id of next focus traversal component. */
    private String focusNextId;

    /**
     * Creates a new <code>Component</code>.
     */
    public Component() {
        super();
        flags = FLAG_ENABLED | FLAG_VISIBLE | FLAG_FOCUS_TRAVERSAL_PARTICIPANT;
        localStyle = new MutableStyle();
    }
    
    /**
     * Adds the specified <code>Component</code> as a child of this 
     * <code>Component</code>.  The child will be added at the greatest
     * index.
     *
     * @param c the child <code>Component</code> to add
     */ 
    public void add(Component c) {
        add(c, -1);
    }

    /**
     * Adds the specified <code>Component</code> as the <code>n</code>th 
     * child of this component.
     * All component-add operations use this method to add components.
     * <code>Component</code>s that require notification of all child additions
     * should override this method (making sure to call the superclass' 
     * implementation).
     * If the child component currently has a parent in another hierarchy, it
     * will automatically be removed from that hierarchy before being added 
     * to this component.  This behavior will also occur if the child component
     * is currently a child of this component.
     *
     * @param c the child component to add
     * @param n the index at which to add the child component, or -1 to add the
     *          component at the end
     * @throws IllegalChildException if the child is not allowed to be added
     *         to this component, because it is either not valid for the 
     *         component's state or is of an invalid type
     */
    public void add(Component c, int n) 
    throws IllegalChildException {
        
        // Ensure child is acceptable to this component.
        if (!isValidChild(c)) {
            throw new IllegalChildException(this, c);
        }
        
        // Ensure child component finds this component acceptable as a parent.
        if (!c.isValidParent(this)) {
            throw new IllegalChildException(this, c);
        }

        // Remove child from it's current parent if required.
        if (c.parent != null) {
            c.parent.remove(c);
        }
        
        // Lazy-create child collection if necessary.
        if (children == null) {
            children = new ArrayList(CHILD_LIST_CAPACITY);
        }

        // Connect child to parent.
        c.parent = this;
        if (n == -1) {
            children.add(c);
        } else {
            children.add(n, c);
        }
        
        // Flag child as registered.
        if (applicationInstance != null) {
            c.register(applicationInstance);
        }

        // Notify PropertyChangeListeners of change.
        firePropertyChange(CHILDREN_CHANGED_PROPERTY, null, c);

        // Initialize component.
        c.doInit();
    }
    
    /**
     * Adds a property change listener to this <code>Component</code>.
     *
     * @param l the listener to add
     */
    public void addPropertyChangeListener(PropertyChangeListener l) {
        if (propertyChangeSupport == null) {
            propertyChangeSupport = new PropertyChangeSupport(this);
        }
        propertyChangeSupport.addPropertyChangeListener(l);
    }

    /**
     * Adds a property change listener to this <code>Component</code> for a specific property.
     * 
     * @param propertyName the name of the property for which to listen
     * @param l the listener to add
     */
    public void addPropertyChangeListener(String propertyName, PropertyChangeListener l) {
        if (propertyChangeSupport == null) {
            propertyChangeSupport = new PropertyChangeSupport(this);
        }
        propertyChangeSupport.addPropertyChangeListener(propertyName, l);
    }

    /**
     * Internal method to set the render identifier of the<code>Component</code>.
     * This method is invoked by the <code>ApplicationInstance</code>
     * when the component is registered or unregistered, or by manual
     * invocation of <code>setRenderId()</code>.  This method performs no
     * error checking.
     * 
     * @param renderId the new identifier
     * @see #getRenderId()
     * @see #setRenderId(java.lang.String)
     */
    void assignRenderId(String renderId) {
        this.renderId = renderId;
    }
    
    /**
     * Life-cycle method invoked when the <code>Component</code> is removed 
     * from a registered hierarchy.  Implementations should always invoke
     * <code>super.dispose()</code>.
     * Modifications to the component hierarchy are not allowed within this 
     * method.
     */
    public void dispose() { }
    
    /**
     * Recursively executes the <code>dispose()</code> life-cycle methods of 
     * this <code>Component</code> and its descendants.
     */
    void doDispose() {
        if (applicationInstance == null) {
            return;
        }
        if ((flags & (FLAG_INIT_IN_PROGRESS | FLAG_DISPOSE_IN_PROGRESS)) != 0) {
            throw new IllegalStateException(
                    "Attempt to dispose component when initialize or dispose operation already in progress.");
        }
        flags |= FLAG_DISPOSE_IN_PROGRESS;
        try {
            if (children != null) {
                Iterator it = children.iterator();
                while (it.hasNext()) {
                    ((Component) it.next()).doDispose();
                }
            }
            if ((flags & FLAG_INITIALIZED) == 0) {
                // Component already disposed.
                return;
            }
            dispose();
            flags &= ~FLAG_INITIALIZED;
        } finally {
            flags &= ~FLAG_DISPOSE_IN_PROGRESS;
        }
    }
    
    /**
     * Recursively executes the <code>init()</code> life-cycle methods of 
     * this <code>Component</code> and its descendants.
     */
    void doInit() {
        if (applicationInstance == null) {
            return;
        }
        if ((flags & FLAG_INITIALIZED) != 0) {
            // Component already initialized.
            return;
        }
        
        if ((flags & (FLAG_INIT_IN_PROGRESS | FLAG_DISPOSE_IN_PROGRESS)) != 0) {
            throw new IllegalStateException(
                    "Attempt to initialize component when initialize or dispose operation already in progress.");
        }
        flags |= FLAG_INIT_IN_PROGRESS;
        try {
            init();
            flags |= FLAG_INITIALIZED;
            if (children != null) {
                Iterator it = children.iterator();
                while (it.hasNext()) {
                    ((Component) it.next()).doInit();
                }
            }
        } finally {
            flags &= ~FLAG_INIT_IN_PROGRESS;
        }
    }
    
    /**
     * Reports a bound property change to <code>PropertyChangeListener</code>s
     * and to the <code>ApplicationInstance</code>'s update management system.
     *
     * @param propertyName the name of the changed property
     * @param oldValue the previous value of the property
     * @param newValue the present value of the property
     */
    protected void firePropertyChange(String propertyName, Object oldValue, Object newValue) {
        // Report to PropertyChangeListeners.
        if (propertyChangeSupport != null) {
            propertyChangeSupport.firePropertyChange(propertyName, oldValue, newValue);
        }
        
        // Report to ApplicationInstance.
        // The ApplicationInstance is notified directly in order to reduce
        // per-Component-instance memory requirements, i.e., it enables the 
        // PropertyChangeSupport object to only be instantiated on Components 
        // that have ProperyChangeListeners registered by a third party.
        if (applicationInstance != null) {
            applicationInstance.notifyComponentPropertyChange(this, propertyName, oldValue, newValue);
        }
    }
    
    /**
     * Returns the value of the specified property.
     * This method is generally used only internally by a 
     * <code>Component</code>, however there are exceptions.
     * The more specific <code>getXXX()</code> methods to retrieve 
     * property values from a <code>Component</code> whenever
     * possible.
     * See the class-level documentation for a more detailed 
     * explanation of the use of this method.
     * 
     * @param propertyName the property name
     * @return the property value
     */
    public final Object get(String propertyName) {
        return localStyle.get(propertyName);
    }
    
    /**
     * Returns the <code>ApplicationInstance</code> to which this 
     * <code>Component</code> is registered, or null if it is not currently 
     * registered.
     * 
     * @return the application instance
     */
    public ApplicationInstance getApplicationInstance() {
        return applicationInstance;
    }
    
    /**
     * Returns the default/base background color of the <code>Component</code>.
     * This property may not be relevant to certain components, though
     * even in such cases may be useful for setting a default for
     * children.
     *
     * @return the background color
     */
    public Color getBackground() {
        return (Color) localStyle.get(PROPERTY_BACKGROUND);
    }
    
    /**
     * Returns the <code>n</code>th immediate child component.
     *
     * @param n the index of the <code>Component</code> to retrieve
     * @return the <code>Component</code> at index <code>n</code>
     * @throws IndexOutOfBoundsException when the index is invalid
     */
    public final Component getComponent(int n) {
        if (children == null) {
            throw new IndexOutOfBoundsException();
        }
        
        return (Component) children.get(n);
    }
    
    /**
     * Recursively searches for the component with the specified id
     * by querying this component and its descendants.
     * The id value is that retrieved and set via the <code>getId()</code>
     * and <code>setId()</code> methods.  This method is in no way
     * related to <code>renderId</code>s.
     * 
     * @param id the user-defined id of the component to be retrieved
     * @return the component with the specified id, if it either is this
     *         component or is a descendant of it, or null otherwise
     */
    public final Component getComponent(String id) {
        if (id.equals(this.id)) {
            return this;
        }
        if (children == null) {
            return null;
        }
        Iterator it = children.iterator();
        while (it.hasNext()) {
            Component testComponent = (Component) it.next();
            Component targetComponent = testComponent.getComponent(id);
            if (targetComponent != null) {
                return targetComponent;
            }
        }
        return null;
    }
    
    /**
     * Returns the number of immediate child <code>Component</code>s.
     *
     * @return the number of immediate child <code>Component</code>s
     */
    public final int getComponentCount() {
        if (children == null) {
            return 0;
        } else {
            return children.size();
        }
    }
    
    /**
     * Returns an array of all immediate child <code>Component</code>s.
     *
     * @return an array of all immediate child <code>Component</code>s
     */
    public final Component[] getComponents() {
        if (children == null) {
            return EMPTY_COMPONENT_ARRAY;
        } else {
            return (Component[]) children.toArray(new Component[children.size()]);
        }
    }
    
    /**
     * Returns the local <code>EventListenerList</code>.
     * The listener list is lazily created; invoking this method will 
     * create the <code>EventListenerList</code> if required.
     * 
     * @return the listener list
     */
    protected EventListenerList getEventListenerList() {
        if (listenerList == null) {
            listenerList = new EventListenerList();
        }
        return listenerList;
    }
    
    /**
     * Returns the next focusable component.
     * 
     * @return the renderId of the next focusable component
     * @see #setFocusNextId
     */
    public String getFocusNextId() {
        return focusNextId;
    }
    
    /**
     * Returns the previous focusable component.
     * 
     * @return the renderId of the previous focusable component
     * @see #setFocusPreviousId
     */
    public String getFocusPreviousId() {
        return focusPreviousId;
    }
    
    /**
     * Returns the default/base font of the component.
     * This property may not be relevant to certain components, though
     * even in such cases may be useful for setting a default for
     * children.
     *
     * @return the font
     */
    public Font getFont() {
        return (Font) localStyle.get(PROPERTY_FONT);
    }
    
    /**
     * Returns the default/base foreground color of the <code>Component</code>.
     * This property may not be relevant to certain components, though
     * even in such cases may be useful for setting a default for 
     * children.
     *
     * @return the foreground color
     */
    public Color getForeground() {
        return (Color) localStyle.get(PROPERTY_FOREGROUND);
    }
    
    /**
     * Returns the user-defined identifier of the <code>Component</code>.
     * Note that the user defined identifier has no relation to the
     * <code>renderId</code>.
     * 
     * @return the user-defined identifier
     */
    public String getId() {
        return id;
    }
    
    /**
     * Returns the value of the specified indexed property.
     * This method is generally used only internally by a 
     * <code>Component</code>, however there are exceptions.
     * The more specific <code>getXXX()</code> methods to retrieve 
     * property values from a <code>Component</code> whenever
     * possible.
     * See the class-level documentation for a more detailed 
     * explanation of the use of this method.
     * 
     * @param propertyName the property name
     * @param propertyIndex the property index
     * @return the property value
     */
    public final Object getIndex(String propertyName, int propertyIndex) {
        return localStyle.getIndex(propertyName, propertyIndex);
    } 
    
    /**
     * Returns the <code>LayoutData</code> object used to describe how this
     * <code>Component</code> should be laid out within its parent container.
     * 
     * @return the layout data, or null if unset
     * @see LayoutData
     */
    public LayoutData getLayoutData() {
        return (LayoutData) localStyle.get(PROPERTY_LAYOUT_DATA);
    }

    /**
     * Returns the specific layout direction setting of this component, if any.
     * This method will return null unless a <code>LayoutDirection</code> is
     * specifically set on <strong>this</strong> <code>Component</code>.
     * 
     * @return the layout direction property of <strong>this</strong>
     *         <code>Component</code>
     */
    public LayoutDirection getLayoutDirection() {
        return layoutDirection;
    }

    /**
     * Returns the specific locale setting of this component, if any.
     * This method will return null unless a <code>Locale</code> is
     * specifically set on <strong>this</strong> <code>Component</code>.
     * 
     * @return the locale property of <strong>this</strong> 
     *         <code>Component</code>
     */
    public Locale getLocale() {
        return locale;
    }
    
    /**
     * Returns the <code>Style</code> object in which local style
     * properties are stored.  Access to this object is provided
     * solely for the purpose of allowing the enabling the application
     * container to render the state of the component to a client.
     * 
     * @return the local <code>Style</code>
     */
    public Style getLocalStyle() {
        return localStyle;
    }
    
    /**
     * Returns the parent component.
     * 
     * @return the parent component, or null if this component has no parent
     */
    public final Component getParent() {
        return parent;
    }
    
    /**
     * Returns the render id of this component.  
     * This id is only guaranteed to be unique within 
     * the <code>ApplicationInstance</code> to which this component is 
     * registered.  This method returns null in the event that the 
     * component is not registered to an <code>ApplicationInstance</code>.
     * 
     * @return the <code>ApplicationInstance</code>-wide unique id of this 
     *         component
     * @see nextapp.echo.app.RenderIdSupport#getRenderId()
     */
    public String getRenderId() {
        return renderId;
    }

    /**
     * Determines the &quot;rendered state&quot; of an indexed property.
     * The rendered state is determined by first determining if the given
     * property is locally set on this <code>Component</code>, and returning
     * it in that case.  If the property state is not set locally, the 
     * shared <code>Style</code> assigned to this component will be queried
     * for the property value.  If the property state is not set in the
     * shared <code>Style</code>, the <code>StyleSheet</code> of the
     * <code>ApplicationInstance</code> to which this <code>Component</code>
     * is registered will be queried for the property value.
     * In the event the property is not set in any of these resources,
     * null is returned.
     * <p>
     * The application container will invoke this method
     * rather than individual property getter methods to determine the state
     * of properties when rendering.
     * 
     * @param propertyName the name of the property
     * @return the rendered property value
     */
    public final Object getRenderIndexedProperty(String propertyName, int propertyIndex) {
        return getRenderIndexedProperty(propertyName, propertyIndex, null);
    }
    
    /**
     * Determines the &quot;rendered state&quot; of an indexed property.
     * The rendered state is determined by first determining if the given
     * property is locally set on this <code>Component</code>, and returning
     * it in that case.  If the property state is not set locally, the 
     * shared <code>Style</code> assigned to this component will be queried
     * for the property value.  If the property state is not set in the
     * shared <code>Style</code>, the <code>StyleSheet</code> of the
     * <code>ApplicationInstance</code> to which this <code>Component</code>
     * is registered will be queried for the property value.
     * In the event the property is not set in any of these resources,
     * <code>defaultValue</code> is returned.
     * 
     * @param propertyName the name of the property
     * @param defaultValue the value to be returned if the property is not set
     * @return the property state
     */ 
    public final Object getRenderIndexedProperty(String propertyName, int propertyIndex, Object defaultValue) {
        if (localStyle.isIndexedPropertySet(propertyName, propertyIndex)) {
            // Return local style value.
            return localStyle.getIndex(propertyName, propertyIndex);
        } else if (sharedStyle != null && sharedStyle.isIndexedPropertySet(propertyName, propertyIndex)) {
            // Return style value specified in shared style.
            return sharedStyle.getIndex(propertyName, propertyIndex);
        } else {
            if (applicationInstance != null) {
                Style applicationStyle = applicationInstance.getStyle(getClass(), styleName);
                if (applicationStyle != null && applicationStyle.isIndexedPropertySet(propertyName, propertyIndex)) {
                    // Return style value specified in application.
                    return applicationStyle.getIndex(propertyName, propertyIndex);
                }
            }
            return defaultValue;
        }
    }
    
    /**
     * Returns the rendered <code>Locale</code> of the <code>Component</code>.
     * If this <code>Component</code> does not itself specify a locale, its
     * ancestors will be queried recursively until a <code>Component</code>
     * providing a <code>Locale</code> is found. If no ancestors have
     * <code>Locale</code>s set, the <code>ApplicationInstance</code>'s
     * locale will be returned. In the event that no locale information is
     * available from the ancestral hierarchy of <code>Component</code>s and
     * no <code>ApplicationInstance</code> is registered, null is returned.
     * 
     * @return the locale for this component
     */
    public final Locale getRenderLocale() {
        if (locale == null) {
            if (parent == null) {
                if (applicationInstance == null) {
                    return null;
                } else {
                    return applicationInstance.getLocale();
                }
            } else {
                return parent.getRenderLocale();
            }
        } else {
            return locale;
        }
    }

    /**
     * Determines the &quot;rendered state&quot; of a property.
     * The rendered state is determined by first determining if the given
     * property is locally set on this <code>Component</code>, and returning
     * it in that case.  If the property state is not set locally, the 
     * shared <code>Style</code> assigned to this component will be queried
     * for the property value.  If the property state is not set in the
     * shared <code>Style</code>, the <code>StyleSheet</code> of the
     * <code>ApplicationInstance</code> to which this <code>Component</code>
     * is registered will be queried for the property value.
     * In the event the property is not set in any of these resources,
     * null is returned.
     * <p>
     * The application container will invoke this method
     * rather than individual property getter methods to determine the state
     * of properties when rendering.
     * 
     * @param propertyName the name of the property
     * @return the rendered property value
     */
    public final Object getRenderProperty(String propertyName) {
        return getRenderProperty(propertyName, null);
    }

    /**
     * Determines the &quot;rendered state&quot; of a property.
     * The rendered state is determined by first determining if the given
     * property is locally set on this <code>Component</code>, and returning
     * it in that case.  If the property state is not set locally, the 
     * shared <code>Style</code> assigned to this component will be queried
     * for the property value.  If the property state is not set in the
     * shared <code>Style</code>, the <code>StyleSheet</code> of the
     * <code>ApplicationInstance</code> to which this <code>Component</code>
     * is registered will be queried for the property value.
     * In the event the property is not set in any of these resources,
     * <code>defaultValue</code> is returned.
     * 
     * @param propertyName the name of the property
     * @param defaultValue the value to be returned if the property is not set
     * @return the property state
     */ 
    public final Object getRenderProperty(String propertyName, Object defaultValue) {
        Object propertyValue = localStyle.get(propertyName);
        if (propertyValue != null) {
            return propertyValue;
        }
        if (sharedStyle != null) {
            propertyValue = sharedStyle.get(propertyName);
            if (propertyValue != null) {
                return propertyValue;
            }
        }
        if (applicationInstance != null) {
            Style applicationStyle = applicationInstance.getStyle(getClass(), styleName);
            if (applicationStyle != null) {
                // Return style value specified in application.
                propertyValue = applicationStyle.get(propertyName);
                if (propertyValue != null) {
                    return propertyValue;
                }
            }
        }
        return defaultValue;
    }
    
    /**
     * Returns the shared <code>Style</code> object assigned to this 
     * <code>Component</code>.
     * As its name implies, the <strong>shared</strong> <code>Style</code> 
     * may be shared amongst multiple <code>Component</code>s.
     * Style properties will be rendered from the specified <code>Style</code>
     * when they are not specified locally in the <code>Component</code> 
     * itself.
     * 
     * @return the shared <code>Style</code>
     */
    public final Style getStyle() {
        return sharedStyle;
    }
    
    /**
     * Returns the name of the <code>Style</code> in the
     * <code>ApplicationInstance</code>'s<code>StyleSheet</code> from
     * which the renderer will retrieve properties. The renderer will only query
     * the <code>StyleSheet</code> when properties are not specified directly
     * by the <code>Component</code> or by the <code>Component</code>'s
     * shared <code>Style</code>.
     * 
     * @return the style name
     */
    public final String getStyleName() {
        return styleName;
    }
    
    /**
     * Returns the <code>n</code>th immediate <strong>visible</strong> 
     * child <code>Component</code>.
     *
     * @param n the index of the <code>Component</code> to retrieve
     * @return the <code>Component</code> at index <code>n</code>
     * @throws IndexOutOfBoundsException when the index is invalid
     */
    public final Component getVisibleComponent(int n) {
        if (children == null) {
            throw new IndexOutOfBoundsException(Integer.toString(n));
        }
        int visibleComponentCount = 0;
        Component component = null;
        Iterator it = children.iterator();
        while (visibleComponentCount <= n) {
            if (!it.hasNext()) {
              throw new IndexOutOfBoundsException(Integer.toString(n));
            }
            component = (Component) it.next();
            if (component.isVisible()) {
                ++visibleComponentCount;
            }
        }
        return component;
    }

    /**
     * Returns the number of <strong>visible</strong> immediate child 
     * <code>Component</code>s.
     *
     * @return the number of <strong>visible</strong> immediate child 
     *         <code>Component</code>s
     */
    public final int getVisibleComponentCount() {
        if (children == null) {
            return 0;
        } else {
            int visibleComponentCount = 0;
            Iterator it = children.iterator();
            while (it.hasNext()) {
                Component component = (Component) it.next();
                if (component.isVisible()) {
                    ++visibleComponentCount;
                }
            }
            return visibleComponentCount;
        }
    }
    
    /**
     * Returns an array of all <strong>visible</strong> immediate child 
     * <code>Component</code>s.
     *
     * @return an array of all <strong>visible</strong> immediate child 
     *         <code>Component</code>s
     */
    public final Component[] getVisibleComponents() {
        if (children == null) {
            return EMPTY_COMPONENT_ARRAY;
        } else {
            Iterator it = children.iterator();
            List visibleChildList = new ArrayList();
            while (it.hasNext()) {
                Component component = (Component) it.next();
                if (component.isVisible()) {
                    visibleChildList.add(component);
                }
            }
            return (Component[]) visibleChildList.toArray(new Component[visibleChildList.size()]);
        }
    }
    
    /**
     * Determines if a local <code>EventListenerList</code> exists.
     * If no listener list exists, it can be assured that there are thus no
     * listeners registered to it.  This method should be invoked by event
     * firing code prior to invoking <code>getListenerList()</code> to avoid
     * unnecessary creation of an <code>EventListenerList</code> in response
     * to their query.
     * 
     * @return true if a local <code>EventListenerList</code> exists
     */
    protected boolean hasEventListenerList() {
        return listenerList != null;
    }
    
    /**
     * Determines the index of the given <code>Component</code> within the 
     * children of this <code>Component</code>.  If the given 
     * <code>Component</code> is not a child, <code>-1</code> is returned.
     * 
     * @param c the <code>Component</code> to analyze
     * @return the index of the specified <code>Component</code> amongst the 
     *         children of this <code>Component</code>
     */
    public final int indexOf(Component c) {
        return children == null ? -1 : children.indexOf(c);
    }
    
    /**
     * Life-cycle method invoked when the <code>Component</code> is added 
     * to a registered hierarchy.  Implementations should always invoke
     * <code>super.init()</code>.
     * Modifications to the component hierarchy are not allowed within this 
     * method.
     */
    public void init() { }
    
    /**
     * Determines if this <code>Component</code> is or is an ancestor of 
     * the specified <code>Component</code>.
     * 
     * @param c the <code>Component</code> to test for ancestry
     * @return true if this <code>Component</code> is an ancestor of the 
     *         specified <code>Component</code>
     */
    public final boolean isAncestorOf(Component c) {
        while (c != null && c != this) {
            c = c.parent;
        }
        return c == this;
    }
    
    /**
     * Determines the enabled state of this <code>Component</code>.
     * Disabled<code>Component</code>s are not eligible to receive user input.
     * The application container may render disabled components with an altered
     * appearance. 
     * 
     * @return true if the component is enabled
     * @see #verifyInput(java.lang.String, java.lang.Object)
     */
    public final boolean isEnabled() {
        return (flags & FLAG_ENABLED) != 0;
    }
    
    /**
     * Determines if the <code>Component</code> participates in (tab) focus 
     * traversal.
     * 
     * @return true if the <code>Component</code> participates in focus 
     *         traversal
     */
    public boolean isFocusTraversalParticipant() {
        return (flags & FLAG_FOCUS_TRAVERSAL_PARTICIPANT) != 0;
    }

    /**
     * Determines if the <code>Component</code> is registered to an 
     * <code>ApplicationInstance</code>.
     * 
     * @return true if the <code>Component</code> is registered to an 
     *         <code>ApplicationInstance</code>
     */
    public final boolean isRegistered() {
        return applicationInstance != null;
    }
    
    /**
     * Determines whether this <code>Component</code> should be rendered with
     * an enabled state.
     * Disabled<code>Component</code>s are not eligible to receive user input.
     * The application container may render disabled components with an altered
     * appearance. 
     * 
     * @return true if the component should be rendered enabled.
     */
    public final boolean isRenderEnabled() {
        Component component = this;
        while (component != null) {
            if ((component.flags & FLAG_ENABLED) == 0) {
                return false;
            }
            component = component.parent;
        }
        return true;
    }
    
    /**
     * Determines if the <code>Component</code> and all of its parents are
     * visible.
     * 
     * @return true if the <code>Component</code> is recursively visible
     */
    public final boolean isRenderVisible() {
        Component component = this;
        while (component != null) {
            if ((component.flags & FLAG_VISIBLE) == 0) {
                return false;
            }
            component = component.parent;
        }
        return true;
    }
    
    /**
     * Determines if a given <code>Component</code> is valid to be added as a
     * child to this <code>Component</code>. Default implementation always
     * returns true, may be overridden to provide specific behavior.
     * 
     * @param child the <code>Component</code> to evaluate as a child
     * @return true if the <code>Component</code> is a valid child
     */
    public boolean isValidChild(Component child) {
        return true;
    }
    
    /**
     * Determines if this <code>Component</code> is valid to be added as a
     * child of the given parent <code>Component</code>. Default
     * implementation always returns true, may be overridden to provide specific
     * behavior.
     * 
     * @param parent the <code>Component</code> to evaluate as a parent
     * @return true if the <code>Component</code> is a valid parent
     */
    public boolean isValidParent(Component parent) {
        return true;
    }
    
    /**
     * Returns the visibility state of this <code>Component</code>.
     * Non-visible components will not be seen by the rendering application
     * container, and will not be rendered in any fashion on the user 
     * interface.  Rendering Application Containers should ensure that no 
     * information about the state of an invisible component is provided to 
     * the user interface for security purposes. 
     *
     * @return the visibility state of this <code>Component</code>
     */
    public final boolean isVisible() {
        return (FLAG_VISIBLE & flags) != 0;
    }
    
    /**
     * Processes client input specific to the <code>Component</code> 
     * received from the <code>UpdateManager</code>.
     * Derivative implementations should take care to invoke 
     * <code>super.processInput()</code>.
     * 
     * <strong>Security note:</strong>  Because input to this method is 
     * likely from a remote client, it should be treated as potentially hostile.
     * All input to this method should be carefully verified.
     * For example, directly invoking <code>set()</code> method with the
     * provided input would constitute a security hole. 
     * 
     * @param inputName the name of the input
     * @param inputValue the value of the input
     * @see nextapp.echo.app.update.UpdateManager
     */
    public void processInput(String inputName, Object inputValue) { }
    
    /**
     * Sets the <code>ApplicationInstance</code> to which this component is
     * registered.
     * <p>
     * The <code>ApplicationInstance</code> to which a component is registered
     * may not be changed directly from one to another, i.e., if the component
     * is registered to instance "A" and an attempt is made to set it to
     * instance "B", an <code>IllegalStateException</code> will be thrown. In
     * order to change the instance to which a component is registered, the
     * instance must first be set to null.
     * 
     * @param newValue the new <code>ApplicationInstance</code>
     * @throws IllegalStateException in the event that an attempt is made to
     *         re-add a <code>Component</code> to a hierarchy during a 
     *         <code>dispose()</code> operation or if an attempt is made to
     *         remove a <code>Component</code> during an <code>init()</code>
     *         operation.
     */
    void register(ApplicationInstance newValue) {
        // Verifying 'registering' flag is not set.
        if ((flags & FLAG_REGISTERING) != 0) {
            throw new IllegalStateException(
                    "Illegal attempt to register/unregister Component from within invocation of registration change " +
                    "life-cycle method.");
        }
        try {
            // Set 'registering' flag.
            flags |= FLAG_REGISTERING;
            
            if (applicationInstance == newValue) {
                // Child component added/removed during init()/dispose(): do nothing.
                return;
            }
            
            if (applicationInstance != null && newValue != null) {
                throw new IllegalStateException(
                        "Illegal attempt to re-register Component to alternate ApplicationInstance.");
            }
            
            if (newValue == null) { // unregistering
                if (children != null) {
                    Iterator it = children.iterator();
                    while (it.hasNext()) {
                        ((Component) it.next()).register(null); // Recursively unregister children.
                    }
                }
                
                applicationInstance.unregisterComponent(this);
            }
            
            applicationInstance = newValue;
            
            if (newValue != null) { // registering
                applicationInstance.registerComponent(this);
    
                if (children != null) {
                    Iterator it = children.iterator();
                    while (it.hasNext()) {
                        ((Component) it.next()).register(newValue); // Recursively register children.
                    }
                }
            }
        } finally {
            // Clear 'registering' flag.
            flags &= ~FLAG_REGISTERING;
        }
    }
    
    /**
     * Removes the specified child <code>Component</code> from this
     * <code>Component</code>.
     * <p>
     * All <code>Component</code> remove operations use this method to 
     * remove <code>Component</code>s. <code>Component</code>s that require 
     * notification of all child removals should 
     * override this method (while ensuring to call the superclass' 
     * implementation).
     * 
     * @param c the child <code>Component</code> to remove
     */
    public void remove(Component c) {

        if (children == null || !children.contains(c)) {
            // Do-nothing if component is not a child.
            return;
        }

        c.doDispose();
        
        // Deregister child.
        if (applicationInstance != null) {
            c.register(null);
        }
        
        // Dissolve references between parent and child.
        children.remove(c);
        c.parent = null;

        // Notify PropertyChangeListeners of change.
        firePropertyChange(CHILDREN_CHANGED_PROPERTY, c, null);
    }
    
    /**
     * Removes the <code>Component</code> at the <code>n</code>th index.
     *
     * @param n the index of the child <code>Component</code> to remove
     * @throws IndexOutOfBoundsException if the index is not valid
     */
    public void remove(int n) {
        if (children == null) {
            throw new IndexOutOfBoundsException();
        }
        remove(getComponent(n));
    }
    
    /**
     * Removes all child <code>Component</code>s.
     */
    public void removeAll() {
        if (children != null) {
            while (children.size() > 0) {
                Component c = (Component) children.get(children.size() - 1);
                remove(c);
            }
            children = null;
        }
    }
    
    /**
     * Removes a property change listener from this <code>Component</code>.
     *
     * @param l the listener to be removed
     */
    public void removePropertyChangeListener(PropertyChangeListener l) {
        if (propertyChangeSupport != null) {
            propertyChangeSupport.removePropertyChangeListener(l);
        }
    }
    
    /**
     * Removes a property change listener from this <code>Component</code> for a specific property.
     *
     * @param propertyName the name of the property for which to listen
     * @param l the listener to be removed
     */
    public void removePropertyChangeListener(String propertyName, PropertyChangeListener l) {
        if (propertyChangeSupport != null) {
            propertyChangeSupport.removePropertyChangeListener(propertyName, l);
        }
    }
    
    /**
     * Sets a generic property of the <code>Component</code>.
     * The value will be stored in this <code>Component</code>'s local style.
     * 
     * @param propertyName the name of the property
     * @param newValue the value of the property
     * @see #get(java.lang.String)
     */
    public void set(String propertyName, Object newValue) {
        Object oldValue = localStyle.get(propertyName);
        localStyle.set(propertyName, newValue);
        firePropertyChange(propertyName, oldValue, newValue);
    }
    
    /**
     * Sets the default background color of the <code>Component</code>.
     * 
     * @param newValue the new background <code>Color</code>
     */
    public void setBackground(Color newValue) {
        set(PROPERTY_BACKGROUND, newValue);
    }
    
    /**
     * Sets the child components for this container, removing
     * any existing children.
     * @param components the child components for this container.
     */
    public void setComponents(Component[] components) {
        removeAll();
        for (int i = 0; i < components.length; i++) {
            add(components[i]);
        }
    }
    
    /**
     * Sets the enabled state of the <code>Component</code>.
     * 
     * @param newValue the new state
     * @see #isEnabled
     */
    public void setEnabled(boolean newValue) {
        boolean oldValue = (flags & FLAG_ENABLED) != 0;
        if (oldValue != newValue) {
            flags ^= FLAG_ENABLED; // Toggle FLAG_ENABLED bit.
            firePropertyChange(ENABLED_CHANGED_PROPERTY, new Boolean(oldValue), new Boolean(newValue));
        }
    }

    /**
     * Sets whether the component participates in the focus traversal order 
     * (tab order).
     * 
     * @param newValue true if the component participates in the focus 
     *        traversal order
     */
    public void setFocusTraversalParticipant(boolean newValue) {
        boolean oldValue = isFocusTraversalParticipant();
        if (oldValue != newValue) {
            flags ^= FLAG_FOCUS_TRAVERSAL_PARTICIPANT; // Toggle FLAG_FOCUS_TRAVERSAL_PARTICIPANT bit.
            firePropertyChange(FOCUS_TRAVERSAL_PARTICIPANT_CHANGED_PROPERTY, new Boolean(oldValue), new Boolean(newValue));
        }
    }
    
    /**
     * Sets the next focusable component.
     * RenderIds are used for setting focus traversal order in order to avoid referencing/garbage collection issues.
     * Ensure that the component has a renderId (either by way of it having been registered with the application, or
     * having it manually set).
     * 
     * @param newValue the <code>renderId</code> of the next focusable component
     */
    public void setFocusNextId(String newValue) {
        String oldValue = focusNextId;
        focusNextId = newValue;
        firePropertyChange(FOCUS_NEXT_ID_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the previous focusable component.
     * RenderIds are used for setting focus traversal order in order to avoid referencing/garbage collection issues.
     * Ensure that the component has a renderId (either by way of it having been registered with the application, or
     * having it manually set).
     * 
     * @param newValue the <code>renderId</code> of the previous focusable component
     */
    public void setFocusPreviousId(String newValue) {
        String oldValue = focusPreviousId;
        focusPreviousId = newValue;
        firePropertyChange(FOCUS_PREVIOUS_ID_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the default text font of the <code>Component</code>.
     * 
     * @param newValue the new <code>Font</code>
     */
    public void setFont(Font newValue) {
        set(PROPERTY_FONT, newValue);
    }
    
    /**
     * Sets the default foreground color of the <code>Component</code>.
     * 
     * @param newValue the new foreground <code>Color</code>
     */
    public void setForeground(Color newValue) {
        set(PROPERTY_FOREGROUND, newValue);
    }
    
    /**
     * Sets a user-defined identifier for this <code>Component</code>.
     * 
     * @param id the new identifier
     */
    public void setId(String id) {
        this.id = id;
    }
    
    /**
     * Sets a generic indexed property of the <code>Component</code>.
     * The value will be stored in this <code>Component</code>'s local style.
     * 
     * @param propertyName the name of the property
     * @param propertyIndex the index of the property
     * @param newValue the value of the property
     * 
     * @see #getIndex(java.lang.String, int)
     */
    public void setIndex(String propertyName, int propertyIndex, Object newValue) {
        localStyle.setIndex(propertyName, propertyIndex, newValue);
        firePropertyChange(propertyName, null, null);
    }
    
    /**
     * Sets the <code>LayoutData</code> of this <code>Component</code>.
     * A <code>LayoutData</code> implementation describes how this
     * <code>Component</code> is laid out within/interacts with its 
     * containing parent <code>Component</code>.
     * 
     * @param newValue the new <code>LayoutData</code>
     * @see LayoutData
     */
    public void setLayoutData(LayoutData newValue) {
        set(PROPERTY_LAYOUT_DATA, newValue);
    }
    
    /**
     * Sets the <code>LayoutDirection</code> of this <code>Component</code>,
     * describing whether content is rendered left-to-right or right-to-left.
     * 
     * @param newValue the new <code>LayoutDirection</code>. 
     */
    public void setLayoutDirection(LayoutDirection newValue) {
        LayoutDirection oldValue = layoutDirection;
        layoutDirection = newValue;
        firePropertyChange(LAYOUT_DIRECTION_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the locale of the <code>Component</code>.
     *
     * @param newValue the new locale
     * @see #getLocale()
     */
    public void setLocale(Locale newValue) {
        Locale oldValue = locale;
        locale = newValue;
        firePropertyChange(LOCALE_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets a custom render identifier for this <code>Component</code>.
     * The identifier may be changed without notification if another 
     * component is already using it.
     * Identifiers are limited to ASCII alphanumeric values.  
     * The first character must be an upper- or lower-case ASCII letter.
     * Underscores and other punctuation characters are not permitted.
     * Use of "TitleCase" or "camelCase" is recommended.
     * 
     * @param renderId the new identifier
     */
    public void setRenderId(String renderId) {
        if (this.renderId != null && renderId != null && this.applicationInstance != null) {
            throw new IllegalStateException("Cannot set renderId while component is registered.");
        }
        if (renderId != null) {
            int length = renderId.length();
            if (!isRenderIdStart(renderId.charAt(0))) {
                throw new IllegalArgumentException("Invalid identifier:" + renderId);
            }
            for (int i = 1; i < length; ++i) {
                if (!isRenderIdPart(renderId.charAt(i))) {
                    throw new IllegalArgumentException("Invalid identifier:" + renderId);
                }
            }
            
        }
        assignRenderId(renderId);
    }
    
    /**
     * Sets the shared style of the <code>Component</code>.
     * Setting the shared style will have no impact on the local stylistic
     * properties of the <code>Component</code>.
     * 
     * @param newValue the new shared style
     * @see #getStyle()
     */
    public void setStyle(Style newValue) {
        Style oldValue = sharedStyle;
        sharedStyle = newValue;
        firePropertyChange(STYLE_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the name of the style to use from the
     * <code>ApplicationInstance</code>-defined <code>StyleSheet</code>.
     * Setting the style name will have no impact on the local stylistic
     * properties of the <code>Component</code>.
     * 
     * @param newValue the new style name
     * @see #getStyleName
     */
    public void setStyleName(String newValue) {
        String oldValue = styleName;
        styleName = newValue;
        firePropertyChange(STYLE_NAME_CHANGED_PROPERTY, oldValue, newValue);
    }
    
    /**
     * Sets the visibility state of this <code>Component</code>.
     * 
     * @param newValue the new visibility state
     * @see #isVisible()
     */
    public void setVisible(boolean newValue) {
        boolean oldValue = (flags & FLAG_VISIBLE) != 0;
        if (oldValue != newValue) {
            flags ^= FLAG_VISIBLE; // Toggle FLAG_VISIBLE bit.
            firePropertyChange(VISIBLE_CHANGED_PROPERTY, Boolean.valueOf(oldValue), Boolean.valueOf(newValue));
            if (parent != null) {
                parent.firePropertyChange(CHILD_VISIBLE_CHANGED_PROPERTY, newValue ? null : this, newValue ? this : null);
            }
        }
    }

    /**
     * A life-cycle method invoked before the component is rendered to ensure it
     * is in a valid state. Default implementation is empty. Overriding
     * implementations should ensure to invoke <code>super.validate()</code>
     * out of convention.
     */
    public void validate() { }
    
    /**
     * Invoked by the <code>ClientUpdateManager</code> on each component in the
     * hierarchy whose <code>processInput()</code> method will layer be invoked
     * in the current transaction.  This method should return true if the 
     * component will be capable of processing the given input in its current 
     * state or false otherwise.  This method should not do any of the actual
     * processing work if overridden (any actual processing should be done in
     * the <code>processInput()</code> implementation).
     * <p>
     * The default implementation verifies that the component is visible, 
     * enabled, and not "obscured" by the presence of any modal component.
     * If overriding this method, your implementation should invoke
     * <code>super.verifyInput()</code>.
     * 
     * @param inputName the name of the input
     * @param inputValue the value of the input
     * @return true if the input is allowed to be processed by this component
     *         in its current state
     */
    public boolean verifyInput(String inputName, Object inputValue) {
        if (applicationInstance != null && !applicationInstance.verifyModalContext(this)) {
            return false;
        }
        return isVisible() && isEnabled();
    }

    /**
     * Determines the index of the given <code>Component</code> within the 
     * <strong>visible</strong> children of this <code>Component</code>.  If the
     * given <code>Component</code> is not a child, <code>-1</code> is 
     * returned.
     * 
     * @param c the <code>Component</code> to analyze
     * @return the index of the specified <code>Component</code> amongst the 
     *         <strong>visible</strong> children of this <code>Component</code>
     */
    public final int visibleIndexOf(Component c) {
        if (!c.isVisible()) {
            return -1;
        }
        if (children == null) {
            return -1;
        }
        int visibleIndex = 0;
        Iterator it = children.iterator();
        while (it.hasNext()) {
            Component component = (Component) it.next();
            if (!component.isVisible()) {
                continue;
            }
            if (component.equals(c)) {
                return visibleIndex;
            }
            ++visibleIndex;
        }
        return -1;
    }
}

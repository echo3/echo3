package nextapp.echo.webcontainer;

import java.util.HashSet;
import java.util.Set;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import nextapp.echo.webcontainer.output.XmlDocument;

/**
 * The outgoing XML message which synchronizes the state of the client to that
 * of the server.
 */
public class ServerMessage extends XmlDocument {
    
    /**
     * Constant for the "init" message part group. Message parts in this group are
     * processed before the "update" group.
     */
    public static final String GROUP_ID_INIT = "init";

    /**
     * Constant for the "update" message part group. Message parts in this group are
     * processed after the "init" group.
     */
    public static final String GROUP_ID_UPDATE = "update";

    /** Set of added script libraries. */
    private Set addedLibraries;

    /**
     * DOM <code>libraries</code> Element to which <code>library</code>
     * elements are added to represent individual dynamically loaded JavaScript
     * libraries.
     */
    private Element librariesElement;

    /** Root DOM <code>server-message</code> element. */
    private Element serverMessageElement;

    /**
     * Creates a new <code>ServerMessage</code>.
     */
    public ServerMessage() {
        super("smsg", null, null, "http://www.nextapp.com/products/echo/svrmsg/servermessage.3.0");
        Document document = getDocument();
        serverMessageElement = document.getDocumentElement();
        librariesElement = document.createElement("libs");
        serverMessageElement.appendChild(librariesElement);

        // Add basic part groups.
        addPartGroup(GROUP_ID_INIT);
        addPartGroup(GROUP_ID_UPDATE);
    }

    /**
     * Adds a JavaScript library service to be dynamically loaded.
     * 
     * @param serviceId the id of the service to load (the service must return
     *        JavaScript code with content-type "text/javascript")
     */
    public void addLibrary(String serviceId) {
        if (addedLibraries == null) {
            addedLibraries = new HashSet();
        }
        if (addedLibraries.contains(serviceId)) {
            return;
        }
        Element libraryElement = getDocument().createElement("lib");
        libraryElement.setAttribute("i", serviceId);
        librariesElement.appendChild(libraryElement);
        addedLibraries.add(serviceId);
    }

    /**
     * Adds a "group" to the document. Part groups enable certain groups of
     * operations, e.g., remove operations, to be performed before others, e.g.,
     * add operations.
     * 
     * @param groupId the identifier of the group
     * @return the created "message-part-group" element.
     */
    public Element addPartGroup(String groupId) {
        Element messagePartGroupElement = getDocument().createElement("group");
        messagePartGroupElement.setAttribute("i", groupId);
        serverMessageElement.appendChild(messagePartGroupElement);
        return messagePartGroupElement;
    }

    /**
     * Retrieves the "message-part-group" element pertaining to a specific group.
     * 
     * @param groupId the id of the group
     * @return the "message-part-group" element
     */
    public Element getPartGroup(String groupId) {
        NodeList groupList = serverMessageElement.getElementsByTagName("group");
        int length = groupList.getLength();
        for (int i = 0; i < length; ++i) {
            Element groupElement = (Element) groupList.item(i);
            if (groupId.equals(groupElement.getAttribute("i"))) {
                return groupElement;
            }
        }
        return null;
    }

    /**
     * Adds a "message-part" to the document that will be processed by the
     * specified client-side processor object.
     * 
     * @param groupId the id of the group to which the "message-part" element
     *        should be added
     * @param processor the name of the client-side processor object which will
     *        process the message part, e.g., "EchoEventUpdate", or
     *        "EchoDomUpdate"
     * @return the created "message-part" element
     */
    public Element addDirective(String groupId, String processor) {
        Element messagePartGroupElement = getPartGroup(groupId);
        Element messagePartElement = getDocument().createElement("dir");
        messagePartElement.setAttribute("proc", processor);
        messagePartGroupElement.appendChild(messagePartElement);
        return messagePartElement;
    }

    /**
     * Creates and appends a directive element beneath to a message part.
     * Attempts to append the directive to an existing message part if the last
     * message part in the specified group happens to have the same processor as
     * is specified by the <code>processor</code> argument. If this is not
     * possible, a new "message-part" element is created and the directive is
     * added to it.
     * 
     * @param groupId
     * @param processor the name of the client-side processor object which will
     *        process the message part, e.g., "EchoEventUpdate", or
     *        "EchoDomUpdate"
     * @param directiveName the name of the directive, e.g., "event-add" or
     *        "dom-remove".
     * @return the directive element
     */
    public Element addDirective(String groupId, String processor, String directiveName) {
        Element messagePartElement = null;
        Element groupElement = getPartGroup(groupId);

        Element lastChild = (Element) groupElement.getLastChild();
        if (lastChild != null && processor.equals(lastChild.getAttribute("proc"))) {
            messagePartElement = lastChild;
        } else {
            messagePartElement = addDirective(groupId, processor);
        }
        
        Element directiveElement = getDocument().createElement(directiveName);
        messagePartElement.appendChild(directiveElement);
        return directiveElement;
    }
    
    /**
     * Sets the numeric identifier for this transaction, which will be returned
     * in next client message.
     * 
     * @param transactionId the transaction identifier
     */
    public void setTransactionId(long transactionId) {
        serverMessageElement.setAttribute("i", Long.toString(transactionId));
    }
}
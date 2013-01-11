                 ____    __          _      __    __ 
                / __/___/ /  ___    | | /| / /__ / / 
               / _// __/ _ \/ _ \   | |/ |/ / -_) _ \
              /___/\__/_//_/\___/   |__/|__/\__/_.__/
                    ____                                   __  
                   / __/______ ___ _  ___ _    _____  ____/ /__
                  / _// __/ _ `/  ' \/ -_) |/|/ / _ \/ __/  '_/
                 /_/ /_/  \_,_/_/_/_/\__/|__,__/\___/_/ /_/\_\ 
                                                               

What is Echo?
=============

Echo is an open-source framework for developing rich web applications. From the 
developer's perspective, Echo behaves as a user interface toolkit--like Swing or 
Eclipse SWT. 

AJAX technology is employed to deliver a user experience to web clients that 
approaches that of desktop-based applications. Echo applications can be created 
entirely in server-side Java code using a component-oriented and event-driven 
API or as client-side applications written in JavaScript.


Why Echo?
=========

Though MVC and Swing are well established and well known, most web application
frameworks on the market are still stuck in the paradigm of page-flow oriented
design principles and require a heavy mixture of different technologies like
XML, Java, JSP, Tag libraries, etc.
This has heavy implications on the development process as it disables full
reuse but requires to generate, write and maintain many different artifacts
during the whole process. Think of JSP template files, XML based page flow
descriptions, required form beans, and so on: All of these must be written,
maintained and kept in sync for every dialog of your project.

In contrast Echo offers a very efficient and sophisticated way to implement
and design complex real-world applications in pure Java, enabling to fully
leverage modern software design principles like inheritance, component-
oriented design, refactoring and all the others without making a stop on the
web tier.


Features
========

### Server-Side Java API
  Echo provides an entirely Java-based API for application development. The 
  Server-side framework makes use of a derivative of the client-side framework 
  to render the state of the server-side application remotely. The only 
  exception which requires JavaScript knowledge is in the case where the 
  developer wishes to extend the framework by creating components that render 
  custom XML/HTML/JavaScript code.


### Client-Side JavaScript API
  The entirity of the Echo framework has been ported to JavaScript, such that 
  applications may be developed entirely in JavaScript and function entirely 
  without any server round trips. This allows to shift between Server-Side and 
  Client-Side Web Application paradigms. 
  The API of the client-side version is similar to the server-side framework. 
  
* Delayed Batch Rendering  
    The client application framework renders changes to its component hierarchy 
    in batches. This strategy increases rendering efficiency and eliminates 
    potential screen flickering issues.
  
* Application Rendered Components (ARCs)  
    Client-side component synchronization peers may render components to HTML 
    by creating a container HTML element (e.g. a DIV) and then loading a 
    new client-side-only Echo application within the DIV. The Echo3Extras Rich 
    Text Editor uses this feature to display a MenuBarPane, WindowPane-based 
    dialogs, ColorSelects, toolbars and other UI elements. By writing the Rich 
    Text Editor as a client-side Echo application, much time was saved and the 
    editor is far more feature rich.      

### Java-Like development on Client-Side (CoreJS Library):
  Echo3 is built atop the CoreJS JavaScript Library, which provides cross-
  platform APIs for building JavaScript objects and interfacing with web 
  browser features (CSS/DOM). 

  The CoreJS Library imposed no dependencies or modifications to existing
  JavaScript namespace an provides the following features:

   - Class-based JavaScript Inheritance  
   - Virtual and Final JavaScript Properties 
   - Method References

### Automatic Client/Server Serialization:  
  Data objects sent between client and server can beautomatically serialized 
  between Java, XML, and JavaScript. The serialization architecture is 
  extensible--serialization code for new object types may be added by the 
  developer.
 
  Serializing components and commands between client and server is performed 
  automatically using the built-in serialization architecture. The component 
  developer only need specify which properties should be sent (for components, 
  all local style properties are automatically sent).

### User Experience Improvements
* Improved Layout Engine:   
    Echo3 features an improved layout engine which can automatically size 
    components to their content (e.g., WindowPanes and SplitPanes.
* Reduced Bandwidth:   
    Echo3 uses approximately 30-40% of the bandwidth of a comparable Echo2 
    application and much less compared to classic page-oriented applications. 
* Reduced Server Load:   
    Due to the fact that the server is no longer rendering HTML, it has quite 
    a bit less work to do. The reduced bandwidth usage means less server CPU 
    and memory utilization for rendering.
*  Keyboard Navigation / Focus Management:   
    Focus amongst components is now fully tracked. Echo does away with the 
    practice of using sequential tab index numbers to control focus order, 
    instead presenting next/previous element focus events to components for a 
    more intuitive user interface. Components that have multiple "focus points" 
    especially benefit from this feature.


The Latest Version
==================

Details of the latest official releases can be found on the wingS
GitHub web site <https://github.com/echo3/echo3>.

If you want to be in touch with the latest development we recommend
to retrieve the latest version directly out of Git. Details on how to 
access the public Git repository on GitHub can be found on the official
GitHub pages.


Documentation
-------------

Documentation is available online on the official Website at
  <http://echo.nextapp.com/site/echo3/doc>


Licensing
=========

Echo is licensed under the terms of the open-source Mozilla Public License. 
The terms of the Mozilla Public License provide software developers with the 
ability to use the product royalty free to develop both open-source and 
closed-source (proprietary) applications. 

Developers may also modify the source code to the Echo framework itself, but in 
this case are required to submit their changes back to the community. If 
desired, a developer may choose to instead license the Echo under the GNU 
Lesser General Public License or the GNU General Public License. Use of the GNU 
licenses is entirely optional.


Thanks for choosing Echo!

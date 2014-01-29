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

Echo is an open source framework for developing rich web applications. From the
developer's perspective, Echo behaves as a user interface toolkit like Java's
Swing or Eclipse SWT and completely abstracts developers from the web tier. Ajax
technology is employed to deliver a user experience to web clients that
approaches that of traditional desktop applications. Echo applications can be
created entirely in server-side Java code using a component-oriented and
event-driven API or as client-side applications written entirely in JavaScript.


Why Echo?
=========

Although Model-View-Controller (MVC) design principles and the Java Swing API
are well established and well known, most web application frameworks on the
market are still stuck in the paradigm of page-flow oriented design principles
and require a heavy mixture of different technologies like XML, Java, JSP, tag
libraries, etc. Such a paradigm has significant impacts on the development
process as it disables full reuse and requires developers to generate, write,
and maintain many different artifacts during the whole process: Think of JSP
template files, XML-based page flow descriptions, required form beans, and so
on; all of these must be written, maintained, and kept in sync for every element
of your project's user interface.

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
  The Echo framework is available to applications developed entirely within the
  web browser by using the client-side JavaScript API. The API of the
  client-side version is similar to the server-side framework and as such
  employs an API design that should be somewhat familiar to desktop application
  developers.
  
* Delayed Batch Rendering  
    The client application framework renders changes to its component hierarchy 
    in batches. This strategy increases rendering efficiency and eliminates 
    potential screen flickering issues.
  
* Application Rendered Components (ARCs)  
    Client-side component synchronization peers render components in the web
    browser by creating a container HTML element (e.g., a DIV) and then loading
    a new client-side Echo application within the DIV. For example, the
    Echo3Extras project's Rich Text Editor component uses this feature to
    display a menu bar, dialogs, color selection controls, toolbars and other
    user interface elements. By writing the Rich Text Editor as a client-side
    Echo application, a lot of time was saved and the editor is more feature
    rich as a result.

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

If you want to be stay current with the latest development, we recommend that
you retrieve the latest version directly out of Git. Details on how to access
the public Git repository on GitHub can be found on the official GitHub pages.


Documentation
-------------

Documentation is available online on the official Website at
  <http://echo.nextapp.com/site/echo3/doc>


Development
===========
Echo can be built by running

    ant dist

which will automatically fetch the required dependencies using Maven.

As IDE we recommend using IntelliJ IDEA. The source folder already contains
the project definition which allows you to directly open the project in IDEA.
Note that you should run either "ant dist" or "ant dependencies" before opening
the project to make sure the required libraries are present.
On the first run you have to register & select a installed JDK and choose a
default compilation output folder (choose a new empty folder 'build' in the
project to avoid errors about missing classes on running the unit tests).
Test your setup by executing the "All JUnit Tests" target.

The free Community Edition of the IntelliJ IDEA IDE is sufficient, but the
Ultimate Edition offers significant additional features worth considering (e.g.,
inline JavaScript debugging).


License
=======

Echo is licensed under the terms of the open-source Mozilla Public License. 
The terms of the Mozilla Public License provide software developers with the 
ability to use the product royalty free to develop both open-source and 
closed-source (proprietary) applications. 

Developers may also modify the source code to the Echo framework itself, but in 
such a case they are required to submit their changes back to the community. If
desired, a developer may license Echo under the GNU Lesser General Public
License or the GNU General Public License. Use of the GNU licenses is entirely
optional.

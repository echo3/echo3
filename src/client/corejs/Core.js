/**
 * @fileoverview
 * Provides low-level core functionality.  Requires nothing.
 * <p>
 * Provides core APIs for creating object-oriented and event-driven JavaScript code.  Features include:
 * <ul>
 *  <li>Provides API for declaring JavaScript classes which includes support for
 *   specifying abstract and virtual properties and validating subtypes to such
 *   specification.</li>
 *  <li>Provides a "Method Wrapper" function (Core.method()) to create a function which will invoke 
 *    a member function of a specific object instance (enabling invocation with the "this pointer" set
 *    appropriately).</li>
 *  <li>Provides event/listener management framework.  Event-listeners which invoke
 *    methods of an object instance may be created using the Core.method() function.</li>
 *  <li>Provides a "Large Map" useful for managing an associative array that is frequently modified
 *    and will exist for a long period of time.  This object is unfortunately necessary due to
 *    issues present in certain clients (Internet Explorer 6 memory leak / performance degradation).</li>
 *  <li>Provides array manipulation utilities.<li>
 *  <li>Provides some simple debugging utilities, e.g., a pseudo-console output.</li>
 *  <li>Does not provide any web-specific functionality.</li>
 * </ul>
 */

/**
 * Namespace for core functionality.
 * @namespace
 */
Core = {

    /**
     * Creates a duplicate copy of a function.
     * Per the ECMA-262 v3 specification, Function.toString() is required to return an (implementation specific)
     * string representation of the function.
     * Creating a copy of a constructor is more efficient than invoking Function.apply() in certain browsers
     * (a significant performance improvement was observed in Internet Explorer 6).
     *
     * @param f the function
     * @return an identical copy
     * @private
     */
    _copyFunction: function(f) {
        var fCopy;
        eval("fCopy = " + f.toString() + ";");
        return fCopy;
    },
    
    /**
     * Creates an empty function.
     *
     * @private
     */
    _createFunction: function() {
        return function() { };
    },
    
    /**
     * Creates a new class, optionally extending an existing class.
     * This method may be called with one or two parameters as follows:
     * <p>
     * <code>Core.extend(definition)</code>
     * <code>Core.extend(baseClass, definition)</code>
     * <p>
     * Each property of the definition object will be added to the prototype of the returned defined class.
     * Properties that begin with a dollar-sign (<code>$</code>) will be processed specially:
     * <p>
     * <ul>
     * <li>The <code>$construct</code> property, which must be a function, will be used as the constructor.
     * The <code>$load</code> property, which must be a function, f provided, will be used as a static initializer,
     * executed once when the class is *defined*.  The this pointer will be set to the class when
     * this method is executed.</li>
     * <li>The <code>$static</code> property, an object, if provided, will have its properties installed as class variables.</li>
     * <li>The <code>$abstract</code> property, an object or <code>true</code>, if provided, will define methods that
     * must be implemented by derivative classes.  If the value is simply <code>true</code>, the object will be marked as
     * abstract (such that it does not necessarily need to provide implementations of abstract methods defined in its 
     * base class.)</li>
     * <li>The <code>$virtual</code> property, an object, if provided, defines methods that will be placed into the prototype
     * that may be overridden by subclasses.  Attempting to override a property/method of the superclass that
     * is not defined in the virtual block will result in an exception.  Having the default behavior NOT allow
     * for overriding ensures that namespacing between super- and sub-types if all internal variables are instance
     * during <code>Core.extend()</code>.</li>
     * </ul>
     * <p>
     * Use of this method enables a class to be derived WITHOUT executing the constructor of the base class
     * in order to create a prototype for the derived class.  This method uses a "shared prototype" architecture,
     * where two objects are created, a "prototype class" and a "constructor class".  These two objects share
     * the same prototype, but the "prototype class" has an empty constructor.  When a class created with
     * this method is derived, the "prototype class" is used to create a prototype for the derivative.
     * <p>
     * This method will return the constructor class, which contains an internal reference to the 
     * prototype class that will be used if the returned class is later derived by this method.
     * 
     * @param {Function} baseClass the base class
     * @param {Object} definition an associative array containing methods and properties of the class
     * @return the constructor class
     */
    extend: function() {
        // Configure baseClass/definition arguments.
        var baseClass = arguments.length == 1 ? null : arguments[0];
        var definition = arguments.length == 1 ? arguments[0] : arguments[1];
        
        // Perform argument error checking.
        if (arguments.length == 2) {
            if (typeof(baseClass) != "function") {
                throw new Error("Base class is not a function, cannot derive.");
            }
        }
        if (!definition) {
            throw new Error("Object definition not provided.");
        }
        
        // Create the constructor class.
        var constructorClass;
        if (definition.$construct) {
            // Definition provides constructor, provided constructor function will be used as object.
            constructorClass = definition.$construct;
            
            // Remove property such that it will not later be added to the object prototype.
            delete definition.$construct;
        } else {
            // Definition does not provide constructor.
            if (baseClass) {
                // Base class available: copy constructor function from base class.
                // Note: should function copying not be supported by a future client,
                // it is possible to simply create a new constructor which invokes the base
                // class constructor (using closures and Function.apply()) to achieve the
                // same effect (with a slight performance penalty).
                constructorClass = Core._copyFunction(baseClass);
            } else {
                // No base class: constructor is an empty function.
                constructorClass = Core._createFunction();
            }
        }
        
        // Create virtual property storage.
        constructorClass.$virtual = {};
        
        // Store reference to base class in constructor class.
        constructorClass.$super = baseClass;

        if (baseClass) {
            // Create class with empty constructor that shares prototype of base class.
            var prototypeClass = Core._createFunction();
            prototypeClass.prototype = baseClass.prototype;
            
            // Create new instance of constructor-less prototype for use as prototype of new class.
            constructorClass.prototype = new prototypeClass();
        }
        
        // Assign constructor correctly.
        constructorClass.prototype.constructor = constructorClass;

        // Add abstract properties.
        if (definition.$abstract) {
            constructorClass.$abstract = {};
            if (baseClass && baseClass.$abstract) {
                // Copy abstract properties from base class.
                for (var x in baseClass.$abstract) {
                    constructorClass.$abstract[x] = baseClass.$abstract[x];
                }
            }

            if (definition.$abstract instanceof Object) {
                // Add abstract properties from definition.
                for (var x in definition.$abstract) {
                    constructorClass.$abstract[x] = true;
                    constructorClass.$virtual[x] = true;
                }
            }
            
            // Remove property such that it will not later be added to the object prototype.
            delete definition.$abstract;
        }
        
        // Copy virtual property flags from base class to shared prototype.
        if (baseClass) {
            for (var name in baseClass.$virtual) {
                constructorClass.$virtual[name] = baseClass.$virtual[name];
            }
        }
        
        // Add virtual instance properties from definition to shared prototype.
        if (definition.$virtual) {
            Core._inherit(constructorClass.prototype, definition.$virtual, constructorClass.$virtual);
            for (var name in definition.$virtual) {
                constructorClass.$virtual[name] = true;
            }

            // Remove property such that it will not later be added to the object prototype.
            delete definition.$virtual;
        }
        
        // Add toString and valueOf manually, as they will not be iterated
        // by for-in iteration in Internet Explorer.
        if (definition.hasOwnProperty("toString")) {
            constructorClass.prototype.toString = definition.toString;
        }
        if (definition.hasOwnProperty("valueOf")) {
            constructorClass.prototype.valueOf = definition.valueOf;
        }

        // Remove properties such that they will not later be added to the object prototype.
        delete definition.toString;
        delete definition.valueOf;

        // Add Mixins.
        if (definition.$include) {
            // Reverse order of mixins, such that later-defined mixins will override earlier ones.
            // (Mixins will only be added if they will NOT override an existing method.)
            var mixins = definition.$include.reverse();
            Core._processMixins(constructorClass, mixins);
            
            // Remove property such that it will not later be added to the object prototype.
            delete definition.$include;
        }

        // Store $load static initializer and remove from definition so it is not inherited in static processing.
        var loadMethod = null;
        if (definition.$load) {
            loadMethod = definition.$load;

            // Remove property such that it will not later be added to the object prototype.
            delete definition.$load;
        }
        
        // Process static properties and methods defined in the '$static' object.
        if (definition.$static) {
            Core._inherit(constructorClass, definition.$static);

            // Remove property such that it will not later be added to the object prototype.
            delete definition.$static;
        }

        // Process instance properties and methods.
        Core._inherit(constructorClass.prototype, definition, constructorClass.$virtual);
        
        // If class is concrete, verify all abstract methods are provided.
        if (!constructorClass.$abstract) {
            this._verifyAbstractImpl(constructorClass);
        }
        
        // Invoke static constructors.
        if (loadMethod) {
            // Invoke $load() function with "this" pointer set to class.
            loadMethod.call(constructorClass);
        }
        
        return constructorClass;
    },
    
    /**
     * Retrieves a value from an object hierarchy.
     *
     * Examples: 
     * Given the following object 'o': <code>{ a: { b: 4, c: 2 }}</code>
     * <ul>
     * <li><code>Core.get(o, ["a", "b"]) will return <code>4</code>.</li>
     * <li><code>Core.get(o, ["a", "c"]) will return <code>2</code>.</li>
     * <li><code>Core.get(o, ["a", "d"]) will return <code>null</code>.</li>
     * <li><code>Core.get(o, ["a"]) will return <code>{ b: 4, c: 2 }</code>.</li>
     * <li><code>Core.get(o, ["b"]) will return <code>null</code>.</li>
     * <li><code>Core.get(o, ["d"]) will return <code>null</code>.</li>
     * </ul>
     *
     * @param object an arbitrary object from which the value should be retrieved
     * @param {Array} path an array of object property names describing the path to retrieve
     * @return the value, if found, or null if it does not exist
     */
    get: function(object, path) {
        for (var i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (!object) {
                return null;
            }
        }

        return object;
    },
    
    /**
     * Determines if the specified propertyName of the specified object is a virtual
     * property, i.e., that it can be overridden by subclasses.
     */
    _isVirtual: function(virtualProperties, propertyName) {
        switch (propertyName) {
        case "toString":
        case "valueOf":
            return true;
        }
        
        return virtualProperties[propertyName];
    },
    
    /**
     * Installs properties from source object into destination object.
     * <p>
     * In the case where the destination object already has a property defined
     * and the "virtualProperties" argument is provided, the "virtualProperties"
     * collection will be checked to ensure that property is allowed to be
     * overridden.  If "virtualProperties" is omitted, any property may be
     * overridden.
     *
     * @param destination the destination object
     * @param soruce the source object
     * @param virtualProperties (optional) collection of virtual properties from base class.
     * @private  
     */
    _inherit: function(destination, source, virtualProperties) {
        for (var name in source) {
            if (virtualProperties && destination[name] !== undefined && !this._isVirtual(virtualProperties, name)) {
                // Property exists in destination as is not marked as virtual.
                throw new Error("Cannot override non-virtual property \"" + name + "\".");
            } else {
                destination[name] = source[name];
            }
        }
    },
    
    /**
     * Creates a new function which executes a specific method of an object instance.
     * Any arguments passed to the returned function will be passed to the method.
     * The return value of the method will be returned by the function.
     *
     * CAUTION: When adding and removing methods as listeners, note that two separately
     * constructed methods will not be treated as equal, even if their instance and method
     * properties are the same.  Failing to heed this warning can result in a memory leak,
     * as listeners would never be removed.
     *
     * @param instance the object instance
     * @param {Function} method the method to be invoked on the instance
     * @return the return value provided by the method
     */
    method: function(instance, method) {
        return function() {
            return method.apply(instance, arguments);
        };
    },
    
    /**
     * Add properties of mixin objects to destination object.
     * Mixins will be added in order, and any property which is already
     * present in the destination object will not be overridden.
     *
     * @param destination the destination object
     * @param {Array} mixins the mixin objects to add 
     */
    _processMixins: function(destination, mixins) {
        for (var i = 0; i < mixins.length; ++i) {
            for (var mixinProperty in mixins[i]) {
                if (destination.prototype[mixinProperty]) { 
                    // Ignore mixin properties that already exist.
                    continue;
                }
                destination.prototype[mixinProperty] = mixins[i][mixinProperty];
            }
        }
    },
    
    /**
     * Sets a value in an object hierarchy.
     *
     * Examples: 
     * Given the following object 'o': <code>{ a: { b: 4, c: 2 } }</code>
     * <ul>
     * <li><code>Core.set(o, ["a", "b"], 5)</code> will update the value of 'o' to be: <code>{ a: { b: 5, c: 2 } }</code></li>
     * <li><code>Core.set(o, ["a", "d"], 7)</code> will update the value of 'o' to be:
     * <code>{ a: { b: 4, c: 2, d: 7 } }</code></li>
     * <li><code>Core.set(o, ["e"], 9)</code> will update the value of 'o' to be: <code>{ a: { b: 4, c: 2 }, e: 9 }</code></li>
     * <li><code>Core.set(o, ["f", "g"], 8)</code> will update the value of 'o' to be: 
     * <code>{ a: { b: 4, c: 2 }, f: { g: 8 } }</code></li>
     * <li><code>Core.set(o, ["a"], 10)</code> will update the value of 'o' to be: <code>{ a: 10 }</code></li>
     * </ul>
     *
     * @param object an arbitrary object from which the value should be retrieved
     * @param {Array} path an array of object property names describing the path to retrieve
     * @return the value, if found, or null if it does not exist
     */
    set: function(object, path, value) {
        var parentObject = null;
        
        // Find or create container object.
        for (var i = 0; i < path.length - 1; ++i) {
            parentObject = object; 
            object = object[path[i]];
            if (!object) {
                object = {};
                parentObject[path[i]] = object;
            }
        }
        
        // Assign value.
        object[path[path.length - 1]] = value;
    },
    
    /**
     * Verifies that a concrete derivative of an abstract class implements
     * abstract properties present in the base class.
     *
     * @param constructorClass the class to verify
     */
    _verifyAbstractImpl: function(constructorClass) {
         var baseClass = constructorClass.$super;
         if (!baseClass || !baseClass.$abstract || baseClass.$abstract === true) {
             return;
         }
         
         for (var x in baseClass.$abstract) {
             if (constructorClass.prototype[x] == null) {
                 throw new Error("Concrete class does not provide implementation of abstract method \"" + x + "\".");
             }
         }
    }
};

/**
 * Namespace for debugging related utilities.
 * @class
 */
Core.Debug = { 

    /**
     * The DOM element to which console output should be written.
     * @type HTMLElement
     */
    consoleElement: null,
    
    /**
    * Flag indicating whether console output should be displayed as alerts.
    * Enabling is generally not recommended.
    * @type Boolean
    */
    useAlertDialog: false,
    
    /**
     * Writes a message to the debug console.
     * 
     * @param {String} text the message
     */
    consoleWrite: function(text) {
        if (Core.Debug.consoleElement) {
            var entryElement = document.createElement("div");
            entryElement.appendChild(document.createTextNode(text));
            if (Core.Debug.consoleElement.childNodes.length == 0) {
                Core.Debug.consoleElement.appendChild(entryElement);
            } else {
                Core.Debug.consoleElement.insertBefore(entryElement, Core.Debug.consoleElement.firstChild);
            }
        } else if (Core.Debug.useAlertDialog) {
            alert("DEBUG:" + text);
        }
    },
    
    /**
     * Creates a string representation of the state of an object's instance variables.
     *
     * @param object the object to convert to a string
     * @return the string
     * @type String
     */
    toString: function(object) {
        var s = "";
        for (var x in object) {
            if (typeof object[x] != "function") { 
                s += x + ":" + object[x] + "\n";
            }
        }
        return s;
    }
};

/**
 * Arrays namespace.
 */
Core.Arrays = {

    /**
     * Returns <tt>true</tt> if the first array contains all of the elements
     * in the second array.
     *
     * @param {Array} array1 the array to be analyzed
     * @param {Array} array2 an array whose elements must all be present in <code>array1</code>
     *        for this method to return <code>true</code>
     * @param {Boolean} unique optional flag indicating that all elements in array2 are unique
     * @return <tt>true</tt> if the first array contains all of the elements
     *         in the second array
     * @type Boolean
     */
    containsAll: function(array1, array2, unique) {
        if (unique && array1.length < array2.length) {
            return false;
        }
        if (array2.length == 0) {
            return true;
        }
        var found, item;
        for (var i = 0; i < array2.length; ++i) {
            found = false;
            item = array2[i];
            for (var j = 0; j < array1.length; ++j) {
                if (item == array1[j]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    },

    /**
     * Returns the index of the specified item within the array, or -1 if it 
     * is not contained in the array.  
     * 
     * @param item the item
     * @return the index of the item, or -1 if it is not present in the array
     * @type Number
     */
    indexOf: function(array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (item == array[i]) {
                return i;
            }
        }
        return -1;
    },
    
    /**
     * Removes the first instance of the specified item from an array.
     * If the item does not exist in the array, no action is taken.
     * Equality is determined using the '==' operator.
     * 
     * @param array the array from which the item should be removed
     * @param item the item to remove
     */
    remove: function(array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (item == array[i]) {
                array.splice(i, 1);
                return;
            }
        }
    },
    
    /**
     * Removes duplicate items from an array.
     * Items retained in the array may not appear in the previous order.
     * 
     * @param array the array from which duplicates are to be removed.
     */
    removeDuplicates: function(array) {
        array.sort();
        var removeCount = 0;
        // Iterate from last element to second element.
        for (var i = array.length - 1; i > 0; --i) {
            // Determine if element is equivalent to previous element.
            if (array[i] == array[i - 1]) {
                // If duplicate, copy last element in array over current element.
                array[i] = array[array.length - 1 - removeCount];
                
                // Increment removeCount (indicating how much the length of the array should be decremented)
                ++removeCount;
            }
        }
        
        if (removeCount > 0) {
            array.length = array.length - removeCount;
        }
    }
};

/**
 * Associative array wrapper which periodically recreates the associative array
 * in order to avoid memory leakage and performance problems on certain browser
 * platforms, i.e., Internet Explorer 6.
 * Null values are not permitted as keys.  Setting a key to a null value
 * will result in the key being removed.
 */
Core.Arrays.LargeMap = Core.extend({
    
    $static: {
        garbageCollectEnabled: false
    },
    
    /**
     * Number of removes since last associative array re-creation.
     * @type Number
     * @private
     */
    _removeCount: 0,
    
    /**
     * Number (integer) of removes between associative array re-creation.
     * @type Number
     */
    garbageCollectionInterval: 250,
    
    /**
     * Associative mapping.
     */
    map: null, 
    
    /**
     * Creates a new LargeMap.
     */
    $construct: function() {
        this.map = {};
    },
    
    /**
     * Performs 'garbage-collection' operations, recreating the array.
     * This operation is necessary due to Internet Explorer memory leak
     * issues.
     */
    _garbageCollect: function() {
        this._removeCount = 0;
        var newMap = {};
        for (var key in this.map) {
            newMap[key] = this.map[key];
        }
        this.map = newMap;
    },
    
    /**
     * Removes the value referenced by the specified key.
     *
     * @param key the key
     */
    remove: function(key) {
        delete this.map[key];
        if (Core.Arrays.LargeMap.garbageCollectEnabled) {
            ++this._removeCount;
            if (this._removeCount >= this.garbageCollectionInterval) {
                this._garbageCollect();
            }
        }
    }
});

/**
 * A collection of event listeners.  Provides capability to manage listeners
 * of multiple types, and fire events to listeners based on type.
 */
Core.ListenerList = Core.extend({

    /**
     * Array containing event types and event listeners.  
     * Even indexes contain event types, and the subsequent odd
     * index contain Functions to invoke.
     * @type Array
     */
    _data: null,
   
    /**
     * Creates a new listener list.
     * 
     * @constructor
     */
    $construct: function() {
        this._data = [];
    },

    /**
     * Adds an event listener.
     * 
     * @param {String} eventType the event type
     * @param {Function} eventTarget the event target
     */
    addListener: function(eventType, eventTarget) {
        this._data.push(eventType, eventTarget);
    },
    
    /**
     * Fires an event.
     * 
     * @param event the event to fire
     * @return true if all event listeners returned values that evaluate to true, 
     *         or false if any event listeners returned values that evaluate to 
     *         false
     * @type Boolean
     */
    fireEvent: function(event) {
        if (event.type == null) {
            throw new Error("Cannot fire event, type property not set.");
        }
        
        var listeners = [];
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == event.type) {
                listeners.push(this._data[i + 1]);
            }
        }
        
        var returnValue = true;
        for (var i = 0; i < listeners.length; ++i) {
            returnValue = listeners[i](event) && returnValue; 
        }
        return returnValue;
    },
    
    /**
     * Returns an array containing the types of all listeners
     * in the list.
     * 
     * @return the event types
     * @type Array
     */
    getListenerTypes: function() {
        var types = [];
        for (var i = 0; i < this._data.length; i += 2) {
            types.push(this._data[i]);
        }
        Core.Arrays.removeDuplicates(types);
        return types;
    },
    
    /**
     * Returns an array of all listeners for a specific event type.
     * 
     * @param {String} eventType the event type
     * @return the listeners
     * @type Array
     */
    getListeners: function(eventType) {
        var listeners = [];
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType) {
                listeners.push(this._data[i + 1]);
            }
        }
        return listeners;
    },
    
    /**
     * Determines the number of listeners for a specific event type.
     * 
     * @param {String} eventType the event type
     * @return the listener count
     * @type Number
     */
    getListenerCount: function(eventType) {
        var count = 0;
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType) {
                ++count;
            }
        }
        return count;
    },
    
    /**
     * Determines if the listeners list has any listeners of a specific type.
     * 
     * @param {String} eventType the event type
     * @return true if any listeners exist
     * @type Boolean
     */
    hasListeners: function(eventType) {
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * Determines if any number of listeners are registered to the list.
     * 
     * @return true if the listener list is empty
     * @type Boolean
     */
    isEmpty: function() {
        return this._data.length == 0;
    },
    
    /**
     * Removes an event listener.
     * 
     * @param {String} eventType the event type
     * @param {Function} eventTarget the event target
     */
    removeListener: function(eventType, eventTarget) {
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType && eventTarget == this._data[i + 1]) {
                var oldLength = this._data.length;
                this._data.splice(i, 2);
                return;
            }
        }
    },
    
    /**
     * Creates a string representation of the listener list.
     * This should be used for debugging purposes only.
     */
    toString: function() {
        var out = "";
        for (var i = 0; i < this._data.length; i += 2) {
            if (i > 0) {
                out += ", ";
            }
            out += this._data[i] + ":" + this._data[i + 1];
        }
        return out;
    }
});

/**
 * A collection of locale-specific resources.
 */
Core.ResourceBundle = Core.extend({

    $static: {
    
        /**
         * Generates a less specific version of the specified language code.
         * Returns null if no "parent" language code can be determined.
         * This operation is implemented  by removing the sub-tag (if found)
         * from the specified RFC 1766 language code.  If the language
         * code does not have a sub-tag, null is returned.
         *
         * @param {String} languageCode an RFC 1766 language code
         * @return a less specific version of the specified language code,
         *         or null if none can be determined
         * @type String 
         */
        getParentLanguageCode: function(languageCode) {
            if (languageCode.indexOf("-") == -1) {
                return null;
            } else {
                return languageCode.substring(0, languageCode.indexOf("-"));
            }
        }
    },

    /**
     * Association between RFC 1766 language codes and resource maps.
     */
    _sourceBundles: null,
    
    _generatedBundles: null,
    
    /**
     * The default resource map that should be utilized in the event that a
     * locale-specific map is not available for a particular language code.
     */
    _defaultBundle: null,

    $construct: function(defaultBundle) {
        this._sourceBundles = {};
        this._generatedBundles = {};
        this._defaultBundle = defaultBundle;
    },
    
    /**
     * Returns a locale-specific map.
     */
    get: function(languageCode) {
        var bundle = languageCode ? this._generatedBundles[languageCode] : this._defaultBundle;
        if (bundle) {
            return bundle;
        }
    
        bundle = {};
        var x;

        // Copy items from exact language bundle into new bundle.
        var sourceBundle = this._sourceBundles[languageCode];
        if (sourceBundle) {
            for (x in sourceBundle) {
                bundle[x] = sourceBundle[x];
            }
        }

        // Copy any missing items found in parent language bundle (if it exists) into new bundle.
        var parentLanguageCode = Core.ResourceBundle.getParentLanguageCode(languageCode);
        if (parentLanguageCode) {
            var sourceBundle = this._sourceBundles[parentLanguageCode];
            if (sourceBundle) {
                for (x in sourceBundle) {
                    if (bundle[x] === undefined) {
                        bundle[x] = sourceBundle[x];
                    }
                }
            }
        }

        // Copy any missing items found in default bundle into new bundle.
        for (x in this._defaultBundle) {
            if (bundle[x] === undefined) {
                bundle[x] = this._defaultBundle[x];
            }
        }
        
        this._generatedBundles[languageCode] = bundle;
        return bundle;
    },

    /**
     * Adds a new locale-specific map to the bundle. 
     */
    set: function(languageCode, map) {
        this._generatedBundles = {};
        this._sourceBundles[languageCode] = map;
    },
    
    toString: function() {
        var out = "ResourceBundle: ";
        for (var x in this._sourceBundles) {
            out += " " + x;
        }
        return out;
    }
});

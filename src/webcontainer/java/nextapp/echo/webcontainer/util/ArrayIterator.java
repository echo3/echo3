package nextapp.echo.webcontainer.util;

import java.util.Iterator;

public class ArrayIterator 
implements Iterator {

    private int index = 0;
    private Object[] array;
    
    public ArrayIterator(Object[] array) {
        super();
        this.array = array;
    }
    
    /**
     * @see java.util.Iterator#hasNext()
     */
    public boolean hasNext() {
        return index < array.length;
    }

    /**
     * @see java.util.Iterator#next()
     */
    public Object next() {
        return array[index++];
    }

    /**
     * @see java.util.Iterator#remove()
     */
    public void remove() {
        throw new UnsupportedOperationException();
    }
}

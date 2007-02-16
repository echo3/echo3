package nextapp.echo.app.xml;

import java.util.HashMap;
import java.util.Map;

public class ConstantMap {
    
    private Map dualMap = new HashMap();
    
    public void add(int constantValue, String constantName) {
        Integer constantInteger = new Integer(constantValue);
        dualMap.put(constantName, constantInteger);
        dualMap.put(constantInteger, constantName);
    }
    
    public String get(int constantValue) {
        return (String) dualMap.get(new Integer(constantValue));
    }
    
    public int get(String constantName, int defaultValue) {
        Integer constantValue = (Integer) dualMap.get(constantName);
        return constantValue == null ? defaultValue : constantValue.intValue();
    }
    
}

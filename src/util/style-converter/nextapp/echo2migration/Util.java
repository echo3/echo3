package nextapp.echo2migration;

public class Util {
    
    public static final boolean LOG_ENABLED = true;

    public static void logError(String message) {
        logError(message, null);
    }
    
    public static void logError(String message, Exception e) {
        if (LOG_ENABLED) {
            System.err.println("ERROR: " + message);
            if (e != null) {
                e.printStackTrace();
            }
        }
    }
    
    public static void logOutput(String message) {
        if (LOG_ENABLED) {
            System.out.println("INFO: " + message);
        }
    }
    
    public static void logWarning(String message) {
        if (LOG_ENABLED) {
            System.err.println("WARN: " + message);
        }
    }
    
    public static String stripWhitespace(String input) {
        String output = input.trim();
        output = output.replace('\n', ' ');
        output = output.replace('\r', ' ');
        output = output.replace('\t', ' ');
        while (output.indexOf("  ") != -1) {
            output = output.replaceAll("  ", " ");
        }
        return output;
    }
}

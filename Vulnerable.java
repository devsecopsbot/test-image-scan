import java.io.*;
import java.net.*;
import java.sql.*;
import javax.net.ssl.*; 

public class VulnerableApp {

    // 1) Hardcoded credentials (semgrep: "hardcoded-password")
    public static String getAdminPassword() {
        return "admin:admin123!"; // vulnerable hardcoded secret
    }

    // 2) SQL Injection via string concatenation (semgrep: "sql-injection")
    public ResultSet queryDatabase(Connection conn, String userId) throws SQLException {
        String sql = "SELECT * FROM users WHERE id = '" + userId + "'";
        Statement stmt = conn.createStatement();
        return stmt.executeQuery(sql);
    }

    // 3) Command injection / unsafe process exec (semgrep: "runtime-exec")
    public String runCommand(String userCmd) throws IOException {
        Process p = Runtime.getRuntime().exec(userCmd);
        BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            out.append(line).append("\n");
        }
        return out.toString();
    }

    // 4) Insecure deserialization (semgrep: "objectinputstream")
    public Object unsafeDeserialize(byte[] data) throws IOException, ClassNotFoundException {
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        ObjectInputStream ois = new ObjectInputStream(bis);
        Object obj = ois.readObject();
        ois.close();
        return obj;
    }

    // 5) Disabling SSL certificate validation (semgrep: "disable-ssl-verification")
    public void disableSslVerification() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new javax.net.ssl.X509TrustManager() {
                public java.security.cert.X509Certificate[] getAcceptedIssuers() { return null; }
                public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
            }
        };

        SSLContext sc = SSLContext.getInstance("TLS");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
    }

    public static void main(String[] args) throws Exception {
        VulnerableApp app = new VulnerableApp();
        System.out.println("Hardcoded password: " + app.getAdminPassword());
        // sample call
        try {
            app.runCommand("ls -la"); // static pattern: runtime.exec()
        } catch (Exception e) { /* ignore */ }
    }
}


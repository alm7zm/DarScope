import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;

class VerifyRls {
    public static void main(String[] args) throws Exception {
        String port = Files.readString(Path.of("pg-port")).strip();
        try (var db = DriverManager.getConnection("jdbc:postgresql://127.0.0.1:" + port + "/postgres", "postgres", "");
             var statement = db.createStatement()) {
            db.setAutoCommit(false);
            try (var result = statement.executeQuery(
                    "SELECT relrowsecurity FROM pg_class WHERE oid = 'public.property'::regclass")) {
                if (!result.next() || !result.getBoolean(1)) throw new AssertionError("RLS disabled");
            }
            statement.execute("CREATE ROLE darscope_qa_reader NOLOGIN");
            statement.execute("GRANT SELECT ON public.property TO darscope_qa_reader");
            try (var result = statement.executeQuery("SELECT COUNT(*) FROM public.property")) {
                if (!result.next() || result.getInt(1) != 8) throw new AssertionError("Expected 8 rows");
            }
            statement.execute("SET LOCAL ROLE darscope_qa_reader");
            try (var result = statement.executeQuery("SELECT COUNT(*) FROM public.property")) {
                if (!result.next() || result.getInt(1) != 0) throw new AssertionError("RLS exposed rows");
            }
            db.rollback();
        }
        System.out.println("PASS: RLS was enabled. The database owner read 8 rows; a test role with SELECT and no RLS policy read 0.");
    }
}

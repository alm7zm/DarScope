package edu.psu.se411.darscope;

import java.time.Clock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DarscopeApplication {

    public static void main(String[] args) {
        SpringApplication.run(DarscopeApplication.class, args);
    }

    /**
     * The clock the service reads for createdAt and updatedAt. A bean, so the tests can pass a
     * fixed clock and check the exact timestamps.
     */
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}

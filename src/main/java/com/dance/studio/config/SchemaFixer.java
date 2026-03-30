package com.dance.studio.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=================================================");
        System.out.println("🔧 SCHEMA FIXER: Starting checks...");
        System.out.println("=================================================");

        try {
            // Try Method 1: MODIFY
            System.out.println("Attempting Method 1: ALTER TABLE attendance MODIFY id BIGINT AUTO_INCREMENT...");
            jdbcTemplate.execute("ALTER TABLE attendance MODIFY id BIGINT AUTO_INCREMENT");
            System.out.println("✅ Method 1 Success!");
        } catch (Exception e1) {
            System.out.println("⚠️ Method 1 Failed: " + e1.getMessage());
            try {
                // Try Method 2: CHANGE (MySQL specific often needs consistent types)
                System.out.println(
                        "Attempting Method 2: ALTER TABLE attendance CHANGE id id BIGINT NOT NULL AUTO_INCREMENT...");
                jdbcTemplate.execute("ALTER TABLE attendance CHANGE id id BIGINT NOT NULL AUTO_INCREMENT");
                System.out.println("✅ Method 2 Success!");
            } catch (Exception e2) {
                System.out.println("⚠️ Method 2 Failed: " + e2.getMessage());
                System.out.println(
                        "❌ Manual Intervention may be required. Please run: 'ALTER TABLE attendance MODIFY id BIGINT AUTO_INCREMENT;' in your database console.");
            }
        }
        System.out.println("=================================================");
    }
}

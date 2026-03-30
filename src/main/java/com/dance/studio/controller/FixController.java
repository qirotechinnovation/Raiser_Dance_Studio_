package com.dance.studio.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

@RestController
public class FixController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/fix-db")
    @Transactional
    public String fixDb() {
        try {
            entityManager.createNativeQuery("ALTER TABLE attendance MODIFY id BIGINT AUTO_INCREMENT").executeUpdate();
            return "Attendance table fixed! Please try checking in again.";
        } catch (Exception e) {
            return "Fix failed: " + e.getMessage();
        }
    }
}

package com.dance.studio.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dance.studio.model.Batch;
import com.dance.studio.model.Student;
import com.dance.studio.repository.StudentRepository;

@RestController
@RequestMapping("/student")
@CrossOrigin
@SuppressWarnings("null")
public class StudentBatchController {

    private final StudentRepository studentRepo;

    public StudentBatchController(StudentRepository studentRepo) {
        this.studentRepo = studentRepo;
    }

    @GetMapping("/{id}/batch")
    public Map<String, Object> myBatch(@PathVariable Long id) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Batch batch = student.getBatch();

        Map<String, Object> res = new HashMap<>();
        if (batch != null) {
            res.put("name", batch.getName());
            res.put("time", batch.getTiming() != null ? batch.getTiming()
                    : (batch.getStartTime() + " - " + batch.getEndTime()));
            res.put("days", batch.getDays());
            res.put("style", batch.getDanceType() != null ? batch.getDanceType().getName() : "Dance Style");
            res.put("instructor", batch.getInstructor() != null ? batch.getInstructor() : "Assistant");
        }

        return res;
    }
}

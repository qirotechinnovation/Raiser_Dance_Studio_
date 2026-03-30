package com.dance.studio.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dance.studio.model.Attendance;
import com.dance.studio.repository.AttendanceRepository;

@RestController
@RequestMapping("/student")
@CrossOrigin(origins = "*")
public class StudentAttendanceController {

    private final AttendanceRepository attendanceRepository;

    public StudentAttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<?> getAttendance(@PathVariable Long id) {
        List<Attendance> records = attendanceRepository.findByStudentId(id);

        long presentCount = records.stream().filter(Attendance::isPresent).count();
        long totalClasses = records.size();

        Map<String, Object> response = new HashMap<>();
        response.put("history", records);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalClasses", totalClasses);
        summary.put("present", presentCount);
        summary.put("absent", totalClasses - presentCount);
        summary.put("percentage", totalClasses > 0 ? (presentCount * 100.0 / totalClasses) : 0);

        response.put("summary", summary);

        return ResponseEntity.ok(response);
    }
}

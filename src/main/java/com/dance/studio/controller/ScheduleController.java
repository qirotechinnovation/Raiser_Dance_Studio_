package com.dance.studio.controller;

import com.dance.studio.model.Batch;
import com.dance.studio.model.ClassSchedule;
import com.dance.studio.repository.BatchRepository;
import com.dance.studio.repository.ClassScheduleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedule")
@CrossOrigin
@SuppressWarnings("null")
public class ScheduleController {

    private final ClassScheduleRepository scheduleRepo;
    private final BatchRepository batchRepo;

    public ScheduleController(ClassScheduleRepository scheduleRepo, BatchRepository batchRepo) {
        this.scheduleRepo = scheduleRepo;
        this.batchRepo = batchRepo;
    }

    // ✅ ADD CLASS SLOT
    @PostMapping("/batch/{batchId}")
    public ClassSchedule addSlot(@PathVariable Long batchId, @RequestBody ClassSchedule schedule) {
        Batch batch = batchRepo.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        schedule.setBatch(batch);
        return scheduleRepo.save(schedule);
    }

    // ✅ GET SLOTS BY BATCH
    @GetMapping("/batch/{batchId}")
    public List<ClassSchedule> getSlots(@PathVariable Long batchId) {
        return scheduleRepo.findByBatchId(batchId);
    }

    // ✅ DELETE SLOT
    @DeleteMapping("/{id}")
    public void deleteSlot(@PathVariable Long id) {
        scheduleRepo.deleteById(id);
    }

    // ✅ GET ALL SLOTS (Optional, for admin overview)
    @GetMapping("/all")
    public List<ClassSchedule> getAll() {
        return scheduleRepo.findAll();
    }
}

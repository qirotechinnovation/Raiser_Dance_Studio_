package com.dance.studio.service;

import com.dance.studio.model.Event;
import com.dance.studio.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@SuppressWarnings("null")
public class EventService {

    private final EventRepository repo;

    public EventService(EventRepository repo) {
        this.repo = repo;
    }

    // ================= ADMIN =================

    // CREATE
    public Event save(Event event) {
        return repo.save(event);
    }

    // UPDATE
    public Event update(Long id, Event event) {
        Event existing = findById(id);

        existing.setTitle(event.getTitle());
        existing.setVenue(event.getVenue());
        existing.setDate(event.getDate());
        existing.setDescription(event.getDescription());

        return repo.save(existing);
    }

    // DELETE
    public void delete(Long id) {
        repo.deleteById(id);
    }

    // ================= COMMON =================

    // READ ALL
    public List<Event> findAll() {
        return repo.findAll();
    }

    // READ BY ID
    public Event findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id " + id));
    }

    // ================= STUDENT =================

    // UPCOMING EVENTS
    public List<Event> upcomingEvents() {
        return repo.findByDateAfter(LocalDate.now());
    }

    // TODAY'S EVENTS (for dashboard)
    public List<Event> todayEvents() {
        return repo.findByDate(LocalDate.now());
    }
}

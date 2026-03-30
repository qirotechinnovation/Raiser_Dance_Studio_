package com.dance.studio.controller;

import com.dance.studio.model.User;
import com.dance.studio.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // CREATE USER
    @PostMapping
    public User create(@RequestBody User user) {
        return service.save(user);
    }

    // GET ALL USERS
    @GetMapping
    public List<User> getAll() {
        return service.findAll();
    }

    // GET USER BY ID
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return service.findById(id);
    }

    // UPDATE USER
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        return service.update(id, user);
    }

    // DELETE USER
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

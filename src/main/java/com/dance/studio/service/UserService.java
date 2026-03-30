package com.dance.studio.service;

import com.dance.studio.model.User;
import com.dance.studio.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    // CREATE
    public User save(User user) {
        return repo.save(user);
    }

    // READ ALL
    public List<User> findAll() {
        return repo.findAll();
    }

    // READ BY ID
    public User findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    // UPDATE
    public User update(Long id, User user) {
        User existing = findById(id);

        existing.setEmail(user.getEmail());
        existing.setPassword(user.getPassword());
        existing.setRole(user.getRole());

        return repo.save(existing);
    }

    // DELETE
    public void delete(Long id) {
        repo.deleteById(id);
    }

    public User login(String email, String password) {
        return repo.findByEmailAndPassword(email, password).orElse(null);
    }
}

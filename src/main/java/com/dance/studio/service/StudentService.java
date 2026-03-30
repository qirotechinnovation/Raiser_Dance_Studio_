
package com.dance.studio.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.dance.studio.model.Student;
import com.dance.studio.repository.StudentRepository;

@Service
@SuppressWarnings("null")
public class StudentService {
    private final StudentRepository repo;
    public StudentService(StudentRepository repo){this.repo=repo;}
    public Student save(Student e){return repo.save(e);}
    public List<Student> all(){return repo.findAll();}
}

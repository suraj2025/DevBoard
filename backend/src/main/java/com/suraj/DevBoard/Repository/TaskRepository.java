package com.suraj.DevBoard.Repository;

import com.suraj.DevBoard.Entity.Task;
import com.suraj.DevBoard.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(Users user);
    Optional<Task> findByIdAndUser(Long id, Users user);
}
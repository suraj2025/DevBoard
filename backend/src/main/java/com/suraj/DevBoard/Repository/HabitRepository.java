package com.suraj.DevBoard.Repository;

import com.suraj.DevBoard.Entity.Habit;
import com.suraj.DevBoard.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUser(Users user);
    Optional<Habit> findByIdAndUser(Long id, Users user);
}
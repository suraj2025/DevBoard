package com.suraj.DevBoard.Service;

import com.suraj.DevBoard.DTO.HabitDTO;
import com.suraj.DevBoard.Entity.Habit;
import com.suraj.DevBoard.Entity.Users;
import com.suraj.DevBoard.Repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    public List<HabitDTO> getAllHabits(Users user) {
        return habitRepository.findByUser(user)
                .stream()
                .map(HabitDTO::fromEntity)
                .toList();
    }

    public HabitDTO createHabit(HabitDTO dto, Users user) {
        Habit habit = new Habit();
        habit.setName(dto.getName());
        habit.setDescription(dto.getDescription());
        habit.setUser(user);

        Habit saved = habitRepository.save(habit);
        return HabitDTO.fromEntity(saved);
    }

    public HabitDTO toggleHabit(Long id, Users user) {
        Habit habit = habitRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));

        String today = LocalDate.now().toString(); // yyyy-MM-dd

        if (habit.getCompletedDates().contains(today)) {
            habit.getCompletedDates().remove(today);
        } else {
            habit.getCompletedDates().add(today);
        }

        Habit saved = habitRepository.save(habit);
        return HabitDTO.fromEntity(saved);
    }

    public void deleteHabit(Long id, Users user) {
        Habit habit = habitRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habitRepository.delete(habit);
    }
}
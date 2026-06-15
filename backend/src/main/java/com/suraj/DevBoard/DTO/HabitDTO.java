package com.suraj.DevBoard.DTO;

import com.suraj.DevBoard.Entity.Habit;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitDTO {
    private Long id;
    private String name;
    private String description;
    private List<String> completedDates;
    private LocalDateTime createdAt;

    public static HabitDTO fromEntity(Habit habit) {
        return new HabitDTO(
                habit.getId(),
                habit.getName(),
                habit.getDescription(),
                habit.getCompletedDates(),
                habit.getCreatedAt()
        );
    }
}
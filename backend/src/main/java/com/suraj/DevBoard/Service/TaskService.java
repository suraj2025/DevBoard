package com.suraj.DevBoard.Service;

import com.suraj.DevBoard.DTO.TaskDTO;
import com.suraj.DevBoard.Entity.Task;
import com.suraj.DevBoard.Entity.Users;
import com.suraj.DevBoard.Repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<TaskDTO> getAllTasks(Users user) {
        return taskRepository.findByUser(user)
                .stream()
                .map(TaskDTO::fromEntity)
                .toList();
    }

    public TaskDTO createTask(TaskDTO dto, Users user) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setUser(user);
        task.setDueDate(dto.getDueDate());

        Task saved = taskRepository.save(task);
        return TaskDTO.fromEntity(saved);
    }

    public TaskDTO updateTask(Long id, TaskDTO dto, Users user) {
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (dto.getTitle() != null)       task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStatus() != null)      task.setStatus(dto.getStatus());
        if (dto.getPriority() != null)    task.setPriority(dto.getPriority());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        Task saved = taskRepository.save(task);
        return TaskDTO.fromEntity(saved);
    }

    public void deleteTask(Long id, Users user) {
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        taskRepository.delete(task);
    }
}
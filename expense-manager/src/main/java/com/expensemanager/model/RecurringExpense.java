package com.expensemanager.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecurringExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private double amount;

    @Column(nullable = false)
    private String category;

    private LocalDate nextDueDate;

    // Keep simple for now: Daily/Weekly/Monthly/Yearly
    private String frequency;

    // Payment method default for this bill
    private String paymentMethod;

    // Alerts: how many days before due date user wants a reminder
    private Integer reminderDaysBefore;

    // Scheduler bookkeeping
    private LocalDate lastAppliedAt;

    private boolean enabled = true;
}


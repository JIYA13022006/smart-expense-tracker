package com.expensemanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"category", "month"}))
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    // Stored as YYYY-MM, for example 2026-07.
    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private double limitAmount;
}

package com.expensemanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    private double amount;
    private String date;

    // ONE_TIME, WEEKLY, MONTHLY, or YEARLY. Recurring values are forecast only.
    private String frequency = "ONE_TIME";
    private Long accountId;
}

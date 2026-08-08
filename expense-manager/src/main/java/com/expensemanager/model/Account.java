package com.expensemanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // CASH, BANK, UPI, CREDIT_CARD, or OTHER
    private String type;

    // The balance before tracked income and expenses are applied.
    private double openingBalance;
}

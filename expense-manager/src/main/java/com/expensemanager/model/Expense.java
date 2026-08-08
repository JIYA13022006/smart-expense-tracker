package com.expensemanager.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private double amount;

    @Column(nullable = false)
    private String category;

private String date;
    @Column(columnDefinition = "TEXT")
    private String note;
    private String dueDate;

    // Smart Expense Planner fields
    // paymentStatus: PENDING, PAID, PAID_UPI, PAID_CARD, PAID_CASH, OVERDUE
    private String paymentStatus;

    // paymentMethod: UPI, CARD, CASH, TRANSFER, OTHER
    private String paymentMethod;

@Column(columnDefinition = "TEXT")
    private String tags;

    // source: manual, receipt_scan
    private String source = "manual";

    private boolean splitExpense = false;

    // splitType: OWED_TO_ME or I_OWE
    private String splitType = "OWED_TO_ME";

    @ElementCollection
    @CollectionTable(name = "expense_split_share", joinColumns = @JoinColumn(name = "expense_id"))
    private List<SplitShare> splitShares = new ArrayList<>();

}


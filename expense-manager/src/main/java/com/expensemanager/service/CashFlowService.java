package com.expensemanager.service;

import com.expensemanager.model.*;
import com.expensemanager.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class CashFlowService {
    private final AccountRepository accountRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final BudgetRepository budgetRepository;

    public CashFlowService(AccountRepository accountRepository, IncomeRepository incomeRepository,
                           ExpenseRepository expenseRepository, RecurringExpenseRepository recurringExpenseRepository,
                           BudgetRepository budgetRepository) {
        this.accountRepository = accountRepository;
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.recurringExpenseRepository = recurringExpenseRepository;
        this.budgetRepository = budgetRepository;
    }

    public double currentBalance() {
        double opening = accountRepository.findAll().stream().mapToDouble(Account::getOpeningBalance).sum();
        double income = incomeRepository.findAll().stream()
                .filter(i -> isOnOrBefore(i.getDate(), LocalDate.now()))
                .mapToDouble(Income::getAmount).sum();
        double expenses = expenseRepository.findAll().stream()
                .filter(e -> e.getDate() != null && isOnOrBefore(e.getDate(), LocalDate.now()))
                .filter(e -> e.getPaymentStatus() == null || !e.getPaymentStatus().equalsIgnoreCase("PENDING"))
                .mapToDouble(Expense::getAmount).sum();
        return opening + income - expenses;
    }

    public CashFlowForecast forecast(int days) {
        int window = Math.max(1, Math.min(days, 365));
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(window);
        double expectedIncome = incomeRepository.findAll().stream()
                .filter(i -> occursBetween(i, today, end))
                .mapToDouble(Income::getAmount).sum();
        double bills = recurringExpenseRepository.findByEnabledTrueAndNextDueDateLessThanEqual(end).stream()
                .filter(r -> r.getNextDueDate() != null && !r.getNextDueDate().isBefore(today))
                .mapToDouble(RecurringExpense::getAmount).sum();
        double budgets = budgetRepository.findByMonthOrderByCategoryAsc(YearMonth.now().toString()).stream()
                .mapToDouble(Budget::getLimitAmount).sum();
        double current = currentBalance();
        double safeToSpend = current + expectedIncome - bills - budgets;
        List<String> alerts = new ArrayList<>();
        if (bills > current + expectedIncome) alerts.add("Upcoming bills exceed your available cash.");
        if (safeToSpend < 0) alerts.add("Your budget commitments may leave you short before the forecast ends.");
        if (alerts.isEmpty()) alerts.add("Cash flow looks healthy for this forecast window.");
        return new CashFlowForecast(today.toString(), end.toString(), current, expectedIncome, bills, budgets,
                safeToSpend, safeToSpend < 0, alerts);
    }

    private boolean occursBetween(Income income, LocalDate start, LocalDate end) {
        LocalDate date = parse(income.getDate());
        if (date == null) return false;
        if (!"ONE_TIME".equalsIgnoreCase(income.getFrequency())) return !date.isAfter(end);
        return !date.isBefore(start) && !date.isAfter(end);
    }

    private boolean isOnOrBefore(String date, LocalDate target) {
        LocalDate parsed = parse(date);
        return parsed != null && !parsed.isAfter(target);
    }

    private LocalDate parse(String date) {
        try { return date == null ? null : LocalDate.parse(date); }
        catch (RuntimeException ignored) { return null; }
    }
}

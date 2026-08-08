package com.expensemanager.controller;

import com.expensemanager.model.*;
import com.expensemanager.repository.AccountRepository;
import com.expensemanager.repository.IncomeRepository;
import com.expensemanager.service.CashFlowService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FinancialPlanningController {
    private final AccountRepository accountRepository;
    private final IncomeRepository incomeRepository;
    private final CashFlowService cashFlowService;

    public FinancialPlanningController(AccountRepository accountRepository, IncomeRepository incomeRepository,
                                       CashFlowService cashFlowService) {
        this.accountRepository = accountRepository;
        this.incomeRepository = incomeRepository;
        this.cashFlowService = cashFlowService;
    }

    @GetMapping("/accounts") public List<Account> accounts() { return accountRepository.findAll(); }
    @PostMapping("/accounts") @ResponseStatus(HttpStatus.CREATED)
    public Account addAccount(@RequestBody Account account) {
        if (account.getName() == null || account.getName().isBlank()) throw new IllegalArgumentException("Account name is required");
        if (account.getType() == null || account.getType().isBlank()) account.setType("OTHER");
        return accountRepository.save(account);
    }
    @DeleteMapping("/accounts/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@PathVariable Long id) { accountRepository.deleteById(id); }

    @GetMapping("/income") public List<Income> income() { return incomeRepository.findAll(); }
    @PostMapping("/income") @ResponseStatus(HttpStatus.CREATED)
    public Income addIncome(@RequestBody Income income) {
        if (income.getTitle() == null || income.getTitle().isBlank()) throw new IllegalArgumentException("Income title is required");
        if (income.getAmount() < 0) throw new IllegalArgumentException("Income cannot be negative");
        if (income.getDate() == null || income.getDate().isBlank()) income.setDate(LocalDate.now().toString());
        if (income.getFrequency() == null || income.getFrequency().isBlank()) income.setFrequency("ONE_TIME");
        return incomeRepository.save(income);
    }
    @DeleteMapping("/income/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIncome(@PathVariable Long id) { incomeRepository.deleteById(id); }

    @GetMapping("/cash-flow/forecast")
    public CashFlowForecast forecast(@RequestParam(defaultValue = "30") int days) { return cashFlowService.forecast(days); }
}

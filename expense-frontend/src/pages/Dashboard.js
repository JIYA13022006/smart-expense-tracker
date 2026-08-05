import React, { useEffect, useMemo, useState } from "react";
import Tesseract from "tesseract.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const API_BASE = "http://localhost:8082";
const COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#22c55e", "#f59e0b"];
const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Grocery", "Other"];
const CURRENCIES = [
  { code: "INR", symbol: "Rs", rate: 1 },
  { code: "USD", symbol: "$", rate: 0.012 },
  { code: "EUR", symbol: "EUR", rate: 0.011 },
  { code: "GBP", symbol: "GBP", rate: 0.0095 },
  { code: "JPY", symbol: "JPY", rate: 1.78 },
];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Yearly"];
const PAYMENT_OPTIONS = [
  { method: "UPI", title: "UPI", subtitle: "Fast bank transfer", accent: "#06b6d4" },
  { method: "CARD", title: "Card", subtitle: "Debit or credit card", accent: "#8b5cf6" },
  { method: "CASH", title: "Cash", subtitle: "Offline payment", accent: "#22c55e" },
];
const BILL_SUGGESTIONS = [
  {
    title: "Netflix",
    amount: 199,
    category: "Bills",
    frequency: "Monthly",
    paymentMethod: "UPI",
    reminderDaysBefore: 2,
  },
  {
    title: "Rent",
    amount: 10000,
    category: "Bills",
    frequency: "Monthly",
    paymentMethod: "UPI",
    reminderDaysBefore: 5,
  },
];
const MERCHANT_CATEGORY_KEYWORDS = {
  Food: ["swiggy", "zomato", "dominos", "pizza hut", "mcdonald", "kfc", "restaurant", "cafe", "foods", "dosa", "paneer", "coffee", "tea", "burger", "biryani", "masala", "meal", "thali"],
  Grocery: ["dmart", "d-mart", "reliance fresh", "bigbazaar", "big bazaar", "more supermarket", "grofers", "blinkit", "grocery", "mart", "supermarket"],
  Transport: ["uber", "ola", "rapido", "metro", "irctc", "fuel", "petrol"],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "mall", "store", "fashion", "electronics"],
  Bills: ["netflix", "airtel", "jio", "electricity", "water bill", "broadband"],
};

const today = () => new Date().toISOString().split("T")[0];

const defaultExpense = {
  title: "",
  amount: "",
  category: "Food",
  date: today(),
  dueDate: "",
  paymentStatus: "PAID",
  paymentMethod: "UPI",
  note: "",
  source: "manual",
};

const normalizeDate = (value) => {
  if (!value) return "";

  const compact = value.match(/\b((?:19|20)\d{2})[-_/]?(\d{2})(\d{2})\b/);
  if (compact) {
    return `${compact[1]}-${compact[2]}-${compact[3]}`;
  }

  const iso = value.match(/\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/);
  if (iso) {
    const month = iso[2].padStart(2, "0");
    const day = iso[3].padStart(2, "0");
    return `${iso[1]}-${month}-${day}`;
  }

  const numeric = value.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    const day = numeric[1].padStart(2, "0");
    const month = numeric[2].padStart(2, "0");
    const year = numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3];
    return `${year}-${month}-${day}`;
  }

  const named = value.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/i);
  if (named) {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = String(monthNames.findIndex((item) => named[1].toLowerCase().startsWith(item)) + 1).padStart(2, "0");
    const day = named[2].padStart(2, "0");
    return `${named[3]}-${month}-${day}`;
  }

  const dayNamed = value.match(/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})\b/i);
  if (dayNamed) {
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = String(monthNames.findIndex((item) => dayNamed[2].toLowerCase().startsWith(item)) + 1).padStart(2, "0");
    const day = dayNamed[1].padStart(2, "0");
    return `${dayNamed[3]}-${month}-${day}`;
  }

  return "";
};

const getMoneyValues = (text) => {
  const matches = text.match(/(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+\.[0-9]{1,2})/gi) || [];
  return matches
    .map((match) => {
      const cleaned = match.replace(/rs\.?|inr|₹/gi, "").replaceAll(",", "").trim();
      return Number(cleaned);
    })
    .filter((value) => Number.isFinite(value) && value > 0);
};

const pickReceiptAmount = (lines) => {
  const totalWords = /(grand\s+total|amount\s+due|total\s+amount|net\s+payable|balance\s+due|bill\s+amount|sub[\s-]?total|subtotal|total\b)/i;
  const labelCandidates = [];

  lines.forEach((line, index) => {
    if (!totalWords.test(line)) return;
    const values = getMoneyValues([line, lines[index + 1] || ""].join(" "));
    values.forEach((value) => labelCandidates.push(value));
  });

  if (labelCandidates.length) {
    return String(labelCandidates[labelCandidates.length - 1]);
  }

  const bottomValues = lines
    .slice(-12)
    .flatMap((line) => getMoneyValues(line))
    .filter((value) => value >= 1);

  if (bottomValues.length) {
    return String(Math.max(...bottomValues));
  }

  const allValues = lines
    .flatMap((line) => getMoneyValues(line))
    .filter((value) => value >= 1 && value < 1000000);

  return allValues.length ? String(Math.max(...allValues)) : "";
};

const preprocessReceiptImage = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const scale = Math.min(4, Math.max(2, 1800 / image.width));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.data.length; i += 4) {
        const avg = data.data[i] * 0.299 + data.data[i + 1] * 0.587 + data.data[i + 2] * 0.114;
        const contrast = avg > 165 ? 255 : 0;
        data.data[i] = contrast;
        data.data[i + 1] = contrast;
        data.data[i + 2] = contrast;
      }
      ctx.putImageData(data, 0, 0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load receipt image"));
    };

    image.src = url;
  });
};

const suggestCategory = (merchant, receiptText = "") => {
  const text = `${merchant} ${receiptText}`.toLowerCase();
  const match = Object.entries(MERCHANT_CATEGORY_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => text.includes(keyword))
  );
  return match ? match[0] : "Other";
};

const parseReceiptText = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const merchantLines = lines
    .filter((line) => !/(invoice|bill|receipt|date|time|gst|tax|phone|mobile|cashier|order|token)/i.test(line))
    .slice(0, 2);
  const merchant = (merchantLines.length ? merchantLines : lines.slice(0, 2)).join(" ").trim();

  const totalLineIndex = lines.findIndex((line) =>
    /(grand\s+total|amount\s+due|total\s+amount|net\s+payable|balance\s+due|bill\s+amount|sub[\s-]?total|total\b)/i.test(line)
  );
  const totalText =
    totalLineIndex >= 0
      ? [lines[totalLineIndex], lines[totalLineIndex + 1] || ""].join(" ")
      : "";
  const totalNumbers = getMoneyValues(totalText);
  const receiptAmount = totalNumbers.length ? String(totalNumbers[totalNumbers.length - 1]) : pickReceiptAmount(lines);
  const dateMatch =
    text.match(/\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/) ||
    text.match(/\b(?:19|20)\d{2}[-_/]?\d{2}\d{2}\b/) ||
    text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/) ||
    text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b/i) ||
    text.match(/\b\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b/i);

  return {
    title: merchant,
    amount: receiptAmount,
    date: dateMatch ? normalizeDate(dateMatch[0]) : "",
    category: merchant || text ? suggestCategory(merchant, text) : "Other",
  };
};

const defaultRecurring = {
  title: "",
  amount: "",
  category: "Bills",
  nextDueDate: today(),
  frequency: "Monthly",
  paymentMethod: "UPI",
  reminderDaysBefore: 3,
  enabled: true,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expenses, setExpenses] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [expenseForm, setExpenseForm] = useState(defaultExpense);
  const [recurringForm, setRecurringForm] = useState(defaultRecurring);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "INR");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiForm, setAiForm] = useState({ budget: "", income: "", savingsGoal: "" });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [cashTendered, setCashTendered] = useState({});
  const [receiptScan, setReceiptScan] = useState({
    imageUrl: "",
    rawText: "",
    loading: false,
    error: "",
    autoFilled: false,
    progress: 0,
    parsed: null,
  });

  const token = localStorage.getItem("token");

  const money = (amount) => {
    const c = CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0];
    const value = Number(amount || 0) * c.rate;
    return `${c.symbol} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });

  const request = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Login expired");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Request failed");
    }

    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const loadAll = async () => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      setLoading(true);
      const [expenseData, recurringData, reminderData] = await Promise.all([
        request("/api/expenses"),
        request("/api/recurring"),
        request("/api/bills/reminders"),
      ]);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
      setRecurring(Array.isArray(recurringData) ? recurringData : []);
      setReminders(Array.isArray(reminderData) ? reminderData : []);
    } catch (err) {
      showToast(err.message || "Could not load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = (expense.title || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "All" || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, filterCategory]);

  const total = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [filteredExpenses]
  );

  const categoryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((expense) => {
      const name = expense.category || "Other";
      map[name] = (map[name] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      const month = expense.date ? expense.date.substring(0, 7) : "No date";
      map[month] = (map[month] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(map)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [expenses]);

  const unpaidBills = useMemo(
    () => reminders.filter((expense) => !String(expense.paymentStatus || "").startsWith("PAID")),
    [reminders]
  );

  const currentMonthSpend = useMemo(() => {
    const month = today().substring(0, 7);
    return expenses
      .filter((expense) => expense.date && expense.date.startsWith(month))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  }, [expenses]);

  const nextRecurring = useMemo(() => {
    return recurring
      .filter((item) => item.nextDueDate)
      .slice()
      .sort((a, b) => String(a.nextDueDate).localeCompare(String(b.nextDueDate)))[0];
  }, [recurring]);

  const updateExpenseForm = (key, value) => {
    setExpenseForm((current) => ({ ...current, [key]: value }));
  };

  const scanReceipt = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setReceiptScan({
      imageUrl,
      rawText: "",
      loading: true,
      error: "",
      autoFilled: false,
      progress: 0,
      parsed: null,
    });

    try {
      const processedImage = await preprocessReceiptImage(file);
      const result = await Tesseract.recognize(processedImage, "eng", {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setReceiptScan((current) => ({
              ...current,
              progress: Math.round((message.progress || 0) * 100),
            }));
          }
        },
      });
      const rawText = result.data.text || "";
      const parsed = parseReceiptText(rawText);
      const hasAutoFill = Boolean(parsed.title || parsed.amount || parsed.date);

      setExpenseForm((current) => ({
        ...current,
        title: parsed.title || current.title,
        amount: parsed.amount || current.amount,
        date: parsed.date || "",
        category: parsed.category || "Other",
        note: rawText ? `Receipt scan text:\n${rawText}` : current.note,
        source: "receipt_scan",
      }));

      setReceiptScan({
        imageUrl,
        rawText,
        loading: false,
        error: rawText.trim()
          ? parsed.amount && parsed.date
            ? ""
            : "Some fields could not be detected. Please fill the blanks manually."
          : "No readable text was detected. Try a clearer, closer receipt photo.",
        autoFilled: hasAutoFill,
        progress: 100,
        parsed,
      });
    } catch (err) {
      setReceiptScan({
        imageUrl,
        rawText: "",
        loading: false,
        error: `Could not read this receipt. ${err?.message || "You can still enter the expense manually."}`,
        autoFilled: false,
        progress: 0,
        parsed: null,
      });
    }

    event.target.value = "";
  };

  const updateRecurringForm = (key, value) => {
    setRecurringForm((current) => ({ ...current, [key]: value }));
  };

  const choosePaymentMethod = (method, target = "expense") => {
    if (target === "recurring") {
      updateRecurringForm("paymentMethod", method);
    } else {
      updateExpenseForm("paymentMethod", method);
      updateExpenseForm("paymentStatus", method === "CASH" ? "PAID_CASH" : method === "CARD" ? "PAID_CARD" : "PAID_UPI");
    }
  };

  const fillBillSuggestion = (suggestion) => {
    setRecurringForm({
      ...defaultRecurring,
      ...suggestion,
      amount: String(suggestion.amount),
      nextDueDate: recurringForm.nextDueDate || today(),
    });
    setActiveTab("recurring");
    showToast(`${suggestion.title} bill suggestion added to the form`);
  };

  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const csvCell = (value) => {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  };

  const exportCsv = () => {
    const rows = [
      ["Title", "Amount", "Category", "Date", "Due Date", "Payment Status", "Payment Method", "Source", "Note", "Tags"],
      ...expenses.map((expense) => [
        expense.title,
        expense.amount,
        expense.category,
        expense.date,
        expense.dueDate,
        expense.paymentStatus,
        expense.paymentMethod,
        expense.source,
        expense.note,
        expense.tags,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    downloadFile(`expense-report-${today()}.csv`, csv, "text/csv;charset=utf-8");
    showToast("CSV exported");
  };

  const exportPdfReport = () => {
    const rows = expenses
      .map(
        (expense) => `
          <tr>
            <td>${expense.title || ""}</td>
            <td>${expense.category || ""}</td>
            <td>${expense.date || ""}</td>
            <td>${expense.dueDate || ""}</td>
            <td>${expense.paymentStatus || ""}</td>
            <td>${expense.paymentMethod || ""}</td>
            <td>${expense.source || "manual"}</td>
            <td>${money(expense.amount)}</td>
          </tr>`
      )
      .join("");

    const report = `
      <html>
        <head>
          <title>Expense Report ${today()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
            h1 { margin-bottom: 4px; }
            .muted { color: #6b7280; margin-bottom: 22px; }
            .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .value { font-size: 20px; font-weight: 700; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>expense.track report</h1>
          <div class="muted">Generated on ${today()}</div>
          <div class="cards">
            <div class="card"><div>Total spend</div><div class="value">${money(total)}</div></div>
            <div class="card"><div>Expenses</div><div class="value">${expenses.length}</div></div>
            <div class="card"><div>Recurring</div><div class="value">${recurring.length}</div></div>
            <div class="card"><div>Due bills</div><div class="value">${unpaidBills.length}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Date</th><th>Due</th><th>Status</th><th>Method</th><th>Source</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>${rows || "<tr><td colspan='8'>No expenses found</td></tr>"}</tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>`;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      showToast("Allow popups to download PDF report", "error");
      return;
    }
    reportWindow.document.write(report);
    reportWindow.document.close();
    showToast("PDF report opened. Choose Save as PDF.");
  };

  const addExpense = async (event) => {
    event.preventDefault();
    try {
      await request("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...expenseForm,
          amount: Number(expenseForm.amount),
          dueDate: expenseForm.dueDate || null,
          source: expenseForm.source || "manual",
        }),
      });
      setExpenseForm(defaultExpense);
      setReceiptScan({ imageUrl: "", rawText: "", loading: false, error: "", autoFilled: false, progress: 0, parsed: null });
      showToast("Expense added");
      loadAll();
    } catch (err) {
      showToast(err.message || "Add failed", "error");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await request(`/api/expenses/${id}`, { method: "DELETE" });
      showToast("Expense deleted");
      loadAll();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  const addRecurring = async (event) => {
    event.preventDefault();
    try {
      await request("/api/recurring", {
        method: "POST",
        body: JSON.stringify({
          ...recurringForm,
          amount: Number(recurringForm.amount),
          reminderDaysBefore: Number(recurringForm.reminderDaysBefore || 0),
        }),
      });
      setRecurringForm(defaultRecurring);
      showToast("Recurring expense added");
      loadAll();
    } catch (err) {
      showToast(err.message || "Could not add recurring expense", "error");
    }
  };

  const deleteRecurring = async (id) => {
    try {
      await request(`/api/recurring/${id}`, { method: "DELETE" });
      showToast("Recurring expense deleted");
      loadAll();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  const applyRecurring = async (id) => {
    try {
      await request(`/api/recurring/${id}/apply`, { method: "POST", body: "{}" });
      showToast("Recurring bill added to log");
      loadAll();
    } catch (err) {
      showToast(err.message || "Apply failed", "error");
    }
  };

  const markPaid = async (id, paymentMethod) => {
    try {
      await request(`/api/bills/mark-paid/${id}`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      });
      showToast("Bill marked paid");
      setCashTendered((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      loadAll();
    } catch (err) {
      showToast(err.message || "Could not mark paid", "error");
    }
  };

  const dismissReminder = async (id) => {
    try {
      await request(`/api/expenses/${id}`, { method: "DELETE" });
      showToast("Reminder dismissed");
      loadAll();
    } catch (err) {
      showToast(err.message || "Could not dismiss reminder", "error");
    }
  };

  const runAiAnalysis = async (event) => {
    event.preventDefault();
    try {
      setAiLoading(true);
      const result = await request("/api/ai/analyze", {
        method: "POST",
        body: JSON.stringify({
          budget: Number(aiForm.budget),
          income: Number(aiForm.income),
          savingsGoal: Number(aiForm.savingsGoal),
        }),
      });
      setAiResult(result);
      showToast("AI insights refreshed");
    } catch (err) {
      showToast(err.message || "AI analysis failed", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const statCards = [
    { label: "Total spend", value: money(total), hint: `${filteredExpenses.length} matching logs` },
    { label: "This month", value: money(currentMonthSpend), hint: today().substring(0, 7) },
    { label: "Recurring", value: recurring.length, hint: "active bill rules" },
    { label: "Due bills", value: unpaidBills.length, hint: "pending or overdue" },
  ];

  return (
    <div className="dash-shell">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #0a0a0f; }
        .dash-shell {
          min-height: 100vh;
          background: #0a0a0f;
          color: #f8fafc;
          padding: 22px;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .dash-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 0 auto 18px;
          max-width: 1180px;
        }
        .brand {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0;
        }
        .brand span { color: #f97316; }
        .muted { color: rgba(248,250,252,0.62); }
        .top-actions, .tabs, .form-row, .filters, .row-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        button, input, select, textarea {
          font: inherit;
        }
        .btn {
          border: 0;
          border-radius: 8px;
          padding: 10px 13px;
          background: #1f2937;
          color: #fff;
          cursor: pointer;
        }
        .btn:hover { background: #374151; }
        .btn.primary { background: #f97316; }
        .btn.primary:hover { background: #ea580c; }
        .btn.danger { background: #dc2626; }
        .btn.ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); }
        .tabs {
          max-width: 1180px;
          margin: 0 auto 18px;
          padding: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
        }
        .tab {
          border: 0;
          border-radius: 8px;
          padding: 10px 13px;
          background: transparent;
          color: rgba(248,250,252,0.7);
          cursor: pointer;
        }
        .tab.active {
          background: #f97316;
          color: #fff;
        }
        .dash-main {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          gap: 16px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .card {
          background: linear-gradient(145deg, rgba(17,24,39,0.98), rgba(15,23,42,0.92));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 18px 55px rgba(0,0,0,0.22);
        }
        .stat-card {
          position: relative;
          overflow: hidden;
          min-height: 118px;
        }
        .stat-card::before {
          content: "";
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #f97316, #06b6d4, transparent);
        }
        .stat-card::after {
          content: "";
          position: absolute;
          right: -38px;
          bottom: -48px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(249,115,22,0.09);
        }
        .stat-value {
          font-size: 24px;
          font-weight: 800;
          margin-top: 6px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
        }
        .section-title {
          margin: 0 0 12px;
          font-size: 18px;
        }
        .input, .select, .textarea {
          min-width: 150px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          background: #0b1220;
          color: #fff;
          padding: 10px 12px;
          outline: none;
        }
        .textarea {
          min-width: 260px;
          min-height: 42px;
          resize: vertical;
        }
        .input:focus, .select:focus, .textarea:focus { border-color: #f97316; }
        .table {
          width: 100%;
          border-collapse: collapse;
          overflow: hidden;
        }
        .table th, .table td {
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 12px 10px;
          text-align: left;
          vertical-align: top;
        }
        .table th {
          color: rgba(248,250,252,0.58);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 9px;
          background: rgba(249,115,22,0.12);
          color: #fdba74;
          font-size: 12px;
          white-space: nowrap;
        }
        .empty {
          padding: 26px;
          text-align: center;
          color: rgba(248,250,252,0.58);
          border: 1px dashed rgba(255,255,255,0.16);
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
        }
        .toast {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 20;
          max-width: 320px;
          border-radius: 8px;
          padding: 12px 14px;
          background: #16a34a;
          color: #fff;
          box-shadow: 0 16px 48px rgba(0,0,0,.35);
        }
        .toast.error { background: #dc2626; }
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .suggest-card, .payment-card, .export-card {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.045);
        }
        .suggest-card {
          display: grid;
          gap: 6px;
          border-color: rgba(249,115,22,0.22);
        }
        .suggest-top, .payment-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(92px, 1fr));
          gap: 8px;
          width: 100%;
          max-width: 390px;
        }
        .payment-card {
          text-align: left;
          cursor: pointer;
          color: #fff;
          background:
            linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025)),
            #101827;
          padding: 9px 10px;
        }
        .payment-card.active {
          border-color: var(--accent);
          box-shadow: inset 0 0 0 1px var(--accent), 0 14px 38px rgba(0,0,0,0.24);
        }
        .payment-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 18px var(--accent);
        }
        .export-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .export-card {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .mini-list {
          display: grid;
          gap: 10px;
        }
        .mini-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          border-radius: 8px;
          padding: 10px;
        }
        .cash-box {
          display: grid;
          gap: 8px;
          min-width: 220px;
        }
        .cash-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .cash-row .input {
          min-width: 105px;
          width: 105px;
        }
        .due-actions {
          display: grid;
          gap: 8px;
          min-width: 320px;
        }
        .compact-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .receipt-uploader {
          display: grid;
          grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          margin-top: 14px;
          padding: 12px;
          border: 1px solid rgba(6,182,212,0.18);
          border-radius: 8px;
          background: rgba(6,182,212,0.055);
        }
        .receipt-preview {
          width: 100%;
          max-height: 170px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.2);
        }
        .receipt-text {
          max-height: 110px;
          overflow: auto;
          white-space: pre-wrap;
          font-size: 12px;
          color: rgba(248,250,252,0.68);
          padding: 10px;
          border-radius: 8px;
          background: rgba(0,0,0,0.18);
        }
        .receipt-fields {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }
        .receipt-field {
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 8px;
          background: rgba(255,255,255,0.035);
        }
        .receipt-field strong {
          display: block;
          margin-top: 3px;
          font-size: 13px;
        }
        .verify-badge {
          display: inline-flex;
          margin-top: 8px;
          border-radius: 999px;
          padding: 5px 9px;
          color: #67e8f9;
          background: rgba(6,182,212,0.12);
          border: 1px solid rgba(6,182,212,0.2);
          font-size: 12px;
        }
        .ai-score {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: conic-gradient(#f97316 calc(var(--score) * 1%), rgba(255,255,255,0.08) 0);
          font-size: 24px;
          font-weight: 800;
        }
        .ai-list {
          margin: 8px 0 0;
          padding-left: 18px;
          color: rgba(248,250,252,0.78);
        }
        @media (max-width: 860px) {
          .dash-shell { padding: 14px; }
          .dash-top { align-items: flex-start; flex-direction: column; }
          .stats, .grid-2, .quick-grid, .payment-grid, .export-grid, .receipt-uploader, .receipt-fields { grid-template-columns: 1fr; }
          .table { display: block; overflow-x: auto; white-space: nowrap; }
          .input, .select, .textarea, .btn { width: 100%; }
          .tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>

      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.message}</div>}

      <header className="dash-top">
        <div>
          <div className="brand">expense<span>.</span>track</div>
          <div className="muted">Dashboard, logs, recurring bills, reminders and AI insights</div>
        </div>
        <div className="top-actions">
          <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((item) => (
              <option key={item.code} value={item.code}>{item.code}</option>
            ))}
          </select>
          <button className="btn ghost" onClick={loadAll}>Refresh</button>
          <button className="btn danger" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="tabs">
        {[
          ["overview", "Overview"],
          ["expenses", "Expense Logs"],
          ["recurring", "Recurring"],
          ["bills", "Bill Reminders"],
          ["ai", "AI Insights"],
        ].map(([key, label]) => (
          <button
            className={`tab ${activeTab === key ? "active" : ""}`}
            key={key}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="dash-main">
        {loading ? (
          <div className="empty">Loading dashboard...</div>
        ) : (
          <>
            <section className="stats">
              {statCards.map((card) => (
                <div className="card stat-card" key={card.label}>
                  <div className="muted">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                  <div className="muted">{card.hint}</div>
                </div>
              ))}
            </section>

            {activeTab === "overview" && (
              <section className="grid-2">
                <div className="card">
                  <h2 className="section-title">Quick bill setup</h2>
                  <div className="quick-grid">
                    {BILL_SUGGESTIONS.map((bill) => (
                      <div className="suggest-card" key={bill.title}>
                        <div className="suggest-top">
                          <div>
                            <strong>{bill.title}</strong>
                            <div className="muted">{bill.frequency} bill / reminder {bill.reminderDaysBefore} days before</div>
                          </div>
                          <span className="pill">{money(bill.amount)}</span>
                        </div>
                        <button className="btn primary" onClick={() => fillBillSuggestion(bill)}>
                          Use this suggestion
                      </button>
                    </div>
                  ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Reports</h2>
                  <div className="export-grid">
                    <div className="export-card">
                      <div>
                        <strong>Expense CSV</strong>
                        <div className="muted">All logs and payment details.</div>
                      </div>
                      <button className="btn ghost" onClick={exportCsv}>Export</button>
                    </div>
                    <div className="export-card">
                      <div>
                        <strong>PDF report</strong>
                        <div className="muted">Print or save as PDF.</div>
                      </div>
                      <button className="btn primary" onClick={exportPdfReport}>Download</button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Spend by category</h2>
                  {categoryData.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={92}>
                          {categoryData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => money(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty">Add expenses to see category charts.</div>
                  )}
                </div>

                <div className="card">
                  <h2 className="section-title">Monthly trend</h2>
                  {monthlyData.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={monthlyData}>
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip formatter={(value) => money(value)} />
                        <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty">No monthly data yet.</div>
                  )}
                </div>

                <div className="card">
                  <h2 className="section-title">Category bars</h2>
                  {categoryData.length ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={categoryData}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip formatter={(value) => money(value)} />
                        <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty">No category totals yet.</div>
                  )}
                </div>

                <div className="card">
                  <h2 className="section-title">Upcoming bill snapshot</h2>
                  {unpaidBills.length ? (
                    <table className="table">
                      <tbody>
                        {unpaidBills.slice(0, 5).map((bill) => (
                          <tr key={bill.id}>
                            <td>{bill.title}</td>
                            <td>{money(bill.amount)}</td>
                            <td><span className="pill">{bill.dueDate || "No due date"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty">No pending bill reminders.</div>
                  )}
                </div>

                <div className="card">
                  <h2 className="section-title">Smart summary</h2>
                  <div className="mini-list">
                    <div className="mini-item">
                      <span className="muted">Top category</span>
                      <strong>{categoryData[0] ? `${categoryData[0].name} / ${money(categoryData[0].value)}` : "No data"}</strong>
                    </div>
                    <div className="mini-item">
                      <span className="muted">Next recurring bill</span>
                      <strong>{nextRecurring ? `${nextRecurring.title} on ${nextRecurring.nextDueDate}` : "None added"}</strong>
                    </div>
                    <div className="mini-item">
                      <span className="muted">Payment health</span>
                      <strong>{unpaidBills.length ? `${unpaidBills.length} bills need payment` : "All clear"}</strong>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "expenses" && (
              <section className="card">
                <h2 className="section-title">Expense logs</h2>
                <div className="filters">
                  <input className="input" placeholder="Search logs" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <select className="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option>All</option>
                    {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>

                <div className="receipt-uploader">
                  <div>
                    {receiptScan.imageUrl ? (
                      <img className="receipt-preview" src={receiptScan.imageUrl} alt="Receipt preview" />
                    ) : (
                      <div className="empty">Receipt preview</div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 8px" }}>Scan receipt</h3>
                    <label className="btn primary" style={{ display: "inline-flex" }}>
                      Upload Receipt
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={scanReceipt}
                        style={{ display: "none" }}
                      />
                    </label>
                    {receiptScan.loading && <span className="verify-badge">Reading receipt... {receiptScan.progress}%</span>}
                    {receiptScan.autoFilled && (
                      <div className="verify-badge">Auto-filled from receipt - please verify</div>
                    )}
                    {receiptScan.error && <div className="muted" style={{ marginTop: 8 }}>{receiptScan.error}</div>}
                    {receiptScan.parsed && (
                      <div className="receipt-fields">
                        <div className="receipt-field">
                          <span className="muted">Merchant</span>
                          <strong>{receiptScan.parsed.title || "Not detected"}</strong>
                        </div>
                        <div className="receipt-field">
                          <span className="muted">Amount</span>
                          <strong>{receiptScan.parsed.amount || "Not detected"}</strong>
                        </div>
                        <div className="receipt-field">
                          <span className="muted">Date</span>
                          <strong>{receiptScan.parsed.date || "Not detected"}</strong>
                        </div>
                        <div className="receipt-field">
                          <span className="muted">Category</span>
                          <strong>{receiptScan.parsed.category || "Other"}</strong>
                        </div>
                      </div>
                    )}
                    {(receiptScan.rawText || receiptScan.parsed) && (
                      <div className="receipt-text" style={{ marginTop: 10 }}>
                        {receiptScan.rawText || "No OCR text detected from this image."}
                      </div>
                    )}
                  </div>
                </div>

                <form className="form-row" onSubmit={addExpense} style={{ marginTop: 14 }}>
                  <input className="input" placeholder="Title" value={expenseForm.title} onChange={(e) => updateExpenseForm("title", e.target.value)} required />
                  <input className="input" type="number" min="0" step="0.01" placeholder="Amount" value={expenseForm.amount} onChange={(e) => updateExpenseForm("amount", e.target.value)} required />
                  <select className="select" value={expenseForm.category} onChange={(e) => updateExpenseForm("category", e.target.value)}>
                    {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <input className="input" type="date" value={expenseForm.date} onChange={(e) => updateExpenseForm("date", e.target.value)} />
                  <input className="input" type="date" value={expenseForm.dueDate} onChange={(e) => updateExpenseForm("dueDate", e.target.value)} title="Due date" />
                  <div className="payment-grid">
                    {PAYMENT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.method}
                        className={`payment-card ${expenseForm.paymentMethod === option.method ? "active" : ""}`}
                        style={{ "--accent": option.accent }}
                        onClick={() => choosePaymentMethod(option.method)}
                      >
                        <div className="payment-top">
                          <strong>{option.title}</strong>
                          <span className="payment-dot" />
                        </div>
                        <div className="muted">{option.subtitle}</div>
                      </button>
                    ))}
                  </div>
                  <button className="btn primary" type="submit">Add Expense</button>
                </form>

                {filteredExpenses.length ? (
                  <table className="table" style={{ marginTop: 16 }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Due</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Source</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.slice().reverse().map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.title}</td>
                          <td><span className="pill">{expense.category}</span></td>
                          <td>{expense.date || "-"}</td>
                          <td>{expense.dueDate || "-"}</td>
                          <td>{expense.paymentStatus || "-"}</td>
                          <td>{money(expense.amount)}</td>
                          <td><span className="pill">{expense.source || "manual"}</span></td>
                          <td><button className="btn danger" onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty" style={{ marginTop: 16 }}>No expense logs found.</div>
                )}
              </section>
            )}

            {activeTab === "recurring" && (
              <section className="card">
                <h2 className="section-title">Recurring expenses</h2>
                <div className="quick-grid">
                  {BILL_SUGGESTIONS.map((bill) => (
                    <div className="suggest-card" key={bill.title}>
                      <div className="suggest-top">
                        <div>
                          <strong>{bill.title}</strong>
                          <div className="muted">Suggested monthly bill. Pick the exact due date below.</div>
                        </div>
                        <span className="pill">{money(bill.amount)}</span>
                      </div>
                      <button className="btn ghost" onClick={() => fillBillSuggestion(bill)}>
                        Fill form
                      </button>
                    </div>
                  ))}
                </div>
                <form className="form-row" onSubmit={addRecurring}>
                  <input className="input" placeholder="Bill name" value={recurringForm.title} onChange={(e) => updateRecurringForm("title", e.target.value)} required />
                  <input className="input" type="number" min="0" step="0.01" placeholder="Amount" value={recurringForm.amount} onChange={(e) => updateRecurringForm("amount", e.target.value)} required />
                  <select className="select" value={recurringForm.category} onChange={(e) => updateRecurringForm("category", e.target.value)}>
                    {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <select className="select" value={recurringForm.frequency} onChange={(e) => updateRecurringForm("frequency", e.target.value)}>
                    {FREQUENCIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <input className="input" type="date" value={recurringForm.nextDueDate} onChange={(e) => updateRecurringForm("nextDueDate", e.target.value)} />
                  <div className="payment-grid">
                    {PAYMENT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.method}
                        className={`payment-card ${recurringForm.paymentMethod === option.method ? "active" : ""}`}
                        style={{ "--accent": option.accent }}
                        onClick={() => choosePaymentMethod(option.method, "recurring")}
                      >
                        <div className="payment-top">
                          <strong>{option.title}</strong>
                          <span className="payment-dot" />
                        </div>
                        <div className="muted">{option.subtitle}</div>
                      </button>
                    ))}
                  </div>
                  <input className="input" type="number" min="0" placeholder="Reminder days" value={recurringForm.reminderDaysBefore} onChange={(e) => updateRecurringForm("reminderDaysBefore", e.target.value)} />
                  <button className="btn primary" type="submit">Add Recurring</button>
                </form>

                {recurring.length ? (
                  <table className="table" style={{ marginTop: 16 }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Frequency</th>
                        <th>Next due</th>
                        <th>Reminder</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurring.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}<div className="muted">{item.category} / {item.paymentMethod || "OTHER"}</div></td>
                          <td>{item.frequency || "-"}</td>
                          <td>{item.nextDueDate || "-"}</td>
                          <td>{item.reminderDaysBefore ?? 0} days before</td>
                          <td>{money(item.amount)}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn primary" onClick={() => applyRecurring(item.id)}>Apply</button>
                              <button className="btn danger" onClick={() => deleteRecurring(item.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty" style={{ marginTop: 16 }}>No recurring expenses added yet.</div>
                )}
              </section>
            )}

            {activeTab === "bills" && (
              <section className="card">
                <h2 className="section-title">Bill reminders</h2>
                {reminders.length ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Bill</th>
                        <th>Due date</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Pay with</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reminders.map((bill) => (
                        <tr key={bill.id}>
                          <td>{bill.title}<div className="muted">{bill.category}</div></td>
                          <td>{bill.dueDate || "-"}</td>
                          <td><span className="pill">{bill.paymentStatus || "PENDING"}</span></td>
                          <td>{money(bill.amount)}</td>
                          <td>
                            <div className="due-actions">
                              <div className="compact-actions">
                                <button className="btn primary" onClick={() => markPaid(bill.id, "UPI")}>
                                  Paid UPI
                                </button>
                                <button className="btn primary" onClick={() => markPaid(bill.id, "CARD")}>
                                  Paid Card
                                </button>
                                <button className="btn danger" onClick={() => dismissReminder(bill.id)}>
                                  Not paid
                                </button>
                              </div>
                              <div className="cash-box">
                                <div className="cash-row">
                                  <input
                                    className="input"
                                    type="number"
                                    min="0"
                                    placeholder="Cash"
                                    value={cashTendered[bill.id] || ""}
                                    onChange={(e) =>
                                      setCashTendered((current) => ({
                                        ...current,
                                        [bill.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button className="btn primary" onClick={() => markPaid(bill.id, "CASH")}>
                                    Paid Cash
                                  </button>
                                </div>
                                <div className="muted">
                                  Return: {money(Math.max(0, Number(cashTendered[bill.id] || 0) - Number(bill.amount || 0)))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty">No upcoming or overdue bills. Apply a recurring expense to create a pending bill.</div>
                )}
              </section>
            )}

            {activeTab === "ai" && (
              <section className="grid-2">
                <div className="card">
                  <h2 className="section-title">AI expense analysis</h2>
                  <form className="form-row" onSubmit={runAiAnalysis}>
                    <input className="input" type="number" min="0" required placeholder="Monthly budget — e.g. 20,000" value={aiForm.budget} onChange={(e) => setAiForm({ ...aiForm, budget: e.target.value })} />
                    <input className="input" type="number" min="0" required placeholder="Monthly income — e.g. 50,000" value={aiForm.income} onChange={(e) => setAiForm({ ...aiForm, income: e.target.value })} />
                    <input className="input" type="number" min="0" required placeholder="Savings target — e.g. 10,000" value={aiForm.savingsGoal} onChange={(e) => setAiForm({ ...aiForm, savingsGoal: e.target.value })} />
                    <button className="btn primary" type="submit" disabled={aiLoading}>
                      {aiLoading ? "Analyzing..." : "Analyze"}
                    </button>
                  </form>
                  <p className="muted">Enter monthly targets. Analysis uses expenses from the current month only.</p>
                </div>

                <div className="card">
                  <h2 className="section-title">Insight result</h2>
                  {aiResult ? (
                    <>
                      <div className="form-row">
                        <div className="ai-score" style={{ "--score": aiResult.score || 0 }}>{aiResult.score || 0}</div>
                        <div>
                          <h3 style={{ margin: 0 }}>{aiResult.scoreLabel || "Score"}</h3>
                          <p className="muted">{aiResult.topInsight}</p>
                        </div>
                      </div>
                      <table className="table" style={{ marginTop: 14 }}>
                        <tbody>
                          <tr><td>Total spent</td><td>{money(aiResult.totalSpent)}</td></tr>
                          <tr><td>Savings</td><td>{money(aiResult.savings)}</td></tr>
                          <tr><td>Budget used</td><td>{aiResult.budgetUsedPct || 0}%</td></tr>
                          <tr><td>Savings target progress</td><td>{aiResult.savingsProgressPct || 0}%</td></tr>
                          <tr><td>Top category</td><td>{aiResult.topCategory} ({aiResult.topCategoryPct || 0}%)</td></tr>
                          <tr><td>Biggest expense</td><td>{aiResult.biggestExpense}</td></tr>
                        </tbody>
                      </table>
                      <h3>Warnings</h3>
                      <ul className="ai-list">
                        {(aiResult.warnings || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                      <h3>Suggestions</h3>
                      <ul className="ai-list">
                        {(aiResult.suggestions || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </>
                  ) : (
                    <div className="empty">Run analysis to see AI suggestions.</div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

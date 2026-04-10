// import React, { useEffect, useState, useMemo } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip, Legend,
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line
// } from "recharts";

// // ─── Constants ───────────────────────────────────────────────────────────────
// const COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#22c55e"];
// const CATEGORIES = ["Food", "Travel", "Shopping", "Bills","Grocery", "Other"];
// const CAT_ICONS = { Food: "🍜", Travel: "✈️", Shopping: "🛍️", Bills: "📄",Grocery: "🛒", Other: "📦" };
// const ALL_TAGS = ["🔴 Urgent", "🟡 Planned", "🟢 Optional", "💼 Work", "🎉 Fun", "🏠 Home"];
// const CURRENCIES = [
//   { code: "INR", symbol: "₹", rate: 1 },
//   { code: "USD", symbol: "$", rate: 0.012 },
//   { code: "EUR", symbol: "€", rate: 0.011 },
//   { code: "GBP", symbol: "£", rate: 0.0095 },
//   { code: "JPY", symbol: "¥", rate: 1.78 },
// ];

// const fmt = (amount, currency) => {
//   const c = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
//   return `${c.symbol}${(amount * c.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
// };

// const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
// const today = () => new Date().toISOString().split("T")[0];

// // ─── Component ────────────────────────────────────────────────────────────────
// export default function Dashboard() {
//   const [expenses, setExpenses] = useState([]);
//   const [title, setTitle] = useState("");
//   const [amount, setAmount] = useState("");
//   const [category, setCategory] = useState("Food");
//   const [noteInput, setNoteInput] = useState("");
//   const [tagInput, setTagInput] = useState([]);
//   const [dueDate, setDueDate] = useState("");
//   const [adding, setAdding] = useState(false);

//   const [darkMode, setDarkMode] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [filterMonth, setFilterMonth] = useState("");
//   const [filterTag, setFilterTag] = useState("All");
//   const [budget, setBudget] = useState(10000);
//   const [budgetInput, setBudgetInput] = useState("10000");
//   const [savingsGoal, setSavingsGoal] = useState(5000);
//   const [savingsInput, setSavingsInput] = useState("5000");
//   const [income, setIncome] = useState(30000);
//   const [incomeInput, setIncomeInput] = useState("30000");
//   const [currency, setCurrency] = useState("INR");
//   const [toast, setToast] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editFields, setEditFields] = useState({});
//   const [recurringList, setRecurringList] = useState([
//     { id: 1, title: "Rent", amount: 8000, category: "Bills", note: "", tags: [] },
//     { id: 2, title: "Netflix", amount: 649, category: "Bills", note: "", tags: [] }
//   ]);
//   const [recurringForm, setRecurringForm] = useState({ title: "", amount: "", category: "Bills" });
//   const [activityLog, setActivityLog] = useState([]);
//   const [reminders, setReminders] = useState([]);
//   const [reminderForm, setReminderForm] = useState({ title: "", date: "", amount: "", category: "Bills" });
//   const [activeTab, setActiveTab] = useState("overview");
//   const [summaryMonth, setSummaryMonth] = useState(new Date().toISOString().substring(0, 7));

//   const token = localStorage.getItem("token");
  
// // const token = localStorage.getItem("token");
// // const response = fetch("http://localhost:8080/api/expenses", {
// //   method: "POST",
// //   headers: {
// //     "Content-Type": "application/json",
// //     "Authorization": `Bearer ${token}`
// //   },
// //   body: JSON.stringify(expenseData)
// // });


//   const th = {
//     bg: darkMode ? "#0a0a0f" : "#f5f3ef",
//     card: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
//     border: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
//     text: darkMode ? "#f0ece4" : "#1a1410",
//     sub: darkMode ? "rgba(240,236,228,0.38)" : "rgba(26,20,16,0.42)",
//     iBg: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
//     iBorder: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
//     tooltip: darkMode ? "#1a1a24" : "#fff",
//   };

//   const log = (action, detail) => {
//     setActivityLog(prev => [{ id: Date.now(), action, detail, time: now(), date: today() }, ...prev].slice(0, 100));
//   };

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

// //  const fetchExpenses = async () => {
// //   try {
// //     const res = await fetch("http://localhost:8080/api/expenses", {
// //       headers: { Authorization: `Bearer ${token}` }
// //     });

// //     console.log("FETCH STATUS:", res.status);

// //     const data = await res.json();
// //     setExpenses(Array.isArray(data) ? data : []);

// //   } catch {
// //     showToast("Failed to fetch expenses", "error");
// //   }
// // };




// // eslint-disable-line react-hooks/exhaustive-deps

// // eslint-disable-next-line react-hooks/exhaustive-deps
// // useEffect(() => { fetchExpenses(); }, []);
//   // Check reminders on load
//   useEffect(() => {
//     const overdue = reminders.filter(r => r.date && r.date <= today() && !r.done);
//     if (overdue.length > 0) showToast(`⏰ ${overdue.length} reminder(s) due today!`, "warn");
//   }, [reminders]);

//   // ── Derived ──
//   const filteredExpenses = useMemo(() => {
//     return expenses.filter(e => {
//       const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
//       const matchCat = filterCategory === "All" || e.category === filterCategory;
//       const matchMonth = !filterMonth || (e.date && e.date.startsWith(filterMonth));
//       const matchTag = filterTag === "All" || (e.tags && e.tags.includes(filterTag));
//       return matchSearch && matchCat && matchMonth && matchTag;
//     });
//   }, [expenses, search, filterCategory, filterMonth, filterTag]);

//   const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0);
//   const totalFiltered = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
//   const balance = income - totalAll;
//   const budgetUsed = Math.min((totalAll / budget) * 100, 100);
//   const savingsPct = Math.min((balance / savingsGoal) * 100, 100);

//   const topCat = useMemo(() => {
//     const map = {};
//     expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
//     return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
//   }, [expenses]);

//   const getCatData = (list = filteredExpenses) => {
//     const map = {};
//     list.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
//     return Object.keys(map).map(k => ({ name: k, value: map[k] }));
//   };

//   const getMonthlyData = () => {
//     const map = {};
//     expenses.forEach(e => {
//       if (!e.date) return;
//       const m = e.date.substring(0, 7);
//       map[m] = (map[m] || 0) + Number(e.amount);
//     });
//     return Object.entries(map).sort().slice(-6).map(([k, v]) => ({ month: k.substring(5), amount: v }));
//   };

//   const getMonthlySummary = () => {
//     const list = expenses.filter(e => e.date && e.date.startsWith(summaryMonth));
//     const total = list.reduce((s, e) => s + Number(e.amount), 0);
//     const catData = getCatData(list);
//     const avg = list.length > 0 ? (total / list.length).toFixed(0) : 0;
//     const highest = [...list].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
//     return { list, total, catData, avg, highest, count: list.length };
//   };

//   // ── CRUD ──
//   const handleAdd = async (ev) => {
//     ev.preventDefault();
//     setAdding(true);
//     try {
//       await fetch("http://localhost:8080/api/expenses", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({
//           title, amount, category,
//           date: today(),
//           note: noteInput,
//           tags: tagInput,
//           dueDate: dueDate || null
//         })
//       });
//       log("➕ Added", `${title} — ${fmt(Number(amount), currency)} (${category})`);
//       if (totalAll + Number(amount) > budget * 0.9) showToast("⚠️ Approaching budget limit!", "warn");
//       else showToast("Expense added! 🎉");
//       setTitle(""); setAmount(""); setNoteInput(""); setTagInput([]); setDueDate("");
//       fetchExpenses();
//     } catch { showToast("Failed to add", "error"); }
//     setAdding(false);
//   };

//   const handleDelete = async (id, expTitle) => {
//     try {
//       await fetch(`http://localhost:8080/api/expenses/${id}`, {
//         method: "DELETE", headers: { Authorization: `Bearer ${token}` }
//       });
//       log("🗑️ Deleted", expTitle);
//       showToast("Deleted");
//       fetchExpenses();
//     } catch { showToast("Delete failed", "error"); }
//   };

//   const handleEditSave = async (id) => {
//     try {
//       await fetch(`http://localhost:8080/api/expenses/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ ...editFields, date: today() })
//       });
//       log("✏️ Edited", editFields.title);
//       setEditingId(null);
//       showToast("Updated! ✅");
//       fetchExpenses();
//     } catch { showToast("Update failed", "error"); }
//   };

//   const applyRecurring = async (r) => {
//     await fetch("http://localhost:8080/api/expenses", {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       body: JSON.stringify({ title: r.title, amount: r.amount, category: r.category, date: today(), note: r.note || "", tags: r.tags || [] })
//     });
//     log("🔁 Recurring", `${r.title} applied for ${today().substring(0, 7)}`);
//     showToast(`${r.title} added!`);
//     fetchExpenses();
//   };

//   // ── Reminder helpers ──
//   const addReminder = () => {
//     if (!reminderForm.title || !reminderForm.date) return;
//     setReminders(prev => [...prev, { id: Date.now(), ...reminderForm, done: false }]);
//     log("⏰ Reminder set", `${reminderForm.title} due ${reminderForm.date}`);
//     setReminderForm({ title: "", date: "", amount: "", category: "Bills" });
//     showToast("Reminder set!");
//   };

//   const markReminderDone = (id) => {
//     setReminders(prev => prev.map(r => r.id === id ? { ...r, done: true } : r));
//     log("✅ Reminder done", reminders.find(r => r.id === id)?.title);
//   };

//   const exportCSV = () => {
//     const rows = [["Title", "Amount", "Category", "Date", "Tags", "Note"]];
//     expenses.forEach(e => rows.push([e.title, e.amount, e.category, e.date, (e.tags || []).join("|"), e.note || ""]));
//     const csv = rows.map(r => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a"); a.href = url; a.download = "expenses.csv"; a.click();
//     log("📤 Exported", "expenses.csv downloaded");
//     showToast("CSV exported!");
//   };

//   const overdueReminders = reminders.filter(r => !r.done && r.date <= today());

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
//         *{margin:0;padding:0;box-sizing:border-box;}
//         body{font-family:'DM Sans',sans-serif;}
//         .app{min-height:100vh;transition:background 0.3s,color 0.3s;}
//         .header{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:10px;}
//         .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:21px;letter-spacing:-0.5px;}
//         .logo span{color:#f97316;}
//         .header-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
//         .tabs{display:flex;gap:3px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:4px;}
//         .tab{padding:7px 14px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;transition:all 0.2s;background:transparent;color:var(--sub);}
//         .tab.active{background:#f97316;color:#fff;}
//         .theme-btn{background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 13px;border-radius:20px;cursor:pointer;font-size:12px;transition:all 0.2s;}
//         .theme-btn:hover{border-color:#f97316;}
//         .main{padding:28px 40px;max-width:1300px;margin:0 auto;}
//         .page-title{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;margin-bottom:3px;}
//         .page-title span{color:#f97316;}
//         .page-sub{color:var(--sub);font-size:13px;margin-bottom:22px;}
//         .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}
//         .stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;position:relative;overflow:hidden;transition:border-color 0.2s,transform 0.2s;}
//         .stat-card:hover{border-color:rgba(249,115,22,0.4);transform:translateY(-2px);}
//         .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f97316,transparent);}
//         .stat-label{font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:7px;}
//         .stat-value{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;line-height:1;margin-bottom:3px;}
//         .stat-meta{font-size:10px;color:var(--sub);}
//         .card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:22px;}
//         .card-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:7px;}
//         .dot{width:6px;height:6px;background:#f97316;border-radius:50%;flex-shrink:0;}
//         .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
//         .form-row{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end;}
//         .input{background:var(--iBg);border:1px solid var(--iBorder);border-radius:9px;padding:10px 13px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s;width:100%;}
//         .input:focus{border-color:#f97316;}
//         .input::placeholder{color:var(--sub);}
//         select.input option{background:#1a1a24;}
//         .btn{background:#f97316;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
//         .btn:hover{background:#ea6c10;transform:translateY(-1px);}
//         .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
//         .btn-ghost{background:var(--iBg);border:1px solid var(--iBorder);color:var(--text);border-radius:9px;padding:9px 16px;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;}
//         .btn-ghost:hover{border-color:#f97316;color:#f97316;}
//         .btn-sm{padding:4px 9px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
//         .btn-edit{background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2);}
//         .btn-edit:hover{background:rgba(6,182,212,0.2);}
//         .btn-del{background:rgba(239,68,68,0.08);color:rgba(239,68,68,0.7);border:1px solid rgba(239,68,68,0.15);}
//         .btn-del:hover{background:rgba(239,68,68,0.18);color:#ef4444;}
//         .btn-green{background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);}
//         .btn-green:hover{background:rgba(34,197,94,0.2);}
//         .expense-list{display:flex;flex-direction:column;gap:7px;}
//         .exp-item{display:flex;align-items:flex-start;justify-content:space-between;padding:12px 13px;background:var(--card);border:1px solid var(--border);border-radius:11px;transition:all 0.2s;animation:slideIn 0.2s ease;gap:10px;}
//         .exp-item:hover{border-color:rgba(249,115,22,0.25);}
//         @keyframes slideIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
//         .exp-icon{width:34px;height:34px;background:rgba(249,115,22,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
//         .exp-title{font-weight:500;font-size:13px;margin-bottom:2px;}
//         .exp-meta{font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:0.7px;}
//         .exp-note{font-size:11px;color:var(--sub);margin-top:3px;font-style:italic;}
//         .exp-amount{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#f97316;white-space:nowrap;}
//         .due-badge{font-size:10px;padding:2px 7px;border-radius:20px;background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);margin-top:3px;display:inline-block;}
//         .tag-badge{font-size:10px;padding:2px 7px;border-radius:20px;background:rgba(249,115,22,0.1);color:#f97316;border:1px solid rgba(249,115,22,0.2);margin-right:4px;margin-top:3px;display:inline-block;}
//         .scroll-box{max-height:360px;overflow-y:auto;}
//         .scroll-box::-webkit-scrollbar{width:3px;}
//         .scroll-box::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.3);border-radius:3px;}
//         .progress-bar{height:8px;background:var(--iBg);border-radius:99px;overflow:hidden;margin:7px 0;}
//         .progress-fill{height:100%;border-radius:99px;transition:width 0.5s ease;}
//         .filter-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
//         .filter-row .input{flex:1;min-width:120px;}
//         .empty{text-align:center;padding:36px;color:var(--sub);}
//         .empty div:first-child{font-size:30px;margin-bottom:8px;}
//         .toast{position:fixed;bottom:24px;right:24px;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;z-index:9999;animation:fadeUp 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.3);color:#fff;}
//         @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
//         .gap{margin-bottom:14px;}
//         .log-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
//         .log-item:last-child{border-bottom:none;}
//         .log-action{font-size:13px;font-weight:500;}
//         .log-detail{font-size:11px;color:var(--sub);margin-top:2px;}
//         .log-time{font-size:10px;color:var(--sub);white-space:nowrap;margin-left:auto;}
//         .summary-stat{padding:14px;background:var(--iBg);border-radius:11px;border:1px solid var(--iBorder);text-align:center;}
//         .summary-stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#f97316;}
//         .summary-stat-lbl{font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:1px;margin-top:3px;}
//         .reminder-item{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;border:1px solid var(--border);border-radius:11px;margin-bottom:7px;transition:all 0.2s;}
//         .reminder-item.overdue{border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.04);}
//         .reminder-item.done{opacity:0.4;}
//         .tags-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
//         .tag-select{padding:4px 10px;border-radius:20px;border:1px solid var(--iBorder);background:var(--iBg);color:var(--sub);font-size:11px;cursor:pointer;transition:all 0.2s;}
//         .tag-select.selected{background:rgba(249,115,22,0.12);color:#f97316;border-color:rgba(249,115,22,0.35);}
//         .hint{padding:10px 13px;background:rgba(249,115,22,0.05);border:1px solid rgba(249,115,22,0.15);border-radius:9px;font-size:12px;color:var(--sub);margin-top:12px;}
//         .currency-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
//         .currency-btn{padding:6px 13px;border-radius:20px;border:1px solid var(--iBorder);background:var(--iBg);color:var(--sub);font-size:12px;cursor:pointer;transition:all 0.2s;}
//         .currency-btn.active{background:rgba(249,115,22,0.12);color:#f97316;border-color:rgba(249,115,22,0.35);}
//         @media(max-width:900px){
//           .stats-grid{grid-template-columns:1fr 1fr;}
//           .two-col{grid-template-columns:1fr;}
//           .form-row{grid-template-columns:1fr;}
//           .main{padding:18px;}
//           .header{padding:14px 18px;}
//         }
//       `}</style>

//       <div className="app" style={{
//         "--card": th.card, "--border": th.border, "--text": th.text,
//         "--sub": th.sub, "--iBg": th.iBg, "--iBorder": th.iBorder,
//         background: th.bg, color: th.text
//       }}>

//         {/* TOAST */}
//         {toast && (
//           <div className="toast" style={{ background: toast.type === "error" ? "#ef4444" : toast.type === "warn" ? "#f59e0b" : "#22c55e" }}>
//             {toast.msg}
//           </div>
//         )}

//         {/* HEADER */}
//         <div className="header">
//           <div>
//             <div className="logo">expense<span>.</span>track</div>
//             {overdueReminders.length > 0 && (
//               <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>
//                 ⏰ {overdueReminders.length} reminder{overdueReminders.length > 1 ? "s" : ""} due!
//               </div>
//             )}
//           </div>
//           <div className="header-right">
//             <div className="tabs">
//               {["overview", "expenses", "recurring", "goals", "logs"].map(t => (
//                 <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
//                   {t === "logs" ? "📋 Logs" : t.charAt(0).toUpperCase() + t.slice(1)}
//                 </button>
//               ))}
//             </div>
//             <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
//               {darkMode ? "☀️" : "🌙"}
//             </button>
//           </div>
//         </div>

//         <div className="main">
//           <div className="page-title">Your <span>Finances</span></div>
//           <div className="page-sub">Track, manage and grow your money</div>

//           {/* ══════════════════ OVERVIEW ══════════════════ */}
//           {activeTab === "overview" && (
//             <>
//               {/* Currency Selector */}
//               <div className="currency-row">
//                 {CURRENCIES.map(c => (
//                   <button key={c.code} className={`currency-btn ${currency === c.code ? "active" : ""}`} onClick={() => { setCurrency(c.code); log("💱 Currency", `Switched to ${c.code}`); }}>
//                     {c.symbol} {c.code}
//                   </button>
//                 ))}
//               </div>

//               {/* Stats */}
//               <div className="stats-grid">
//                 {[
//                   { label: "Total Spent", val: fmt(totalAll, currency), meta: `${expenses.length} transactions`, color: "#f97316" },
//                   { label: "Balance", val: fmt(balance, currency), meta: "Income – Expenses", color: balance >= 0 ? "#22c55e" : "#ef4444" },
//                   { label: "Top Category", val: topCat ? `${CAT_ICONS[topCat[0]] || "📦"} ${topCat[0]}` : "—", meta: topCat ? fmt(topCat[1], currency) : "No data", color: th.text, sm: true },
//                   { label: "Budget Used", val: `${budgetUsed.toFixed(0)}%`, meta: `of ${fmt(budget, currency)}`, color: budgetUsed > 90 ? "#ef4444" : budgetUsed > 70 ? "#f59e0b" : "#22c55e" }
//                 ].map(s => (
//                   <div className="stat-card" key={s.label}>
//                     <div className="stat-label">{s.label}</div>
//                     <div className="stat-value" style={{ color: s.color, fontSize: s.sm ? "16px" : "22px" }}>{s.val}</div>
//                     <div className="stat-meta">{s.meta}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Budget + Savings */}
//               <div className="two-col gap">
//                 <div className="card">
//                   <div className="card-title"><div className="dot"></div> Monthly Budget</div>
//                   <div style={{ display: "flex", gap: "7px", marginBottom: "10px" }}>
//                     <input className="input" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="Set budget (₹)" />
//                     <button className="btn" onClick={() => { setBudget(Number(budgetInput)); log("💰 Budget", `Set to ₹${budgetInput}`); showToast("Budget updated!"); }}>Set</button>
//                   </div>
//                   <div className="progress-bar">
//                     <div className="progress-fill" style={{ width: `${budgetUsed}%`, background: budgetUsed > 90 ? "#ef4444" : budgetUsed > 70 ? "#f59e0b" : "#22c55e" }} />
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: th.sub }}>
//                     <span>{fmt(totalAll, currency)} spent</span><span>{fmt(Math.max(0, budget - totalAll), currency)} left</span>
//                   </div>
//                   {budgetUsed > 90 && <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "7px" }}>⚠️ {budgetUsed.toFixed(0)}% of budget used!</div>}
//                 </div>

//                 <div className="card">
//                   <div className="card-title"><div className="dot"></div> Income & Savings Goal</div>
//                   <div style={{ display: "flex", gap: "7px", marginBottom: "7px" }}>
//                     <input className="input" type="number" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} placeholder="Monthly income" />
//                     <button className="btn" onClick={() => { setIncome(Number(incomeInput)); log("💵 Income", `Set to ₹${incomeInput}`); showToast("Income updated!"); }}>Set</button>
//                   </div>
//                   <div style={{ display: "flex", gap: "7px", marginBottom: "9px" }}>
//                     <input className="input" type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="Savings goal" />
//                     <button className="btn" onClick={() => { setSavingsGoal(Number(savingsInput)); log("🎯 Goal", `Set to ₹${savingsInput}`); showToast("Goal updated!"); }}>Set</button>
//                   </div>
//                   <div className="progress-bar">
//                     <div className="progress-fill" style={{ width: `${Math.max(0, savingsPct)}%`, background: "#22c55e" }} />
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: th.sub }}>
//                     <span>Saved {fmt(Math.max(0, balance), currency)}</span><span>Goal {fmt(savingsGoal, currency)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Charts */}
//               {getCatData().length > 0 && (
//                 <div className="two-col gap">
//                   <div className="card">
//                     <div className="card-title"><div className="dot"></div> By Category</div>
//                     <PieChart width={260} height={180}>
//                       <Pie data={getCatData()} dataKey="value" cx={120} cy={80} outerRadius={65} strokeWidth={0}>
//                         {getCatData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//                       </Pie>
//                       <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
//                       <Legend wrapperStyle={{ fontSize: "10px" }} />
//                     </PieChart>
//                   </div>
//                   <div className="card">
//                     <div className="card-title"><div className="dot"></div> Monthly Trend</div>
//                     <ResponsiveContainer width="100%" height={180}>
//                       <LineChart data={getMonthlyData()}>
//                         <XAxis dataKey="month" tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
//                         <YAxis tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
//                         <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
//                         <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 4 }} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               )}

//               {/* Quick Add */}
//               <div className="card">
//                 <div className="card-title"><div className="dot"></div> Quick Add Expense</div>
//                 <form onSubmit={handleAdd}>
//                   <div className="form-row" style={{ marginBottom: "8px" }}>
//                     <input className="input" placeholder="What did you spend on?" value={title} onChange={e => setTitle(e.target.value)} required />
//                     <input type="number" className="input" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
//                     <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
//                       {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//                     </select>
//                     <button className="btn" type="submit" disabled={adding}>{adding ? "..." : "+ Add"}</button>
//                   </div>
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
//                     <input className="input" placeholder="📝 Note (optional)" value={noteInput} onChange={e => setNoteInput(e.target.value)} />
//                     <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} title="Due date (optional)" />
//                   </div>
//                   <div className="tags-row">
//                     {ALL_TAGS.map(t => (
//                       <button type="button" key={t} className={`tag-select ${tagInput.includes(t) ? "selected" : ""}`}
//                         onClick={() => setTagInput(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
//                         {t}
//                       </button>
//                     ))}
//                   </div>
//                 </form>
//               </div>
//             </>
//           )}

//           {/* ══════════════════ EXPENSES ══════════════════ */}
//           {activeTab === "expenses" && (
//             <>
//               <div className="filter-row">
//                 <input className="input" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
//                 <select className="input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
//                   <option value="All">All Categories</option>
//                   {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//                 </select>
//                 <input type="month" className="input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
//                 <select className="input" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
//                   <option value="All">All Tags</option>
//                   {ALL_TAGS.map(t => <option key={t}>{t}</option>)}
//                 </select>
//                 {(search || filterCategory !== "All" || filterMonth || filterTag !== "All") && (
//                   <button className="btn" onClick={() => { setSearch(""); setFilterCategory("All"); setFilterMonth(""); setFilterTag("All"); }}>Clear</button>
//                 )}
//               </div>

//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
//                 <div style={{ fontSize: "12px", color: th.sub }}>{filteredExpenses.length} expenses · {fmt(totalFiltered, currency)}</div>
//                 <button className="btn-ghost" onClick={exportCSV}>📤 Export CSV</button>
//               </div>

//               <div className="card gap">
//                 {filteredExpenses.length === 0 ? (
//                   <div className="empty"><div>🧾</div><div>No expenses found</div></div>
//                 ) : (
//                   <div className="scroll-box expense-list">
//                     {[...filteredExpenses].reverse().map(e => (
//                       <div key={e.id} className="exp-item">
//                         {editingId === e.id ? (
//                           <div style={{ display: "flex", gap: "7px", flex: 1, flexWrap: "wrap" }}>
//                             <input className="input" style={{ flex: 1 }} value={editFields.title || ""} onChange={ev => setEditFields(p => ({ ...p, title: ev.target.value }))} />
//                             <input className="input" type="number" style={{ width: "90px" }} value={editFields.amount || ""} onChange={ev => setEditFields(p => ({ ...p, amount: ev.target.value }))} />
//                             <select className="input" style={{ width: "110px" }} value={editFields.category || "Food"} onChange={ev => setEditFields(p => ({ ...p, category: ev.target.value }))}>
//                               {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//                             </select>
//                             <input className="input" style={{ flex: 1 }} placeholder="Note" value={editFields.note || ""} onChange={ev => setEditFields(p => ({ ...p, note: ev.target.value }))} />
//                             <button className="btn-sm btn-green" onClick={() => handleEditSave(e.id)}>Save</button>
//                             <button className="btn-sm btn-del" onClick={() => setEditingId(null)}>✕</button>
//                           </div>
//                         ) : (
//                           <>
//                             <div style={{ display: "flex", gap: "9px", flex: 1 }}>
//                               <div className="exp-icon">{CAT_ICONS[e.category] || "📦"}</div>
//                               <div style={{ flex: 1 }}>
//                                 <div className="exp-title">{e.title}</div>
//                                 <div className="exp-meta">{e.category} · {e.date}</div>
//                                 {e.note && <div className="exp-note">"{e.note}"</div>}
//                                 {e.dueDate && <div className="due-badge">⏰ Due {e.dueDate}</div>}
//                                 <div>{(e.tags || []).map(t => <span key={t} className="tag-badge">{t}</span>)}</div>
//                               </div>
//                             </div>
//                             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
//                               <div className="exp-amount">{fmt(Number(e.amount), currency)}</div>
//                               <div style={{ display: "flex", gap: "5px" }}>
//                                 <button className="btn-sm btn-edit" onClick={() => { setEditingId(e.id); setEditFields({ title: e.title, amount: e.amount, category: e.category, note: e.note || "" }); }}>Edit</button>
//                                 <button className="btn-sm btn-del" onClick={() => handleDelete(e.id, e.title)}>✕</button>
//                               </div>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {getCatData().length > 0 && (
//                 <div className="card">
//                   <div className="card-title"><div className="dot"></div> Category Breakdown</div>
//                   <ResponsiveContainer width="100%" height={180}>
//                     <BarChart data={getCatData()} barSize={28}>
//                       <XAxis dataKey="name" tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
//                       <YAxis tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
//                       <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
//                       <Bar dataKey="value" fill="#f97316" radius={[5, 5, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </>
//           )}

//           {/* ══════════════════ RECURRING ══════════════════ */}
//           {activeTab === "recurring" && (
//             <>
//               <div className="card gap">
//                 <div className="card-title"><div className="dot"></div> Add Recurring Expense</div>
//                 <div className="form-row">
//                   <input className="input" placeholder="e.g. Rent, Netflix" value={recurringForm.title} onChange={e => setRecurringForm(p => ({ ...p, title: e.target.value }))} />
//                   <input type="number" className="input" placeholder="Amount (₹)" value={recurringForm.amount} onChange={e => setRecurringForm(p => ({ ...p, amount: e.target.value }))} />
//                   <select className="input" value={recurringForm.category} onChange={e => setRecurringForm(p => ({ ...p, category: e.target.value }))}>
//                     {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//                   </select>
//                   <button className="btn" onClick={() => {
//                     if (!recurringForm.title || !recurringForm.amount) return;
//                     setRecurringList(p => [...p, { id: Date.now(), ...recurringForm, note: "", tags: [] }]);
//                     log("🔁 Recurring added", recurringForm.title);
//                     setRecurringForm({ title: "", amount: "", category: "Bills" });
//                     showToast("Recurring added!");
//                   }}>+ Add</button>
//                 </div>
//               </div>

//               <div className="card gap">
//                 <div className="card-title"><div className="dot"></div> Reminders / Due Dates</div>
//                 <div className="form-row" style={{ marginBottom: "12px" }}>
//                   <input className="input" placeholder="Reminder title" value={reminderForm.title} onChange={e => setReminderForm(p => ({ ...p, title: e.target.value }))} />
//                   <input type="date" className="input" value={reminderForm.date} onChange={e => setReminderForm(p => ({ ...p, date: e.target.value }))} />
//                   <input type="number" className="input" placeholder="Amount (optional)" value={reminderForm.amount} onChange={e => setReminderForm(p => ({ ...p, amount: e.target.value }))} />
//                   <button className="btn" onClick={addReminder}>+ Set</button>
//                 </div>
//                 {reminders.length === 0 ? (
//                   <div className="empty"><div>⏰</div><div>No reminders yet</div></div>
//                 ) : (
//                   reminders.map(r => (
//                     <div key={r.id} className={`reminder-item ${r.done ? "done" : r.date <= today() ? "overdue" : ""}`}>
//                       <div>
//                         <div style={{ fontWeight: 500, fontSize: "13px" }}>{r.title}</div>
//                         <div style={{ fontSize: "11px", color: r.date <= today() && !r.done ? "#ef4444" : th.sub }}>
//                           {r.date <= today() && !r.done ? "⚠️ Overdue · " : "📅 "}{r.date}{r.amount ? ` · ${fmt(Number(r.amount), currency)}` : ""}
//                         </div>
//                       </div>
//                       <div style={{ display: "flex", gap: "6px" }}>
//                         {!r.done && <button className="btn-sm btn-green" onClick={() => markReminderDone(r.id)}>✓ Done</button>}
//                         <button className="btn-sm btn-del" onClick={() => { setReminders(p => p.filter(x => x.id !== r.id)); }}>✕</button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div className="card">
//                 <div className="card-title"><div className="dot"></div> Recurring Expenses</div>
//                 {recurringList.length === 0 ? (
//                   <div className="empty"><div>🔁</div><div>None yet</div></div>
//                 ) : (
//                   recurringList.map(r => (
//                     <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", background: th.card, border: `1px solid ${th.border}`, borderRadius: "11px", marginBottom: "7px" }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
//                         <div className="exp-icon">{CAT_ICONS[r.category] || "📦"}</div>
//                         <div>
//                           <div className="exp-title">{r.title}</div>
//                           <div className="exp-meta">{r.category} · {fmt(r.amount, currency)}/mo</div>
//                         </div>
//                       </div>
//                       <div style={{ display: "flex", gap: "6px" }}>
//                         <button className="btn-sm btn-green" onClick={() => applyRecurring(r)}>Apply</button>
//                         <button className="btn-sm btn-del" onClick={() => { setRecurringList(p => p.filter(x => x.id !== r.id)); log("🗑️ Recurring removed", r.title); }}>✕</button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//                 <div className="hint">💡 Click <strong style={{ color: "#22c55e" }}>Apply</strong> to add a recurring expense for today.</div>
//               </div>
//             </>
//           )}

//           {/* ══════════════════ GOALS ══════════════════ */}
//           {activeTab === "goals" && (
//             <>
//               <div className="two-col gap">
//                 <div className="card">
//                   <div className="card-title"><div className="dot"></div> 🎯 Savings Goal</div>
//                   <div style={{ display: "flex", gap: "7px", marginBottom: "14px" }}>
//                     <input className="input" type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="Target savings" />
//                     <button className="btn" onClick={() => { setSavingsGoal(Number(savingsInput)); log("🎯 Savings goal", `Updated to ₹${savingsInput}`); showToast("Goal updated!"); }}>Set</button>
//                   </div>
//                   <div style={{ textAlign: "center", marginBottom: "12px" }}>
//                     <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "48px", color: balance >= savingsGoal ? "#22c55e" : "#f97316" }}>
//                       {Math.min(100, Math.max(0, savingsPct)).toFixed(0)}%
//                     </div>
//                     <div style={{ fontSize: "12px", color: th.sub }}>of {fmt(savingsGoal, currency)} goal</div>
//                   </div>
//                   <div className="progress-bar" style={{ height: "10px" }}>
//                     <div className="progress-fill" style={{ width: `${Math.max(0, savingsPct)}%`, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }} />
//                   </div>
//                   <div style={{ textAlign: "center", fontSize: "12px", color: th.sub, marginTop: "8px" }}>
//                     {balance >= savingsGoal ? "🎉 Goal achieved!" : `${fmt(Math.max(0, savingsGoal - balance), currency)} more to go`}
//                   </div>
//                 </div>

//                 <div className="card">
//                   <div className="card-title"><div className="dot"></div> 💰 Financial Summary</div>
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
//                     {[["Income", fmt(income, currency), "#22c55e"], ["Spent", fmt(totalAll, currency), "#f97316"], ["Saved", fmt(Math.max(0, balance), currency), "#06b6d4"], ["Budget Left", fmt(Math.max(0, budget - totalAll), currency), "#8b5cf6"]].map(([label, val, color]) => (
//                       <div key={label} style={{ padding: "10px", background: th.iBg, borderRadius: "10px", border: `1px solid ${th.iBorder}` }}>
//                         <div style={{ fontSize: "9px", color: th.sub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "3px" }}>{label}</div>
//                         <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "15px", color }}>{val}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Category Breakdown */}
//               <div className="card">
//                 <div className="card-title"><div className="dot"></div> Category Breakdown</div>
//                 {getCatData().length === 0 ? <div className="empty"><div>📊</div><div>No data</div></div> : (
//                   getCatData().sort((a, b) => b.value - a.value).map((item, i) => (
//                     <div key={item.name} style={{ marginBottom: "10px" }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
//                         <span>{CAT_ICONS[item.name] || "📦"} {item.name}</span>
//                         <span style={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>
//                           {fmt(item.value, currency)} ({totalAll > 0 ? ((item.value / totalAll) * 100).toFixed(0) : 0}%)
//                         </span>
//                       </div>
//                       <div className="progress-bar">
//                         <div className="progress-fill" style={{ width: `${totalAll > 0 ? (item.value / totalAll) * 100 : 0}%`, background: COLORS[i % COLORS.length] }} />
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </>
//           )}

//           {/* ══════════════════ LOGS ══════════════════ */}
//           {activeTab === "logs" && (
//             <>
//               {/* Monthly Summary */}
//               <div className="card gap">
//                 <div className="card-title"><div className="dot"></div> 📊 Monthly Summary Report</div>
//                 <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
//                   <input type="month" className="input" style={{ maxWidth: "180px" }} value={summaryMonth} onChange={e => setSummaryMonth(e.target.value)} />
//                   <span style={{ fontSize: "12px", color: th.sub }}>Select month to view report</span>
//                 </div>
//                 {(() => {
//                   const s = getMonthlySummary();
//                   return s.count === 0 ? (
//                     <div className="empty"><div>📭</div><div>No expenses in {summaryMonth}</div></div>
//                   ) : (
//                     <>
//                       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
//                         {[
//                           { val: fmt(s.total, currency), lbl: "Total Spent" },
//                           { val: s.count, lbl: "Transactions" },
//                           { val: fmt(Number(s.avg), currency), lbl: "Avg per Expense" },
//                           { val: s.highest ? `${CAT_ICONS[s.highest.category] || "📦"} ${s.highest.title}` : "—", lbl: "Biggest Expense" }
//                         ].map(item => (
//                           <div key={item.lbl} className="summary-stat">
//                             <div className="summary-stat-val">{item.val}</div>
//                             <div className="summary-stat-lbl">{item.lbl}</div>
//                           </div>
//                         ))}
//                       </div>
//                       {s.catData.length > 0 && (
//                         <ResponsiveContainer width="100%" height={160}>
//                           <BarChart data={s.catData} barSize={24}>
//                             <XAxis dataKey="name" tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
//                             <YAxis tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
//                             <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
//                             <Bar dataKey="value" fill="#f97316" radius={[5, 5, 0, 0]} />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>

//               {/* Activity Log */}
//               <div className="card">
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
//                   <div className="card-title" style={{ margin: 0 }}><div className="dot"></div> 📋 Activity Log</div>
//                   <div style={{ display: "flex", gap: "7px" }}>
//                     <span style={{ fontSize: "11px", color: th.sub }}>{activityLog.length} events</span>
//                     {activityLog.length > 0 && (
//                       <button className="btn-sm btn-del" onClick={() => { setActivityLog([]); showToast("Log cleared"); }}>Clear</button>
//                     )}
//                   </div>
//                 </div>
//                 {activityLog.length === 0 ? (
//                   <div className="empty"><div>📋</div><div>No activity yet. Start adding expenses!</div></div>
//                 ) : (
//                   <div className="scroll-box">
//                     {activityLog.map(entry => (
//                       <div key={entry.id} className="log-item">
//                         <div style={{ width: "32px", height: "32px", background: "rgba(249,115,22,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
//                           {entry.action.split(" ")[0]}
//                         </div>
//                         <div style={{ flex: 1 }}>
//                           <div className="log-action">{entry.action.substring(entry.action.indexOf(" ") + 1)}</div>
//                           <div className="log-detail">{entry.detail}</div>
//                         </div>
//                         <div className="log-time">{entry.time}<br /><span style={{ fontSize: "9px" }}>{entry.date}</span></div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }




























// import React, { useEffect, useState, useMemo } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip, Legend,
//   LineChart, Line, XAxis, YAxis, ResponsiveContainer
// } from "recharts";

// // ─── Constants ─────────────────────────────────────
// const COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#22c55e"];
// const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Grocery", "Other"];
// const CAT_ICONS = { Food: "🍜", Travel: "✈️", Shopping: "🛍️", Bills: "📄", Grocery: "🛒", Other: "📦" };

// const fmt = (a) => `₹${Number(a).toLocaleString()}`;
// const today = () => new Date().toISOString().split("T")[0];

// // ─── Component ─────────────────────────────────────
// export default function Dashboard() {
//   const [expenses, setExpenses] = useState([]);
//   const [activeTab, setActiveTab] = useState("overview");

//   const [title, setTitle] = useState("");
//   const [amount, setAmount] = useState("");
//   const [category, setCategory] = useState("Food");

//   const [search, setSearch] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");

//   const [toast, setToast] = useState(null);

//   // ─── Toast ─────────────────────────────────────
//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   // ─── Fetch ─────────────────────────────────────
//   const fetchExpenses = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) return;

//       const res = await fetch("http://localhost:8080/api/expenses", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.status === 401) {
//         showToast("Login expired", "error");
//         return;
//       }

//       const data = await res.json();
//       setExpenses(Array.isArray(data) ? data : []);

//     } catch {
//       showToast("Fetch error", "error");
//     }
//   };

//   useEffect(() => { fetchExpenses(); }, []);

//   // ─── Add ─────────────────────────────────────
//   const handleAdd = async (e) => {
//     e.preventDefault();

//     const res = await fetch("http://localhost:8080/api/expenses", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`
//       },
//       body: JSON.stringify({
//         title, amount, category, date: today()
//       })
//     });

//     if (res.status !== 200 && res.status !== 201) {
//       showToast("Add failed", "error");
//       return;
//     }

//     setTitle(""); setAmount("");
//     showToast("Added");

//     fetchExpenses();
//   };

//   // ─── Delete ─────────────────────────────────────
//   const handleDelete = async (id) => {
//     const res = await fetch(`http://localhost:8080/api/expenses/${id}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//     });

//     if (res.status !== 200) {
//       showToast("Delete failed", "error");
//       return;
//     }

//     showToast("Deleted");
//     fetchExpenses();
//   };

//   // ─── Derived ─────────────────────────────────────
//   const filtered = useMemo(() => {
//     return expenses.filter(e =>
//       e.title.toLowerCase().includes(search.toLowerCase()) &&
//       (filterCategory === "All" || e.category === filterCategory)
//     );
//   }, [expenses, search, filterCategory]);

//   const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

//   const catData = useMemo(() => {
//     const map = {};
//     filtered.forEach(e => {
//       map[e.category] = (map[e.category] || 0) + Number(e.amount);
//     });
//     return Object.keys(map).map(k => ({ name: k, value: map[k] }));
//   }, [filtered]);

//   const monthly = useMemo(() => {
//     const map = {};
//     expenses.forEach(e => {
//       if (!e.date) return;
//       const m = e.date.substring(5, 7);
//       map[m] = (map[m] || 0) + Number(e.amount);
//     });
//     return Object.keys(map).map(k => ({ month: k, amount: map[k] }));
//   }, [expenses]);

//   // ─── UI ─────────────────────────────────────
//   return (
//     <div style={{ background: "#0a0a0f", color: "#fff", minHeight: "100vh", padding: 25 }}>

//       {/* Toast */}
//       {toast && (
//         <div style={{
//           position: "fixed", bottom: 20, right: 20,
//           background: toast.type === "error" ? "#ef4444" : "#22c55e",
//           padding: 10, borderRadius: 8
//         }}>
//           {toast.msg}
//         </div>
//       )}

//       {/* Header */}
//       <h1>expense<span style={{color:"#f97316"}}>.</span>track</h1>

//       {/* Tabs */}
//       <div style={{ marginBottom: 20 }}>
//         {["overview", "expenses"].map(t => (
//           <button key={t}
//             onClick={() => setActiveTab(t)}
//             style={{
//               marginRight: 10,
//               background: activeTab === t ? "#f97316" : "#222",
//               color: "#fff", padding: "8px 12px", border: "none"
//             }}>
//             {t}
//           </button>
//         ))}
//       </div>

//       {/* OVERVIEW */}
//       {activeTab === "overview" && (
//         <>
//           <h2>Total: {fmt(total)}</h2>

//           {catData.length > 0 && (
//             <PieChart width={300} height={200}>
//               <Pie data={catData} dataKey="value" cx={150} cy={100} outerRadius={70}>
//                 {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           )}

//           <ResponsiveContainer width="100%" height={200}>
//             <LineChart data={monthly}>
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Line dataKey="amount" stroke="#f97316" />
//             </LineChart>
//           </ResponsiveContainer>
//         </>
//       )}

//       {/* EXPENSES */}
//       {activeTab === "expenses" && (
//         <>
//           {/* Filters */}
//           <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
//           <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
//             <option>All</option>
//             {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//           </select>

//           {/* Add */}
//           <form onSubmit={handleAdd} style={{ marginTop: 10 }}>
//             <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
//             <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" required />
//             <select value={category} onChange={e => setCategory(e.target.value)}>
//               {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//             </select>
//             <button>Add</button>
//           </form>

//           {/* List */}
//           {filtered.map(e => (
//             <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
//               <div>{CAT_ICONS[e.category]} {e.title}</div>
//               <div>
//                 {fmt(e.amount)}
//                 <button onClick={() => handleDelete(e.id)}>❌</button>
//               </div>
//             </div>
//           ))}
//         </>
//       )}

//     </div>
//   );
// }

























import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line
} from "recharts";

const COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#22c55e"];
const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Grocery", "Other"];
const CAT_ICONS = { Food: "🍜", Travel: "✈️", Shopping: "🛍️", Bills: "📄", Grocery: "🛒", Other: "📦" };
const ALL_TAGS = ["🔴 Urgent", "🟡 Planned", "🟢 Optional", "💼 Work", "🎉 Fun", "🏠 Home"];
const CURRENCIES = [
  { code: "INR", symbol: "₹", rate: 1 },
  { code: "USD", symbol: "$", rate: 0.012 },
  { code: "EUR", symbol: "€", rate: 0.011 },
  { code: "GBP", symbol: "£", rate: 0.0095 },
  { code: "JPY", symbol: "¥", rate: 1.78 },
];
const FREQUENCIES = ["Monthly", "Weekly", "Daily"];

const fmt = (amount, currency) => {
  const c = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  return `${c.symbol}${(amount * c.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};
const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const scoreColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

const isRecurringDue = (r) => {
  if (!r.lastApplied) return true;
  const last = new Date(r.lastApplied);
  const now = new Date();
  if (r.frequency === "Weekly") {
    return (now - last) / (1000 * 60 * 60 * 24) >= 7;
  }
  if (r.frequency === "Daily") {
    return last.toDateString() !== now.toDateString();
  }
  return last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [noteInput, setNoteInput] = useState("");
  const [tagInput, setTagInput] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);

  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") ?? "true"));
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "INR");
  const [budget, setBudget] = useState(() => Number(localStorage.getItem("budget") || 10000));
  const [budgetInput, setBudgetInput] = useState(() => localStorage.getItem("budget") || "10000");
  const [savingsGoal, setSavingsGoal] = useState(() => Number(localStorage.getItem("savingsGoal") || 5000));
  const [savingsInput, setSavingsInput] = useState(() => localStorage.getItem("savingsGoal") || "5000");
  const [income, setIncome] = useState(() => Number(localStorage.getItem("income") || 30000));
  const [incomeInput, setIncomeInput] = useState(() => localStorage.getItem("income") || "30000");
  const [recurringList, setRecurringList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recurringList")) || [
        { id: 1, title: "Rent", amount: 8000, category: "Bills", frequency: "Monthly", lastApplied: null },
        { id: 2, title: "Netflix", amount: 649, category: "Bills", frequency: "Monthly", lastApplied: null },
        { id: 3, title: "Grocery", amount: 500, category: "Grocery", frequency: "Weekly", lastApplied: null }
      ];
    } catch { return []; }
  });
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reminders")) || []; } catch { return []; }
  });
  const [activityLog, setActivityLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("activityLog")) || []; } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [recurringForm, setRecurringForm] = useState({ title: "", amount: "", category: "Grocery", frequency: "Weekly" });
  const [reminderForm, setReminderForm] = useState({ title: "", date: "", amount: "" });
  const [summaryMonth, setSummaryMonth] = useState(new Date().toISOString().substring(0, 7));
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const th = {
    bg: darkMode ? "#0a0a0f" : "#f5f3ef",
    card: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    border: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
    text: darkMode ? "#f0ece4" : "#1a1410",
    sub: darkMode ? "rgba(240,236,228,0.38)" : "rgba(26,20,16,0.42)",
    iBg: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    iBorder: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    tooltip: darkMode ? "#1a1a24" : "#fff",
  };

  useEffect(() => { localStorage.setItem("darkMode", JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem("currency", currency); }, [currency]);
  useEffect(() => { localStorage.setItem("budget", budget); }, [budget]);
  useEffect(() => { localStorage.setItem("savingsGoal", savingsGoal); }, [savingsGoal]);
  useEffect(() => { localStorage.setItem("income", income); }, [income]);
  useEffect(() => { localStorage.setItem("recurringList", JSON.stringify(recurringList)); }, [recurringList]);
  useEffect(() => { localStorage.setItem("reminders", JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem("activityLog", JSON.stringify(activityLog)); }, [activityLog]);

  const log = useCallback((action, detail) => {
    setActivityLog(prev => {
      const updated = [{ id: Date.now(), action, detail, time: nowTime(), date: today() }, ...prev].slice(0, 100);
      localStorage.setItem("activityLog", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExpenses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:8081/api/expenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { showToast("Session expired. Please login again.", "error"); return; }
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to fetch expenses", "error"); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    const overdue = reminders.filter(r => !r.done && r.date && r.date <= today());
    if (overdue.length > 0) showToast(`⏰ ${overdue.length} reminder(s) due today!`, "warn");
  }, [reminders]);

  useEffect(() => {
    const due = recurringList.filter(r => isRecurringDue(r));
    if (due.length > 0) showToast(`🔁 ${due.length} recurring expense(s) due!`, "warn");
  }, [recurringList]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "All" || e.category === filterCategory;
      const matchMonth = !filterMonth || (e.date && e.date.startsWith(filterMonth));
      const expTags = typeof e.tags === "string" ? e.tags.split(",") : (e.tags || []);
      const matchTag = filterTag === "All" || expTags.includes(filterTag);
      return matchSearch && matchCat && matchMonth && matchTag;
    });
  }, [expenses, search, filterCategory, filterMonth, filterTag]);

  const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalFiltered = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const balance = income - totalAll;
  const budgetUsed = Math.min((totalAll / budget) * 100, 100);
  const savingsPct = Math.min((balance / savingsGoal) * 100, 100);
  const overdueReminders = reminders.filter(r => !r.done && r.date && r.date <= today());
  const dueRecurring = recurringList.filter(r => isRecurringDue(r));

  const topCat = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  }, [expenses]);

  const getCatData = (list = filteredExpenses) => {
    const map = {};
    list.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  };

  const getMonthlyData = () => {
    const map = {};
    expenses.forEach(e => {
      if (!e.date || typeof e.date !== "string" || e.date.length < 7) return;
      const m = e.date.substring(0, 7);
      map[m] = (map[m] || 0) + Number(e.amount);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([k, v]) => ({ month: k.substring(5), amount: v }));
  };

  const getMonthlySummary = () => {
    const list = expenses.filter(e => e.date && e.date.startsWith(summaryMonth));
    const total = list.reduce((s, e) => s + Number(e.amount), 0);
    const avg = list.length > 0 ? (total / list.length) : 0;
    const highest = [...list].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
    return { list, total, catData: getCatData(list), avg, highest, count: list.length };
  };

  const handleAdd = async (ev) => {
    ev.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, amount, category, date: today(), note: noteInput, tags: tagInput.join(","), dueDate: dueDate || null })
      });
      if (res.status !== 200 && res.status !== 201) { showToast("Failed to add expense", "error"); setAdding(false); return; }
      log("➕ Added", `${title} — ${fmt(Number(amount), currency)} (${category})`);
      if (totalAll + Number(amount) > budget * 0.9) showToast("⚠️ Approaching budget limit!", "warn");
      else showToast("Expense added! 🎉");
      setTitle(""); setAmount(""); setNoteInput(""); setTagInput([]); setDueDate("");
      fetchExpenses();
    } catch { showToast("Failed to add", "error"); }
    setAdding(false);
  };

  const handleDelete = async (id, expTitle) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/api/expenses/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status !== 200) { showToast("Delete failed", "error"); return; }
      log("🗑️ Deleted", expTitle);
      showToast("Deleted");
      fetchExpenses();
    } catch { showToast("Delete failed", "error"); }
  };

  const handleEditSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editFields, date: today() })
      });
      if (res.status !== 200) { showToast("Update failed", "error"); return; }
      log("✏️ Edited", editFields.title);
      setEditingId(null);
      showToast("Updated! ✅");
      fetchExpenses();
    } catch { showToast("Update failed", "error"); }
  };

  const applyRecurring = async (r) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: r.title, amount: r.amount, category: r.category, date: today(), note: "", tags: "" })
      });
      if (res.status !== 200 && res.status !== 201) { showToast("Failed to apply", "error"); return; }
      setRecurringList(prev => prev.map(x => x.id === r.id ? { ...x, lastApplied: today() } : x));
      log("🔁 Recurring", `${r.title} applied`);
      showToast(`${r.title} added!`);
      fetchExpenses();
    } catch { showToast("Failed to apply", "error"); }
  };

  const exportCSV = () => {
    const rows = [["Title", "Amount", "Category", "Date", "Tags", "Note", "Due Date"]];
    expenses.forEach(e => rows.push([e.title, e.amount, e.category, e.date, e.tags || "", e.note || "", e.dueDate || ""]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "expenses.csv"; a.click();
    log("📤 Exported", "expenses.csv");
    showToast("CSV exported!");
  };

  const runAIAnalysis = async () => {
    if (expenses.length === 0) { showToast("Add some expenses first!", "warn"); return; }
    setAiLoading(true); setAiError(null); setAiAnalysis(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ income, budget, savingsGoal, totalExpenses: totalAll })
      });
      if (!response.ok) { setAiError("Analysis failed. Please try again."); setAiLoading(false); return; }
      const parsed = await response.json();
      setAiAnalysis(parsed);
      log("🤖 AI Analysis", "Smart analysis completed");
    } catch { setAiError("Could not connect to backend. Make sure it is running."); }
    setAiLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;}
        .app{min-height:100vh;transition:background 0.3s,color 0.3s;}
        .header{display:flex;align-items:center;justify-content:space-between;padding:18px 36px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:10px;}
        .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.5px;}
        .logo span{color:#f97316;}
        .header-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .tabs{display:flex;gap:2px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:3px;}
        .tab{padding:6px 13px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;transition:all 0.2s;background:transparent;color:var(--sub);}
        .tab.active{background:#f97316;color:#fff;}
        .theme-btn{background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 12px;border-radius:20px;cursor:pointer;font-size:12px;transition:all 0.2s;}
        .theme-btn:hover{border-color:#f97316;}
        .main{padding:26px 36px;max-width:1300px;margin:0 auto;}
        .page-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;margin-bottom:3px;}
        .page-title span{color:#f97316;}
        .page-sub{color:var(--sub);font-size:13px;margin-bottom:20px;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
        .stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;position:relative;overflow:hidden;transition:border-color 0.2s,transform 0.2s;}
        .stat-card:hover{border-color:rgba(249,115,22,0.4);transform:translateY(-2px);}
        .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f97316,transparent);}
        .stat-label{font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:7px;}
        .stat-value{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;line-height:1;margin-bottom:3px;}
        .stat-meta{font-size:10px;color:var(--sub);}
        .card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:22px;}
        .card-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:7px;}
        .dot{width:6px;height:6px;background:#f97316;border-radius:50%;flex-shrink:0;}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
        .form-row{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end;}
        .form-row-5{display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:8px;align-items:end;}
        .input{background:var(--iBg);border:1px solid var(--iBorder);border-radius:9px;padding:10px 13px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s;width:100%;}
        .input:focus{border-color:#f97316;}
        .input::placeholder{color:var(--sub);}
        select.input option{background:#1a1a24;}
        .btn{background:#f97316;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .btn:hover{background:#ea6c10;transform:translateY(-1px);}
        .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .btn-ghost{background:var(--iBg);border:1px solid var(--iBorder);color:var(--text);border-radius:9px;padding:9px 15px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all 0.2s;}
        .btn-ghost:hover{border-color:#f97316;color:#f97316;}
        .btn-sm{padding:4px 9px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .btn-edit{background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2);}
        .btn-edit:hover{background:rgba(6,182,212,0.2);}
        .btn-del{background:rgba(239,68,68,0.08);color:rgba(239,68,68,0.7);border:1px solid rgba(239,68,68,0.15);}
        .btn-del:hover{background:rgba(239,68,68,0.18);color:#ef4444;}
        .btn-green{background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);}
        .btn-green:hover{background:rgba(34,197,94,0.2);}
        .expense-list{display:flex;flex-direction:column;gap:7px;}
        .exp-item{display:flex;align-items:flex-start;justify-content:space-between;padding:11px 13px;background:var(--card);border:1px solid var(--border);border-radius:11px;transition:all 0.2s;animation:slideIn 0.2s ease;gap:10px;}
        .exp-item:hover{border-color:rgba(249,115,22,0.25);}
        @keyframes slideIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .exp-icon{width:34px;height:34px;background:rgba(249,115,22,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
        .exp-title{font-weight:500;font-size:13px;margin-bottom:2px;}
        .exp-meta{font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:0.7px;}
        .exp-note{font-size:11px;color:var(--sub);margin-top:3px;font-style:italic;}
        .exp-amount{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#f97316;white-space:nowrap;}
        .due-badge{font-size:10px;padding:2px 7px;border-radius:20px;background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);margin-top:3px;display:inline-block;}
        .tag-badge{font-size:10px;padding:2px 7px;border-radius:20px;background:rgba(249,115,22,0.1);color:#f97316;border:1px solid rgba(249,115,22,0.2);margin-right:4px;margin-top:3px;display:inline-block;}
        .freq-badge{font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2);display:inline-block;margin-left:4px;}
        .due-now{font-size:10px;color:#ef4444;margin-left:6px;}
        .scroll-box{max-height:360px;overflow-y:auto;}
        .scroll-box::-webkit-scrollbar{width:3px;}
        .scroll-box::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.3);border-radius:3px;}
        .progress-bar{height:8px;background:var(--iBg);border-radius:99px;overflow:hidden;margin:7px 0;}
        .progress-fill{height:100%;border-radius:99px;transition:width 0.5s ease;}
        .filter-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
        .filter-row .input{flex:1;min-width:120px;}
        .empty{text-align:center;padding:36px;color:var(--sub);}
        .empty div:first-child{font-size:30px;margin-bottom:8px;}
        .toast{position:fixed;bottom:24px;right:24px;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;z-index:9999;animation:fadeUp 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.3);color:#fff;max-width:300px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .gap{margin-bottom:14px;}
        .log-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
        .log-item:last-child{border-bottom:none;}
        .log-time{font-size:10px;color:var(--sub);white-space:nowrap;margin-left:auto;text-align:right;}
        .summary-stat{padding:14px;background:var(--iBg);border-radius:11px;border:1px solid var(--iBorder);text-align:center;}
        .summary-stat-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#f97316;}
        .summary-stat-lbl{font-size:10px;color:var(--sub);text-transform:uppercase;letter-spacing:1px;margin-top:3px;}
        .reminder-item{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;border:1px solid var(--border);border-radius:11px;margin-bottom:7px;}
        .reminder-item.overdue{border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.04);}
        .reminder-item.done{opacity:0.4;}
        .tags-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .tag-sel{padding:4px 10px;border-radius:20px;border:1px solid var(--iBorder);background:var(--iBg);color:var(--sub);font-size:11px;cursor:pointer;transition:all 0.2s;}
        .tag-sel.on{background:rgba(249,115,22,0.12);color:#f97316;border-color:rgba(249,115,22,0.35);}
        .hint{padding:10px 13px;background:rgba(249,115,22,0.05);border:1px solid rgba(249,115,22,0.15);border-radius:9px;font-size:12px;color:var(--sub);margin-top:12px;}
        .cur-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
        .cur-btn{padding:6px 12px;border-radius:20px;border:1px solid var(--iBorder);background:var(--iBg);color:var(--sub);font-size:12px;cursor:pointer;transition:all 0.2s;}
        .cur-btn.on{background:rgba(249,115,22,0.12);color:#f97316;border-color:rgba(249,115,22,0.35);}
        .rec-item{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:11px;margin-bottom:8px;transition:all 0.2s;}
        .rec-item.due{border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.03);}
        .ai-hero{background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(139,92,246,0.06));border:1px solid rgba(249,115,22,0.15);border-radius:20px;padding:40px;text-align:center;margin-bottom:16px;}
        .ai-hero-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;margin-bottom:8px;}
        .ai-hero-title span{color:#f97316;}
        .ai-hero-sub{font-size:14px;opacity:0.55;margin-bottom:24px;line-height:1.6;}
        .ai-run-btn{background:linear-gradient(135deg,#f97316,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:14px 32px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 20px rgba(249,115,22,0.3);}
        .ai-run-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(249,115,22,0.4);}
        .ai-run-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .ai-spinner{width:44px;height:44px;border:3px solid rgba(249,115,22,0.2);border-top-color:#f97316;border-radius:50%;animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ai-pulse{animation:pulse 1.5s ease-in-out infinite;font-size:14px;opacity:0.6;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.9}}
        .score-wrap{position:relative;width:140px;height:140px;margin:0 auto 12px;}
        .score-wrap svg{transform:rotate(-90deg);}
        .score-num{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Syne',sans-serif;font-size:34px;font-weight:800;text-align:center;}
        .insight-card{border-radius:13px;padding:15px 17px;margin-bottom:10px;border:1px solid;}
        .insight-ttl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px;}
        .insight-txt{font-size:13px;line-height:1.6;}
        .sug-item{display:flex;gap:10px;padding:11px 0;border-bottom:1px solid var(--border);font-size:13px;line-height:1.5;}
        .sug-item:last-child{border-bottom:none;}
        .sug-num{width:22px;height:22px;background:rgba(249,115,22,0.12);color:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;}
        @media(max-width:900px){
          .stats-grid{grid-template-columns:1fr 1fr;}
          .two-col{grid-template-columns:1fr;}
          .form-row{grid-template-columns:1fr;}
          .form-row-5{grid-template-columns:1fr;}
          .main{padding:18px;}
          .header{padding:14px 18px;}
        }
      `}</style>

      <div className="app" style={{
        "--card": th.card, "--border": th.border, "--text": th.text,
        "--sub": th.sub, "--iBg": th.iBg, "--iBorder": th.iBorder,
        background: th.bg, color: th.text
      }}>

        {toast && (
          <div className="toast" style={{ background: toast.type === "error" ? "#ef4444" : toast.type === "warn" ? "#f59e0b" : "#22c55e" }}>
            {toast.msg}
          </div>
        )}

        {/* HEADER */}
        <div className="header">
          <div>
            <div className="logo">expense<span>.</span>track</div>
            <div style={{ display: "flex", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
              {overdueReminders.length > 0 && <div style={{ fontSize: "11px", color: "#ef4444" }}>⏰ {overdueReminders.length} reminder(s) due!</div>}
              {dueRecurring.length > 0 && <div style={{ fontSize: "11px", color: "#f59e0b" }}>🔁 {dueRecurring.length} recurring due!</div>}
            </div>
          </div>
          <div className="header-right">
            <div className="tabs">
              {["overview", "expenses", "recurring", "goals", "logs", "ai"].map(t => (
                <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t === "ai" ? "🤖 AI" : t === "logs" ? "📋 Logs" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div className="main">
          <div className="page-title">Your <span>Finances</span></div>
          <div className="page-sub">Track, manage and grow your money</div>

          {/* ════ OVERVIEW ════ */}
          {activeTab === "overview" && (
            <>
              <div className="cur-row">
                {CURRENCIES.map(c => (
                  <button key={c.code} className={`cur-btn ${currency === c.code ? "on" : ""}`}
                    onClick={() => { setCurrency(c.code); log("💱 Currency", `Switched to ${c.code}`); }}>
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>

              <div className="stats-grid">
                {[
                  { label: "Total Spent", val: fmt(totalAll, currency), meta: `${expenses.length} transactions`, color: "#f97316" },
                  { label: "Balance", val: fmt(balance, currency), meta: "Income – Expenses", color: balance >= 0 ? "#22c55e" : "#ef4444" },
                  { label: "Top Category", val: topCat ? `${CAT_ICONS[topCat[0]] || "📦"} ${topCat[0]}` : "—", meta: topCat ? fmt(topCat[1], currency) : "No data", color: th.text, sm: true },
                  { label: "Budget Used", val: `${budgetUsed.toFixed(0)}%`, meta: `of ${fmt(budget, currency)}`, color: budgetUsed > 90 ? "#ef4444" : budgetUsed > 70 ? "#f59e0b" : "#22c55e" }
                ].map(s => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: s.sm ? "16px" : "22px" }}>{s.val}</div>
                    <div className="stat-meta">{s.meta}</div>
                  </div>
                ))}
              </div>

              <div className="two-col gap">
                <div className="card">
                  <div className="card-title"><div className="dot"></div> Monthly Budget</div>
                  <div style={{ display: "flex", gap: "7px", marginBottom: "10px" }}>
                    <input className="input" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="Set budget" />
                    <button className="btn" onClick={() => { setBudget(Number(budgetInput)); log("💰 Budget", `Set to ₹${budgetInput}`); showToast("Budget updated!"); }}>Set</button>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${budgetUsed}%`, background: budgetUsed > 90 ? "#ef4444" : budgetUsed > 70 ? "#f59e0b" : "#22c55e" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: th.sub }}>
                    <span>{fmt(totalAll, currency)} spent</span><span>{fmt(Math.max(0, budget - totalAll), currency)} left</span>
                  </div>
                  {budgetUsed > 90 && <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px" }}>⚠️ {budgetUsed.toFixed(0)}% of budget used!</div>}
                </div>

                <div className="card">
                  <div className="card-title"><div className="dot"></div> Income & Savings Goal</div>
                  <div style={{ display: "flex", gap: "7px", marginBottom: "7px" }}>
                    <input className="input" type="number" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} placeholder="Monthly income" />
                    <button className="btn" onClick={() => { setIncome(Number(incomeInput)); log("💵 Income", `Set to ₹${incomeInput}`); showToast("Income updated!"); }}>Set</button>
                  </div>
                  <div style={{ display: "flex", gap: "7px", marginBottom: "9px" }}>
                    <input className="input" type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="Savings goal" />
                    <button className="btn" onClick={() => { setSavingsGoal(Number(savingsInput)); log("🎯 Goal", `Set to ₹${savingsInput}`); showToast("Goal updated!"); }}>Set</button>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.max(0, savingsPct)}%`, background: "#22c55e" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: th.sub }}>
                    <span>Saved {fmt(Math.max(0, balance), currency)}</span><span>Goal {fmt(savingsGoal, currency)}</span>
                  </div>
                </div>
              </div>

              {getCatData().length > 0 && (
                <div className="two-col gap">
                  <div className="card">
                    <div className="card-title"><div className="dot"></div> By Category</div>
                    <PieChart width={260} height={180}>
                      <Pie data={getCatData()} dataKey="value" cx={120} cy={80} outerRadius={65} strokeWidth={0}>
                        {getCatData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </div>
                  <div className="card">
                    <div className="card-title"><div className="dot"></div> Monthly Trend</div>
                    {getMonthlyData().length === 0 ? (
                      <div className="empty"><div>📈</div><div>Add expenses to see trend</div></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={getMonthlyData()}>
                          <XAxis dataKey="month" tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} formatter={(v) => [fmt(v, currency), "Amount"]} />
                          <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-title"><div className="dot"></div> Quick Add Expense</div>
                <form onSubmit={handleAdd}>
                  <div className="form-row" style={{ marginBottom: "8px" }}>
                    <input className="input" placeholder="What did you spend on?" value={title} onChange={e => setTitle(e.target.value)} required />
                    <input type="number" className="input" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
                    <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button className="btn" type="submit" disabled={adding}>{adding ? "..." : "+ Add"}</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input className="input" placeholder="📝 Note (optional)" value={noteInput} onChange={e => setNoteInput(e.target.value)} />
                    <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} title="Due date" />
                  </div>
                  <div className="tags-row">
                    {ALL_TAGS.map(t => (
                      <button type="button" key={t} className={`tag-sel ${tagInput.includes(t) ? "on" : ""}`}
                        onClick={() => setTagInput(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                        {t}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ════ EXPENSES ════ */}
          {activeTab === "expenses" && (
            <>
              <div className="filter-row">
                <input className="input" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="month" className="input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
                <select className="input" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
                  <option value="All">All Tags</option>
                  {ALL_TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
                {(search || filterCategory !== "All" || filterMonth || filterTag !== "All") && (
                  <button className="btn" onClick={() => { setSearch(""); setFilterCategory("All"); setFilterMonth(""); setFilterTag("All"); }}>Clear</button>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", color: th.sub }}>{filteredExpenses.length} expenses · {fmt(totalFiltered, currency)}</div>
                <button className="btn-ghost" onClick={exportCSV}>📤 Export CSV</button>
              </div>

              <div className="card gap">
                {filteredExpenses.length === 0 ? (
                  <div className="empty"><div>🧾</div><div>No expenses found</div></div>
                ) : (
                  <div className="scroll-box expense-list">
                    {[...filteredExpenses].reverse().map(e => {
                      const expTags = typeof e.tags === "string" ? e.tags.split(",").filter(Boolean) : (e.tags || []);
                      return (
                        <div key={e.id} className="exp-item">
                          {editingId === e.id ? (
                            <div style={{ display: "flex", gap: "7px", flex: 1, flexWrap: "wrap" }}>
                              <input className="input" style={{ flex: 1 }} value={editFields.title || ""} onChange={ev => setEditFields(p => ({ ...p, title: ev.target.value }))} />
                              <input className="input" type="number" style={{ width: "90px" }} value={editFields.amount || ""} onChange={ev => setEditFields(p => ({ ...p, amount: ev.target.value }))} />
                              <select className="input" style={{ width: "110px" }} value={editFields.category || "Food"} onChange={ev => setEditFields(p => ({ ...p, category: ev.target.value }))}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                              </select>
                              <input className="input" placeholder="Note" value={editFields.note || ""} onChange={ev => setEditFields(p => ({ ...p, note: ev.target.value }))} />
                              <button className="btn-sm btn-green" onClick={() => handleEditSave(e.id)}>Save</button>
                              <button className="btn-sm btn-del" onClick={() => setEditingId(null)}>✕</button>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: "flex", gap: "9px", flex: 1 }}>
                                <div className="exp-icon">{CAT_ICONS[e.category] || "📦"}</div>
                                <div style={{ flex: 1 }}>
                                  <div className="exp-title">{e.title}</div>
                                  <div className="exp-meta">{e.category} · {e.date}</div>
                                  {e.note && <div className="exp-note">"{e.note}"</div>}
                                  {e.dueDate && <div className="due-badge">⏰ Due {e.dueDate}</div>}
                                  <div>{expTags.map(t => <span key={t} className="tag-badge">{t}</span>)}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                                <div className="exp-amount">{fmt(Number(e.amount), currency)}</div>
                                <div style={{ display: "flex", gap: "5px" }}>
                                  <button className="btn-sm btn-edit" onClick={() => { setEditingId(e.id); setEditFields({ title: e.title, amount: e.amount, category: e.category, note: e.note || "" }); }}>Edit</button>
                                  <button className="btn-sm btn-del" onClick={() => handleDelete(e.id, e.title)}>✕</button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {getCatData().length > 0 && (
                <div className="card">
                  <div className="card-title"><div className="dot"></div> Category Breakdown</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={getCatData()} barSize={28}>
                      <XAxis dataKey="name" tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
                      <Bar dataKey="value" fill="#f97316" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* ════ RECURRING ════ */}
          {activeTab === "recurring" && (
            <>
              <div className="card gap">
                <div className="card-title"><div className="dot"></div> Add Recurring Expense</div>
                <div className="form-row-5">
                  <input className="input" placeholder="e.g. Grocery, Rent" value={recurringForm.title} onChange={e => setRecurringForm(p => ({ ...p, title: e.target.value }))} />
                  <input type="number" className="input" placeholder="Amount (₹)" value={recurringForm.amount} onChange={e => setRecurringForm(p => ({ ...p, amount: e.target.value }))} />
                  <select className="input" value={recurringForm.category} onChange={e => setRecurringForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="input" value={recurringForm.frequency} onChange={e => setRecurringForm(p => ({ ...p, frequency: e.target.value }))}>
                    {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <button className="btn" onClick={() => {
                    if (!recurringForm.title || !recurringForm.amount) return;
                    setRecurringList(p => [...p, { id: Date.now(), ...recurringForm, lastApplied: null }]);
                    log("🔁 Recurring added", `${recurringForm.title} (${recurringForm.frequency})`);
                    setRecurringForm({ title: "", amount: "", category: "Grocery", frequency: "Weekly" });
                    showToast("Recurring added!");
                  }}>+ Add</button>
                </div>
              </div>

              <div className="card gap">
                <div className="card-title"><div className="dot"></div> ⏰ Reminders</div>
                <div className="form-row" style={{ marginBottom: "12px" }}>
                  <input className="input" placeholder="Reminder title" value={reminderForm.title} onChange={e => setReminderForm(p => ({ ...p, title: e.target.value }))} />
                  <input type="date" className="input" value={reminderForm.date} onChange={e => setReminderForm(p => ({ ...p, date: e.target.value }))} />
                  <input type="number" className="input" placeholder="Amount (optional)" value={reminderForm.amount} onChange={e => setReminderForm(p => ({ ...p, amount: e.target.value }))} />
                  <button className="btn" onClick={() => {
                    if (!reminderForm.title || !reminderForm.date) return;
                    setReminders(p => [...p, { id: Date.now(), ...reminderForm, done: false }]);
                    log("⏰ Reminder set", `${reminderForm.title} due ${reminderForm.date}`);
                    setReminderForm({ title: "", date: "", amount: "" });
                    showToast("Reminder set!");
                  }}>Set</button>
                </div>
                {reminders.length === 0 ? (
                  <div className="empty"><div>⏰</div><div>No reminders yet</div></div>
                ) : (
                  reminders.map(r => (
                    <div key={r.id} className={`reminder-item ${r.done ? "done" : r.date <= today() ? "overdue" : ""}`}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "13px" }}>{r.title}</div>
                        <div style={{ fontSize: "11px", color: r.date <= today() && !r.done ? "#ef4444" : th.sub }}>
                          {r.date <= today() && !r.done ? "⚠️ Overdue · " : "📅 "}{r.date}{r.amount ? ` · ${fmt(Number(r.amount), currency)}` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {!r.done && <button className="btn-sm btn-green" onClick={() => { setReminders(p => p.map(x => x.id === r.id ? { ...x, done: true } : x)); log("✅ Reminder done", r.title); }}>✓</button>}
                        <button className="btn-sm btn-del" onClick={() => setReminders(p => p.filter(x => x.id !== r.id))}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="card">
                <div className="card-title">
                  <div className="dot"></div> Recurring Expenses
                  {dueRecurring.length > 0 && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", marginLeft: "6px" }}>
                      🔁 {dueRecurring.length} due now
                    </span>
                  )}
                </div>
                {recurringList.length === 0 ? (
                  <div className="empty"><div>🔁</div><div>None yet</div></div>
                ) : (
                  recurringList.map(r => {
                    const due = isRecurringDue(r);
                    return (
                      <div key={r.id} className={`rec-item ${due ? "due" : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="exp-icon">{CAT_ICONS[r.category] || "📦"}</div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: "13px" }}>{r.title}</div>
                            <div style={{ fontSize: "11px", color: th.sub, marginTop: "2px" }}>
                              {r.category} · {fmt(r.amount, currency)}
                              <span className="freq-badge">{r.frequency || "Monthly"}</span>
                              {due && <span className="due-now">● Due now</span>}
                            </div>
                            {r.lastApplied && (
                              <div style={{ fontSize: "10px", color: th.sub, marginTop: "2px" }}>Last applied: {r.lastApplied}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn-sm btn-green" onClick={() => applyRecurring(r)}>
                            {due ? "⚡ Apply" : "Apply"}
                          </button>
                          <button className="btn-sm btn-del" onClick={() => { setRecurringList(p => p.filter(x => x.id !== r.id)); log("🗑️ Recurring removed", r.title); }}>✕</button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="hint">
                  💡 <strong style={{ color: "#f97316" }}>Weekly</strong> items show due after 7 days · <strong style={{ color: "#f97316" }}>Monthly</strong> items due each new month · Click <strong style={{ color: "#22c55e" }}>Apply</strong> to add to expenses.
                </div>
              </div>
            </>
          )}

          {/* ════ GOALS ════ */}
          {activeTab === "goals" && (
            <>
              <div className="two-col gap">
                <div className="card">
                  <div className="card-title"><div className="dot"></div> 🎯 Savings Goal</div>
                  <div style={{ display: "flex", gap: "7px", marginBottom: "14px" }}>
                    <input className="input" type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="Target savings" />
                    <button className="btn" onClick={() => { setSavingsGoal(Number(savingsInput)); log("🎯 Goal updated", `₹${savingsInput}`); showToast("Goal updated!"); }}>Set</button>
                  </div>
                  <div style={{ textAlign: "center", marginBottom: "12px" }}>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "48px", color: balance >= savingsGoal ? "#22c55e" : "#f97316" }}>
                      {Math.min(100, Math.max(0, savingsPct)).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: "12px", color: th.sub }}>of {fmt(savingsGoal, currency)} goal</div>
                  </div>
                  <div className="progress-bar" style={{ height: "10px" }}>
                    <div className="progress-fill" style={{ width: `${Math.max(0, savingsPct)}%`, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }} />
                  </div>
                  <div style={{ textAlign: "center", fontSize: "12px", color: th.sub, marginTop: "8px" }}>
                    {balance >= savingsGoal ? "🎉 Goal achieved!" : `${fmt(Math.max(0, savingsGoal - balance), currency)} more to go`}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title"><div className="dot"></div> 💰 Financial Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {[
                      ["Income", fmt(income, currency), "#22c55e"],
                      ["Spent", fmt(totalAll, currency), "#f97316"],
                      ["Saved", fmt(Math.max(0, balance), currency), "#06b6d4"],
                      ["Budget Left", fmt(Math.max(0, budget - totalAll), currency), "#8b5cf6"]
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ padding: "10px", background: th.iBg, borderRadius: "10px", border: `1px solid ${th.iBorder}` }}>
                        <div style={{ fontSize: "9px", color: th.sub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "3px" }}>{label}</div>
                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "15px", color }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title"><div className="dot"></div> Category Breakdown</div>
                {getCatData().length === 0 ? (
                  <div className="empty"><div>📊</div><div>No data</div></div>
                ) : (
                  getCatData().sort((a, b) => b.value - a.value).map((item, i) => (
                    <div key={item.name} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span>{CAT_ICONS[item.name] || "📦"} {item.name}</span>
                        <span style={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>
                          {fmt(item.value, currency)} ({totalAll > 0 ? ((item.value / totalAll) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${totalAll > 0 ? (item.value / totalAll) * 100 : 0}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ════ LOGS ════ */}
          {activeTab === "logs" && (
            <>
              <div className="card gap">
                <div className="card-title"><div className="dot"></div> 📊 Monthly Summary</div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
                  <input type="month" className="input" style={{ maxWidth: "180px" }} value={summaryMonth} onChange={e => setSummaryMonth(e.target.value)} />
                  <span style={{ fontSize: "12px", color: th.sub }}>Select month</span>
                </div>
                {(() => {
                  const s = getMonthlySummary();
                  return s.count === 0 ? (
                    <div className="empty"><div>📭</div><div>No expenses in {summaryMonth}</div></div>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
                        {[
                          { val: fmt(s.total, currency), lbl: "Total Spent" },
                          { val: s.count, lbl: "Transactions" },
                          { val: fmt(s.avg, currency), lbl: "Avg per Expense" },
                          { val: s.highest ? `${CAT_ICONS[s.highest.category] || "📦"} ${s.highest.title}` : "—", lbl: "Biggest" }
                        ].map(item => (
                          <div key={item.lbl} className="summary-stat">
                            <div className="summary-stat-val">{item.val}</div>
                            <div className="summary-stat-lbl">{item.lbl}</div>
                          </div>
                        ))}
                      </div>
                      {s.catData.length > 0 && (
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={s.catData} barSize={24}>
                            <XAxis dataKey="name" tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: th.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: th.tooltip, border: "1px solid rgba(249,115,22,0.3)", borderRadius: "8px" }} />
                            <Bar dataKey="value" fill="#f97316" radius={[5, 5, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div className="card-title" style={{ margin: 0 }}><div className="dot"></div> 📋 Activity Log</div>
                  <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: th.sub }}>{activityLog.length} events</span>
                    {activityLog.length > 0 && (
                      <button className="btn-sm btn-del" onClick={() => { setActivityLog([]); localStorage.removeItem("activityLog"); showToast("Log cleared"); }}>Clear</button>
                    )}
                  </div>
                </div>
                {activityLog.length === 0 ? (
                  <div className="empty"><div>📋</div><div>No activity yet</div></div>
                ) : (
                  <div className="scroll-box">
                    {activityLog.map(entry => (
                      <div key={entry.id} className="log-item">
                        <div style={{ width: "32px", height: "32px", background: "rgba(249,115,22,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                          {entry.action.split(" ")[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: "13px" }}>{entry.action.substring(entry.action.indexOf(" ") + 1)}</div>
                          <div style={{ fontSize: "11px", color: th.sub }}>{entry.detail}</div>
                        </div>
                        <div className="log-time">{entry.time}<br /><span style={{ fontSize: "9px" }}>{entry.date}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════ AI ════ */}
          {activeTab === "ai" && (
            <>
              {!aiAnalysis && !aiLoading && (
                <div className="ai-hero">
                  <div className="ai-hero-title">🤖 <span>Smart</span> Financial Advisor</div>
                  <div className="ai-hero-sub">
                    Get personalized financial insights based on your spending data.<br />
                    Analyzes your patterns and gives smart suggestions instantly.
                  </div>
                  <button className="ai-run-btn" onClick={runAIAnalysis} disabled={expenses.length === 0}>
                    {expenses.length === 0 ? "Add expenses first" : "✨ Analyze My Finances"}
                  </button>
                </div>
              )}

              {aiLoading && (
                <div className="card" style={{ textAlign: "center", padding: "48px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                    <div className="ai-spinner"></div>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "16px" }}>Analyzing your finances...</div>
                    <div className="ai-pulse">Reviewing your spending patterns 🧠</div>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>😕</div>
                  <div style={{ color: "#ef4444", marginBottom: "16px", fontSize: "14px" }}>{aiError}</div>
                  <button className="ai-run-btn" onClick={runAIAnalysis}>Try Again</button>
                </div>
              )}

              {aiAnalysis && !aiLoading && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "16px" }}>Analysis Results</div>
                    <button className="btn-ghost" onClick={runAIAnalysis}>🔄 Re-analyze</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                      <div className="score-wrap">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                          <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(249,115,22,0.1)" strokeWidth="12" />
                          <circle cx="70" cy="70" r="58" fill="none"
                            stroke={scoreColor(aiAnalysis.score)}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 58}`}
                            strokeDashoffset={`${2 * Math.PI * 58 * (1 - aiAnalysis.score / 100)}`}
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                          />
                        </svg>
                        <div className="score-num" style={{ color: scoreColor(aiAnalysis.score) }}>{aiAnalysis.score}</div>
                      </div>
                      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "16px", color: scoreColor(aiAnalysis.score) }}>{aiAnalysis.scoreLabel}</div>
                      <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "4px" }}>Financial Health</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        {[
                          { lbl: "Total Spent", val: fmt(aiAnalysis.totalSpent || totalAll, currency) },
                          { lbl: "Avg Expense", val: fmt(aiAnalysis.avgExpense || 0, currency) },
                          { lbl: "Top Category", val: `${CAT_ICONS[aiAnalysis.topCategory] || "📦"} ${aiAnalysis.topCategory || "—"} (${aiAnalysis.topCategoryPct || 0}%)` }
                        ].map(item => (
                          <div key={item.lbl} style={{ padding: "10px 12px", background: th.iBg, borderRadius: "10px", border: `1px solid ${th.iBorder}` }}>
                            <div style={{ fontSize: "9px", color: th.sub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{item.lbl}</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "12px", color: "#f97316" }}>{item.val}</div>
                          </div>
                        ))}
                      </div>

                      <div className="insight-card" style={{ background: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.2)" }}>
                        <div className="insight-ttl" style={{ color: "#f97316" }}>💡 Key Insight</div>
                        <div className="insight-txt">{aiAnalysis.topInsight}</div>
                      </div>

                      <div className="insight-card" style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}>
                        <div className="insight-ttl" style={{ color: "#22c55e" }}>🎉 What You're Doing Well</div>
                        <div className="insight-txt">{aiAnalysis.praise}</div>
                      </div>

                      {aiAnalysis.warnings?.length > 0 && aiAnalysis.warnings[0] !== "" && (
                        <div className="insight-card" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                          <div className="insight-ttl" style={{ color: "#ef4444" }}>⚠️ Warnings</div>
                          {aiAnalysis.warnings.map((w, i) => (
                            <div key={i} className="insight-txt">• {w}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-title"><div className="dot"></div> 💬 Smart Suggestions</div>
                    {aiAnalysis.suggestions?.map((s, i) => (
                      <div key={i} className="sug-item">
                        <div className="sug-num">{i + 1}</div>
                        <div>{s}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
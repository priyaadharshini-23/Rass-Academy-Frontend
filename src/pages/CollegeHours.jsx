import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Plus, Upload, Download, Printer, Pencil, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";

const API        = "http://localhost:5000/api/collegehours";
const COURSE_API = "http://localhost:5000/api/courses";

const EMPTY_FORM = {
  programme: "",
  noOfSemOrYear: "",
  morningStart: "",
  morningEnd: "",
  afternoonStart: "",
  afternoonEnd: "",
  lectureDuration: "",
  labDuration: "",
  clinicalHospital: "",
  clinicalCommunity: "",
  flHour: "", flMin: "", flCont: "",
  labHour: "", labMin: "", labCont: "",
  clHour: "", clMin: "", clCont: "",
};

// ── Small reusable components ──────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900
               bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
               placeholder:text-gray-300 transition"
  />
);

const YesNoToggle = ({ value, onChange }) => (
  <div className="flex gap-1 shrink-0">
    {["Yes", "No"].map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`px-3 py-2 border rounded-lg text-sm font-medium transition
          ${value === opt
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ── Toast ──────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-2 px-4 py-3
                     rounded-xl shadow-xl text-sm font-medium animate-fade-in
                     ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
};

// ── Main ───────────────────────────────────────────────
export default function CollegeHours() {
  const [data,      setData]      = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [loading,   setLoading]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast,     setToast]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchData(); fetchCourses(); }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch ────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch(API);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) { console.error("FETCH ERROR:", err); }
  };

  const fetchCourses = async () => {
    try {
      const res  = await fetch(COURSE_API);
      const json = await res.json();
      setCourses(Array.isArray(json) ? json : []);
    } catch (err) { console.error("COURSE FETCH ERROR:", err); }
  };

  // ── Modal ────────────────────────────────────────────
  const openAdd  = () => { setForm(EMPTY_FORM); setEditIndex(null); setShowModal(true); };
  const openEdit = (i) => { setForm(data[i]);   setEditIndex(i);    setShowModal(true); };
  const closeModal = () => setShowModal(false);

  // ── Save ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.programme) { showToast("Please select a programme", "error"); return; }

    setLoading(true);
    try {
      const isEdit = editIndex !== null;
      const url    = isEdit ? `${API}/${data[editIndex]._id}` : API;

      const res = await fetch(url, {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || "Save failed", "error");
        return;
      }
      await fetchData();
      closeModal();
      showToast(isEdit ? "Updated successfully!" : "Added successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      showToast("Network error while saving", "error");
    } finally { setLoading(false); }
  };

  // ── Delete ───────────────────────────────────────────
  const handleDelete = async (i) => {
    if (!window.confirm(`Delete "${data[i].programme}" entry?`)) return;
    try {
      const res = await fetch(`${API}/${data[i]._id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Delete failed", "error"); return; }
      await fetchData();
      showToast("Deleted successfully!");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      showToast("Network error while deleting", "error");
    }
  };

  // ── Import Excel → save to DB → refresh table ───────
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = ""; // reset input

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const wb   = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        if (!rows.length) {
          showToast("Excel file is empty", "error");
          return;
        }

        // Remove DB-specific fields before re-inserting
        const clean = rows.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

        const res = await fetch(API, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(clean),   // backend handles array via insertMany
        });

        if (!res.ok) {
          const err = await res.json();
          showToast(err.message || "Import failed", "error");
          return;
        }

        await fetchData();   // ← pull fresh data from DB into table
        showToast(`${clean.length} record(s) imported!`);
      } catch (err) {
        console.error("IMPORT ERROR:", err);
        showToast("Error reading Excel file", "error");
      } finally { setImporting(false); }
    };

    reader.onerror = () => { setImporting(false); showToast("File read error", "error"); };
    reader.readAsArrayBuffer(file);
  };

  // ── Export current DB data to Excel ─────────────────
  const exportToExcel = () => {
    if (!data.length) { showToast("No data to export", "error"); return; }

    const rows = data.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CollegeHours");
    XLSX.writeFile(wb, "college_hours.xlsx");
    showToast("Exported successfully!");
  };

  // ── Helpers ──────────────────────────────────────────
  const set    = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setVal = (field) => (v) => setForm((f) => ({ ...f, [field]: v }));

  // ── Render ───────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-2 space-y-6 text-gray-900">

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">College Hours</h1>
          <p className="text-sm text-gray-500">Manage college working hours per programme</p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                       bg-gradient-to-r from-blue-600 to-cyan-500
                       text-white shadow-lg hover:scale-[1.04] transition"
          >
            <Plus size={15} /> Add
          </button>

          <label
            title="Import from Excel"
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white
                        shadow-sm cursor-pointer hover:bg-gray-50 text-sm transition
                        ${importing ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload size={15} />
            <span className="hidden sm:inline">{importing ? "Importing…" : "Import"}</span>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={importFromExcel} />
          </label>

          <button onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm"
            title="Export to Excel">
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm"
            title="Print">
            <Printer size={15} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 min-w-[960px]">
            <thead className="bg-gray-50 text-gray-900 text-xs uppercase tracking-wide border-b">
              <tr>
                {["S.No","Programme","Sem / Year","Class Hours","Lecture (min)","Lab (min)","Clinical","Faculty Load","Actions"]
                  .map((h, i) => (
                    <th key={h} className={`px-4 py-3 ${i === 0 || i === 1 ? "text-left" : "text-center"}`}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📋</span>
                      <p>No records yet. Click <strong>Add</strong> or <strong>Import</strong> to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((d, i) => (
                  <tr key={d._id} className="hover:bg-blue-50/30 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">{d.programme}</td>
                    <td className="px-4 py-3 text-center">{d.noOfSemOrYear || "—"}</td>
                    <td className="px-4 py-3 text-center text-xs leading-5">
                      <span className="block">{d.morningStart || "--"}–{d.morningEnd || "--"}</span>
                      <span className="block">{d.afternoonStart || "--"}–{d.afternoonEnd || "--"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{d.lectureDuration || "—"}</td>
                    <td className="px-4 py-3 text-center">{d.labDuration || "—"}</td>
                    <td className="px-4 py-3 text-center text-xs leading-5">
                      <span className="block">H: {d.clinicalHospital || "—"}</span>
                      <span className="block">C: {d.clinicalCommunity || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center leading-5">
                      {[
                        { lbl: "L",   h: d.flHour,  m: d.flMin,  c: d.flCont  },
                        { lbl: "Lab", h: d.labHour, m: d.labMin, c: d.labCont },
                        { lbl: "Cl",  h: d.clHour,  m: d.clMin,  c: d.clCont  },
                      ].map(({ lbl, h, m, c }) => (
                        <span key={lbl} className="block">
                          {lbl}: {h || 0}h {m || 0}m{" "}
                          <span className={`px-1 rounded text-[10px]
                            ${c === "Yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                            {c || "—"}
                          </span>
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(i)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(i)}
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
       
      </div>

      {/* ── MODAL — always centered, scrollable body ─────── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl
                          flex flex-col max-h-[88vh]">

            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editIndex !== null ? "Edit College Hours" : "Add College Hours"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the details and click Save</p>
              </div>
              <button onClick={closeModal}
                className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition">
                <X size={14} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Programme */}
              <div>
                <Label>Programme *</Label>
                <select
                  value={form.programme}
                  onChange={set("programme")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                             bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">— Select Programme —</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c.programme}>{c.programme}</option>
                  ))}
                </select>
              </div>

              {/* Sem / Year */}
              <div>
                <Label>No. of Semester / Year</Label>
                <Input type="number" placeholder="e.g. 6 Semesters or 3 Years"
                  value={form.noOfSemOrYear} onChange={set("noOfSemOrYear")} />
              </div>

              {/* Class Hours */}
              <div>
                <Label>Class Hours (Morning &amp; Afternoon)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                  {[
                    ["morningStart",   "Morning Start"],
                    ["morningEnd",     "Morning End"],
                    ["afternoonStart", "Afternoon Start"],
                    ["afternoonEnd",   "Afternoon End"],
                  ].map(([field, lbl]) => (
                    <div key={field}>
                      <span className="text-[10px] text-gray-400 font-medium block mb-1">{lbl}</span>
                      <Input type="time" value={form[field]} onChange={set(field)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Durations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lecture Duration (mins)</Label>
                  <Input type="number" placeholder="e.g. 50"
                    value={form.lectureDuration} onChange={set("lectureDuration")} />
                </div>
                <div>
                  <Label>Lab Duration (mins)</Label>
                  <Input type="number" placeholder="e.g. 180"
                    value={form.labDuration} onChange={set("labDuration")} />
                </div>
              </div>

              {/* Clinical */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Clinical – Hospital (hrs/wk)</Label>
                  <Input type="number" placeholder="e.g. 8"
                    value={form.clinicalHospital} onChange={set("clinicalHospital")} />
                </div>
                <div>
                  <Label>Clinical – Community (hrs/wk)</Label>
                  <Input type="number" placeholder="e.g. 4"
                    value={form.clinicalCommunity} onChange={set("clinicalCommunity")} />
                </div>
              </div>

              {/* Faculty Loads */}
              {[
                { label: "Faculty Load – Lecture",  h: "flHour",  m: "flMin",  c: "flCont"  },
                { label: "Faculty Load – Lab",       h: "labHour", m: "labMin", c: "labCont" },
                { label: "Faculty Load – Clinical",  h: "clHour",  m: "clMin",  c: "clCont"  },
              ].map(({ label, h, m, c }) => (
                <div key={label}>
                  <Label>{label}</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input type="number" min="0" max="23" placeholder="Hr"
                      value={form[h]} onChange={set(h)} />
                    <Input type="number" min="0" max="59" placeholder="Min"
                      value={form[m]} onChange={set(m)} />
                    <YesNoToggle value={form[c]} onChange={setVal(c)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl shrink-0">
              <button onClick={closeModal}
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                           text-white text-sm rounded-lg shadow transition font-medium">
                {loading ? "Saving…" : "Save"}
              </button>
            </div>

          </div>
        </div>,
        document.getElementById("modal-root")
      )}
    </div>
  );
}
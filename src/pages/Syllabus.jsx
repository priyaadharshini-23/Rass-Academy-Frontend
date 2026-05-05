import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus, Upload, Download, Printer,
  Pencil, Trash2, X, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, BookOpen, Layers
} from "lucide-react";

const API        = "http://localhost:5000/api/syllabus";
const COURSE_API = "http://localhost:5000/api/courses";

const EMPTY_UNIT = {
  unitNumber: "", unitName: "", speciality: "",
  content: "", lectureHours: "", labHours: "", unitExam: "No",
};

const EMPTY_FORM = {
  programme: "", type: "Semester", levelName: "", subject: "", units: [],
};

// ── Reusable UI ────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
    {children}
  </label>
);

const Field = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900
               bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
               placeholder:text-gray-300 transition"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900
               bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
  >
    {children}
  </select>
);

// ── Toast ──────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-2 px-4 py-3
                     rounded-xl shadow-2xl text-sm font-medium
                     ${type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────
export default function Syllabus() {
  const [data,          setData]         = useState([]);
  const [courses,       setCourses]      = useState([]);
  const [showModal,     setShowModal]    = useState(false);
  const [editId,        setEditId]       = useState(null);   // stores _id
  const [form,          setForm]         = useState(EMPTY_FORM);
  const [loading,       setLoading]      = useState(false);
  const [importing,     setImporting]    = useState(false);
  const [toast,         setToast]        = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  const [filterProgramme, setFilterProgramme] = useState("All");
  const [filterSemester,  setFilterSemester]  = useState("");
  const [search,          setSearch]          = useState("");

  const fileRef = useRef(null);

  useEffect(() => { fetchData(); fetchCourses(); }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch(API);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) { console.error("FETCH ERR:", err); }
  };

  const fetchCourses = async () => {
    try {
      const res  = await fetch(COURSE_API);
      const json = await res.json();
      setCourses(Array.isArray(json) ? json : []);
    } catch (err) { console.error("COURSE FETCH ERR:", err); }
  };

  // ── Modal ──────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setEditId(item._id);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ── Save ───────────────────────────────────────────
  const handleSave = async () => {
    if (!form.programme) { showToast("Select a programme", "error"); return; }
    if (!form.subject.trim()) { showToast("Subject is required", "error"); return; }

    setLoading(true);
    try {
      const isEdit = !!editId;
      const url    = isEdit ? `${API}/${editId}` : API;

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
      console.error("SAVE ERR:", err);
      showToast("Network error", "error");
    } finally { setLoading(false); }
  };

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.subject}"?`)) return;
    try {
      const res = await fetch(`${API}/${item._id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Delete failed", "error"); return; }
      await fetchData();
      showToast("Deleted!");
    } catch (err) { showToast("Network error", "error"); }
  };

  // ── Import Excel → POST array → refresh ───────────
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const wb   = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        if (!rows.length) { showToast("Excel is empty", "error"); return; }

        // Group flat rows → structured documents
        const structured = [];

        rows.forEach((row) => {
          const programme = String(row.programme || row.Programme || "");
          const levelName = String(row.levelName  || row.Semester  || row.Year || "");
          const subject   = String(row.subject    || row.Subject   || "");

          let doc = structured.find(
            (s) => s.programme === programme && s.levelName === levelName && s.subject === subject
          );

          if (!doc) {
            doc = {
              programme,
              type:      row.type || row.Type || "Semester",
              levelName,
              subject,
              units: [],
            };
            structured.push(doc);
          }

          // Each row can represent a unit (optional)
          const unitNum = row.unitNumber || row.Unit;
          if (unitNum !== undefined && unitNum !== "") {
            let unit = doc.units.find((u) => String(u.unitNumber) === String(unitNum));
            if (!unit) {
              unit = {
                unitNumber:   String(unitNum),
                unitName:     String(row.unitName  || row.UnitName  || ""),
                speciality:   String(row.speciality || row.Category  || ""),
                content:      "",
                lectureHours: 0,
                labHours:     0,
                unitExam:     row.unitExam || row.UnitExam || "No",
              };
              doc.units.push(unit);
            }
            if (row.content || row.Topic) {
              const add = row.content || row.Topic;
              unit.content += (unit.content ? "\n" : "") + add;
            }
            unit.lectureHours += Number(row.lectureHours || row.LectureHours || 0);
            unit.labHours     += Number(row.labHours     || row.LabHours     || 0);
          }
        });

        // Remove internal DB fields if re-importing exported data
        const clean = structured.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

        const res = await fetch(API, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(clean),
        });

        if (!res.ok) {
          const err = await res.json();
          showToast(err.message || "Import failed", "error");
          return;
        }

        await fetchData();
        showToast(`${clean.length} record(s) imported!`);
      } catch (err) {
        console.error("IMPORT ERR:", err);
        showToast("Error reading Excel", "error");
      } finally { setImporting(false); }
    };

    reader.onerror = () => { setImporting(false); showToast("File read error", "error"); };
    reader.readAsArrayBuffer(file);
  };

  // ── Export current DB data ─────────────────────────
  const exportToExcel = () => {
    if (!data.length) { showToast("No data to export", "error"); return; }

    // Flatten nested units into rows
    const rows = [];
    data.forEach((item) => {
      if (!item.units?.length) {
        rows.push({
          programme: item.programme, type: item.type,
          levelName: item.levelName, subject: item.subject,
        });
      } else {
        item.units.forEach((u) => {
          rows.push({
            programme:    item.programme,
            type:         item.type,
            levelName:    item.levelName,
            subject:      item.subject,
            unitNumber:   u.unitNumber,
            unitName:     u.unitName,
            speciality:   u.speciality,
            content:      u.content,
            lectureHours: u.lectureHours,
            labHours:     u.labHours,
            unitExam:     u.unitExam,
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Syllabus");
    XLSX.writeFile(wb, "syllabus.xlsx");
    showToast("Exported successfully!");
  };

  // ── Units helpers ──────────────────────────────────
  const addUnit = () =>
    setForm((f) => ({ ...f, units: [...f.units, { ...EMPTY_UNIT }] }));

  const updateUnit = (i, field, value) =>
    setForm((f) => {
      const u = [...f.units];
      u[i] = { ...u[i], [field]: value };
      return { ...f, units: u };
    });

  const removeUnit = (i) =>
    setForm((f) => ({ ...f, units: f.units.filter((_, idx) => idx !== i) }));

  // ── Toggle expand ──────────────────────────────────
  const toggleExpand = (id) =>
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Filter ─────────────────────────────────────────
  const filteredData = data.filter((item) => {
    const mp = filterProgramme === "All" || item.programme === filterProgramme;
    const ms = !filterSemester || item.levelName === filterSemester;
    const mq = !search || item.subject?.toLowerCase().includes(search.toLowerCase());
    return mp && ms && mq;
  });

  // Group: programme → levelName → items[]
  const grouped = filteredData.reduce((acc, item) => {
    const p = item.programme || "Unknown";
    const s = item.levelName  || "Unknown";
    if (!acc[p])    acc[p]    = {};
    if (!acc[p][s]) acc[p][s] = [];
    acc[p][s].push(item);
    return acc;
  }, {});

  // Unique programme names from courses API
  const programmeNames = courses.map((c) => c.programme);

  // ── Render ─────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900 min-h-screen bg-gray-50">

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Syllabus Management</h1>
          <p className="text-sm text-gray-500">Manage programme syllabus, subjects &amp; units</p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-gradient-to-r from-indigo-600 to-blue-500
                       text-white shadow-lg hover:scale-[1.04] transition">
            <Plus size={15} /> Add
          </button>

          <label
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white
                        shadow-sm cursor-pointer hover:bg-gray-50 text-sm transition
                        ${importing ? "opacity-50 pointer-events-none" : ""}`}
            title="Import Excel"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">{importing ? "Importing…" : "Import"}</span>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={importFromExcel} />
          </label>

          <button onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm"
            title="Export Excel">
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

      {/* ── Filters ── */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 shadow-sm">
        <select
          value={filterProgramme}
          onChange={(e) => setFilterProgramme(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="All">All Programmes</option>
          {programmeNames.map((p) => <option key={p}>{p}</option>)}
        </select>

        <input
          placeholder="Search subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <input
          placeholder="Semester / Year"
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {(filterProgramme !== "All" || filterSemester || search) && (
          <button
            onClick={() => { setFilterProgramme("All"); setFilterSemester(""); setSearch(""); }}
            className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 border rounded-lg hover:border-red-300 transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Syllabus Cards ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center text-gray-400 shadow-sm">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No syllabus found.</p>
          <p className="text-sm mt-1">Click <strong>Add</strong> or <strong>Import</strong> to get started.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([programme, semesters]) => (
          <div key={programme} className="bg-white border rounded-2xl shadow-sm overflow-hidden">

            {/* Programme Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                {programme}
              </h2>
            </div>

            <div className="p-5 space-y-6">
              {Object.entries(semesters).map(([semKey, subjects]) => (
                <div key={semKey}>
                  {/* Semester / Year label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                      {subjects[0]?.type} {semKey}
                    </span>
                    <span className="text-xs text-gray-400">{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</span>
                  </div>

                  <div className="space-y-3">
                    {subjects.map((item) => (
                      <div key={item._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">

                        {/* Subject row */}
                        <div
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
                          onClick={() => toggleExpand(item._id)}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen size={15} className="text-indigo-400 shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm">{item.subject}</span>
                            <span className="text-xs text-gray-400 ml-1">
                              {item.units?.length || 0} unit{item.units?.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                              className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                              className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                            {expandedItems[item._id]
                              ? <ChevronUp size={15} className="text-gray-400 ml-1" />
                              : <ChevronDown size={15} className="text-gray-400 ml-1" />
                            }
                          </div>
                        </div>

                        {/* Units (expandable) */}
                        {expandedItems[item._id] && (
                          <div className="px-4 pb-4 pt-2 bg-white">
                            {item.units?.length ? (
                              <div className="space-y-2 mt-1">
                                {item.units.map((u, i) => (
                                  <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-sm">
                                    <div className="flex flex-wrap gap-2 items-start justify-between">
                                      <div>
                                        <span className="font-semibold text-gray-800">
                                          Unit {u.unitNumber}: {u.unitName}
                                        </span>
                                        {u.speciality && (
                                          <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                                            {u.speciality}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex gap-3 text-xs text-gray-500 shrink-0">
                                        <span>📖 {u.lectureHours}h Lecture</span>
                                        <span>🔬 {u.labHours}h Lab</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                                          ${u.unitExam === "Yes" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                                          Exam: {u.unitExam}
                                        </span>
                                      </div>
                                    </div>
                                    {u.content && (
                                      <p className="text-gray-600 mt-1.5 text-xs leading-relaxed whitespace-pre-line">
                                        {u.content}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 py-2 text-center">No units added</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── MODAL ── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl
                          flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 rounded-t-2xl bg-white">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editId ? "Edit Syllabus Entry" : "Add Syllabus Entry"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in details and click Save</p>
              </div>
              <button onClick={closeModal}
                className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition">
                <X size={14} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* Programme — dynamic from courses API */}
              <div>
                <Label>Programme *</Label>
                <Select value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })}>
                  <option value="">— Select Programme —</option>
                  {programmeNames.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>

              {/* Type */}
              <div>
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="Semester">Semester</option>
                  <option value="Year">Year</option>
                </Select>
              </div>

              {/* Level Name */}
              <div>
                <Label>{form.type === "Semester" ? "Semester Number" : "Year Number"}</Label>
                <Field
                  placeholder={form.type === "Semester" ? "e.g. 1, 2, 3…" : "e.g. 1st Year"}
                  value={form.levelName}
                  onChange={(e) => setForm({ ...form, levelName: e.target.value })}
                />
              </div>

              {/* Subject */}
              <div>
                <Label>Subject *</Label>
                <Field
                  placeholder="e.g. Anatomy & Physiology"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              {/* Units */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Units ({form.units.length})</Label>
                  <button
                    onClick={addUnit}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800
                               font-semibold border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50 transition"
                  >
                    <Plus size={12} /> Add Unit
                  </button>
                </div>

                {form.units.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">
                    No units yet — click "Add Unit" above
                  </p>
                )}

                {form.units.map((u, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unit {i + 1}</span>
                      <button onClick={() => removeUnit(i)}
                        className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 transition">
                        <X size={12} /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Unit Number</Label>
                        <Field placeholder="e.g. 1"
                          value={u.unitNumber}
                          onChange={(e) => updateUnit(i, "unitNumber", e.target.value)} />
                      </div>
                      <div>
                        <Label>Unit Name</Label>
                        <Field placeholder="e.g. Introduction to Anatomy"
                          value={u.unitName}
                          onChange={(e) => updateUnit(i, "unitName", e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <Label>Category / Speciality</Label>
                      <Field placeholder="e.g. Basic Sciences"
                        value={u.speciality}
                        onChange={(e) => updateUnit(i, "speciality", e.target.value)} />
                    </div>

                    <div>
                      <Label>Content / Topics</Label>
                      <textarea
                        placeholder="Enter topics, one per line…"
                        value={u.content}
                        onChange={(e) => updateUnit(i, "content", e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                                   focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Lecture Hrs</Label>
                        <Field type="number" min="0" placeholder="0"
                          value={u.lectureHours}
                          onChange={(e) => updateUnit(i, "lectureHours", e.target.value)} />
                      </div>
                      <div>
                        <Label>Lab Hrs</Label>
                        <Field type="number" min="0" placeholder="0"
                          value={u.labHours}
                          onChange={(e) => updateUnit(i, "labHours", e.target.value)} />
                      </div>
                      <div>
                        <Label>Unit Exam</Label>
                        <Select value={u.unitExam}
                          onChange={(e) => updateUnit(i, "unitExam", e.target.value)}>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl shrink-0">
              <button onClick={closeModal}
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
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
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus, Upload, Download, Printer,
  Pencil, Trash2, X, CheckCircle, AlertCircle,
  User, Phone, Mail, MapPin, CreditCard, Calendar,
  ShieldCheck, ShieldOff
} from "lucide-react";

const API = "http://localhost:5000/api/staff";

const EMPTY_QUAL = { degree: "", year: "", institution: "", rn: "", rm: "", nuid: "" };

const EMPTY_FORM = {
  name: "", photo: "", address: "", mobile: "", email: "",
  social: "", active: true,
  qualifications: [{ ...EMPTY_QUAL }],
  aadhar: "", pan: "", dateOfJoining: "", dateOfRelieving: "",
};

const DEGREES = [
  "ANM", "GNM", "B.SC NURSING", "PBBSC NURSING", "MSC NURSING",
  "M.SC N-MSN", "M.SC N-OBG", "M.SC N-Paed", "M.SC N-MHN", "M.SC N-CHN", "Ph.D",
];

// ── Tiny reusable UI ────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
    {children}
  </label>
);

const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
    )}
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-900
                  bg-white focus:outline-none focus:ring-2 focus:ring-blue-400
                  placeholder:text-gray-300 transition
                  ${Icon ? "pl-9 pr-3" : "px-3"}`}
    />
  </div>
);

// ── Toast ───────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-2 px-4 py-3
                     rounded-xl shadow-2xl text-sm font-medium
                     ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
};

// ── Main ────────────────────────────────────────────────
export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [loading,   setLoading]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("All"); // All / Active / Disabled

  const fileRef    = useRef(null);
  const photoRef   = useRef(null);

  useEffect(() => { fetchStaff(); }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch ───────────────────────────────────────────
  const fetchStaff = async () => {
    try {
      const res  = await fetch(API);
      const json = await res.json();
      setStaffList(Array.isArray(json) ? json : []);
    } catch (err) { console.error("FETCH ERR:", err); }
  };

  // ── Modal ───────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, qualifications: [{ ...EMPTY_QUAL }] });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      ...item,
      qualifications: item.qualifications?.length
        ? item.qualifications
        : [{ ...EMPTY_QUAL }],
    });
    setEditId(item._id);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ── Photo upload → base64 ───────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  // ── Field helpers ───────────────────────────────────
  const set    = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setVal = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const addQual = () =>
    setForm((f) => ({ ...f, qualifications: [...f.qualifications, { ...EMPTY_QUAL }] }));

  const updateQual = (i, field, value) =>
    setForm((f) => {
      const q = [...f.qualifications];
      q[i] = { ...q[i], [field]: value };
      return { ...f, qualifications: q };
    });

  const removeQual = (i) =>
    setForm((f) => ({ ...f, qualifications: f.qualifications.filter((_, idx) => idx !== i) }));

  // ── Save ────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }

    setLoading(true);
    try {
      const isEdit = !!editId;
      const res = await fetch(isEdit ? `${API}/${editId}` : API, {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || "Save failed", "error");
        return;
      }
      await fetchStaff();
      closeModal();
      showToast(isEdit ? "Staff updated!" : "Staff added!");
    } catch (err) {
      console.error("SAVE ERR:", err);
      showToast("Network error", "error");
    } finally { setLoading(false); }
  };

  // ── Delete ──────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const res = await fetch(`${API}/${item._id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Delete failed", "error"); return; }
      await fetchStaff();
      showToast("Deleted!");
    } catch (err) { showToast("Network error", "error"); }
  };

  // ── Import Excel → POST to DB → refresh ────────────
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

        // Strip DB meta fields before re-inserting
        const clean = rows.map(({ _id, __v, createdAt, updatedAt, ...rest }) => ({
          ...rest,
          // qualifications may be a stringified JSON when re-importing exported file
          qualifications:
            typeof rest.qualifications === "string"
              ? (() => { try { return JSON.parse(rest.qualifications); } catch { return []; } })()
              : rest.qualifications || [],
        }));

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

        await fetchStaff();
        showToast(`${clean.length} staff record(s) imported!`);
      } catch (err) {
        console.error("IMPORT ERR:", err);
        showToast("Error reading Excel", "error");
      } finally { setImporting(false); }
    };

    reader.onerror = () => { setImporting(false); showToast("File read error", "error"); };
    reader.readAsArrayBuffer(file);
  };

  // ── Export DB data to Excel (qualifications as JSON string) ─
  const exportToExcel = () => {
    if (!staffList.length) { showToast("No data to export", "error"); return; }

    const rows = staffList.map(({ _id, __v, createdAt, updatedAt, ...rest }) => ({
      ...rest,
      qualifications: JSON.stringify(rest.qualifications || []),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "staff_profiles.xlsx");
    showToast("Exported successfully!");
  };

  // ── Filter + search ─────────────────────────────────
  const displayed = staffList.filter((s) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Active" && s.active) ||
      (filter === "Disabled" && !s.active);
    const matchSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile?.includes(search) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ── Render ──────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900 min-h-screen bg-gray-50">

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff Profiles</h1>
          <p className="text-sm text-gray-500">Manage staff records, qualifications &amp; documents</p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-gradient-to-r from-blue-600 to-cyan-500
                       text-white shadow-lg hover:scale-[1.04] transition">
            <Plus size={15} /> Add Staff
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

      {/* Filter bar */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 shadow-sm items-center">
        <input
          placeholder="Search by name, mobile or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-1">
          {["All", "Active", "Disabled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                ${filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">{displayed.length} record{displayed.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Staff</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Qualifications</th>
                <th className="px-4 py-3 text-center">Joining</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <User size={36} className="opacity-20" />
                      <p>No staff records. Click <strong>Add Staff</strong> or <strong>Import</strong>.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((s, i) => (
                  <tr key={s._id} className="hover:bg-blue-50/30 transition">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100
                                          flex items-center justify-center shrink-0">
                            <User size={16} className="text-blue-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{s.name}</p>
                          {s.social && <p className="text-xs text-gray-400">{s.social}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{s.mobile || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.email || "—"}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                        {s.qualifications?.length || 0} qual.
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {s.dateOfJoining || "—"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {s.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700
                                         text-xs rounded-full font-semibold">
                          <ShieldCheck size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500
                                         text-xs rounded-full font-semibold">
                          <ShieldOff size={11} /> Disabled
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(s)}
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

      {/* ── MODAL ── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl
                          flex flex-col max-h-[90vh]">

            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 rounded-t-2xl bg-white">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editId ? "Edit Staff Profile" : "Add Staff Profile"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in details and click Save</p>
              </div>
              <button onClick={closeModal}
                className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition">
                <X size={14} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Status + Photo row */}
              <div className="flex items-start gap-5">

                {/* Photo preview + upload */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200
                               bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer
                               hover:border-blue-400 transition"
                    onClick={() => photoRef.current?.click()}
                  >
                    {form.photo ? (
                      <img src={form.photo} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="text-center">
                        <User size={24} className="text-gray-300 mx-auto" />
                        <span className="text-[9px] text-gray-300 block mt-1">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                  {form.photo && (
                    <button onClick={() => setVal("photo", "")}
                      className="text-[10px] text-red-400 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>

                {/* Status toggle + name */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Label>Status</Label>
                    <button
                      onClick={() => setVal("active", !form.active)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition
                        ${form.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                    >
                      {form.active ? <><ShieldCheck size={12} /> Active</> : <><ShieldOff size={12} /> Disabled</>}
                    </button>
                  </div>
                  <div>
                    <Label>Full Name *</Label>
                    <Field icon={User} placeholder="e.g. Dr. Priya Sharma"
                      value={form.name} onChange={set("name")} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mobile</Label>
                  <Field icon={Phone} type="tel" placeholder="+91 99999 00000"
                    value={form.mobile} onChange={set("mobile")} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Field icon={Mail} type="email" placeholder="staff@college.edu"
                    value={form.email} onChange={set("email")} />
                </div>
                <div className="col-span-2">
                  <Label>Social / LinkedIn / Website</Label>
                  <Field placeholder="https://linkedin.com/in/…"
                    value={form.social} onChange={set("social")} />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label>Address</Label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-gray-300 pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder="Door No, Street, City, Pincode"
                    value={form.address}
                    onChange={set("address")}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm
                               bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Qualifications ({form.qualifications.length})</Label>
                  <button onClick={addQual}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800
                               font-semibold border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-50 transition">
                    <Plus size={11} /> Add
                  </button>
                </div>

                {form.qualifications.map((q, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase">Qualification {i + 1}</span>
                      {form.qualifications.length > 1 && (
                        <button onClick={() => removeQual(i)}
                          className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                          <X size={11} /> Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <Label>Degree</Label>
                      <select
                        value={q.degree}
                        onChange={(e) => updateQual(i, "degree", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                                   focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">— Select Degree —</option>
                        {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Year</Label>
                        <Field placeholder="e.g. 2018"
                          value={q.year} onChange={(e) => updateQual(i, "year", e.target.value)} />
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Field placeholder="University / College name"
                          value={q.institution} onChange={(e) => updateQual(i, "institution", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>RN No.</Label>
                        <Field placeholder="RN" value={q.rn}
                          onChange={(e) => updateQual(i, "rn", e.target.value)} />
                      </div>
                      <div>
                        <Label>RM No.</Label>
                        <Field placeholder="RM" value={q.rm}
                          onChange={(e) => updateQual(i, "rm", e.target.value)} />
                      </div>
                      <div>
                        <Label>NUID</Label>
                        <Field placeholder="NUID" value={q.nuid}
                          onChange={(e) => updateQual(i, "nuid", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Identity + Dates */}
              <div>
                <Label>Identity Documents</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Label>Aadhar Number</Label>
                    <Field icon={CreditCard} placeholder="XXXX XXXX XXXX"
                      value={form.aadhar} onChange={set("aadhar")} />
                  </div>
                  <div>
                    <Label>PAN Number</Label>
                    <Field icon={CreditCard} placeholder="ABCDE1234F"
                      value={form.pan} onChange={set("pan")} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Joining</Label>
                  <Field icon={Calendar} type="date"
                    value={form.dateOfJoining} onChange={set("dateOfJoining")} />
                </div>
                <div>
                  <Label>Date of Relieving</Label>
                  <Field icon={Calendar} type="date"
                    value={form.dateOfRelieving} onChange={set("dateOfRelieving")} />
                </div>
              </div>

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
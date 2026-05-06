import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus, Upload, Download, Printer,
  Pencil, Trash2, X, Eye,
  CheckCircle, AlertCircle,
  User, Phone, MapPin, CreditCard, Calendar,
  ToggleLeft, ToggleRight, ShieldCheck, ShieldOff,
} from "lucide-react";

const API = "http://localhost:5000/api/adminstaff";

const CATEGORIES = ["Admin Staff", "Mess Staffs", "Watchman", "Housekeeping"];

const EMPTY_FORM = {
  category: "", photo: "", name: "", address: "",
  mobile: "", aadhar: "", pan: "",
  doj: "", dor: "", disabled: false,
};

// ── Tiny UI helpers ────────────────────────────────────
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

// ── Avatar ──────────────────────────────────────────────
const Avatar = ({ photo, name, size = "sm" }) => {
  const dim = size === "lg" ? "w-20 h-20 text-2xl" : "w-9 h-9 text-sm";
  return photo ? (
    <img src={photo} alt={name}
      className={`${dim} rounded-full object-cover border-2 border-gray-100 shrink-0`} />
  ) : (
    <div className={`${dim} rounded-full bg-gradient-to-br from-blue-100 to-cyan-100
                     flex items-center justify-center shrink-0 font-bold text-blue-400`}>
      {name?.[0]?.toUpperCase() || <User size={size === "lg" ? 28 : 16} />}
    </div>
  );
};

// ── View Modal ──────────────────────────────────────────
const ViewModal = ({ item, onClose, onEdit }) => {
  const rows = [
    { label: "Category",        value: item.category },
    { label: "Mobile",          value: item.mobile   },
    { label: "Address",         value: item.address  },
    { label: "Aadhar",          value: item.aadhar   },
    { label: "PAN",             value: item.pan      },
    { label: "Date of Joining", value: item.doj      },
    { label: "Date of Relieving", value: item.dor    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Coloured top band */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-6 pb-10 text-white">
          <button onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition">
            <X size={14} />
          </button>
          <div className="flex items-center gap-4">
            <Avatar photo={item.photo} name={item.name} size="lg" />
            <div>
              <h2 className="text-lg font-bold">{item.name}</h2>
              <p className="text-sm text-blue-100">{item.category || "—"}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
                ${item.disabled ? "bg-red-500/30 text-red-100" : "bg-green-500/30 text-green-100"}`}>
                {item.disabled ? <><ShieldOff size={11} /> Disabled</> : <><ShieldCheck size={11} /> Active</>}
              </span>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="-mt-6 mx-4 bg-white rounded-xl shadow-md p-4 space-y-3">
          {rows.map(({ label, value }) => value ? (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-medium">{label}</span>
              <span className="text-gray-800 font-semibold text-right max-w-[60%]">{value}</span>
            </div>
          ) : null)}
        </div>

        <div className="flex justify-end gap-3 px-4 py-4">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
            Close
          </button>
          <button onClick={onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow transition">
            Edit
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

// ── Main Component ─────────────────────────────────────
export default function AdminStaffProfile() {
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewItem,  setViewItem]  = useState(null);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [loading,   setLoading]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fileRef  = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => { fetchStaff(); }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────
  const fetchStaff = async () => {
    try {
      const res  = await fetch(API);
      const json = await res.json();
      setStaffList(Array.isArray(json) ? json : []);
    } catch (err) { console.error("FETCH ERR:", err); }
  };

  // ── Modal open/close ───────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setEditId(item._id);
    setViewItem(null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ── Photo → base64 ─────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Save ───────────────────────────────────────────
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
      if (!res.ok) { showToast((await res.json()).message || "Save failed", "error"); return; }
      await fetchStaff();
      closeModal();
      showToast(isEdit ? "Staff updated!" : "Staff added!");
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  // ── Toggle disable (PATCH) ─────────────────────────
  const handleToggle = async (item) => {
    try {
      const res = await fetch(`${API}/${item._id}/toggle`, { method: "PATCH" });
      if (!res.ok) { showToast("Toggle failed", "error"); return; }
      await fetchStaff();
      showToast(`${item.name} ${item.disabled ? "activated" : "disabled"}!`);
    } catch { showToast("Network error", "error"); }
  };

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const res = await fetch(`${API}/${item._id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Delete failed", "error"); return; }
      await fetchStaff();
      showToast("Deleted!");
    } catch { showToast("Network error", "error"); }
  };

  // ── Import Excel → DB → refresh ───────────────────
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

        const clean = rows.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

        const res = await fetch(API, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(clean),
        });
        if (!res.ok) { showToast((await res.json()).message || "Import failed", "error"); return; }

        await fetchStaff();
        showToast(`${clean.length} record(s) imported!`);
      } catch { showToast("Error reading Excel", "error"); }
      finally { setImporting(false); }
    };
    reader.onerror = () => { setImporting(false); showToast("File read error", "error"); };
    reader.readAsArrayBuffer(file);
  };

  // ── Export DB data ─────────────────────────────────
  const exportToExcel = () => {
    if (!staffList.length) { showToast("No data to export", "error"); return; }
    const rows = staffList.map(({ _id, __v, createdAt, updatedAt, photo, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AdminStaff");
    XLSX.writeFile(wb, "admin_staff.xlsx");
    showToast("Exported!");
  };

  // ── Print ──────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Filter ─────────────────────────────────────────
  const displayed = staffList.filter((s) => {
    const mCat    = catFilter === "All"      || s.category === catFilter;
    const mStatus = statusFilter === "All"   || (statusFilter === "Active" ? !s.disabled : s.disabled);
    const mSearch = !search
      || s.name?.toLowerCase().includes(search.toLowerCase())
      || s.mobile?.includes(search)
      || s.category?.toLowerCase().includes(search.toLowerCase());
    return mCat && mStatus && mSearch;
  });

  // ── Render ─────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900 min-h-screen bg-gray-50">

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* View Modal */}
      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => openEdit(viewItem)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Staff Profile</h1>
          <p className="text-sm text-gray-500">Manage non-teaching staff records</p>
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
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm">
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm">
            <Printer size={15} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 shadow-sm items-center">
        <input
          placeholder="Search name, mobile, category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <div className="flex gap-1">
          {["All", "Active", "Disabled"].map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                ${statusFilter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 ml-auto">
          {displayed.length} record{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 min-w-[750px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b">
              <tr>
                {["#", "Staff", "Category", "Mobile", "Joining", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 ${i <= 1 ? "text-left" : "text-center"}`}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <User size={36} className="opacity-20" />
                      <p>No staff found. Click <strong>Add Staff</strong> or <strong>Import</strong>.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((s, i) => (
                  <tr key={s._id}
                    className={`transition ${s.disabled ? "opacity-50 bg-gray-50" : "hover:bg-blue-50/20"}`}>

                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar photo={s.photo} name={s.name} />
                        <span className="font-semibold text-gray-800">{s.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                        {s.category || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center text-gray-600">{s.mobile || "—"}</td>

                    <td className="px-4 py-3 text-center text-xs text-gray-500">{s.doj || "—"}</td>

                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(s)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition
                          ${s.disabled
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                        {s.disabled
                          ? <><ToggleLeft size={13} /> Disabled</>
                          : <><ToggleRight size={13} /> Active</>}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {/* View */}
                        <button onClick={() => setViewItem(s)}
                          className="p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-500 transition" title="View">
                          <Eye size={13} />
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition" title="Edit">
                          <Pencil size={13} />
                        </button>
                        {/* Delete */}
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

      {/* ── Add / Edit Modal ── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl
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

              {/* Photo + Status */}
              <div className="flex items-start gap-5">

                {/* Photo upload */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    onClick={() => photoRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200
                               bg-gray-50 flex items-center justify-center overflow-hidden
                               cursor-pointer hover:border-blue-400 transition"
                  >
                    {form.photo ? (
                      <img src={form.photo} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="text-center">
                        <User size={22} className="text-gray-300 mx-auto" />
                        <span className="text-[9px] text-gray-300 block mt-1">Upload</span>
                      </div>
                    )}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                  {form.photo && (
                    <button onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                      className="text-[10px] text-red-400 hover:text-red-600">Remove</button>
                  )}
                </div>

                {/* Status + Name */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Status</Label>
                    <button
                      onClick={() => setForm((f) => ({ ...f, disabled: !f.disabled }))}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition
                        ${form.disabled
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    >
                      {form.disabled
                        ? <><ShieldOff size={12} /> Disabled</>
                        : <><ShieldCheck size={12} /> Active</>}
                    </button>
                  </div>
                  <div>
                    <Label>Full Name *</Label>
                    <Field icon={User} placeholder="e.g. Rajan Kumar"
                      value={form.name} onChange={set("name")} />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={set("category")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
                >
                  <option value="">— Select Category —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="text-gray-500">{c}</option>)}
                </select>
              </div>

              {/* Mobile */}
              <div>
                <Label>Mobile</Label>
                <Field icon={Phone} type="tel" placeholder="+91 99999 00000"
                  value={form.mobile} onChange={set("mobile")} />
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
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-500
                               bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              </div>

              {/* Identity */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Joining</Label>
                  <Field icon={Calendar} type="date"
                    value={form.doj} onChange={set("doj")} />
                </div>
                <div>
                  <Label>Date of Relieving</Label>
                  <Field icon={Calendar} type="date"
                    value={form.dor} onChange={set("dor")} />
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
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus, Upload, Download, Printer,
  Eye, Pencil, Trash2, X,
  CheckCircle, AlertCircle,
  User, Phone, Mail, MapPin, GraduationCap,
  ToggleLeft, ToggleRight, ShieldCheck, ShieldOff,
} from "lucide-react";

const API = "http://localhost:5000/api/externalstaff";

const EMPTY_FORM = {
  name: "", address: "", mobile: "",
  email: "", qualification: "", disabled: false,
};

// ── Tiny UI helpers ────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
    {children}
  </label>
);

const Field = ({ icon: Icon, textarea, ...props }) => {
  const cls = `w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-900
               bg-white focus:outline-none focus:ring-2 focus:ring-blue-400
               placeholder:text-gray-300 transition
               ${Icon ? "pl-9 pr-3" : "px-3"}
               ${props.disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`;

  return (
    <div className="relative">
      {Icon && (
        <Icon size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
      )}
      {textarea ? (
        <textarea {...props}
          className={cls + " resize-none"}
          rows={2}
        />
      ) : (
        <input {...props} className={cls} />
      )}
    </div>
  );
};

// ── Toast ───────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-2 px-4 py-3
                     rounded-xl shadow-2xl text-sm font-medium
                     ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
};

// ── Avatar initials ─────────────────────────────────────
const Avatar = ({ name, size = "sm" }) => {
  const dim = size === "lg" ? "w-16 h-16 text-2xl" : "w-9 h-9 text-sm";
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-purple-100 to-blue-100
                     flex items-center justify-center shrink-0 font-bold text-purple-500`}>
      {name?.[0]?.toUpperCase() || <User size={size === "lg" ? 24 : 15} />}
    </div>
  );
};

// ── View Modal ──────────────────────────────────────────
const ViewModal = ({ item, onClose, onEdit }) => {
  const rows = [
    { icon: Phone,          label: "Mobile",        value: item.mobile        },
    { icon: Mail,           label: "Email",         value: item.email         },
    { icon: GraduationCap,  label: "Qualification", value: item.qualification },
    { icon: MapPin,         label: "Address",       value: item.address       },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Top band */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-10 text-white">
          <button onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition">
            <X size={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center
                            justify-center text-2xl font-bold text-white shrink-0">
              {item.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{item.name}</h2>
              <p className="text-sm text-purple-100 mt-0.5">{item.qualification || "External Staff"}</p>
              <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold
                ${item.disabled ? "bg-red-500/30 text-red-100" : "bg-green-500/30 text-green-100"}`}>
                {item.disabled
                  ? <><ShieldOff size={10} /> Disabled</>
                  : <><ShieldCheck size={10} /> Active</>}
              </span>
            </div>
          </div>
        </div>

        {/* Info card floated up */}
        <div className="-mt-6 mx-4 bg-white rounded-xl shadow-md p-4 space-y-3">
          {rows.map(({ icon: Icon, label, value }) =>
            value ? (
              <div key={label} className="flex items-start gap-3 text-sm border-b border-gray-50 pb-2 last:border-0">
                <Icon size={14} className="text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">{label}</p>
                  <p className="text-gray-800 font-medium">{value}</p>
                </div>
              </div>
            ) : null
          )}
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
export default function ExternalStaffProfile() {
  const [list,      setList]      = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewItem,  setViewItem]  = useState(null);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [loading,   setLoading]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fileRef = useRef(null);

  useEffect(() => { fetchList(); }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────
  const fetchList = async () => {
    try {
      const res  = await fetch(API);
      const json = await res.json();
      setList(Array.isArray(json) ? json : []);
    } catch (err) { console.error("FETCH ERR:", err); }
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
    setViewItem(null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ── Field helper ───────────────────────────────────
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
      await fetchList();
      closeModal();
      showToast(isEdit ? "Updated successfully!" : "Added successfully!");
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  // ── Toggle status ──────────────────────────────────
  const handleToggle = async (item) => {
    try {
      const res = await fetch(`${API}/${item._id}/toggle`, { method: "PATCH" });
      if (!res.ok) { showToast("Toggle failed", "error"); return; }
      await fetchList();
      showToast(`${item.name} ${item.disabled ? "activated!" : "disabled!"}`);
    } catch { showToast("Network error", "error"); }
  };

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const res = await fetch(`${API}/${item._id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Delete failed", "error"); return; }
      await fetchList();
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

        await fetchList();
        showToast(`${clean.length} record(s) imported!`);
      } catch { showToast("Error reading Excel", "error"); }
      finally { setImporting(false); }
    };
    reader.onerror = () => { setImporting(false); showToast("File read error", "error"); };
    reader.readAsArrayBuffer(file);
  };

  // ── Export DB → Excel ──────────────────────────────
  const exportToExcel = () => {
    if (!list.length) { showToast("No data to export", "error"); return; }
    const rows = list.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ExternalStaff");
    XLSX.writeFile(wb, "external_staff.xlsx");
    showToast("Exported!");
  };

  // ── Filter ─────────────────────────────────────────
  const displayed = list.filter((s) => {
    const mStatus = statusFilter === "All"
      || (statusFilter === "Active" && !s.disabled)
      || (statusFilter === "Disabled" && s.disabled);
    const mSearch = !search
      || s.name?.toLowerCase().includes(search.toLowerCase())
      || s.mobile?.includes(search)
      || s.email?.toLowerCase().includes(search.toLowerCase())
      || s.qualification?.toLowerCase().includes(search.toLowerCase());
    return mStatus && mSearch;
  });

  // ── Render ─────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900 min-h-screen bg-gray-50">

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

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
          <h1 className="text-2xl font-semibold tracking-tight">External Staff Profile</h1>
          <p className="text-sm text-gray-500">Manage external / visiting staff records</p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-gradient-to-r from-purple-600 to-blue-500
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

          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm">
            <Printer size={15} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 shadow-sm items-center">
        <input
          placeholder="Search name, mobile, email, qualification…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]
                     focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="flex gap-1">
          {["All", "Active", "Disabled"].map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                ${statusFilter === f
                  ? "bg-purple-600 text-white border-purple-600"
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
                {["#", "Name", "Mobile", "Email", "Qualification", "Status", "Actions"].map((h, i) => (
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
                      <p>No records found. Click <strong>Add Staff</strong> or <strong>Import</strong>.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((s, i) => (
                  <tr key={s._id}
                    className={`transition ${s.disabled ? "opacity-50 bg-gray-50" : "hover:bg-purple-50/20"}`}>

                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <span className="font-semibold text-gray-800">{s.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center text-gray-600">{s.mobile || "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{s.email || "—"}</td>

                    <td className="px-4 py-3 text-center">
                      {s.qualification ? (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">
                          {s.qualification}
                        </span>
                      ) : "—"}
                    </td>

                    {/* Status toggle */}
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

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setViewItem(s)}
                          className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-500 transition" title="View">
                          <Eye size={13} />
                        </button>
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

      {/* ── Add / Edit Modal ── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl
                          flex flex-col max-h-[90vh]">

            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 rounded-t-2xl bg-white">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editId ? "Edit External Staff" : "Add External Staff"}
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

              {/* Status toggle */}
              <div className="flex items-center gap-3">
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

              {/* Name */}
              <div>
                <Label>Full Name *</Label>
                <Field icon={User} placeholder="e.g. Dr. Anita Raj"
                  value={form.name} onChange={set("name")} />
              </div>

              {/* Mobile */}
              <div>
                <Label>Mobile Number</Label>
                <Field icon={Phone} type="tel" placeholder="+91 99999 00000"
                  value={form.mobile} onChange={set("mobile")} />
              </div>

              {/* Email */}
              <div>
                <Label>Email / Mail ID</Label>
                <Field icon={Mail} type="email" placeholder="example@email.com"
                  value={form.email} onChange={set("email")} />
              </div>

              {/* Qualification */}
              <div>
                <Label>Qualification</Label>
                <Field icon={GraduationCap} placeholder="e.g. M.Sc Nursing, Ph.D"
                  value={form.qualification} onChange={set("qualification")} />
              </div>

              {/* Address */}
              <div>
                <Label>Permanent Address</Label>
                <div className="relative">
                  <MapPin size={14}
                    className="absolute left-3 top-3 text-gray-300 pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder="Door No, Street, City, Pincode"
                    value={form.address}
                    onChange={set("address")}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-500
                               bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
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
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60
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
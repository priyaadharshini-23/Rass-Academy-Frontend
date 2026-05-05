import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus,
  Pencil,
  Trash2,
  Printer,
  Download,
  Upload,
} from "lucide-react";

export default function ClinicalECAManagement() {
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    programme: "",
    count: "",
    subject: "",
    area: "",
    requirements: "",
    from: "",
    to: "",
    staffs: [""],
  });

  const programmes = [
    "ANM",
    "GNM",
    "B.SC NURSING",
    "PBBSC NURSING",
    "MSC NURSING",
    "M.SC N-MSN",
    "M.SC N-OBG",
    "M.SC N-Paed",
    "M.SC N-MHN",
    "M.SC N-CHN",
  ];

  const openAdd = () => {
    setForm({
      programme: "",
      count: "",
      subject: "",
      area: "",
      requirements: "",
      from: "",
      to: "",
      staffs: [""],
    });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    const rec = records[i];
    setForm({
      ...rec,
      staffs: Array.isArray(rec.staffs)
        ? rec.staffs
        : rec.staffs
        ? rec.staffs.split(",")
        : [""],
    });
    setEditIndex(i);
    setShowModal(true);
  };

  const handleStaffChange = (index, value) => {
    const updated = [...form.staffs];
    updated[index] = value;
    setForm({ ...form, staffs: updated });
  };

  const addStaffField = () => {
    setForm({ ...form, staffs: [...form.staffs, ""] });
  };

  const removeStaffField = (index) => {
    const updated = form.staffs.filter((_, i) => i !== index);
    setForm({ ...form, staffs: updated.length ? updated : [""] });
  };

const handleSave = () => {
  if (
    !form.programme ||
    !form.count ||
    !form.subject ||
    !form.area ||
    !form.from ||
    !form.to ||
    form.staffs.some((s) => !s.trim())
  ) {
    alert("Please fill all required fields");
    return;
  }

  if (editIndex !== null) {
    const updated = [...records];
    updated[editIndex] = form;
    setRecords(updated);
  } else {
    setRecords([...records, form]);
  }

  setShowModal(false);
};

  const handleDelete = (i) => {
    setRecords(records.filter((_, index) => index !== i));
  };

  const exportToExcel = () => {
    const formatted = records.map((r) => ({
      ...r,
      staffs: r.staffs.join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clinical & ECA");
    XLSX.writeFile(wb, "clinical_eca_management.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(sheet);

      const fixed = importedData.map((item) => ({
        ...item,
        staffs: item.staffs
          ? item.staffs.split(",").map((s) => s.trim())
          : [""],
      }));

      setRecords(fixed);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Clinical & ECA Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage clinical and ECA records
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            <Plus size={16} /> Add
          </button>

          <label className="p-2 border rounded-lg cursor-pointer bg-white text-gray-900">
            <Upload size={16} />
            <input type="file" hidden onChange={importFromExcel} />
          </label>

          <button onClick={exportToExcel} className="p-2 border rounded-lg bg-white text-gray-900">
            <Download size={16} />
          </button>

          <button onClick={() => window.print()} className="p-2 border rounded-lg bg-white text-gray-900">
            <Printer size={16} />
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm min-w-[900px] text-gray-900">

            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="p-3">Programme</th>
                <th className="p-3">Semester/Year</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Area</th>
                <th className="p-3">Requirements</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Staffs</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500">
                    No records yet
                  </td>
                </tr>
              ) : (
                records.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{item.programme}</td>
                    <td className="p-3">{item.count}</td>
                    <td className="p-3">{item.subject}</td>
                    <td className="p-3">{item.area}</td>
                    <td className="p-3">{item.requirements}</td>
                    <td className="p-3">{item.from}</td>
                    <td className="p-3">{item.to}</td>
                    <td className="p-3">
                      {Array.isArray(item.staffs)
                        ? item.staffs.join(", ")
                        : item.staffs}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => openEdit(i)}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(i)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL (UNCHANGED STRUCTURE — ONLY VISIBILITY FIXED) */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-5xl rounded-2xl p-6 text-gray-900">

              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {editIndex !== null ? "Edit" : "Add"} Record
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-medium text-gray-800">Programme</label>
                  <select
                    value={form.programme}
                    onChange={(e) =>
                      setForm({ ...form, programme: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  >
                    <option value="">Select Programme</option>
                    {programmes.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-800">Semester / Year</label>
                  <input
                    type="number"
                    value={form.count}
                    onChange={(e) =>
                      setForm({ ...form, count: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-800">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-800">Area</label>
                  <select
                    value={form.area}
                    onChange={(e) =>
                      setForm({ ...form, area: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  >
                    <option value="">Select Area</option>
                    <option>Hospital</option>
                    <option>Community</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-800">From Date</label>
                  <input
                    type="date"
                    value={form.from}
                    onChange={(e) =>
                      setForm({ ...form, from: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-800">To Date</label>
                  <input
                    type="date"
                    value={form.to}
                    onChange={(e) =>
                      setForm({ ...form, to: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium text-gray-800">Staffs</label>

                  {form.staffs.map((staff, index) => (
                    <div key={index} className="flex gap-2 mt-1">
                      <input
                        value={staff}
                        onChange={(e) =>
                          handleStaffChange(index, e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                      />
                      <button
                        onClick={() => removeStaffField(index)}
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addStaffField}
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    + Add Staff
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>

            </div>
          </div>,
          document.getElementById("modal-root")
        )}
    </div>
  );
}
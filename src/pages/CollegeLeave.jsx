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

export default function CollegeLeaveManagement() {
  const [showModal, setShowModal] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    date: "",
    from: "",
    to: "",
    holidayType: "",
    customHolidayType: "",
  });

  const holidayTypes = [
    "National Holiday",
    "Festival Holiday",
    "Emergency Leave",
    "Medical Leave",
    "College Holiday",
  ];

  const openAdd = () => {
    setForm({
      date: "",
      from: "",
      to: "",
      holidayType: "",
      customHolidayType: "",
    });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm(leaveData[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    const finalHolidayType =
      form.holidayType === "Others"
        ? form.customHolidayType
        : form.holidayType;

    if (!form.date || !form.from || !form.to || !finalHolidayType) return;

    const payload = {
      ...form,
      holidayType: finalHolidayType,
    };

    if (editIndex !== null) {
      const updated = [...leaveData];
      updated[editIndex] = payload;
      setLeaveData(updated);
    } else {
      setLeaveData([...leaveData, payload]);
    }

    setShowModal(false);
  };

  const handleDelete = (i) => {
    setLeaveData(leaveData.filter((_, index) => index !== i));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(leaveData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Management");
    XLSX.writeFile(wb, "leave_management.xlsx");
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
      setLeaveData(importedData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-800">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            College Leave Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage leave and holidays
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-gradient-to-r from-blue-600 to-cyan-500 
                       text-white shadow-lg hover:scale-[1.04] transition"
          >
            <Plus size={16} /> Add
          </button>

          <label className="p-2 border rounded-lg bg-white shadow-sm cursor-pointer hover:bg-gray-50">
            <Upload size={16} />
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={importFromExcel}
            />
          </label>

          <button
            onClick={exportToExcel}
            className="p-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-800 min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">From</th>
                <th className="p-3 text-center">To</th>
                <th className="p-3 text-center">Type of Holiday</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {leaveData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    No leave records yet
                  </td>
                </tr>
              ) : (
                leaveData.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{item.date}</td>
                    <td className="p-3 text-center">{item.from}</td>
                    <td className="p-3 text-center">{item.to}</td>
                    <td className="p-3 text-center">{item.holidayType}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(i)}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
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

      {/* MODAL */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex justify-center items-start sm:items-center p-4 overflow-y-auto">
              <div
                className="w-full max-w-md bg-white rounded-2xl 
                           shadow-[0_25px_80px_rgba(0,0,0,0.3)]"
              >
                <div className="p-5 space-y-4 text-gray-800">
                  <h2 className="text-lg font-semibold">
                    {editIndex !== null ? "Edit Leave" : "Add Leave"}
                  </h2>

                  {/* Date */}
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* From / To */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">From</label>
                      <input
                        type="date"
                        value={form.from}
                        onChange={(e) =>
                          setForm({ ...form, from: e.target.value })
                        }
                        className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">To</label>
                      <input
                        type="date"
                        value={form.to}
                        onChange={(e) =>
                          setForm({ ...form, to: e.target.value })
                        }
                        className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Holiday Type */}
                  <div>
                    <label className="text-sm font-medium">
                      Type of Holiday
                    </label>
                    <select
                      value={form.holidayType}
                      onChange={(e) =>
                        setForm({ ...form, holidayType: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                    >
                      <option value="">Select Holiday Type</option>
                      {holidayTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                      <option value="Others">Others</option>
                    </select>

                    {form.holidayType === "Others" && (
                      <input
                        type="text"
                        placeholder="Enter Holiday Type"
                        value={form.customHolidayType}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            customHolidayType: e.target.value,
                          })
                        }
                        className="mt-2 w-full p-3 border rounded-lg bg-gray-50"
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-3 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.getElementById("modal-root")
        )}
    </div>
  );
}
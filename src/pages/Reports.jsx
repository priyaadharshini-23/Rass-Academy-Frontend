import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus,
  Upload,
  Download,
  Printer,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ReportsModule() {
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    staff: "",
    lectureHour: "",
    labHour: "",
    clinicalHour: "",
    date: "",
  });

  const openAdd = () => {
    setForm({
      staff: "",
      lectureHour: "",
      labHour: "",
      clinicalHour: "",
      date: "",
    });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm(reports[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.staff) return;

    if (editIndex !== null) {
      const updated = [...reports];
      updated[editIndex] = form;
      setReports(updated);
    } else {
      setReports([...reports, form]);
    }

    setShowModal(false);
  };

  const handleDelete = (i) => {
    setReports(reports.filter((_, index) => index !== i));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "reports.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setReports(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-800">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reports Module
          </h1>
          <p className="text-sm text-gray-500">
            Staff Lecture / Lab / Clinical Hours
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
              hidden
              accept=".xlsx,.xls"
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
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Staff</th>
                <th className="p-3">Lecture Hour</th>
                <th className="p-3">Lab Hour</th>
                <th className="p-3">Clinical Hour</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No reports yet
                  </td>
                </tr>
              ) : (
                reports.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{r.staff}</td>
                    <td className="p-3 text-center">{r.lectureHour}</td>
                    <td className="p-3 text-center">{r.labHour}</td>
                    <td className="p-3 text-center">{r.clinicalHour}</td>
                    <td className="p-3 text-center">{r.date}</td>

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
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex justify-center items-start sm:items-center p-4 overflow-y-auto">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
                <div className="p-5 space-y-4 text-gray-800">

                  <h2 className="text-lg font-semibold">
                    {editIndex !== null ? "Edit Report" : "Add Report"}
                  </h2>

                  {/* Staff */}
                  <div>
                    <label className="text-sm font-medium">Staff</label>
                    <input
                      type="text"
                      value={form.staff}
                      onChange={(e) =>
                        setForm({ ...form, staff: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* Lecture */}
                  <div>
                    <label className="text-sm font-medium">Lecture Hour</label>
                    <input
                      type="number"
                      value={form.lectureHour}
                      onChange={(e) =>
                        setForm({ ...form, lectureHour: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* Lab */}
                  <div>
                    <label className="text-sm font-medium">Lab Hour</label>
                    <input
                      type="number"
                      value={form.labHour}
                      onChange={(e) =>
                        setForm({ ...form, labHour: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* Clinical */}
                  <div>
                    <label className="text-sm font-medium">Clinical Hour</label>
                    <input
                      type="number"
                      value={form.clinicalHour}
                      onChange={(e) =>
                        setForm({ ...form, clinicalHour: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>

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

                  {/* Buttons */}
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
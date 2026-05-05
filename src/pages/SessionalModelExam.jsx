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

export default function SessionalModelExamManagement() {
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    programme: "",
    count: "",
    subject: "",
    staff: "",
    from: "",
    examTime: "",
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
      staff: "",
      from: "",
      examTime: "",
    });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm(records[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    if (
      !form.programme ||
      !form.count ||
      !form.subject ||
      !form.staff ||
      !form.from ||
      !form.examTime
    )
      return;

    if (editIndex !== null) {
      const updated = [...records];
      updated[editIndex] = form;
      setRecords(updated);
    } else {
      setRecords([...records, form]);
    }

    setShowModal(false);
    setEditIndex(null);
  };

  const handleDelete = (i) => {
    setRecords(records.filter((_, index) => index !== i));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sessional_Model_Exam");
    XLSX.writeFile(wb, "sessional_model_exam.xlsx");
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
      setRecords(importedData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Sessional / Model Exam Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage exam schedules
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white">
            <Plus size={16} /> Add
          </button>

          <label className="p-2 border rounded-lg bg-white cursor-pointer">
            <Upload size={16} />
            <input type="file" hidden onChange={importFromExcel} />
          </label>

          <button onClick={exportToExcel} className="p-2 border rounded-lg bg-white">
            <Download size={16} />
          </button>

          <button onClick={() => window.print()} className="p-2 border rounded-lg bg-white">
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 min-w-[900px]">

            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Programme</th>
                <th className="p-3">Semester/Year</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Staff</th>
                <th className="p-3">Date</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No exam records yet
                  </td>
                </tr>
              ) : (
                records.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.programme}</td>
                    <td className="p-3">{item.count}</td>
                    <td className="p-3">{item.subject}</td>
                    <td className="p-3">{item.staff}</td>
                    <td className="p-3">{item.from}</td>
                    <td className="p-3">{item.examTime}</td>
                    <td className="p-3 flex justify-center gap-2">
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

      {/* MODAL */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] text-gray-900">

            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex justify-center items-start sm:items-center p-6 overflow-y-auto">

              <div className="w-full sm:max-w-xl md:max-w-2xl bg-white text-gray-900 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto my-6">

                {/* TITLE */}
                <div className="p-5 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sessional / Model / University Exam
                  </h2>
                </div>

                <div className="p-5 space-y-5 text-gray-900">

                  {/* PROGRAMME */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">Programme</label>
                    <select
                      value={form.programme}
                      onChange={(e) =>
                        setForm({ ...form, programme: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
                    >
                      <option value="">Scroll Down</option>
                      {programmes.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* SEMESTER */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      No. of Semester / No. of Year
                    </label>
                    <input
                      type="number"
                      value={form.count}
                      onChange={(e) =>
                        setForm({ ...form, count: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  {/* SUBJECT */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">Exam Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  {/* STAFF */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">Staff</label>
                    <input
                      type="text"
                      value={form.staff}
                      onChange={(e) =>
                        setForm({ ...form, staff: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  {/* DATE */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">Date</label>
                    <input
                      type="date"
                      value={form.from}
                      onChange={(e) =>
                        setForm({ ...form, from: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  {/* HOURS */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">Hours</label>

                    <div className="mt-2 space-y-2 text-gray-900">

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="examTime"
                          value="9:30 AM - 1:30 PM"
                          checked={form.examTime === "9:30 AM - 1:30 PM"}
                          onChange={(e) =>
                            setForm({ ...form, examTime: e.target.value })
                          }
                        />
                        9:30 AM - 1:30 PM
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="examTime"
                          value="12:30 PM - 4:30 PM"
                          checked={form.examTime === "12:30 PM - 4:30 PM"}
                          onChange={(e) =>
                            setForm({ ...form, examTime: e.target.value })
                          }
                        />
                        12:30 PM - 4:30 PM
                      </label>

                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-3 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
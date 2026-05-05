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

export default function ExamManagement() {
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    examType: "",
    programme: "",
    count: "",
    subject: "",
    staff: "",
    date: "",
    time: "",
  });

  const programmes = [
    "ANM","GNM","B.SC NURSING","PBBSC NURSING","MSC NURSING",
    "M.SC N-MSN","M.SC N-OBG","M.SC N-Paed","M.SC N-MHN","M.SC N-CHN",
  ];

  const openAdd = () => {
    setForm({
      examType: "",
      programme: "",
      count: "",
      subject: "",
      staff: "",
      date: "",
      time: "",
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
      !form.examType ||
      !form.programme ||
      !form.count ||
      !form.subject ||
      !form.date ||
      !form.time
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
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam");
    XLSX.writeFile(wb, "exam_management.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const imported = XLSX.utils.sheet_to_json(sheet);

      const fixed = imported.map((item) => ({
        examType: item.ExamType || "",
        programme: item.Programme || "",
        count: item.Count || "",
        subject: item.Subject || "",
        staff: item.Staff || "",
        date: item.Date || "",
        time: item.Time || "",
      }));

      setRecords(fixed);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gray-50 min-h-screen text-gray-900">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Exam Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage Sessional / Model / University Exams
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
                <th className="p-3">Exam</th>
                <th className="p-3">Programme</th>
                <th className="p-3">Semester/Year</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Staff</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No records yet
                  </td>
                </tr>
              ) : (
                records.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{item.examType}</td>
                    <td className="p-3">{item.programme}</td>
                    <td className="p-3">{item.count}</td>
                    <td className="p-3">{item.subject}</td>
                    <td className="p-3">{item.staff}</td>
                    <td className="p-3">{item.date}</td>
                    <td className="p-3">{item.time}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => openEdit(i)}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(i)}>
                        <Trash2 size={14} className="text-red-500" />
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-4xl rounded-2xl p-6 text-gray-900">

              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {editIndex !== null ? "Edit" : "Add"} Exam
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="text-sm text-gray-700">Exam Type</label>
                  <select
                    value={form.examType}
                    onChange={(e) =>
                      setForm({ ...form, examType: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  >
                    <option value="">Select</option>
                    <option>Sessional</option>
                    <option>Model</option>
                    <option>University</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700">Programme</label>
                  <select
                    value={form.programme}
                    onChange={(e) =>
                      setForm({ ...form, programme: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  >
                    <option value="">Select</option>
                    {programmes.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700">Semester / Year</label>
                  <input
                    type="number"
                    value={form.count}
                    onChange={(e) =>
                      setForm({ ...form, count: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Staff</label>
                  <input
                    value={form.staff}
                    onChange={(e) =>
                      setForm({ ...form, staff: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Time Slot</label>
                  <select
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    className="w-full border p-2 rounded bg-white text-gray-900"
                  >
                    <option value="">Select</option>
                    <option>9:30 AM - 12:30 PM</option>
                    <option>1:30 PM - 4:30 PM</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 border rounded" onClick={() => setShowModal(false)}>
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
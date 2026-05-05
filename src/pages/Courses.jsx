import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import {
  Plus,
  Upload,
  Download,
  Printer,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function Courses() {
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    programme: "",
    year: "",
    month: "",
    semester: "",
    count: "",
  });

  const API = "http://localhost:5000/api/courses";

  const openAdd = () => {
    setForm({
      programme: "",
      year: "",
      month: "",
      semester: "",
      count: "",
    });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm(courses[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  const handleSave = async () => {
    if (!form.programme || form.programme.trim() === "") {
      alert("Programme is required");
      return;
    }

    console.log("SENDING DATA:", form);

    try {
      let res;

      if (editIndex !== null) {
        const id = courses[editIndex]._id;
        res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const result = await res.json();
      console.log("SERVER RESPONSE:", result);

      if (!res.ok) {
        alert("Save failed");
        return;
      }

      fetchCourses();
      setShowModal(false);

    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Error saving data");
    }
  };

  const handleDelete = async (i) => {
    try {
      await fetch(`${API}/${courses[i]._id}`, {
        method: "DELETE",
      });
      fetchCourses();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(courses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Courses");
    XLSX.writeFile(wb, "courses.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("IMPORT DATA:", jsonData);

      try {
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonData),
        });

        fetchCourses();
      } catch (err) {
        console.error("IMPORT ERROR:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900">

      <div className="flex flex-wrap justify-between items-center gap-3">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Programme Manager
          </h1>
          <p className="text-sm text-gray-600">
            Add and manage programmes
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
            <input type="file" hidden onChange={importFromExcel} />
          </label>

          <button onClick={exportToExcel} className="p-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50">
            <Download size={16} />
          </button>

          <button onClick={() => window.print()} className="p-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50">
            <Printer size={16} />
          </button>

        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 min-w-[600px]">

            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">S.No</th>
                <th className="p-3 text-left">Programme</th>
                <th className="p-3 text-center">Years</th>
                <th className="p-3 text-center">Months</th>
                <th className="p-3 text-center">Semester</th>
                <th className="p-3 text-center">Count</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No programmes yet
                  </td>
                </tr>
              ) : (
                courses.map((c, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{i + 1}</td>
                    <td className="p-3 font-semibold">{c.programme}</td>
                    <td className="p-3 text-center">{c.year}</td>
                    <td className="p-3 text-center">{c.month}</td>
                    <td className="p-3 text-center">{c.semester}</td>
                    <td className="p-3 text-center">{c.count}</td>

                    <td className="p-3 flex justify-center gap-2">
                      <button onClick={() => openEdit(i)} className="p-1 hover:bg-blue-100 rounded">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(i)} className="p-1 hover:bg-red-100 rounded">
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

      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">

            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex justify-center items-start sm:items-center p-4 overflow-y-auto">

              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl relative">

                {/* 🔴 RED CLOSE BUTTON */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <X size={16} />
                </button>

                <div className="p-5 space-y-4 text-gray-900">

                  <h2 className="text-lg font-semibold">
                    {editIndex !== null ? "Edit Programme" : "Add Programme"}
                  </h2>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Programme Name
                    </label>
                    <input
                      type="text"
                      value={form.programme}
                      onChange={(e) =>
                        setForm({ ...form, programme: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        placeholder="Years"
                        value={form.year}
                        onChange={(e) =>
                          setForm({ ...form, year: e.target.value })
                        }
                        className="w-1/2 p-3 border rounded-lg bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Months"
                        value={form.month}
                        onChange={(e) =>
                          setForm({ ...form, month: e.target.value })
                        }
                        className="w-1/2 p-3 border rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Semester
                    </label>
                    <div className="flex gap-2 mt-2">
                      {["Yes", "No"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setForm({ ...form, semester: opt })}
                          className={`flex-1 p-2 border rounded-lg ${form.semester === opt
                            ? "bg-blue-600 text-white"
                            : "bg-white"
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {form.semester === "Yes"
                        ? "No. of Semesters"
                        : "No. of Years"}
                    </label>
                    <input
                      type="number"
                      value={form.count}
                      onChange={(e) =>
                        setForm({ ...form, count: e.target.value })
                      }
                      className="mt-1 w-full p-3 border rounded-lg bg-white"
                    />
                  </div>

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
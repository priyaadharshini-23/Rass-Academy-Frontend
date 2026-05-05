import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function RankModule() {
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [filter, setFilter] = useState({
    programme: "",
    academicYear: "",
    semester: "",
  });

  const emptyForm = {
    programme: "",
    academicYear: "",
    semester: "",
    sno: "",
    studentName: "",
    subCode: "",
    subject: "",
    examType: "",
    internal: "",
    total: "",
    creditPoints: "",
    gradePoints: "",
    cpGp: "",
    grade: "",
    sgpa: "",
    cgpa: "",
  };

  const [form, setForm] = useState(emptyForm);

  const programmes = [
    "ANM","GNM","B.SC NURSING","PBBSC NURSING","MSC NURSING",
    "M.SC N-MSN","M.SC N-OBG","M.SC N-Paed","M.SC N-MHN","M.SC N-CHN",
  ];

  const openAdd = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm(records[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.studentName) return;

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
    setRecords(records.filter((_, idx) => idx !== i));
  };

  const filteredRecords = records.filter((r) => {
    return (
      (!filter.programme || r.programme === filter.programme) &&
      (!filter.academicYear || r.academicYear === filter.academicYear) &&
      (!filter.semester || r.semester === filter.semester)
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-800">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            University Mark Entry & Rank
          </h1>
          <p className="text-sm text-gray-500">
            Filter by Programme / Year / Semester
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow">
        <select
          className="border p-2 rounded"
          value={filter.programme}
          onChange={(e) =>
            setFilter({ ...filter, programme: e.target.value })
          }
        >
          <option value="">All Programme</option>
          {programmes.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <input
          placeholder="Academic Year"
          className="border p-2 rounded"
          value={filter.academicYear}
          onChange={(e) =>
            setFilter({ ...filter, academicYear: e.target.value })
          }
        />

        <input
          placeholder="Semester / Year"
          className="border p-2 rounded"
          value={filter.semester}
          onChange={(e) =>
            setFilter({ ...filter, semester: e.target.value })
          }
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Student</th>
              <th className="p-3">Sub Code</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Exam Type</th>
              <th className="p-3">Internal</th>
              <th className="p-3">Total</th>
              <th className="p-3">Credit</th>
              <th className="p-3">Grade Pt</th>
              <th className="p-3">C.P*G.P</th>
              <th className="p-3">Grade</th>
              <th className="p-3">SGPA</th>
              <th className="p-3">CGPA</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="14" className="text-center p-6 text-gray-400">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{r.sno}</td>
                  <td className="p-2">{r.studentName}</td>
                  <td className="p-2">{r.subCode}</td>
                  <td className="p-2">{r.subject}</td>
                  <td className="p-2">{r.examType}</td>
                  <td className="p-2">{r.internal}</td>
                  <td className="p-2">{r.total}</td>
                  <td className="p-2">{r.creditPoints}</td>
                  <td className="p-2">{r.gradePoints}</td>
                  <td className="p-2">{r.cpGp}</td>
                  <td className="p-2">{r.grade}</td>
                  <td className="p-2">{r.sgpa}</td>
                  <td className="p-2">{r.cgpa}</td>

                  <td className="p-2 flex gap-2">
                    <button onClick={() => openEdit(i)} className="text-blue-600">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(i)} className="text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* MODAL (FIXED - FULL FIELDS + LABELS + VISIBILITY) */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] text-gray-800">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex justify-center items-start sm:items-center p-4 overflow-y-auto">

              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl text-gray-800">

                <div className="p-5 space-y-3 max-h-[85vh] overflow-y-auto text-gray-800">

                  <h2 className="text-lg font-semibold">
                    {editIndex !== null ? "Edit Entry" : "Add Entry"}
                  </h2>

                  {/* PROGRAMME */}
                  <label>Programme</label>
                  <select
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.programme}
                    onChange={(e) =>
                      setForm({ ...form, programme: e.target.value })
                    }
                  >
                    <option value="">Select Programme</option>
                    {programmes.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>

                  {/* ACADEMIC + SEMESTER */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label>Academic Year</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.academicYear}
                        onChange={(e) =>
                          setForm({ ...form, academicYear: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label>Semester</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.semester}
                        onChange={(e) =>
                          setForm({ ...form, semester: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* SNO */}
                  <label>S.No</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.sno}
                    onChange={(e) =>
                      setForm({ ...form, sno: e.target.value })
                    }
                  />

                  {/* STUDENT */}
                  <label>Student Name</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.studentName}
                    onChange={(e) =>
                      setForm({ ...form, studentName: e.target.value })
                    }
                  />

                  {/* SUBJECT */}
                  <label>Sub Code</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.subCode}
                    onChange={(e) =>
                      setForm({ ...form, subCode: e.target.value })
                    }
                  />

                  <label>Subject</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                  />

                  <label>Exam Type</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.examType}
                    onChange={(e) =>
                      setForm({ ...form, examType: e.target.value })
                    }
                  />

                  {/* MARKS */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label>Internal</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.internal}
                        onChange={(e) =>
                          setForm({ ...form, internal: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label>Total</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.total}
                        onChange={(e) =>
                          setForm({ ...form, total: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* CREDITS */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label>Credit Points</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.creditPoints}
                        onChange={(e) =>
                          setForm({ ...form, creditPoints: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label>Grade Points</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.gradePoints}
                        onChange={(e) =>
                          setForm({ ...form, gradePoints: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* CP GP */}
                  <label>C.P * G.P</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.cpGp}
                    onChange={(e) =>
                      setForm({ ...form, cpGp: e.target.value })
                    }
                  />

                  {/* GRADE + SGPA */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label>Grade</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.grade}
                        onChange={(e) =>
                          setForm({ ...form, grade: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label>SGPA</label>
                      <input
                        className="w-full p-3 border rounded-lg text-gray-800"
                        value={form.sgpa}
                        onChange={(e) =>
                          setForm({ ...form, sgpa: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* CGPA */}
                  <label>CGPA</label>
                  <input
                    className="w-full p-3 border rounded-lg text-gray-800"
                    value={form.cgpa}
                    onChange={(e) =>
                      setForm({ ...form, cgpa: e.target.value })
                    }
                  />

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-2 pt-2">
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
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ExamMarkModule() {
  const programmes = [
    "B.SC NURSING",
    "PBBSC NURSING",
    "MSC NURSING",
    "M.SC N-MSN",
    "M.SC N-OBG",
    "M.SC N-Paed",
    "M.SC N-MHN",
    "M.SC N-CHN",
  ];

  const examTypes = [
    "Unit Exam",
    "Sessional Exam I",
    "Sessional Exam II",
    "Sessional Exam III",
    "Model Exam",
  ];

  const [form, setForm] = useState({
    programme: "",
    academicYear: "",
    semester: "",
    subject: "",
    examType: "",
    maxMarks: "",
  });

  const [students, setStudents] = useState([
    { sno: 1, name: "", marks: "" },
    { sno: 2, name: "", marks: "" },
    { sno: 3, name: "", marks: "" },
    { sno: 4, name: "", marks: "" },
    { sno: 5, name: "", marks: "" },
  ]);

  const addRow = () => {
    setStudents([
      ...students,
      { sno: students.length + 1, name: "", marks: "" },
    ]);
  };

  const deleteRow = (index) => {
    const updated = students.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, sno: i + 1 }));
    setStudents(updated);
  };

  const handleChange = (i, field, value) => {
    const updated = [...students];
    updated[i][field] = value;
    setStudents(updated);
  };

  const handleSave = () => {
    console.log({
      ...form,
      students: students.filter((s) => s.name),
    });
    alert("Saved Successfully");
  };

  return (
    <div className="p-6 space-y-6 text-gray-800">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Exam Mark Entry</h1>

      {/* FORM */}
      <div className="grid md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow">

        <select
          className="border p-2 rounded bg-white text-gray-800"
          value={form.programme}
          onChange={(e) =>
            setForm({ ...form, programme: e.target.value })
          }
        >
          <option value="">Programme</option>
          {programmes.map((p) => <option key={p}>{p}</option>)}
        </select>

        <input
          placeholder="Academic Year"
          className="border p-2 rounded bg-white text-gray-800"
          value={form.academicYear}
          onChange={(e) =>
            setForm({ ...form, academicYear: e.target.value })
          }
        />

        <input
          placeholder="Semester / Year"
          className="border p-2 rounded bg-white text-gray-800"
          value={form.semester}
          onChange={(e) =>
            setForm({ ...form, semester: e.target.value })
          }
        />

        <input
          placeholder="Subject"
          className="border p-2 rounded bg-white text-gray-800"
          value={form.subject}
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        />

        <select
          className="border p-2 rounded bg-white text-gray-800"
          value={form.examType}
          onChange={(e) =>
            setForm({ ...form, examType: e.target.value })
          }
        >
          <option value="">Exam Type</option>
          {examTypes.map((e) => <option key={e}>{e}</option>)}
        </select>

        <input
          placeholder="Max Marks"
          className="border p-2 rounded bg-white text-gray-800"
          value={form.maxMarks}
          onChange={(e) =>
            setForm({ ...form, maxMarks: e.target.value })
          }
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">S.No</th>
              <th className="p-2">Student Name</th>
              <th className="p-2">
                Marks ( / {form.maxMarks || "___"} )
              </th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 text-center">{s.sno}</td>

                <td className="p-2">
                  <input
                    className="w-full border p-1 rounded bg-white text-gray-800"
                    value={s.name}
                    onChange={(e) =>
                      handleChange(i, "name", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    className="w-full border p-1 rounded bg-white text-gray-800"
                    value={s.marks}
                    onChange={(e) =>
                      handleChange(i, "marks", e.target.value)
                    }
                  />
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteRow(i)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between">
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          <Plus size={16} /> Add Row
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
}
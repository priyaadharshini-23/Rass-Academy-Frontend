import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Plus, Upload, Download, Printer, Pencil, Trash2 } from "lucide-react";

export default function Syllabus() {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [filterProgramme, setFilterProgramme] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");
  const [search, setSearch] = useState("");

  const emptyForm = {
    programme: "",
    type: "Semester",
    levelName: "",
    subject: "",
    units: []
  };

  const [form, setForm] = useState(emptyForm);

  const programmes = [
    "ANM", "GNM", "B.SC NURSING", "PBBSC NURSING", "MSC NURSING",
    "M.SC N-MSN", "M.SC N-OBG", "M.SC N-Paed", "M.SC N-MHN", "M.SC N-CHN"
  ];

  /* ---------------- SAVE ---------------- */
  const handleSave = () => {
    if (!form.programme) return;

    if (editIndex !== null) {
      const updated = [...data];
      updated[editIndex] = form;
      setData(updated);
    } else {
      setData([...data, form]);
    }

    setForm(emptyForm);
    setShowModal(false);
    setEditIndex(null);
  };

  /* ---------------- UNIT ---------------- */
  const addUnit = () => {
    setForm({
      ...form,
      units: [
        ...form.units,
        {
          unitNumber: "",
          unitName: "",
          speciality: "", 
          content: "",
          lectureHours: "",
          labHours: "",
          unitExam: "No"
        }
      ]
    });
  };

  const updateUnit = (i, field, value) => {
    const updated = [...form.units];
    updated[i][field] = value;
    setForm({ ...form, units: updated });
  };

  const removeUnit = (i) => {
    setForm({
      ...form,
      units: form.units.filter((_, idx) => idx !== i)
    });
  };

  /* ---------------- EXPORT ---------------- */
  const exportToExcel = () => {
    const exportData = data.map((item) => ({
      ...item,
      units: JSON.stringify(item.units || [])
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Syllabus");
    XLSX.writeFile(wb, "syllabus.xlsx");
  };

  /* ---------------- IMPORT ---------------- */
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const structured = [];

      rows.forEach((row) => {
        const programme = row.Programme || "";
        const semester = String(row.Semester || "");
        const subject = row.Subject || "";

        let subjectObj = structured.find(
          (s) =>
            s.programme === programme &&
            s.levelName === semester &&
            s.subject === subject
        );

        if (!subjectObj) {
          subjectObj = {
            programme,
            type: row.Type || "Semester",
            levelName: semester,
            subject,
            units: []
          };
          structured.push(subjectObj);
        }

        let unitObj = subjectObj.units.find(
          (u) => String(u.unitNumber) === String(row.Unit)
        );

        if (!unitObj) {
          unitObj = {
            unitNumber: row.Unit || "",
            unitName: row.UnitName || "",
            speciality: row.Category || "", // ✅ category fixed
            content: "",
            lectureHours: 0,
            labHours: 0,
            unitExam: row.UnitExam || "No"
          };
          subjectObj.units.push(unitObj);
        }

        if (row.Topic) {
          unitObj.content += (unitObj.content ? "\n" : "") + row.Topic;
        }

        unitObj.lectureHours += Number(row.LectureHours || 0);
        unitObj.labHours += Number(row.LabHours || 0);
      });

      setData(structured);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------------- FILTER ---------------- */
  const filteredData = data.filter((item) => {
    const matchProgramme =
      filterProgramme === "All" || item.programme === filterProgramme;

    const matchSemester =
      filterSemester === "All" || item.levelName === filterSemester;

    const matchSearch =
      item.subject?.toLowerCase().includes(search.toLowerCase());

    return matchProgramme && matchSemester && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">
          Syllabus Management
        </h1>

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() => {
              setForm(emptyForm);
              setShowModal(true);
              setEditIndex(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            <Plus size={16} /> Add
          </button>

          <label className="p-2 border rounded bg-white cursor-pointer">
            <Upload size={16} />
            <input type="file" hidden onChange={importFromExcel} />
          </label>

          <button onClick={exportToExcel} className="p-2 border rounded bg-white">
            <Download size={16} />
          </button>

          <button onClick={() => window.print()} className="p-2 border rounded bg-white">
            <Printer size={16} />
          </button>

        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border flex flex-wrap gap-3">

        <select
          value={filterProgramme}
          onChange={(e) => setFilterProgramme(e.target.value)}
          className="border p-2 rounded text-gray-900 bg-white"
        >
          <option value="All">All Programmes</option>
          {programmes.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <input
          placeholder="Search Subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1 min-w-[200px] text-gray-900 bg-white"
        />

        <input
          placeholder="Semester / Year"
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="border p-2 rounded text-gray-900 bg-white"
        />

      </div>

      {/* SYLLABUS VIEW */}
      <div className="space-y-6">

        {filteredData.length === 0 ? (
          <div className="bg-white border rounded p-6 text-center text-gray-500">
            No syllabus found
          </div>
        ) : (
          Object.entries(
            filteredData.reduce((acc, item) => {
              const prog = item.programme || "Unknown Programme";
              const sem = item.levelName || "Unknown Semester";

              if (!acc[prog]) acc[prog] = {};
              if (!acc[prog][sem]) acc[prog][sem] = [];

              acc[prog][sem].push(item);
              return acc;
            }, {})
          ).map(([programme, semesters]) => (
            <div key={programme} className="bg-white border rounded-xl p-5">

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {programme}
              </h2>

              {Object.entries(semesters).map(([semester, subjects]) => (
                <div key={semester} className="mb-6">

                  {/* ✅ FIXED LABEL */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {subjects[0]?.type} {semester}
                  </h3>

                  {subjects.map((d) => (
                    <div
                      key={data.indexOf(d)}
                      className="border rounded-lg p-4 mb-4 bg-white"
                    >

                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900">
                          📖 {d.subject}
                        </h4>

                        <div className="flex gap-2">

                          <button
                            onClick={() => {
                              setForm(d);
                              setEditIndex(data.indexOf(d));
                              setShowModal(true);
                            }}
                          >
                            <Pencil size={16} className="text-blue-600" />
                          </button>

                          <button
                            onClick={() =>
                              setData(data.filter((_, idx) => idx !== data.indexOf(d)))
                            }
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>

                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {d.units?.length ? (
                          d.units.map((u, i) => (
                            <div
                              key={i}
                              className="border rounded p-3 bg-gray-50"
                            >
                              <div className="font-semibold text-gray-900">
                                Unit {u.unitNumber}: {u.unitName}
                              </div>

                              {/* ✅ CATEGORY DISPLAY */}
                              {u.speciality && (
                                <div className="font-semibold text-gray-600">
                                  Category: {u.speciality}
                                </div>
                              )}

                              <div className="text-gray-700 text-sm mt-1">
                                {u.content}
                              </div>

                              <div className="text-xs text-gray-600 mt-1">
                                Lecture: {u.lectureHours} | Lab: {u.labHours} | Exam: {u.unitExam}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-sm">
                            No units
                          </div>
                        )}
                      </div>

                    </div>
                  ))}

                </div>
              ))}

            </div>
          ))
        )}

      </div>

      {/* MODAL */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">

              <div className="bg-white w-full max-w-4xl p-6 rounded-xl max-h-[90vh] overflow-y-auto text-gray-900">

                <h2 className="text-xl font-bold mb-4">
                  Syllabus Form
                </h2>

                <select
                  value={form.programme}
                  onChange={(e) =>
                    setForm({ ...form, programme: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="">Select Programme</option>
                  {programmes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-3"
                >
                  <option>Semester</option>
                  <option>Year</option>
                </select>

                <input
                  value={form.levelName}
                  onChange={(e) =>
                    setForm({ ...form, levelName: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-3"
                  placeholder="Semester / Year Name"
                />

                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-3"
                  placeholder="Subject"
                />

                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Units</h3>

                  <button
                    onClick={addUnit}
                    className="text-blue-600 text-sm"
                  >
                    + Add Unit
                  </button>
                </div>

                {form.units.map((u, i) => (
                  <div key={i} className="border p-3 rounded mb-3 bg-gray-50">

                    <input
                      placeholder="Unit Number"
                      value={u.unitNumber}
                      onChange={(e) =>
                        updateUnit(i, "unitNumber", e.target.value)
                      }
                      className="w-full p-2 border rounded mb-2"
                    />

                    <input
                      placeholder="Unit Name"
                      value={u.unitName}
                      onChange={(e) =>
                        updateUnit(i, "unitName", e.target.value)
                      }
                      className="w-full p-2 border rounded mb-2"
                    />

                    {/* ✅ CATEGORY INPUT */}
                    <input
                      placeholder="Category"
                      value={u.speciality}
                      onChange={(e) =>
                        updateUnit(i, "speciality", e.target.value)
                      }
                      className="w-full p-2 border rounded mb-2"
                    />

                    <textarea
                      placeholder="Content"
                      value={u.content}
                      onChange={(e) =>
                        updateUnit(i, "content", e.target.value)
                      }
                      className="w-full p-2 border rounded mb-2"
                    />

                    <div className="grid grid-cols-2 gap-2">

                      <input
                        placeholder="Lecture Hours"
                        value={u.lectureHours}
                        onChange={(e) =>
                          updateUnit(i, "lectureHours", e.target.value)
                        }
                        className="p-2 border rounded"
                      />

                      <input
                        placeholder="Lab Hours"
                        value={u.labHours}
                        onChange={(e) =>
                          updateUnit(i, "labHours", e.target.value)
                        }
                        className="p-2 border rounded"
                      />

                    </div>

                    <select
                      value={u.unitExam}
                      onChange={(e) =>
                        updateUnit(i, "unitExam", e.target.value)
                      }
                      className="w-full p-2 border rounded mt-2"
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>

                    <button
                      onClick={() => removeUnit(i)}
                      className="text-red-500 text-xs mt-2"
                    >
                      Remove Unit
                    </button>

                  </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">

                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    className="px-5 py-2 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>

                </div>

              </div>
            </div>
          </div>,
          document.getElementById("modal-root")
        )}

    </div>
  );
}
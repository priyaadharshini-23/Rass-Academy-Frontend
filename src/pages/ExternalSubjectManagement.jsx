import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Plus, Upload, Download, Printer, Edit, Trash2, X } from "lucide-react";

export default function ExternalSubjectManagement() {

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [list, setList] = useState([]);

  const programmes = [
    "ANM","GNM","B.SC NURSING","PBBSC NURSING","MSC NURSING",
    "M.SC N-MSN","M.SC N-OBG","M.SC N-Paed","M.SC N-MHN","M.SC N-CHN"
  ];

  const emptySubject = {
    subjectName: "",
    unitNumber: "",
    unitName: "",
    type: "Superspeciality",
    topics: "",
    lectureFrom: "",
    lectureTo: "",
    timing: "9:30-1:30",
    continuousHours: "No"
  };

  const emptyForm = {
    programme: "",
    semesterOrYear: "",
    subjects: [emptySubject]
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubjectChange = (i, field, value) => {
    const updated = [...form.subjects];
    updated[i][field] = value;
    setForm({ ...form, subjects: updated });
  };

  const addSubject = () => {
    setForm({ ...form, subjects: [...form.subjects, { ...emptySubject }] });
  };

  const removeSubject = (i) => {
    const updated = form.subjects.filter((_, idx) => idx !== i);
    setForm({ ...form, subjects: updated.length ? updated : [emptySubject] });
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!form.programme) return;

    if (editIndex !== null) {
      const updated = [...list];
      updated[editIndex] = form;
      setList(updated);
    } else {
      setList([...list, form]);
    }

    closeModal();
  };

  const closeModal = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowModal(false);
  };

  /* ================= CRUD ================= */

  const handleEdit = (i) => {
    setForm(list[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleDelete = (i) => {
    setList(list.filter((_, idx) => idx !== i));
  };

  /* ================= EXCEL ================= */

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "External Subjects");
    XLSX.writeFile(wb, "external_subjects.xlsx");
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-gray-800">

      {/* HEADER */}
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-lg md:text-xl font-semibold">
          External Subject Management
        </h1>

        <button
          onClick={()=>setShowModal(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"
        >
          <Plus size={16}/> Add
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Programme</th>
              <th>Semester</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((row,i)=>(
              <tr key={i} className="border-t">
                <td className="p-2">{row.programme}</td>
                <td>{row.semesterOrYear}</td>

                <td className="p-2">
                  {row.subjects.map((s,idx)=>(
                    <div key={idx} className="border p-2 mb-2 rounded bg-gray-50 text-xs">
                      <b>{s.subjectName}</b>
                      <p>Unit {s.unitNumber} - {s.unitName}</p>
                      <p>{s.type}</p>
                      <p>{s.topics}</p>
                      <p>{s.lectureFrom} → {s.lectureTo}</p>
                      <p>{s.timing}</p>
                    </div>
                  ))}
                </td>

                <td>
                  <button onClick={()=>handleEdit(i)}><Edit size={16}/></button>
                  <button onClick={()=>handleDelete(i)}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && createPortal(
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

    <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex flex-col max-h-[90vh]">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b p-4">
        <h2 className="font-semibold text-lg text-black">
          External Subject Form
        </h2>
        <button onClick={closeModal} className="text-black">
          <X/>
        </button>
      </div>

      {/* FORM BODY */}
      <div className="overflow-y-auto p-4 space-y-5">

        {/* Programme */}
        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Programme
          </label>
          <select
            value={form.programme}
            onChange={(e)=>handleChange("programme", e.target.value)}
            className="w-full border p-2 rounded text-black bg-white"
          >
            <option value="">Select Programme</option>
            {programmes.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Semester / Year
          </label>
          <input
            value={form.semesterOrYear}
            onChange={(e)=>handleChange("semesterOrYear", e.target.value)}
            className="w-full border p-2 rounded text-black placeholder-gray-500 bg-white"
            placeholder="Enter Semester or Year"
          />
        </div>

        {/* SUBJECTS */}
        {form.subjects.map((s,i)=>(
          <div key={i} className="border rounded p-4 bg-gray-50 space-y-4">

            {/* Subject Name */}
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Subject Name
              </label>
              <input
                value={s.subjectName}
                onChange={(e)=>handleSubjectChange(i,"subjectName",e.target.value)}
                className="w-full border p-2 rounded text-black bg-white"
                placeholder="Enter Subject Name"
              />
            </div>

            {/* Unit */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-black">
                  Unit Number
                </label>
                <input
                  value={s.unitNumber}
                  onChange={(e)=>handleSubjectChange(i,"unitNumber",e.target.value)}
                  className="w-full border p-2 rounded text-black bg-white mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-black">
                  Unit Name
                </label>
                <input
                  value={s.unitName}
                  onChange={(e)=>handleSubjectChange(i,"unitName",e.target.value)}
                  className="w-full border p-2 rounded text-black bg-white mt-1"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-semibold text-black">
                Type (Superspeciality / Speciality / External)
              </label>
              <select
                value={s.type}
                onChange={(e)=>handleSubjectChange(i,"type",e.target.value)}
                className="w-full border p-2 rounded text-black bg-white mt-1"
              >
                <option>Superspeciality</option>
                <option>Speciality</option>
                <option>External</option>
              </select>
            </div>

            {/* Topics */}
            <div>
              <label className="text-sm font-semibold text-black">
                Topics / Content
              </label>
              <textarea
                value={s.topics}
                onChange={(e)=>handleSubjectChange(i,"topics",e.target.value)}
                className="w-full border p-2 rounded text-black bg-white mt-1"
                placeholder="Enter Topics"
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-black">
                  Lecture From
                </label>
                <input
                  type="date"
                  value={s.lectureFrom}
                  onChange={(e)=>handleSubjectChange(i,"lectureFrom",e.target.value)}
                  className="w-full border p-2 rounded text-black bg-white mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-black">
                  Lecture To
                </label>
                <input
                  type="date"
                  value={s.lectureTo}
                  onChange={(e)=>handleSubjectChange(i,"lectureTo",e.target.value)}
                  className="w-full border p-2 rounded text-black bg-white mt-1"
                />
              </div>
            </div>

            {/* Timing */}
            <div>
              <label className="text-sm font-semibold text-black">
                Lecture Timing
              </label>
              <select
                value={s.timing}
                onChange={(e)=>handleSubjectChange(i,"timing",e.target.value)}
                className="w-full border p-2 rounded text-black bg-white mt-1"
              >
                <option value="9:30-1:30">9:30 AM - 1:30 PM</option>
                <option value="12:30-4:30">12:30 PM - 4:30 PM</option>
              </select>
            </div>

            {/* Continuous */}
            <div>
              <label className="text-sm font-semibold text-black">
                Continuous Hours
              </label>
              <select
                value={s.continuousHours}
                onChange={(e)=>handleSubjectChange(i,"continuousHours",e.target.value)}
                className="w-full border p-2 rounded text-black bg-white mt-1"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <button
              onClick={()=>removeSubject(i)}
              className="text-red-600 text-sm"
            >
              Remove Subject
            </button>

          </div>
        ))}

        <button onClick={addSubject} className="text-blue-600 font-medium">
          + Add Subject
        </button>

      </div>

      {/* FOOTER */}
      <div className="border-t p-4 flex justify-end gap-2">
        <button onClick={closeModal} className="border px-4 py-2 text-black">
          Cancel
        </button>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2">
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
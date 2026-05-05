import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Plus, Upload, Download, Printer, Eye, Edit, Trash2, X } from "lucide-react";

export default function StaffSubjectManagement() {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [list, setList] = useState([]);

  const emptyForm = {
    staffName: "",
    programme: "",
    semesterOrYear: "",
    subjects: [
      {
        name: "",
        superspecialty: "No",
        speciality: "No",
        external: "No"
      }
    ]
  };

  const [form, setForm] = useState(emptyForm);

  const programmes = [
    "ANM","GNM","B.SC NURSING","PBBSC NURSING","MSC NURSING",
    "M.SC N-MSN","M.SC N-OBG","M.SC N-Paed","M.SC N-MHN","M.SC N-CHN"
  ];

  /* ================= FORM ================= */

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...form.subjects];
    updated[index][field] = value;
    setForm({ ...form, subjects: updated });
  };

  const addSubject = () => {
    setForm({
      ...form,
      subjects: [
        ...form.subjects,
        { name: "", superspecialty: "No", speciality: "No", external: "No" }
      ]
    });
  };

  const removeSubject = (index) => {
    const updated = form.subjects.filter((_, i) => i !== index);
    setForm({ ...form, subjects: updated.length ? updated : emptyForm.subjects });
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!form.staffName) return;

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
    setShowModal(false);
    setEditIndex(null);
    setViewMode(false);
  };

  /* ================= CRUD ================= */

  const handleEdit = (i) => {
    setForm(list[i]);
    setEditIndex(i);
    setViewMode(false);
    setShowModal(true);
  };

  const handleView = (i) => {
    setForm(list[i]);
    setViewMode(true);
    setShowModal(true);
  };

  const handleDelete = (i) => {
    setList(list.filter((_, idx) => idx !== i));
  };

  /* ================= EXCEL ================= */

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Subjects");
    XLSX.writeFile(wb, "staff_subjects.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setList(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 space-y-6 text-gray-900 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">

        <h1 className="text-2xl font-semibold">
          Staff Subject Management
        </h1>

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() => {
              setForm(emptyForm);
              setEditIndex(null);
              setViewMode(false);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded"
          >
            <Plus size={16}/>Add
          </button>

          <label className="flex items-center px-3 py-2 border rounded bg-white cursor-pointer">
            <Upload size={16}/>
            <input type="file" hidden onChange={importFromExcel}/>
          </label>

          <button onClick={exportToExcel} className="flex items-center px-3 py-2 border rounded bg-white">
            <Download size={16}/>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center px-3 py-2 border rounded bg-white"
          >
            <Printer size={16}/>
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">

        <table className="w-full min-w-[900px] text-sm">

          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="p-3 text-left">Staff Name</th>
              <th>Programme</th>
              <th>Semester / Year</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No Records Found
                </td>
              </tr>
            ) : (
              list.map((s, i) => (
                <tr key={i} className="border-t">

                  <td className="p-2">{s.staffName}</td>
                  <td>{s.programme}</td>
                  <td>{s.semesterOrYear}</td>

                  <td className="p-3">
  <div className="space-y-2">
    {s.subjects?.map((sub, idx) => (
      <div
        key={idx}
        className="border rounded-lg p-2 bg-gray-50"
      >
        <div className="font-medium text-gray-900">
          {sub.name}
        </div>

        <div className="flex flex-wrap gap-2 mt-1 text-xs">

          {sub.superspecialty === "Yes" && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              Superspeciality
            </span>
          )}

          {sub.speciality === "Yes" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Speciality
            </span>
          )}

          {sub.external === "Yes" && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
              External
            </span>
          )}

          {/* Optional: if none selected */}
          {sub.superspecialty !== "Yes" &&
           sub.speciality !== "Yes" &&
           sub.external !== "Yes" && (
            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
              General
            </span>
          )}

        </div>
      </div>
    ))}
  </div>
</td>

                  <td className="flex gap-3 justify-center p-2">

                    <button onClick={() => handleEdit(i)} className="text-blue-600">
                      <Edit size={18}/>
                    </button>

                    <button onClick={() => handleDelete(i)} className="text-red-600">
                      <Trash2 size={18}/>
                    </button>

                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] text-gray-900">

            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">

              <div className="bg-white w-full max-w-4xl rounded p-6 max-h-[90vh] overflow-y-auto relative">

                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-600"
                >
                  <X size={22}/>
                </button>

                <h2 className="text-xl font-semibold mb-4">
                  Staff Subject Management Form
                </h2>

                <input
                  value={form.staffName}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("staffName", e.target.value)}
                  placeholder="Staff Name"
                  className="w-full p-2 border rounded mb-3"
                />

                <select
                  value={form.programme}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("programme", e.target.value)}
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="">Select Programme</option>
                  {programmes.map((p,i)=>(
                    <option key={i}>{p}</option>
                  ))}
                </select>

                <input
                  value={form.semesterOrYear}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("semesterOrYear", e.target.value)}
                  placeholder="Semester / Year"
                  className="w-full p-2 border rounded mb-4"
                />

                {form.subjects.map((sub, i) => (
                  <div key={i} className="border p-3 rounded mb-3 space-y-3">

                    <input
                      value={sub.name}
                      disabled={viewMode}
                      onChange={(e)=>handleSubjectChange(i,"name",e.target.value)}
                      placeholder="Subject Name"
                      className="w-full p-2 border rounded"
                    />

                    <div className="grid grid-cols-3 gap-3 text-sm">

                      <div>
                        <p className="font-medium mb-1">Superspeciality</p>
                        <select
                          value={sub.superspecialty}
                          disabled={viewMode}
                          onChange={(e)=>handleSubjectChange(i,"superspecialty",e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>

                      <div>
                        <p className="font-medium mb-1">Speciality</p>
                        <select
                          value={sub.speciality}
                          disabled={viewMode}
                          onChange={(e)=>handleSubjectChange(i,"speciality",e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>

                      <div>
                        <p className="font-medium mb-1">External</p>
                        <select
                          value={sub.external}
                          disabled={viewMode}
                          onChange={(e)=>handleSubjectChange(i,"external",e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>

                    </div>

                    {!viewMode && (
                      <button
                        onClick={() => removeSubject(i)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                ))}

                {!viewMode && (
                  <button
                    onClick={addSubject}
                    className="text-blue-600 mb-4"
                  >
                    + Add Subject
                  </button>
                )}

                {!viewMode && (
                  <div className="flex justify-end gap-3">

                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>,
          document.getElementById("modal-root")
        )}

    </div>
  );
}
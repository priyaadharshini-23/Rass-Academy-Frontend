import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Plus, Upload, Download, Printer, Pencil, Trash2 } from "lucide-react";

export default function Staff() {
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const emptyForm = {
    name: "",
    photo: "",
    address: "",
    mobile: "",
    email: "",
    social: "",
    active: true,
    qualifications: [
      { degree: "", year: "", institution: "", rn: "", rm: "", nuid: "" }
    ],
    aadhar: "",
    pan: "",
    dateOfJoining: "",
    dateOfRelieving: "",
  };

  const [form, setForm] = useState(emptyForm);

  const programmes = [
    "ANM", "GNM", "B.SC NURSING", "PBBSC NURSING", "MSC NURSING",
    "M.SC N-MSN", "M.SC N-OBG", "M.SC N-Paed", "M.SC N-MHN", "M.SC N-CHN", "Ph.D"
  ];

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const addQualification = () => {
    setForm({
      ...form,
      qualifications: [
        ...form.qualifications,
        { degree: "", year: "", institution: "", rn: "", rm: "", nuid: "" }
      ]
    });
  };

  const updateQualification = (index, field, value) => {
    const updated = [...form.qualifications];
    updated[index][field] = value;
    setForm({ ...form, qualifications: updated });
  };

  const removeQualification = (index) => {
    const updated = form.qualifications.filter((_, i) => i !== index);
    setForm({ ...form, qualifications: updated });
  };

  const handleSave = () => {
    if (!form.name) return;

    if (editIndex !== null) {
      const updated = [...staffList];
      updated[editIndex] = form;
      setStaffList(updated);
    } else {
      setStaffList([...staffList, form]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditIndex(null);
  };

  const handleDelete = (i) => {
    setStaffList(staffList.filter((_, idx) => idx !== i));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(staffList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "staff.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setStaffList(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Staff Profile</h1>

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() => {
              setForm(emptyForm);
              setEditIndex(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            <Plus size={16} /> Add
          </button>

          <label className="p-2 border rounded cursor-pointer bg-white">
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

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm text-gray-900">

          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th>Name</th>
              <th>Mobile Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-400">
                  No staff yet
                </td>
              </tr>
            ) : (
              staffList.map((s, i) => (
                <tr key={i} className="border-t text-gray-900">

                  <td className="p-2">
                    {s.photo && (
                      <img src={s.photo} className="w-10 h-10 rounded-full" />
                    )}
                  </td>

                  <td>{s.name}</td>
                  <td>{s.mobile}</td>

                  <td>
                    {s.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-500">Disabled</span>
                    )}
                  </td>

                  <td className="flex gap-2 justify-center p-2">

                    <button
                      onClick={() => {
                        setForm(s);
                        setEditIndex(i);
                        setShowModal(true);
                      }}
                      className="p-2 hover:bg-blue-100 rounded"
                    >
                      <Pencil size={16} className="text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(i)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} className="text-red-500" />
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
          <div className="fixed inset-0 z-[9999]">

            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex items-center justify-center p-3">

              <div className="w-full max-w-3xl bg-white text-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 relative">

                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-xl font-bold"
                >
                  ✕
                </button>

                <h2 className="text-xl font-semibold">Staff Profile Form</h2>

                {/* STATUS */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Status</label>

                  <button
                    onClick={() => handleChange("active", !form.active)}
                    className={`px-3 py-1 rounded-full text-sm ${form.active ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}
                  >
                    {form.active ? "Active" : "Disabled"}
                  </button>
                </div>

                {/* PHOTO */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Photo
                  </label>
                  <input type="file" />
                </div>

                {/* BASIC FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm text-gray-700">Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Mobile</label>
                    <input
                      value={form.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Email</label>
                    <input
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Social</label>
                    <input
                      value={form.social}
                      onChange={(e) => handleChange("social", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                </div>

                {/* ADDRESS */}
                <div>
                  <label className="text-sm text-gray-700">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full p-3 border rounded text-gray-900"
                  />
                </div>

                {/* QUALIFICATION */}
                <div>
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Qualification
                    </label>
                    <button onClick={addQualification} className="text-blue-600 text-sm">
                      + Add
                    </button>
                  </div>

                  {form.qualifications.map((q, i) => (
                    <div key={i} className="border p-3 rounded mb-3 bg-gray-50 space-y-2">

                      <select
                        value={q.degree}
                        onChange={(e) => updateQualification(i, "degree", e.target.value)}
                        className="w-full p-2 border rounded text-gray-900"
                      >
                        <option>Select Degree</option>
                        {programmes.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>

                      <input className="w-full p-2 border rounded text-gray-900"
                        placeholder="Year"
                        value={q.year}
                        onChange={(e) => updateQualification(i, "year", e.target.value)}
                      />

                      <input className="w-full p-2 border rounded text-gray-900"
                        placeholder="Institution"
                        value={q.institution}
                        onChange={(e) => updateQualification(i, "institution", e.target.value)}
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <input className="p-2 border rounded text-gray-900"
                          placeholder="RN" value={q.rn}
                          onChange={(e) => updateQualification(i, "rn", e.target.value)}
                        />
                        <input className="p-2 border rounded text-gray-900"
                          placeholder="RM" value={q.rm}
                          onChange={(e) => updateQualification(i, "rm", e.target.value)}
                        />
                        <input className="p-2 border rounded text-gray-900"
                          placeholder="NUID" value={q.nuid}
                          onChange={(e) => updateQualification(i, "nuid", e.target.value)}
                        />
                      </div>

                      <button onClick={() => removeQualification(i)} className="text-red-500 text-xs">
                        Remove
                      </button>

                    </div>
                  ))}
                </div>

                {/* OTHER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm text-gray-700">Aadhar</label>
                    <input
                      value={form.aadhar}
                      onChange={(e) => handleChange("aadhar", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">PAN</label>
                    <input
                      value={form.pan}
                      onChange={(e) => handleChange("pan", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Date of Joining</label>
                    <input
                      type="date"
                      value={form.dateOfJoining}
                      onChange={(e) => handleChange("dateOfJoining", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Date of Relieving</label>
                    <input
                      type="date"
                      value={form.dateOfRelieving}
                      onChange={(e) => handleChange("dateOfRelieving", e.target.value)}
                      className="w-full p-3 border rounded text-gray-900"
                    />
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded">
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
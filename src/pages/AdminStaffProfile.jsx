import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Upload, Download, Printer, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminStaffProfile() {
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const emptyForm = {
    category: "",
    photo: "",
    name: "",
    address: "",
    mobile: "",
    aadhar: "",
    pan: "",
    doj: "",
    dor: "",
    disabled: false
  };

  const [form, setForm] = useState(emptyForm);

  const categories = [
    "Admin Staff",
    "Mess Staffs",
    "Watchman",
    "Housekeeping"
  ];

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setShowModal(false);
    setEditIndex(null);
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

    resetAndClose();
  };

  const handleDelete = (i) => {
    setStaffList(staffList.filter((_, idx) => idx !== i));
  };

  const toggleDisable = (i) => {
    const updated = [...staffList];
    updated[i].disabled = !updated[i].disabled;
    setStaffList(updated);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Staff Profile
        </h1>

        <button
          onClick={() => {
            setForm(emptyForm);
            setEditIndex(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          <Plus size={16}/> Add
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">

        <table className="w-full text-sm text-gray-900">

          <thead className="bg-gray-100 text-gray-900 font-semibold">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No Records Found
                </td>
              </tr>
            ) : (
              staffList.map((s, i) => (
                <tr key={i} className={`border-t text-gray-900 ${s.disabled ? "opacity-40" : ""}`}>

                  <td className="p-2">
                    {s.photo ? (
                      <img
                        src={s.photo}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">No Photo</span>
                    )}
                  </td>

                  <td className="text-gray-900">{s.name}</td>
                  <td className="text-gray-900">{s.category}</td>
                  <td className="text-gray-900">{s.mobile}</td>

                  {/* STATUS */}
                  <td>
                    <button
                      onClick={() => toggleDisable(i)}
                      className={`flex items-center gap-1 font-semibold ${
                        s.disabled ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {s.disabled ? (
                        <>
                          <ToggleLeft size={18}/> Disabled
                        </>
                      ) : (
                        <>
                          <ToggleRight size={18}/> Active
                        </>
                      )}
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td className="flex gap-3 justify-center p-2">

                    <button
                      onClick={() => {
                        setForm(s);
                        setEditIndex(i);
                        setShowModal(true);
                      }}
                      className="text-blue-600"
                    >
                      <Edit size={18}/>
                    </button>

                    <button
                      onClick={() => handleDelete(i)}
                      className="text-red-600"
                    >
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
              onClick={resetAndClose}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">

              <div className="bg-white w-full max-w-3xl rounded p-6 relative max-h-[90vh] overflow-y-auto text-gray-900">

                <button
                  onClick={resetAndClose}
                  className="absolute top-3 right-3 text-red-600 text-xl font-bold"
                >
                  ✕
                </button>

                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Staff Profile Form
                </h2>

                {/* PHOTO */}
                <label className="block font-medium text-gray-900 mb-1">
                  Photo Upload
                </label>
                <input
                  type="file"
                  onChange={(e)=>handleFile(e.target.files[0])}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* CATEGORY */}
                <label className="block font-medium text-gray-900 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e)=>handleChange("category", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                >
                  <option value="">Select Category</option>
                  {categories.map((c,i)=>(
                    <option key={i}>{c}</option>
                  ))}
                </select>

                {/* NAME */}
                <label className="block font-medium text-gray-900 mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e)=>handleChange("name", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* ADDRESS */}
                <label className="block font-medium text-gray-900 mb-1">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e)=>handleChange("address", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* MOBILE */}
                <label className="block font-medium text-gray-900 mb-1">
                  Mobile
                </label>
                <input
                  value={form.mobile}
                  onChange={(e)=>handleChange("mobile", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* AADHAR */}
                <label className="block font-medium text-gray-900 mb-1">
                  Aadhar Number
                </label>
                <input
                  value={form.aadhar}
                  onChange={(e)=>handleChange("aadhar", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* PAN */}
                <label className="block font-medium text-gray-900 mb-1">
                  PAN Number
                </label>
                <input
                  value={form.pan}
                  onChange={(e)=>handleChange("pan", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* DATES */}
                <div className="grid grid-cols-2 gap-3 text-gray-900">

                  <div>
                    <label className="font-medium">Joining Date</label>
                    <input
                      type="date"
                      value={form.doj}
                      onChange={(e)=>handleChange("doj", e.target.value)}
                      className="w-full p-2 border rounded bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="font-medium">Relieving Date</label>
                    <input
                      type="date"
                      value={form.dor}
                      onChange={(e)=>handleChange("dor", e.target.value)}
                      className="w-full p-2 border rounded bg-white text-gray-900"
                    />
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 mt-5">

                  <button
                    onClick={resetAndClose}
                    className="px-4 py-2 border rounded text-gray-900"
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

              </div>

            </div>

          </div>,
          document.getElementById("modal-root")
        )}

    </div>
  );
}
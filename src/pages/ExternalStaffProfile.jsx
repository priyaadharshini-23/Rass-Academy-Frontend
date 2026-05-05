import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Eye, Edit, Trash2, X } from "lucide-react";

export default function ExternalStaffProfile() {
  const [showModal, setShowModal] = useState(false);
  const [list, setList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  const emptyForm = {
    name: "",
    address: "",
    mobile: "",
    email: "",
    qualification: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setShowModal(false);
    setEditIndex(null);
    setViewMode(false);
  };

  const handleSave = () => {
    if (!form.name) return;

    if (editIndex !== null) {
      const updated = [...list];
      updated[editIndex] = form;
      setList(updated);
    } else {
      setList([...list, form]);
    }

    resetAndClose();
  };

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">

        <h1 className="text-2xl font-semibold text-gray-900">
          External Staff Profile
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

        <table className="w-full text-sm text-gray-900 min-w-[700px]">

          <thead className="bg-gray-100 text-gray-900 font-semibold">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Mobile Number</th>
              <th>Mail ID</th>
              <th>Qualification</th>
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
                <tr key={i} className="border-t text-gray-900">

                  <td className="p-2">{s.name}</td>
                  <td>{s.mobile}</td>
                  <td>{s.email}</td>
                  <td>{s.qualification}</td>

                  <td className="flex gap-3 justify-center p-2">

                    <button
                      onClick={() => handleView(i)}
                      className="text-green-600"
                    >
                      <Eye size={18}/>
                    </button>

                    <button
                      onClick={() => handleEdit(i)}
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

              <div className="bg-white w-full max-w-2xl rounded p-6 relative max-h-[90vh] overflow-y-auto">

                {/* CLOSE BUTTON */}
                <button
                  onClick={resetAndClose}
                  className="absolute top-3 right-3 text-red-600 text-xl font-bold"
                >
                  ✕
                </button>

                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  External Staff Form
                </h2>

                {/* NAME */}
                <label className="block font-medium mb-1 text-gray-900">
                  Name
                </label>
                <input
                  value={form.name}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("name", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* ADDRESS */}
                <label className="block font-medium mb-1 text-gray-900">
                  Permanent Address
                </label>
                <textarea
                  value={form.address}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("address", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* MOBILE */}
                <label className="block font-medium mb-1 text-gray-900">
                  Mobile Number
                </label>
                <input
                  value={form.mobile}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("mobile", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* EMAIL */}
                <label className="block font-medium mb-1 text-gray-900">
                  Mail ID
                </label>
                <input
                  value={form.email}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("email", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* QUALIFICATION */}
                <label className="block font-medium mb-1 text-gray-900">
                  Qualification
                </label>
                <input
                  value={form.qualification}
                  disabled={viewMode}
                  onChange={(e)=>handleChange("qualification", e.target.value)}
                  className="w-full p-2 border rounded mb-3 bg-white text-gray-900"
                />

                {/* ACTIONS */}
                {!viewMode && (
                  <div className="flex justify-end gap-3 mt-4">

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
                )}

              </div>

            </div>

          </div>,
          document.getElementById("modal-root")
        )}

    </div>
  );
}
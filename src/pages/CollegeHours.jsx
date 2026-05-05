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

export default function CollegeHours() {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    programme: "",
    noOfSemOrYear: "",
    morningStart: "",
    morningEnd: "",
    afternoonStart: "",
    afternoonEnd: "",
    lectureDuration: "",
    labDuration: "",
    clinicalHospital: "",
    clinicalCommunity: "",
    flHour: "",
    flMin: "",
    flCont: "",
    labHour: "",
    labMin: "",
    labCont: "",
    clHour: "",
    clMin: "",
    clCont: "",
  });

  const API = "http://localhost:5000/api/collegehours";
  const COURSE_API = "http://localhost:5000/api/courses";

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, []);

  const fetchData = async () => {
    const res = await fetch(API);
    const json = await res.json();
    setData(json);
  };

  const fetchCourses = async () => {
    const res = await fetch(COURSE_API);
    const json = await res.json();
    setCourses(json);
  };

  const openAdd = () => {
    setForm({
      programme: "",
      noOfSemOrYear: "",
      morningStart: "",
      morningEnd: "",
      afternoonStart: "",
      afternoonEnd: "",
      lectureDuration: "",
      labDuration: "",
      clinicalHospital: "",
      clinicalCommunity: "",
      flHour: "",
      flMin: "",
      flCont: "",
      labHour: "",
      labMin: "",
      labCont: "",
      clHour: "",
      clMin: "",
      clCont: "",
    });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm(data[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = async () => {
    let res;

    if (editIndex !== null) {
      const id = data[editIndex]._id;
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

    if (!res.ok) return alert("Save failed");

    fetchData();
    setShowModal(false);
  };

  const handleDelete = async (i) => {
    await fetch(`${API}/${data[i]._id}`, { method: "DELETE" });
    fetchData();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CollegeHours");
    XLSX.writeFile(wb, "college_hours.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      fetchData();
    };

    reader.readAsArrayBuffer(file);
  };

  const YesNoToggle = ({ value, onChange }) => (
    <div className="flex gap-2">
      {["Yes", "No"].map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 border rounded text-sm ${
            value === opt
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const Label = ({ children }) => (
    <label className="block text-sm font-semibold text-gray-800 mb-1">
      {children}
    </label>
  );

  const Input = (props) => (
    <input
      {...props}
      className="w-full border rounded p-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-gray-900">

      {/* HEADER (UPDATED) */}
      <div className="flex flex-wrap justify-between items-center gap-3">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            College Hours
          </h1>
          <p className="text-sm text-gray-600">
            Manage college working hours
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

      {/* TABLE (UPDATED) */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 min-w-[900px]">

            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Programme</th>
                <th className="p-3 text-center">Sem/Year</th>
                <th className="p-3 text-center">Class Hours</th>
                <th className="p-3 text-center">Lecture</th>
                <th className="p-3 text-center">Lab</th>
                <th className="p-3 text-center">Clinical</th>
                <th className="p-3 text-center">Faculty</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No data yet
                  </td>
                </tr>
              ) : (
                data.map((d, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-semibold">{d.programme}</td>
                    <td className="p-3 text-center">{d.noOfSemOrYear}</td>
                    <td className="p-3 text-center">
                      {d.morningStart}-{d.morningEnd} / {d.afternoonStart}-{d.afternoonEnd}
                    </td>
                    <td className="p-3 text-center">{d.lectureDuration}</td>
                    <td className="p-3 text-center">{d.labDuration}</td>
                    <td className="p-3 text-center">
                      {d.clinicalHospital} / {d.clinicalCommunity}
                    </td>
                    <td className="p-3 text-xs text-center">
                      L:{d.flHour}:{d.flMin} ({d.flCont})<br />
                      Lab:{d.labHour}:{d.labMin} ({d.labCont})<br />
                      Cl:{d.clHour}:{d.clMin} ({d.clCont})
                    </td>

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

      {/* MODAL (UNCHANGED) */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">

          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />

          <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">College Hours</h2>
              <button onClick={() => setShowModal(false)} className="bg-red-500 text-white p-2 rounded-full">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <Label>Programme</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.programme}
                  onChange={(e) => setForm({ ...form, programme: e.target.value })}
                >
                  <option>Select</option>
                  {courses.map((c) => (
                    <option key={c._id}>{c.programme}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>No. of Semester / Year</Label>
                <Input value={form.noOfSemOrYear}
                  onChange={(e) => setForm({ ...form, noOfSemOrYear: e.target.value })} />
              </div>

              <div className="col-span-2">
                <Label>Class Hours</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="time" value={form.morningStart} onChange={(e)=>setForm({...form,morningStart:e.target.value})}/>
<Input type="time" value={form.morningEnd} onChange={(e)=>setForm({...form,morningEnd:e.target.value})}/>
<Input type="time" value={form.afternoonStart} onChange={(e)=>setForm({...form,afternoonStart:e.target.value})}/>
<Input type="time" value={form.afternoonEnd} onChange={(e)=>setForm({...form,afternoonEnd:e.target.value})}/>
                </div>
              </div>

              <div>
                <Label>Lecture Duration</Label>
                <Input value={form.lectureDuration} onChange={(e)=>setForm({...form,lectureDuration:e.target.value})}/>
              </div>

              <div>
                <Label>Lab Duration</Label>
                <Input value={form.labDuration} onChange={(e)=>setForm({...form,labDuration:e.target.value})}/>
              </div>

              <div>
                <Label>Clinical Hospital</Label>
                <Input value={form.clinicalHospital} onChange={(e)=>setForm({...form,clinicalHospital:e.target.value})}/>
              </div>

              <div>
                <Label>Clinical Community</Label>
                <Input value={form.clinicalCommunity} onChange={(e)=>setForm({...form,clinicalCommunity:e.target.value})}/>
              </div>

              <div className="col-span-2">
  <Label>Faculty Lecture</Label>
  <div className="flex gap-2">
    <Input
      type="number"
      min="0"
      max="23"
      placeholder="Hr"
      value={form.flHour}
      onChange={(e)=>setForm({...form,flHour:e.target.value})}
    />
    <Input
      type="number"
      min="0"
      max="59"
      placeholder="Min"
      value={form.flMin}
      onChange={(e)=>setForm({...form,flMin:e.target.value})}
    />
    <YesNoToggle value={form.flCont} onChange={(v)=>setForm({...form,flCont:v})}/>
  </div>
</div>

<div className="col-span-2">
  <Label>Faculty Lab</Label>
  <div className="flex gap-2">
    <Input
      type="number"
      min="0"
      max="23"
      placeholder="Hr"
      value={form.labHour}
      onChange={(e)=>setForm({...form,labHour:e.target.value})}
    />
    <Input
      type="number"
      placeholder="Min"
      value={form.labMin}
      onChange={(e)=>setForm({...form,labMin:e.target.value})}
    />
    <YesNoToggle value={form.labCont} onChange={(v)=>setForm({...form,labCont:v})}/>
  </div>
</div>

<div className="col-span-2">
  <Label>Faculty Clinical</Label>
  <div className="flex gap-2">
    <Input
      type="number"
      placeholder="Hr"
      value={form.clHour}
      onChange={(e)=>setForm({...form,clHour:e.target.value})}
    />
    <Input
      type="number"
      placeholder="Min"
      value={form.clMin}
      onChange={(e)=>setForm({...form,clMin:e.target.value})}
    />
    <YesNoToggle value={form.clCont} onChange={(v)=>setForm({...form,clCont:v})}/>
  </div>
</div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setShowModal(false)} className="px-5 py-2 border rounded text-gray-800">
                Cancel
              </button>
              <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded">
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
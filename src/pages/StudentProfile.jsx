import { useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { Plus, Upload, Download } from "lucide-react";

export default function StudentProfile() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");

  const programmes = [
    "ANM","GNM","B.SC NURSING","PBBSC NURSING","MSC NURSING",
    "M.SC N-MSN","M.SC N-OBG","M.SC N-Paed","M.SC N-MHN","M.SC N-CHN"
  ];

  const admissionCertificates = [
    "X Mark Sheet","XI Mark Sheet","XII Mark Sheet","Transfer Certificate",
    "Community","Income & Pay Slip","Nativity","Allotment Order",
    "First Graduate","Aadhar","PAN","Bank Passbook",
    "Medical Fitness","School Studying Information","Parent Community & School Certificate"
  ];

  const completionCertificates = [
    "Transfer Certificate","Course Completion","Provisional Certificate",
    "Degree Certificate","Transcript","Conduct Certificate","Foreign Processing Certificate"
  ];

  const emptyForm = {
    name: "", photo: "", dob: "", community: "", address: "",
    parentMobile: "", mobile: "", email: "", social: "",
    programme: "", academicYear: "", admissionType: "",
    admissionNo: "", universityRegNo: "",
    certificatesAdmission: {}, certificatesCompletion: {},
    bonafide: "", marksheets: ""
  };

  const [form, setForm] = useState(emptyForm);

  const inputStyle = "w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-gray-900 bg-white";

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleFile = (field, file) => {
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, [field]: reader.result });
    reader.readAsDataURL(file);
  };

  const handleMultiFile = (type, name, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, [type]: { ...form[type], [name]: reader.result } });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...students];
      updated[editIndex] = form;
      setStudents(updated);
    } else {
      setStudents([...students, form]);
    }
    setForm(emptyForm);
    setShowModal(false);
    setEditIndex(null);
  };

  const handleDelete = (i) => {
    setStudents(students.filter((_, idx) => idx !== i));
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setStudents(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile?.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <div className="flex gap-2">
          <button onClick={()=>setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center">
            <Plus size={16}/> Add
          </button>
          <label className="border p-2 rounded bg-white cursor-pointer">
            <Upload size={16}/>
            <input type="file" hidden onChange={importExcel}/>
          </label>
          <button onClick={exportExcel} className="border p-2 rounded bg-white">
            <Download size={16}/>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Photo</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Programme</th>
              <th>Academic Year</th>
              <th>Admission Type</th>
              <th>Admission No</th>
              <th>University Reg No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" className="text-center p-6 text-gray-400">No records</td></tr>
            ) : filtered.map((s,i)=>(
              <tr key={i} className="border-t">
                <td className="p-2">{s.photo && <img src={s.photo} className="w-10 h-10 rounded-full"/>}</td>
                <td>{s.name}</td>
                <td>{s.mobile}</td>
                <td>{s.programme}</td>
                <td>{s.academicYear}</td>
                <td>{s.admissionType}</td>
                <td>{s.admissionNo}</td>
                <td>{s.universityRegNo}</td>
                <td className="flex gap-2">
                  <button onClick={()=>{setForm(s);setEditIndex(i);setShowModal(true);}} className="text-blue-600">Edit</button>
                  <button onClick={()=>handleDelete(i)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL stays unchanged */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 w-full max-w-5xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-semibold mb-4">Student Form</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div><label>Name</label><input className={inputStyle} value={form.name} onChange={e=>handleChange("name",e.target.value)} /></div>
              <div><label>Photo</label><input type="file" onChange={e=>handleFile("photo",e.target.files[0])}/></div>
              <div><label>DOB</label><input type="date" className={inputStyle} value={form.dob} onChange={e=>handleChange("dob",e.target.value)} /></div>
              <div><label>Community</label><input className={inputStyle} value={form.community} onChange={e=>handleChange("community",e.target.value)} /></div>
              <div className="md:col-span-2"><label>Permanent Address</label><textarea className={inputStyle} value={form.address} onChange={e=>handleChange("address",e.target.value)} /></div>
              <div><label>Parent Mobile</label><input className={inputStyle} value={form.parentMobile} onChange={e=>handleChange("parentMobile",e.target.value)} /></div>
              <div><label>Mobile</label><input className={inputStyle} value={form.mobile} onChange={e=>handleChange("mobile",e.target.value)} /></div>
              <div><label>Email</label><input className={inputStyle} value={form.email} onChange={e=>handleChange("email",e.target.value)} /></div>
              <div><label>Facebook / Insta</label><input className={inputStyle} value={form.social} onChange={e=>handleChange("social",e.target.value)} /></div>
              <div><label>Programme</label>
                <select className={inputStyle} value={form.programme} onChange={e=>handleChange("programme",e.target.value)}>
                  <option>Select</option>
                  {programmes.map(p=>(<option key={p}>{p}</option>))}
                </select>
              </div>
              <div><label>Academic Year</label><input className={inputStyle} value={form.academicYear} onChange={e=>handleChange("academicYear",e.target.value)} /></div>
              <div><label>Type of Admission</label>
                <select className={inputStyle} value={form.admissionType} onChange={e=>handleChange("admissionType",e.target.value)}>
                  <option>Select</option>
                  <option>Management</option>
                  <option>Government</option>
                </select>
              </div>
              <div><label>Admission Number</label><input className={inputStyle} value={form.admissionNo} onChange={e=>handleChange("admissionNo",e.target.value)} /></div>
              <div><label>University Registration Number</label><input className={inputStyle} value={form.universityRegNo} onChange={e=>handleChange("universityRegNo",e.target.value)} /></div>
            </div>

            <h3 className="mt-6 font-semibold">Certificates on Admission</h3>
            {admissionCertificates.map(cert=>(
              <div key={cert} className="flex justify-between border p-2 mt-2">
                <span>{cert}</span>
                <input type="file" onChange={e=>handleMultiFile("certificatesAdmission",cert,e.target.files[0])}/>
              </div>
            ))}

            <div className="mt-4">
              <label>Bonafide Certificate</label>
              <input type="file" onChange={e=>handleFile("bonafide",e.target.files[0])}/>
            </div>

            <div className="mt-4">
              <label>Mark Statements</label>
              <input type="file" onChange={e=>handleFile("marksheets",e.target.files[0])}/>
            </div>

            <h3 className="mt-6 font-semibold">Certificates on Completion</h3>
            {completionCertificates.map(cert=>(
              <div key={cert} className="flex justify-between border p-2 mt-2">
                <span>{cert}</span>
                <input type="file" onChange={e=>handleMultiFile("certificatesCompletion",cert,e.target.files[0])}/>
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>

          </div>
        </div>, document.getElementById("modal-root"))}

    </div>
  );
}
import { useState, useEffect } from "react";
import { Search, Bell, Menu, ChevronDown } from "lucide-react";

export default function Topbar({ toggleMobile }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);
  }, []);

  return (
    <div className="
      h-[64px]
      px-4 sm:px-6 lg:px-10
      flex items-center justify-between
      bg-[#0f172a]
      text-white
      shadow-md
    ">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold">
            Welcome  {username || "User"}
          </h2>
        </div>
      </div>

    </div>
  );
}
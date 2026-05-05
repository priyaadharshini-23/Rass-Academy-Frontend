import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "1,240",
      icon: Users,
    },
    {
      title: "Courses",
      value: "32",
      icon: BookOpen,
    },
    {
      title: "Exams",
      value: "18",
      icon: FileText,
    },
    {
      title: "Reports",
      value: "76",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your system activity
        </p>
      </div>

      {/* STATS GRID */}
      <div className="
        grid grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-6
      ">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="
                glass rounded-2xl p-5
                shadow-md
                hover-lift
                group
              "
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {item.title}
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-800 mt-1">
                    {item.value}
                  </h2>
                </div>

                <div className="
                  w-10 h-10 rounded-xl
                  bg-indigo-100
                  flex items-center justify-center
                  group-hover:scale-110
                ">
                  <Icon size={18} className="text-indigo-600" />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="
        grid grid-cols-1
        lg:grid-cols-3
        gap-6
      ">

        {/* LEFT LARGE CARD */}
        <div className="
          lg:col-span-2
          glass rounded-2xl p-6
          shadow-md hover-lift
        ">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>

          <div className="space-y-4 text-sm text-gray-600">
            <p>• New student registered</p>
            <p>• Course updated</p>
            <p>• Exam schedule published</p>
            <p>• Report generated</p>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="
          glass rounded-2xl p-6
          shadow-md hover-lift
        ">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button className="
              w-full py-2 rounded-xl
              bg-indigo-600 text-white text-sm
              hover:bg-indigo-700
            ">
              Add Student
            </button>

            <button className="
              w-full py-2 rounded-xl
              bg-gray-100 text-gray-700 text-sm
              hover:bg-gray-200
            ">
              Create Course
            </button>

            <button className="
              w-full py-2 rounded-xl
              bg-gray-100 text-gray-700 text-sm
              hover:bg-gray-200
            ">
              Generate Report
            </button>
          </div>
        </div>

      </div>

      {/* EXTRA SECTION */}
      <div className="
        glass rounded-2xl p-6
        shadow-md hover-lift
      ">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Performance Overview
        </h3>

        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          Chart / Analytics goes here
        </div>
      </div>

    </div>
  );
}
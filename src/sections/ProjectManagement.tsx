import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const ProjectManagement: React.FC = () => {
  const projects = [
    {
      name: "Statutory Full Year Audit",
      status: "completed",
      budget: "$10.5M",
      spent: "$8.2M",
      progress: 100,
      deadline: "2025-04-31",
      team: "Financial Control and Strategy Planning",
    },
    {
      name: "Tax Audit",
      status: "in-progress",
      budget: "$7.5M",
      spent: "$3.2M",
      progress: 75,
      deadline: "2025-11-28",
      team: "Tax Department",
    },
    {
      name: "Quarterly Board Meeting Presentation",
      status: "planning",
      budget: "$0.5M",
      spent: "$0.2M",
      progress: 10,
      deadline: "2025-12-15",
      team: "Strategy",
    },

    {
      name: "Budget Cycle",
      status: "in-progress",
      budget: "$0.3M",
      spent: "$0.1M",
      progress: 75,
      deadline: "2025-12-21",
      team: "FCSP",
    },
    {
      name: "Digital Banking Platform Upgrade",
      status: "in-progress",
      budget: "$12.5M",
      spent: "$8.2M",
      progress: 65,
      deadline: "2025-12-31",
      team: "Technology",
    },
    {
      name: "Branch Network Expansion",
      status: "in-progress",
      budget: "$8.3M",
      spent: "$6.1M",
      progress: 73,
      deadline: "2025-10-15",
      team: "Operations",
    },
    {
      name: "Risk Management System",
      status: "completed",
      budget: "$5.2M",
      spent: "$4.9M",
      progress: 100,
      deadline: "2025-06-30",
      team: "Risk",
    },
    {
      name: "Customer Analytics Platform",
      status: "in-progress",
      budget: "$6.8M",
      spent: "$3.4M",
      progress: 50,
      deadline: "2025-11-30",
      team: "Marketing",
    },
    {
      name: "Core Banking Migration",
      status: "planning",
      budget: "$18.5M",
      spent: "$1.2M",
      progress: 6,
      deadline: "2026-06-30",
      team: "Technology",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "planning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "planning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900">12</div>
          <div className="text-sm text-green-600 mt-2">+2 this quarter</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">8</div>
          <div className="text-sm text-gray-600 mt-2">67% of total</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Budget</div>
          <div className="text-3xl font-bold text-gray-900">$51.3M</div>
          <div className="text-sm text-green-600 mt-2">$23.8M spent</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {project.budget}
                    </div>
                    <div className="text-xs text-gray-500">
                      Spent: {project.spent}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {project.team}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {project.deadline}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;

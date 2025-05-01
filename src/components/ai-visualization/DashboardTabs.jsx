import React from 'react';

const DashboardTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'visualization', label: 'Neural Network' },
    { id: 'metrics', label: 'Performance Metrics' }
  ];

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex flex-nowrap border-b border-gray-700 min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardTabs;

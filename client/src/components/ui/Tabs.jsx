import { useState } from 'react';

export default function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === index
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-dark hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}

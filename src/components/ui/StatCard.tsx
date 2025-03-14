import React from "react";

type StatCardProps = {
  title: string;
  value: number;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div
      className={`bg-${color}-400 text-white rounded-2xl shadow-lg p-6 w-full text-center`}
      style={{ backgroundColor: color, opacity: 0.6 }}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { title: "Total Items", value: 7, color: "blue" },
    { title: "Remain Items", value: 4, color: "red" },
    { title: "Total Point", value: 200, color: "green" },
    { title: "Total Coin", value: 800, color: "purple" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-9 justify-items-center">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default StatsSection;

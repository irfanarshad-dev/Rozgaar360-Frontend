export default function RoleCard({ role, title, description, icon, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="text-center space-y-4">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
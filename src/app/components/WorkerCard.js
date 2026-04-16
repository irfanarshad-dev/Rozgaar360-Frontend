import Link from 'next/link';

export default function WorkerCard({ worker }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={worker.profilePicture || '/default-avatar.png'}
          alt={worker.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{worker.name}</h3>
          <p className="text-blue-600 font-medium">{worker.skill}</p>
          <p className="text-gray-600 text-sm">{worker.city}</p>
          
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(worker.rating))}
              {'☆'.repeat(5 - Math.floor(worker.rating))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {worker.rating} ({worker.reviewCount} reviews) {/* جائزے */}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-3">
        <Link
          href={`/profile/${worker.id}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700"
        >
          View Profile {/* پروفائل دیکھیں */}
        </Link>
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
          Contact {/* رابطہ */}
        </button>
      </div>
    </div>
  );
}
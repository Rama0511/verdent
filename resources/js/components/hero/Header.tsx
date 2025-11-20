export default function Header() {
  return (
    <div className="px-4 pt-4 pb-3 flex justify-between items-center bg-gray-900 text-white rounded-t-3xl">
      <div>
        <h2 className="text-base font-semibold ">Hi, Pengunjung</h2>
        <p className="text-sm text-gray-300">Semoga anda sehat selalu!</p>
      </div>
      <img
        src="https://i.pravatar.cc/100"
        alt="Profile"
        className="w-10 h-10 rounded-full border-2 border-amber-100"
      />
    </div>
  );
}

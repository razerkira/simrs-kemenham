import Link from "next/link";
import { Calendar, Users, Shield, LucideIcon } from "lucide-react";
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="bg-white text-[#313235] rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] cursor-default">
      {/* Menggunakan ikon Lucide React */}
      <Icon className="h-12 w-12 text-blue-600 mb-4" />

      <h3 className="text-xl font-semibold mb-2 text-left">{title}</h3>
      <p className=" text-left">{description}</p>
    </div>
  );
};

// 2. Feature Data

const features = [
  {
    icon: Calendar,
    title: "Mudah & Cepat",
    description:
      "Ajukan cuti atau dinas luar tanpa perlu login, cukup isi data yang diperlukan.",
  },
  {
    icon: Users,
    title: "Tracking Real-time",
    description:
      "Pantau status pengajuan Anda secara real-time melalui dashboard yang informatif.",
  },
  {
    icon: Shield,
    title: "Aman & Terpercaya",
    description:
      "Data Anda tersimpan dengan aman dan hanya dapat diakses oleh pihak yang berwenang.",
  },
];

export default function BerandaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl lg:text-5xl font-bold mb-4">
        Sistem Pengajuan Cuti dan Dinas Luar
      </h1>
      <p className="mb-6 lg:text-xl text-gray-600 max-w-xl">
        Kementerian HAM Republik Indonesia
      </p>
      <div className="space-x-4 mb-20 flex flex-wrap justify-center gap-4">
        <Link
          href="/beranda/pengajuan-cuti"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow"
        >
          Pengajuan Cuti
        </Link>
        <Link
          href="/login"
          className="inline-block border border-blue-600 px-4 py-3 rounded-lg text-blue-600"
        >
          Login Admin
        </Link>
      </div>
      <div className="w-full">
        {/* Grid container: 1 kolom di mobile, 3 kolom di layar medium ke atas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

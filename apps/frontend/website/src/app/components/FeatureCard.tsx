interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transform transition-transform hover:scale-105">
      <div className="text-[#7057A0] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#251C6B] mb-2">{title}</h3>
      <p className="text-[#7057A0]">{description}</p>
    </div>
  );
} 
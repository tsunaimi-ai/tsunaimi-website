import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'full';
}

export default function Logo({ className = "", variant = 'full' }: LogoProps) {
  // Logo configuration
  const logoSrc = '/logo-full.png';
  
  // Adjust these values to control the logo size
  const width = 100;
  const height = 40;

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="TsunAImi Logo"
        width={width}
        height={height}
        priority
        style={{ 
          objectFit: 'contain',
          maxWidth: '100%',
        }}
      />
    </div>
  );
} 
import TeamContent from '../../components/TeamContent';

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

export default function TeamPage() {
  return <TeamContent />;
} 
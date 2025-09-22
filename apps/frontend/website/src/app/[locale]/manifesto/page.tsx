import ManifestoContent from '../../components/ManifestoContent';

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

export default function ManifestoPage() {
  return <ManifestoContent />;
} 
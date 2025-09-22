import StoryContent from '../../components/StoryContent';

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

export default function StoryPage() {
  return <StoryContent />;
} 
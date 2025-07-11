import { useNavigate } from 'react-router';
import { Button } from '../optimizing/Button';
import { Svg } from '../optimizing/Svg';

interface SurahHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({ 
  title = "القرآن الكريم",
  subtitle = "Al-Quran Al-Kareem",
  description = "Bacalah Al-Quran dengan penuh tadabbur dan khusyuk"
}) => {
  const navigate = useNavigate();

  return (
    <header className="relative text-center mb-8">
      <Button
        variant="secondary"
        onClick={() => navigate("/")}
        className="absolute top-0 left-0 size-10"
        rounded
        aria-label="Go back"
      >
        <Svg width={20} height={20} draw={[
          "M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z",
          "m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
        ]} />
      </Button>
      
      <h1 className="text-3xl font-serif font-bold text-emerald-800 dark:text-emerald-200 mb-2 sm:text-4xl">
        {title}
      </h1>
      <p className="text-base text-emerald-600 dark:text-emerald-400 font-semibold sm:text-lg">
        {subtitle}
      </p>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        {description}
      </p>
    </header>
  );
};
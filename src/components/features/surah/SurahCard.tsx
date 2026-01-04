import { memo } from "react";
import type { Surah } from "@/types";
import { formatArabicNumber } from "@/utils/formatting";
import { Button } from "@/components/ui/Button";
import { Svg } from "@/components/ui/Svg";

interface SurahCardProps {
  surah: Surah;
}

const SurahCardComponent = ({ surah }: Readonly<SurahCardProps>) => {
  const { nomor, tempatTurun, nama, namaLatin, arti, jumlahAyat } = surah;

  const isMakkah = tempatTurun === "Mekah";
  const locationColor = isMakkah
    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-500/20"
    : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20";

  return (
    <div className="group relative p-6 rounded-2xl shadow-sm hover:-translate-y-1 border border-gray-200/60 hover:border-emerald-500 dark:border-gray-800/60 bg-gray-50/70 dark:bg-gray-950/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="font-serif size-10 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-gray-100 text-lg shadow-lg">
          {formatArabicNumber(nomor)}
        </div>
        <div
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${locationColor}`}
        >
          {tempatTurun}
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 font-serif">
          {nama}
        </h3>
        <div className="w-12 group-hover:w-14 h-0.5 bg-linear-to-r from-emerald-400 to-teal-400 my-1.5 mx-auto rounded-full transition-all" />
      </div>

      <div className="text-center mb-4">
        <h4 className="mb-1">
          <Button
            variant="link"
            href={`/surat/${nomor}`}
            className="text-lg font-semibold text-gray-700 dark:text-gray-300"
          >
            <span aria-hidden="true" className="absolute inset-0" />
            {namaLatin}
          </Button>
        </h4>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
          {arti}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
        <Svg
          variant="outline"
          width={20}
          height={20}
          draw={[
            "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
          ]}
        />
        <span className="font-medium">{jumlahAyat} ayat</span>
      </div>
    </div>
  );
};

export const SurahCard = memo(SurahCardComponent);

SurahCard.displayName = "SurahCard";

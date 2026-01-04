import {
  forwardRef,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Svg } from "@/components/ui/Svg";
import { quranAPI } from "@/services";
import type { Surah } from "@/types";
import { cn } from "@/utils/formatting";

const SEARCH_STATUS = {
  Idle: "idle",
  Loading: "loading",
  Success: "success",
  Error: "error",
} as const;

type SearchStatus = (typeof SEARCH_STATUS)[keyof typeof SEARCH_STATUS];

interface SearchState {
  query: string;
  results: Surah[];
  isOpen: boolean;
  status: SearchStatus;
}

interface UseSearchOptions {
  close: () => void;
  onSearch?: (query: string) => void; // Callback untuk parent component
}

function useSurahSearch({ close, onSearch }: UseSearchOptions) {
  const navigate = useNavigate();
  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    results: [],
    isOpen: false,
    status: SEARCH_STATUS.Idle,
  });

  const surahCache = useRef<Surah[] | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<number | null>(null);

  const fetchAllSurahs = useCallback(async () => {
    if (surahCache.current) return surahCache.current;

    abortController.current?.abort();
    abortController.current = new AbortController();

    setSearchState((s) => ({ ...s, status: SEARCH_STATUS.Loading }));
    try {
      const data = await quranAPI.getAllSurahs();
      surahCache.current = data;
      return data;
    } catch (err) {
      console.error("Failed to fetch surah list", err);
      setSearchState((s) => ({
        ...s,
        status: SEARCH_STATUS.Error,
        results: [],
      }));
      return [];
    }
  }, []);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 1) {
        setSearchState((s) => ({
          ...s,
          results: [],
          status: SEARCH_STATUS.Idle,
        }));
        onSearch?.("");
        return;
      }

      setSearchState((s) => ({ ...s, status: SEARCH_STATUS.Loading }));
      const list = await fetchAllSurahs();
      const filtered = list
        .filter(
          (s) =>
            s.namaLatin.toLowerCase().includes(query.toLowerCase()) ||
            s.arti.toLowerCase().includes(query.toLowerCase()) ||
            String(s.nomor).includes(query)
        )
        .slice(0, 20);

      setSearchState((s) => ({
        ...s,
        results: filtered,
        status: SEARCH_STATUS.Success,
        isOpen: true,
      }));

      onSearch?.(query);
    },
    [fetchAllSurahs, onSearch]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchState((s) => ({ ...s, query }));

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = window.setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      abortController.current?.abort();
    };
  }, []);

  const navigateToSurah = useCallback(
    (surah: Surah) => {
      navigate(`/surat/${surah.nomor}`);
      close();
    },
    [navigate, close]
  );

  return {
    searchState,
    handleInputChange,
    navigateToSurah,
    setSearchState,
    fetchAllSurahs,
  };
}

function HighlightQuery({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-transparent text-emerald-500 underline">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const SearchResultItem = memo(function SearchResultItem({
  surah,
  query,
  onSelect,
}: {
  surah: Surah;
  query: string;
  onSelect: (surah: Surah) => void;
}) {
  return (
    <li
      role="option"
      className="group block cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 first:border-t-0"
    >
      <Button
        variant="link"
        onClick={() => onSelect(surah)}
        className="items-start flex-col text-start"
      >
        <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-500 dark:text-gray-100">
          <HighlightQuery text={surah.namaLatin} query={query} />
        </div>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          <HighlightQuery text={surah.arti} query={query} />
        </div>
      </Button>
    </li>
  );
});

function SearchResults({
  searchState,
  onSelect,
}: {
  searchState: SearchState;
  onSelect: (s: Surah) => void;
}) {
  const { query, results, status } = searchState;

  if (status === SEARCH_STATUS.Loading) {
    return (
      <div className="p-6 text-center">
        <Svg
          variant="outline"
          width={20}
          height={20}
          draw={["M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"]}
          className="mx-auto animate-spin text-gray-700 dark:text-gray-300"
        />
        <p className="mt-2 text-xs text-gray-700 dark:text-gray-400">
          Searching...
        </p>
      </div>
    );
  }

  if (status === SEARCH_STATUS.Error) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-red-600 dark:text-red-400">
          Error searching. Please try again.
        </p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-gray-700 dark:text-gray-400">
          No results found for "{query}"
        </p>
      </div>
    );
  }

  return (
    <ul role="listbox" className="w-full max-h-96 overflow-y-auto">
      {results.map((surah) => (
        <SearchResultItem
          key={surah.nomor}
          surah={surah}
          query={query}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

const SearchInput = forwardRef<
  HTMLInputElement,
  {
    searchState: SearchState;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
  }
>(function SearchInput({ searchState, onChange, onClose }, inputRef) {
  return (
    <div className="group relative flex h-12">
      <Svg
        variant="outline"
        width={16}
        height={16}
        draw={[
          "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
        ]}
        className="absolute left-3 top-0 h-full text-gray-700 dark:text-gray-300"
      />
      <input
        ref={inputRef}
        type="search"
        className={cn(
          "flex-auto text-sm/6 appearance-none bg-transparent pl-10 text-gray-700 dark:text-gray-300 outline-none placeholder:text-gray-500 focus:w-full",
          searchState.status === SEARCH_STATUS.Loading ? "pr-11" : "pr-4"
        )}
        placeholder="Search surah..."
        value={searchState.query}
        spellCheck={false}
        autoComplete="off"
        onChange={onChange}
        onKeyDown={(e) => {
          if (
            e.key === "Escape" &&
            !searchState.isOpen &&
            searchState.query === ""
          ) {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            onClose();
          }
        }}
      />
      {searchState.status === SEARCH_STATUS.Loading && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <Svg
            variant="outline"
            width={20}
            height={20}
            draw={[
              "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
            ]}
            className="animate-spin text-gray-200"
          />
        </div>
      )}
    </div>
  );
});

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
  onSearch?: (query: string) => void;
}

function SearchDialog({
  open,
  setOpen,
  className,
  onSearch,
}: Readonly<SearchDialogProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchState, handleInputChange, navigateToSurah, setSearchState } =
    useSurahSearch({
      close() {
        setOpen(false);
      },
      onSearch,
    });

  const pathname = useLocation();

  useEffect(() => {
    if (pathname) {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add("overflow-hidden");
      inputRef.current?.focus();
    }

    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setSearchState((prev) => ({
      ...prev,
      query: "",
      results: [],
      status: SEARCH_STATUS.Idle,
    }));
  };

  if (!open) return null;

  return (
    <div
      className={cn(open ? "block" : "hidden", "fixed inset-0 z-50", className)}
    >
      <button
        className="fixed inset-0 z-40 size-full backdrop-blur-sm bg-gray-400/25 dark:bg-gray-950/40"
        onClick={handleClose}
        aria-label="Close search dialog"
      />

      <div className="fixed inset-y-0 inset-x-1/2 -translate-x-1/2 z-50 w-[calc(100%-5%)] h-max overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 md:w-[calc(100%-45%)] lg:px-8 lg:py-[15vh]">
        <div className="mx-auto w-full transform-gpu overflow-hidden rounded-lg bg-gray-50 shadow-xl ring-1 ring-gray-900/7.5 dark:bg-gray-900 dark:ring-gray-800">
          <form onSubmit={(e) => e.preventDefault()}>
            <SearchInput
              ref={inputRef}
              searchState={searchState}
              onChange={handleInputChange}
              onClose={handleClose}
            />
            <div className="border-t border-gray-200 bg-white empty:hidden dark:border-gray-100/5 dark:bg-white/2.5">
              {searchState.query && (
                <SearchResults
                  searchState={searchState}
                  onSelect={navigateToSurah}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface SearchProps {
  onSearch?: (query: string) => void;
}

const SearchComponent = ({ onSearch }: SearchProps) => {
  const [modifierKey] = useState(() =>
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent) ? "⌘" : "Ctrl"
  );
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        className="flex items-center text-sm rounded-full w-full max-w-md mx-auto my-6 px-3 py-2 font-normal text-gray-600 dark:text-gray-400 ring-1"
        onClick={() => setOpen(true)}
      >
        <Svg
          variant="outline"
          width={16}
          height={16}
          draw={[
            "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
          ]}
        />
        <div className="flex-1 text-start ml-1">Search surah...</div>
        {modifierKey && (
          <kbd className="inline-flex items-center rounded-full space-x-1 border border-gray-300 dark:border-gray-700 font-mono text-xs text-gray-600 dark:text-gray-400 px-1.5 py-0.5">
            <kbd>{modifierKey}</kbd>
            <kbd>K</kbd>
          </kbd>
        )}
      </Button>
      <Suspense fallback={null}>
        <SearchDialog open={open} setOpen={setOpen} onSearch={onSearch} />
      </Suspense>
    </>
  );
};

SearchComponent.displayName = "Search";

export const Search = memo(SearchComponent);

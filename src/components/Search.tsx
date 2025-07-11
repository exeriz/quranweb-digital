import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import { Button } from "../components/optimizing/Button";
import { Svg } from "../components/optimizing/Svg";
import { clss } from "../utils/clss";
import type { Surah } from "../assets/types/surah";

const SearchStatus = {
  Idle: "idle",
  Loading: "loading", 
  Success: "success",
  Error: "error"
}

interface SurahSearchState {
  query: string;
  results: Surah[];
  isOpen: boolean;
  status: typeof SearchStatus[keyof typeof SearchStatus];
}

function useWordPressSearch({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const [searchState, setSearchState] = useState<SurahSearchState>({
    query: "",
    results: [],
    isOpen: false,
    status: SearchStatus.Idle,
  });
  
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchState((prev) => ({ 
        ...prev, 
        results: [], 
        status: SearchStatus.Idle 
      }));
      return;
    }

    setSearchState((prev) => ({ ...prev, status: SearchStatus.Loading }));

    try {
      const response = await axios.get("https://equran.id/api/v2/surat");

      setSearchState((prev) => ({
        ...prev,
        results: response.data.data,
        status: SearchStatus.Success,
        isOpen: true,
      }));
    } catch (error) {
      console.error("Search error:", error);
    
      let errorMessage = "An error occurred while searching";
      if (axios.isAxiosError(error)) {
        errorMessage += `: ${error.message}`;
        if (error.response) {
          console.error("Response data:", error.response.data);
        }
      }
      
      setSearchState((prev) => ({ 
        ...prev, 
        status: SearchStatus.Error, 
        results: [],
        errorMessage
      }));
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchState((prev) => ({ ...prev, query }));
      
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      debounceTimeout.current = setTimeout(() => {
        fetchResults(query);
      }, 300);
    },
    [fetchResults]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const navigateToPost = useCallback(
    (surah: Surah) => {
      const customUrl = `/surat/${surah.nomor}`;
      navigate(customUrl);
      close();
    },
    [navigate, close]
  );

  return {
    searchState,
    handleInputChange,
    navigateToPost,
    setSearchState,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function HighlightQuery({
  text,
  query,
}: Readonly<{ text: string; query: string }>) {
  if (!query) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map(part =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={`highlight-${part}`}
            className="bg-transparent text-emerald-500 underline"
          >
            {part}
          </mark>
        ) : (
          <span key={`text-${part}`}>{part}</span>
        )
      )}
    </>
  );
}

function SearchResult({
  surah,
  resultIndex,
  query,
  onSelect,
}: Readonly<{
  surah: Surah;
  resultIndex: number;
  query: string;
  onSelect: (surah: Surah) => void;
}>) {
  const title = surah.namaLatin || 'Unknown';
  const excerpt = surah.deskripsi || 'Unknown';
  const excerptLength = (excerpt.length > 100 ? "..." : "");
  const cleanTitle = typeof title === 'string' ? stripHtml(title) : '';
  const cleanExcerpt = typeof excerpt === 'string' ? stripHtml(excerpt).substring(0, 100) + excerptLength : '';

  return (
    <li
      className={clss(
        "group block cursor-pointer px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900/50",
        resultIndex > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""
      )}
    >
      <Button
        variant="default"
        onClick={() => onSelect(surah)}
        className="items-start flex-col text-start"
      >
        <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-500 dark:text-gray-100">
          <HighlightQuery text={cleanTitle} query={query} />
        </div>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          <HighlightQuery text={cleanExcerpt} query={query} />
        </div>
      </Button>
    </li>
  );
}

function SearchResults({
  searchState,
  onSelect,
}: Readonly<{
  searchState: SurahSearchState;
  onSelect: (surah: Surah) => void;
}>) {
  const { query, results, status } = searchState;

  if (status === SearchStatus.Loading) {
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

  if (status === SearchStatus.Error) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-red-600 dark:text-red-400">
          An error occurred while searching. Please try again.
        </p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="p-6 text-center">
        <Svg
          variant="outline"
          width={24}
          height={24}
          draw={[
            "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6",
          ]}
          className="mx-auto text-gray-400 dark:text-gray-600"
        />
        <p className="mt-3 text-xs text-gray-700 dark:text-gray-400">
          Nothing found for{" "}
          <strong className="break-words font-semibold text-gray-800 dark:text-gray-200">
            &quot;{query}&quot;
          </strong>. Please try again.
        </p>
      </div>
    );
  }

  if (!Array.isArray(results)) {
    return null;
  }

  return (
    <ul className="w-full h-full max-h-100 overflow-y-auto">
      {results.map((surah, index) => (
        <SearchResult
          key={surah.nomor}
          surah={surah}
          resultIndex={index}
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
    searchState: SurahSearchState;
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
        className="absolute left-3 top-0 h-full text-gray-700 dark:text-gray-300 mr-1.5"
      />
      <label htmlFor="search-blog" className="sr-only">Search blog</label>
      <input
        ref={inputRef}
        id="search-blog"
        name="search-blog"
        type="search"
        data-autofocus
        className={clss(
          "flex-auto text-sm/6 appearance-none bg-transparent pl-10 text-gray-700 dark:text-gray-300 outline-none placeholder:text-gray-500 focus:w-full focus:flex-none",
          searchState.status === SearchStatus.Loading ? "pr-11" : "pr-4"
        )}
        placeholder="Search blog posts..."
        value={searchState.query}
        spellCheck={false}
        autoComplete="off"
        onChange={onChange}
        onKeyDown={(event) => {
          if (
            event.key === "Escape" &&
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
      {searchState.status === SearchStatus.Loading && (
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

function SearchDialog({
  open,
  setOpen,
  className,
}: Readonly<{
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}>) {
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    searchState, 
    handleInputChange, 
    navigateToPost, 
    setSearchState 
  } = useWordPressSearch({
    close() {
      setOpen(false);
    },
  });
  const pathname = useLocation();

  useEffect(() => {
    if (pathname) {
      setOpen(false);
    }
  }, [pathname, setOpen]);

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
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add("overflow-hidden");
    }
    
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setSearchState((prev) => ({ 
      ...prev, 
      query: "", 
      results: [],
      status: SearchStatus.Idle
    }));
  };

  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setHasError(false);
  }, [open]);

  if (hasError) {
    return (
      <div className={clss(
        open ? "block" : "hidden", 
        "fixed inset-0 z-50", 
        className
      )}>
        <button
          className="fixed inset-0 z-40 size-full backdrop-blur-sm bg-gray-400/25 dark:bg-gray-950/40"
          onClick={handleClose}
          aria-label="Close search dialog"
        />
        
        <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
          <div className="mx-auto transform-gpu overflow-hidden rounded-lg bg-gray-50 shadow-xl ring-1 ring-gray-900/7.5 sm:max-w-xl dark:bg-gray-900 dark:ring-gray-800 p-6 text-center">
            <p className="text-red-600 dark:text-red-400">
              Something went wrong. Please try again.
            </p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => {
                setHasError(false);
                handleClose();
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clss(
      open ? "block" : "hidden", 
      "fixed inset-0 z-50", 
      className
    )}>
      <button
        className="fixed inset-0 z-40 size-full backdrop-blur-sm bg-gray-400/25 dark:bg-gray-950/40"
        onClick={handleClose}
        aria-label="Close search dialog"
      />

      <div className="fixed inset-y-0 inset-x-1/2 -translate-x-1/2 z-50 w-[calc(100%-5%)] h-max overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 md:w-[calc(100%-45%)] lg:px-8 lg:py-[15vh]">
        <div className="mx-auto w-full transform-gpu overflow-hidden rounded-lg bg-gray-50 shadow-xl ring-1 ring-gray-900/7.5 dark:bg-gray-900 dark:ring-gray-800">
          <form 
            ref={formRef} 
            onSubmit={(event) => event.preventDefault()}
          >
            <SearchInput
              ref={inputRef}
              searchState={searchState}
              onChange={handleInputChange}
              onClose={handleClose}
            />
            <div
              ref={panelRef}
              className="border-t border-gray-200 bg-white empty:hidden dark:border-gray-100/5 dark:bg-white/2.5"
            >
              {searchState.query && (
                <SearchResults
                  searchState={searchState}
                  onSelect={navigateToPost}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function useSearchProps() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  return {
    buttonProps: {
      ref: buttonRef,
      onClick() {
        setOpen(true);
      },
    },
    dialogProps: {
      open,
      setOpen: useCallback(
        (open: boolean) => {
          const { width = 0, height = 0 } =
            buttonRef.current?.getBoundingClientRect() ?? {};
          if (!open || (width !== 0 && height !== 0)) {
            setOpen(open);
          }
        },
        [setOpen]
      ),
    },
  };
}

export function Search() {
  const [modifierKey, setModifierKey] = useState<string>("");
  const { buttonProps, dialogProps } = useSearchProps();

  useEffect(() => {
    setModifierKey(
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent) ? "⌘" : "Ctrl "
    );
  }, []);

  return (
    <>
      <Button
        variant="default"
        className="flex items-center text-sm rounded-full w-full max-w-md mx-auto my-6 bg-gray-50 dark:bg-gray-950 px-3 py-2 font-normal text-gray-600 dark:text-gray-400 ring-1 ring-gray-500/20 dark:ring-gray-400/20 ring-inset"
        {...buttonProps}
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
        <kbd className="inline-flex items-center rounded-full space-x-1.5 border border-gray-300 dark:border-gray-700 font-mono text-xs text-gray-600 dark:text-gray-400 px-1.5 py-0.5">
          <kbd>{modifierKey}</kbd>
          <kbd>K</kbd>
        </kbd>
      </Button>
      <Suspense fallback={null}>
        <SearchDialog {...dialogProps} />
      </Suspense>
    </>
  );
}
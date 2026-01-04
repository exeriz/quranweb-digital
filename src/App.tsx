import { lazy, Suspense, memo } from "react";
import { Route, Routes } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { LoadingState } from "./components/feedback";

const Home = lazy(() => import("./pages/home"));
const Surah = lazy(() => import("./pages/surah"));

const PageFallback = memo(() => <LoadingState />);

PageFallback.displayName = "PageFallback";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/surat/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <Surah />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

App.displayName = "App";

export default memo(App);

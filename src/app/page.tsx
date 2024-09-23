"use client";
import { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Explore from "@/components/explore/Explore";
import Footer from "@/components/footer/Footer";
import Login from "@/components/login/Login";
import LoadingPanel from "@/components/loading-panel/LoadingPanel";
import Lists from "@/components/lists/Lists";
export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [showSingleList, setShowSingleList] = useState(false);
  const [loadingText, setLoadingText] = useState("Connecting to SuSy Database");
  const [firstLoadCount, setFirstLoadCount] = useState<number>(0);
  useEffect(() => {
    if (showLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showLoading]);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
    setShowLoading(true);
  };

  return (
    <main className="bg-white">
      {isAuthenticated ? (
        <>
          <Header
            setListsOpen={setListsOpen}
            isListsOpen={isListsOpen}
            setShowSingleList={setShowSingleList}
            setFirstLoadCount={setFirstLoadCount}
          />
          {!listsOpen && (
            <Explore
              isAuthenticated={isAuthenticated}
              setListsOpen={setListsOpen}
              setShowLoading={setShowLoading}
              showLoading={showLoading}
              setLoadingText={setLoadingText}
              firstLoadCount={firstLoadCount}
              setFirstLoadCount={setFirstLoadCount}
            />
          )}
          {listsOpen && (
            <Lists
              setIsListsOpen={setIsListsOpen}
              isListOpen={isListsOpen}
              setShowSingleList={setShowSingleList}
              showSingleList={showSingleList}
              setLoadingText={setLoadingText}
              setShowLoading={setShowLoading}
            />
          )}

          {/* <Footer /> */}
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}

      {showLoading && <LoadingPanel loadingText={loadingText} />}
    </main>
  );
}

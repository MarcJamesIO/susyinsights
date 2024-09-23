import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  setListsOpen: (value: boolean) => void;
  isListsOpen: boolean;
  setShowSingleList?: (value: boolean) => void;
  setFirstLoadCount?: (value: number) => void;
}

const Header = ({
  setListsOpen,
  isListsOpen,
  setShowSingleList,
  setFirstLoadCount,
}: HeaderProps) => {
  const [activeTab, setActiveTab] = useState<string>("explore");

  useEffect(() => {
    if (isListsOpen) {
      setActiveTab("lists");
    } else {
      setActiveTab("explore");
    }
  }, [isListsOpen]);

  const handleListsClick = () => {
    setListsOpen(true);
    setActiveTab("lists");
    setShowSingleList && setShowSingleList(false);
  };

  const handleExploreClick = () => {
    setListsOpen(false);
    setActiveTab("explore");
    setFirstLoadCount && setFirstLoadCount(-1);
  };

  return (
    <header className="flex justify-between pl-16 pr-16 shadow-md w-full items-end border-b border-grey-400">
      <button
        onClick={handleExploreClick}
        className="text-black hover:underline mt-4 -translate-y-2"
      >
        <Image src="/logo.png" alt="logo" width={70} height={80} className="" />
      </button>
      <nav className="flex items-end text-susyBlue h-full">
        <ul className="flex space-x-16 font-SusyFont font-bold text-1xl">
          <li
            className={`pb-4 ${
              activeTab === "explore" ? "border-b-4 border-susyPink" : ""
            }`}
          >
            <button onClick={handleExploreClick} className="focus:outline-none">
              Explore
            </button>
          </li>
          <li
            className={`pb-4 ${
              activeTab === "lists" ? "border-b-4 border-susyPink" : ""
            }`}
          >
            <button onClick={handleListsClick} className="focus:outline-none">
              My lists
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

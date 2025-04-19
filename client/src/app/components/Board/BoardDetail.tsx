"use client";
import { Board } from "@/app/types/board";
import {
  getContrastColorFromImage,
  getContrastColorFromRGB,
} from "@/app/utils/getContrastColor";
import { useEffect, useState } from "react";

export default function BoardDetail({ board }: { board: Board }) {
  const [dynamicColor, setDynamicColor] = useState<string>("#364153");

  useEffect(() => {
    const fetchColor = async () => {
      if (board.cover) {
        const color = await getContrastColorFromImage(board.cover);
        setDynamicColor(color);
      } else {
        setDynamicColor(getContrastColorFromRGB(board.coverColor || ""));
      }
    };

    fetchColor();
  }, [board]);

  return (
    <div className="p-4">
      <div className="flex">
        <div className="lg:flex-[0_0_15%] lg:pr-2">
          <div className="bg-[rgb(220,234,254)] rounded-lg h-full">
            <div className="bg-[#ffffff3d] py-3.5 pr-2 pl-4 text-gray-800 font-bold leading-5 flex items-center">
              Inbox
            </div>
            <ul className=""></ul>
          </div>
        </div>
        <div className="lg:flex-[1_1_85%] lg:pl-2 ">
          <div
            className="rounded-lg h-[calc(100vh-105.25px)] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundColor: board?.coverColor || "",
              backgroundImage: `url(${board.cover})`,
              color: dynamicColor,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

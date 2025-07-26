"use client";

import { Board, BoardsResponse } from "@/app/types/board";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import CreateBoardModal from "./CreateBoardModal";
import debounce from "@/app/utils/debounce";
import fetchAuth from "@/app/libs/fetchAuth";
import { UnplashImageURL } from "@/app/libs/unplash";

export default function ListBoard({
  initialBoards,
  unplashImages,
}: {
  initialBoards: Board[];
  unplashImages: UnplashImageURL[];
}) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSearchValue = useCallback(
    debounce(async (search: string) => {
      if (!search) {
        setBoards(initialBoards);
        return;
      }

      try {
        const boards = await fetchAuth<Board[]>(`/boards?search=${search}`);
        setBoards(boards);
      } catch (error) {
        console.log(error);
      }
    }, 500),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    getSearchValue(search);
  };

  return (
    <div className="flex-4/5 pl-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-2xl text-gray-800">
          Các bảng của bạn
        </h1>
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Tìm kiếm..."
          onChange={handleSearch}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {boards.map((board) => (
          <Link
            href={`/cong-viec/${board.id}`}
            className="bg-white shadow-raised rounded-lg group"
            key={board.id}
          >
            {board.cover ? (
              <Image
                src={board.cover}
                alt={board.title}
                width={0}
                height={0}
                sizes="100vw"
                className="object-cover w-full h-24 rounded-t-lg group-hover:brightness-75"
              />
            ) : (
              <div
                className="w-full h-24 rounded-t-lg group-hover:brightness-75"
                style={{
                  backgroundColor: board?.coverColor || "",
                }}
              ></div>
            )}
            <div className="p-2">
              <p className="text-gray-600 truncate">{board.title}</p>
            </div>
          </Link>
        ))}

        <CreateBoardModal unplashImages={unplashImages} setBoards={setBoards} />
      </div>
    </div>
  );
}

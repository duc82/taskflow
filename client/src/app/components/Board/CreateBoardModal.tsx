"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import boardDecoration from "@/app/assets/board.svg";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BoardDto, boardSchema } from "@/app/schemas/board.schema";
import Select from "react-select";
import colors from "@/app/datas/colors.json";
import clsx from "clsx";
import { Board, BoardReponse } from "@/app/types/board";
import { formatError } from "@/app/utils/formatError";
import toast from "react-hot-toast";
import fetchAuth from "@/app/libs/fetchAuth";
import { useRouter } from "next/navigation";
import Spinner from "../Spinner";
import { UnplashImageURL } from "@/app/libs/unplash";
import useDisableKeyboardModal from "@/app/hooks/useDisableKeyboardModal";

export default function CreateBoardModal({
  unplashImages,
  setBoards,
}: {
  unplashImages: UnplashImageURL[];
  setBoards: Dispatch<SetStateAction<Board[]>>;
}) {
  const [coverEnd, setCoverEnd] = useState(7);
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  useDisableKeyboardModal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BoardDto>({
    resolver: zodResolver(boardSchema),
    mode: "onChange",
    defaultValues: {
      cover:
        unplashImages.length > 0
          ? `${unplashImages[0].raw}&q=40&auto=compress&fm=webp&w=2560`
          : "",
      visibility: "private",
    },
  });

  const onSubmit = async (data: BoardDto) => {
    try {
      const { board } = await fetchAuth<BoardReponse>("/boards/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setBoards((prev) => [board, ...prev]);
      closeRef.current?.click();
      router.push(`/cong-viec/${board.id}`);
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const options = [
    {
      value: "private",
      label: "Riêng tư",
      description:
        "Chỉ thành viên bảng thông tin mới có quyền xem bảng thông tin này. Quản trị viên của Không gian làm việc có thể đóng bảng thông tin hoặc xóa thành viên.",
    },
    {
      value: "public",
      label: "Công khai",
      description:
        "Bất kỳ ai trên mạng internet đều có thể xem bảng thông tin này. Chỉ thành viên bảng thông tin mới có quyền sửa.",
    },
  ];

  const formatOptionLabel = (
    {
      label,
      description,
    }: {
      label: string;
      description: string;
    },
    { context }: { context: string }
  ) => {
    if (context === "value") return label;
    return (
      <div className="flex flex-col cursor-pointer">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs">{description}</span>
      </div>
    );
  };

  return (
    <Menu>
      <MenuButton
        ref={closeRef}
        className="bg-gray-100 h-[calc(96px+40px)] shadow-raised rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-200 hover:shadow-none focus:outline-none"
      >
        <span className="text-gray-600 text-sm">Tạo bảng mới</span>
      </MenuButton>
      <MenuItems
        anchor="right"
        as="div"
        className="bg-white shadow-overlay rounded-lg p-4 pt-0 ml-2 text-gray-600 text-sm w-80 z-40"
      >
        <header className="py-1">
          <div className="flex items-center justify-between h-10">
            <div></div>
            <h2 className="text-center font-medium">Tạo bảng</h2>
            <MenuItem>
              <button
                type="button"
                className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
              >
                <XMarkIcon className="size-5" />
              </button>
            </MenuItem>
          </div>
        </header>

        <div className="overflow-y-auto">
          <div className="bg-board w-[200px] h-[120px] rounded-sm bg-center bg-cover flex items-center justify-center mx-auto mb-4">
            <Image src={boardDecoration} alt="Board Decoration" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="cover" className="text-sm/6 font-medium">
                Phông nền
              </label>
              <div className="mt-1">
                <ul className="grid grid-cols-4 gap-1.5 mb-2">
                  {unplashImages.slice(0, coverEnd).map((url, index) => {
                    const imageUrl = `${url.raw}&q=40&auto=compress&fm=webp&w=2560`;

                    return (
                      <li key={index} className="w-full h-10">
                        <button
                          type="button"
                          onClick={() => {
                            setValue("cover", imageUrl);
                            setValue("coverColor", "");
                          }}
                          className={clsx(
                            "relative w-full h-full group",
                            watch("cover") === imageUrl &&
                              "before:bg-[#00000029] before:absolute before:content-[''] before:inset-0 before:rounded-md before:z-10"
                          )}
                        >
                          {watch("cover") === imageUrl && (
                            <div className="absolute w-full top-1/2 -translate-y-1/2 left-0 flex justify-center z-10">
                              <CheckIcon className="size-4 text-white" />
                            </div>
                          )}
                          <Image
                            src={url.small}
                            alt="Unplash ImageImage"
                            fill
                            className="object-cover rounded-md group-hover:brightness-75"
                          />
                        </button>
                      </li>
                    );
                  })}
                  <li className="w-full h-10">
                    {coverEnd < 30 && (
                      <button
                        type="button"
                        className="bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center h-full w-full px-1.5 font-medium text-gray-800"
                        onClick={() => setCoverEnd((prev) => prev + 8)}
                      >
                        <PlusIcon className="size-5" />
                      </button>
                    )}
                  </li>
                </ul>

                <ul className="grid grid-cols-5 gap-1.5">
                  {colors.map((color, index) => (
                    <li key={index} className="w-full h-8">
                      <button
                        type="button"
                        onClick={() => {
                          setValue("coverColor", color);
                          setValue("cover", "");
                        }}
                        className={clsx(
                          "relative w-full h-full group",
                          watch("coverColor") === color &&
                            "before:bg-[#00000029] before:absolute before:content-[''] before:inset-0 before:rounded-md before:z-10"
                        )}
                      >
                        {watch("coverColor") === color && (
                          <div className="absolute w-full top-1/2 -translate-y-1/2 left-0 flex justify-center z-10">
                            <CheckIcon className="size-4 text-white" />
                          </div>
                        )}
                        <div
                          className="w-full h-full rounded-md group-hover:brightness-75"
                          style={{
                            backgroundColor: color,
                          }}
                        ></div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <label htmlFor="title" className="text-sm/6 font-medium">
                Tiêu đề bảng <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  {...register("title")}
                  required
                  autoComplete="off"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                />
              </div>
              {errors.title ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.title.message}
                </p>
              ) : (
                <p className="mt-1.5">
                  <span>👋</span> Tiêu đề bảng là bắt buộc
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="visibility"
                className="inline-block text-sm/6 font-medium mb-1"
              >
                Quyền xem
              </label>

              <Controller
                control={control}
                name="visibility"
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    id="visibility"
                    menuPosition="fixed"
                    value={options.find((option) => option.value === value)}
                    ref={ref}
                    formatOptionLabel={formatOptionLabel}
                    onChange={(val) => onChange(val?.value)}
                    options={options}
                    isSearchable={false}
                    styles={{
                      control: (base) => ({
                        ...base,
                        cursor: "pointer",
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                  />
                )}
              />
              {errors.visibility && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.visibility.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 rounded-md w-full py-2 flex justify-center items-center text-white font-semibold hover:bg-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Spinner /> : "Tạo mới"}
            </button>
          </form>
        </div>
      </MenuItems>
    </Menu>
  );
}

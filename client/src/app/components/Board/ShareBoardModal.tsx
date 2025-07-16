"use client";

import useClickOutside from "@/app/hooks/useClickOutside";
import fetchAuth from "@/app/libs/fetchAuth";
import { AddMemberResponse, BoardMember } from "@/app/types/board";
import { User } from "@/app/types/user";
import debounce from "@/app/utils/debounce";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import Select from "react-select";

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMembers: BoardMember[];
  boardId: string;
}

const options = [
  { value: "admin", label: "Quản trị viên" },
  { value: "member", label: "Thành viên" },
  { value: "remove", label: "Xóa khỏi bảng" },
];

export default function ShareBoardModal({
  isOpen,
  onClose,
  initialMembers,
  boardId,
}: ShareBoardModalProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<BoardMember[]>(initialMembers);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [role, setRole] = useState<string>("member");
  const [isSearching, setIsSearching] = useState(false);
  const { containerRef } = useClickOutside<HTMLUListElement>({
    enable: isSearching,
    cb: () => setIsSearching(false),
  });
  const searchRef = useRef<HTMLInputElement>(null);

  const handleRemoveMember = async (memberId: string) => {
    try {
      await fetchAuth(`/boards/members/remove/${memberId}`, {
        method: "DELETE",
      });
      setMembers((prevMembers) => prevMembers.filter((m) => m.id !== memberId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddMember = async () => {
    try {
      const { member } = await fetchAuth<AddMemberResponse>(
        `/boards/members/add`,
        {
          method: "POST",
          body: JSON.stringify({ userId: selectedUser, role, boardId }),
        }
      );
      setMembers((prevMembers) => [...prevMembers, member]);
      setSelectedUser("");
      const search = searchRef.current;
      if (search) {
        search.value = "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    try {
      const { member } = await fetchAuth<AddMemberResponse>(
        `/boards/members/update-role/${memberId}`,
        {
          method: "PUT",
          body: JSON.stringify({ role }),
        }
      );
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.id === member.id ? { ...m, role: member.role } : m
        )
      );
      setSelectedUser("");
    } catch (error) {
      console.log(error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearchUsers = useCallback(
    debounce(async (query) => {
      if (!query) {
        unstable_batchedUpdates(() => {
          setUsers([]);
          setIsSearching(false);
        });
        return;
      }
      try {
        const users = await fetchAuth<User[]>(`/users/search?query=${query}`);
        unstable_batchedUpdates(() => {
          setUsers(users.filter((u) => u.id !== user?.id));
          setIsSearching(true);
        });
      } catch (error) {
        console.log(error);
      }
    }, 500),
    []
  );

  if (!isOpen) return null;

  const isMember = members.some(
    (member) => member.user.id === user?.id && member.role === "member"
  );

  return (
    <div
      id="share-board-modal"
      className="fixed top-0 left-0 h-dvh w-dvw z-50 flex items-start justify-center overflow-auto bg-[#091e427d] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white h-auto my-12 p-4 rounded-lg shadow-lg w-[584px] relative text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Chia sẻ bảng</h2>
          <button
            type="button"
            className="size-9 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={onClose}
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-grow-1">
            <input
              type="text"
              className="py-1.5 pl-3 pr-1 rounded-sm w-full"
              placeholder="Địa chỉ email hoặc tên"
              onChange={(e) => {
                handleSearchUsers(e.target.value);
              }}
              ref={searchRef}
            />

            <ul
              ref={containerRef}
              className={clsx(
                "absolute top-full mt-2 rounded shadow-raised py-1 px-2 bg-white w-full z-50 space-y-2 max-h-80 overflow-y-auto",
                isSearching ? "block" : "hidden"
              )}
            >
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => {
                    const search = searchRef.current;
                    if (search) {
                      search.value = user.name;
                    }
                    setSelectedUser(user.id);
                    setIsSearching(false);
                  }}
                  className="flex items-center space-x-2 p-1 rounded hover:bg-gray-200 cursor-pointer"
                >
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span>{user.name} </span>
                </li>
              ))}
            </ul>
          </div>

          <Select
            options={[
              { value: "admin", label: "Quản trị viên" },
              { value: "member", label: "Thành viên" },
            ]}
            defaultValue={{ value: "member", label: "Thành viên" }}
            isSearchable={false}
            isOptionDisabled={(option) => {
              return isMember && option.value === "admin";
            }}
            onChange={(option) => {
              if (option) {
                setRole(option.value);
              }
            }}
          />
          <button
            type="button"
            disabled={!selectedUser}
            onClick={handleAddMember}
            className="h-9 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-medium"
          >
            Chia sẻ
          </button>
        </div>
        <div>
          <TabGroup>
            <TabList className="relative space-x-4 before:absolute before:content-[''] before:w-full before:bottom-0 before:bg-gray-300 before:h-0.5 before:rounded-[2px]">
              <Tab className="relative py-1.5 flex items-center after:absolute after:content-[''] after:bottom-0 after:left-0 after:w-full after:h-0.5 after:rounded-[2px] data-selected:after:bg-blue-600 hover:after:bg-gray-400">
                <span>Thành viên của bảng thông tin </span>
                <span className="ml-1 text-xs flex items-center justify-center rounded-full size-4 bg-gray-200">
                  {members.length}
                </span>
              </Tab>
              {/* <Tab className="relative py-1.5 after:absolute after:content-[''] after:bottom-0 after:left-0 after:w-full after:h-0.5 after:rounded-[2px] data-selected:after:bg-blue-600 hover:after:bg-gray-400">
                Yêu cầu tham gia
              </Tab> */}
            </TabList>
            <TabPanels>
              <TabPanel className="overflow-y-auto w-full h-auto">
                {members.map((member) => (
                  <div key={member.id} className="pt-4 pr-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={member.user.avatar}
                          alt={member.user.name}
                          width={32}
                          height={32}
                          className="object-cover rounded-full"
                        />
                        <span>
                          {member.user.name}{" "}
                          {user?.id === member.user.id && "(bạn)"}
                        </span>
                      </div>
                      <Select
                        className="w-36"
                        menuPosition="fixed"
                        options={options}
                        defaultValue={options.find(
                          (option) => option.value === member.role
                        )}
                        isSearchable={false}
                        isOptionDisabled={(option) => {
                          if (option.value === "admin") {
                            return isMember;
                          }
                          if (option.value === "member") {
                            return isMember;
                          }

                          if (option.value === "remove") {
                            if (isMember && member.user.id !== user?.id)
                              return true;

                            return (
                              !isMember &&
                              members.filter((m) => m.role === "admin").length <
                                2 &&
                              member.user.id === user?.id
                            );
                          }
                          return false;
                        }}
                        onChange={(option) => {
                          if (!option) return;
                          if (option.value === "remove") {
                            handleRemoveMember(member.id);
                            return;
                          }

                          handleUpdateMemberRole(member.id, option.value);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </TabPanel>
              <TabPanel>Content 2</TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}

import { useContext } from "react";
import { QueryClient } from "react-query";
import { axiosInstance } from "../../../config";
import {
  BlockedContent,
  BlockList,
  ProfileResponse,
  ProfileUpdateDto,
} from "../../../types/backend-alias";
import { Profile } from "../../../types/profile";
import { AppContext } from "../../../appContext";
import { intersection } from "lodash-es";


const getOwnProfile = async () => {
  const { session } = useContext(AppContext);

  // Check if userId exists before sending
  if (!session?.user?.id) {
    throw new Error("User ID is required to fetch the profile.");
  }

  const userInfo = {
    userId: session.user.id,
  };

  const response = await axiosInstance.post<Profile>("/profiles/mine", userInfo);
  return response.data;
};


const updateProfile = async ({
  id,
  about_me,
  avatar,
  name,
  profile,
  user_name,
  config,
  block_list,
}: ProfileUpdateDto) => {
  const response = await axiosInstance.patch<ProfileResponse>("/profiles/mine", {
    id,
    about_me,
    avatar,
    name,
    profile,
    user_name,
    config,
    block_list,
  });
  const result = response.data;

  return result;
};

export const DEFAULT_BLOCK_LIST: BlockList = {
  bots: [],
  creators: [],
  tags: [],
};

export const updateBlockList = async (newBlockList: BlockList, id:string, queryClient: QueryClient) => {
  const result = await updateProfile({ block_list: newBlockList, id:id });

  await Promise.all([
    queryClient.invalidateQueries("profile"),
    queryClient.invalidateQueries("profile-blocked"),
  ]);

  return result;
};

export const getBlockedContent = async () => {
  const { profile } = useContext(AppContext);
  if (!profile?.id) {
    throw new Error("Profile ID is missing");
  }

  const blockedContent = await axiosInstance.get<BlockedContent>(`/profiles/mine/blocked`, {
    params: { id: profile.id },
  });

  console.log(blockedContent,"blockedContent")

  return blockedContent.data;
};

export const isBlocked = (
  blockList: Profile["block_list"],
  type: "bots" | "creators",
  id: string
) => {
  if (!blockList) {
    return false;
  }

  const bList = blockList || DEFAULT_BLOCK_LIST;
  console.log({ blockList, type, id });

  if (type === "bots" || type === "creators") {
    return bList[type].includes(id);
  }

  return false;
};

export const isTagBlocked = (blockList: Profile["block_list"], tags?: number[]) => {
  if (!blockList || !tags) {
    return false;
  }

  const bList = blockList || DEFAULT_BLOCK_LIST;

  return intersection(bList.tags, tags).length > 0;
};

export const profileService = {
  getOwnProfile,
  getBlockedContent,
  updateProfile,
  isBlocked,
};

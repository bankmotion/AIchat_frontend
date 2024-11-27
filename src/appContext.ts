import { Session } from "@supabase/supabase-js";
import { createContext } from "react";
import { getLocalData, UserLocalData } from "./shared/services/user-local-data";
import { UserConfig } from "./shared/services/user-config";
import { Profile } from "./types/profile";

interface AppContextType {
  session?: Session | null;
  setSession: (session: Session | null) => void;
  profile?: Profile | null;
  setProfile: (profile: Profile | null) => void;
  isProfileLoading: boolean;
  config?: UserConfig;
  updateConfig: (config: Partial<UserConfig>) => void;
  localData: UserLocalData;
  updateLocalData: (data: Partial<UserLocalData>) => void;
  isActivateModalVisible?: boolean;
  setIsActivateModalVisible: (isActivateModalVisible: boolean) =>void;
  setLoginUserEmail:(loginUserEmail:string)=>void;
  loginUserEmail?:string;
}

export const AppContext = createContext<AppContextType>({
  setSession: (session) => {},
  setProfile: (profile) => {},
  localData: getLocalData(),
  isProfileLoading: false,
  updateLocalData: (data) => {},
  updateConfig: (config) => {},
  setIsActivateModalVisible:(isActivateModalVisible) =>{},
  setLoginUserEmail:(loginUserEmail)=>{}
});

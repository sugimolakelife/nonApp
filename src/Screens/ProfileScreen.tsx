
import { Thumbnail } from "native-base";
import React, { useState } from "react";
import { 
  Dimensions, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  FlatList,
  ListRenderItemInfo} from "react-native";
import man from "../../assets/icons8-person-64.png";
import { StackNavigationProp } from "@react-navigation/stack";
import { loadProfileInfoListAsync, removeProfileInfoAsync } from "../Store";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Profile">;
};

export function ProfileScreen({ navigation }: Props) {
  const [profileInfoList, setProfileInfoList] = useState<PictureInfo[]>([]);

  // 画像リストをストレージから読み込み、更新する
  const updateProfileInfoListAsync = async () => {
    const newProfileInfoList = await loadProfileInfoListAsync();
    setProfileInfoList(newProfileInfoList);
    console.log(profileInfoList[0]);
  };

  useFocusEffect(
    React.useCallback(() => {
      updateProfileInfoListAsync();
    }, [])
  );
  // 画像情報の削除処理 + 画面更新
  const removePictureInfoAndUpdateAsync = async (pictureInfo: PictureInfo) => {
    await removeProfileInfoAsync(pictureInfo);
    updateProfileInfoListAsync();
  };

  const handleEditButton = () => {
    navigation.navigate("Edit");
  };

  

  return (
    <View style={styles.content}>
      <View style={styles.profileSection}>
        <Thumbnail large source={profileInfoList[1]} style={styles.avatar} />
        <View style={styles.pictureInfoContainer}>
        {/* <Text style={styles.pictureTitle}>{`${profileInfoList[0].title}`}</Text> */}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditButton}>
          <Text style={styles.buttonText}>プロフィール編集</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
          <Text style={styles.buttonText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
  notLoginContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileSection: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: screenWidth,
    height: screenHeight / 3,
    padding: 10,
    borderColor: "black",
    borderWidth: 1,
  },
  avatar: {
    width: screenHeight / 5,
    height: screenHeight / 5,
    borderRadius: screenHeight / 10,
    marginBottom: 15,
    borderColor: "black",
    borderWidth: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  editButton: {
    position: "absolute",
    padding: 10,
    bottom: 10,
    right: 10,
  },
  logoutButton: {
    position: "absolute",
    padding: 10,
    bottom: 10,
    left: 10,
  },
  loginButton: {
    padding: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  buttonText: {
    fontSize: 10.5,
    color: "black",
  },
  pictureInfoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    margin: 5,
  },
  picture: {
    // 横の幅に合わせて3:4
    width: screenWidth * 1,
    height: (screenWidth * 0.8 * 4) / 3,
  },
  pictureTitle: {
    fontSize: 30,
  },
  timestamp: {
    fontSize: 15,
  },
});


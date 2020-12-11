import { Thumbnail } from "native-base";
import React, { useReducer, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import man from "../../assets/icons8-person-64.png";
import { StackNavigationProp } from "@react-navigation/stack";
import { loadProfileInfoAsync, removeProfileInfoAsync } from "../Store";
import { useFocusEffect } from "@react-navigation/native";
import firebase from "firebase";

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Profile">;
};

export function ProfileScreen({ navigation }: Props) {
  const [profileInfo, setProfileInfo] = useState<PictureInfo>();
  var user = firebase.auth().currentUser;

  // 画像リストをストレージから読み込み、更新する
  const updateProfileInfoAsync = async () => {
    const newProfileInfo = await loadProfileInfoAsync();
    setProfileInfo(newProfileInfo);
  };

  useFocusEffect(
    React.useCallback(() => {
      updateProfileInfoAsync();
    }, [])
  );
  // 画像情報の削除処理 + 画面更新
  const removePictureInfoAndUpdateAsync = async (pictureInfo: PictureInfo) => {
    await removeProfileInfoAsync(pictureInfo);
    updateProfileInfoAsync();
  };

  const handleEditButton = async () => {
    navigation.navigate("Edit");

    // const db = firebase.firestore();
      //ドキュメント取得
        // const doc =await db
        //   .collection("User")
        //   .doc("xQkAhENK4lFwn9wkdhcA")
        //   .get()
        //   console.log(doc.data());
          

        //コレクション取得
        // const snapshot=await db.collection("User").get();
        //   snapshot.forEach(doc => {
        //     console.log(doc.id,"=>",doc.data());
          
        // });
      //  const ref = db.collection("User").add({
      //    name:"田中",
      //    age:100
      //   });
      //   const snapShot = await ref.get();
      //   const data = snapShot.data();
      //   console.log((await ref).id, data );

//       if (user != null) {
//         user.providerData.forEach(function (profile) {
//           console.log("Sign-in provider: " + profile.providerId);
//           console.log("  Provider-specific UID: " + profile.uid);
//           console.log("  Name: " + profile.displayName);
//           console.log("  Email: " + profile.email);
//           console.log("  Photo URL: " + profile.photoURL);
//           console.log(user?.email);
//         });
//       }


//       user
//         .updateProfile({
//           displayName: "Jane Q. User",
//           photoURL: "https://example.com/jane-q-user/profile.jpg",
//         })
//         .then(function () {
//           // Update successful.
//         })
//         .catch(function (error) {
//           // An error happened.
//         });

// console.log("test");
  };

  const unsubscribe = () => {
    firebase
      .firestore()
      .collection("messages")
      .orderBy("createdAt")
      .onSnapshot((snapshot) => {});
  };


  const pressedSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {

        unsubscribe();
        navigation.navigate("SignIn");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <View style={styles.content}>
      <View style={styles.profileSection}>
        <Thumbnail
          large
          source={{ uri: profileInfo?.uri }}
          style={styles.avatar}
        />
        <View style={styles.pictureInfoContainer}>
          <Text style={styles.pictureTitle}>{`${profileInfo?.title}`}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditButton}>
          <Text style={styles.buttonText}>プロフィール編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            pressedSignOut();
          }}
        >
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

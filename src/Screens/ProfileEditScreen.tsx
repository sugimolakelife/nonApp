import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import moment from "moment";
import * as MediaLibrary from "expo-media-library";
import { saveProfileInfoAsync } from "../Store";

import { StackNavigationProp } from "@react-navigation/stack";
import man from "../../assets/icons8-person-64.png";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Thumbnail } from "native-base";
import firebase from "firebase";
import { RouteProp } from "@react-navigation/native";

type ChatScreenRouteProps = RouteProp<RootStackParamList, "Edit">;
type Props = {
  route: ChatScreenRouteProps;
  navigation: StackNavigationProp<RootStackParamList, "Edit">;
};

export function ProfileEditScreen(props: Props) {
  const currentUser = props.route.params.user;
  const [titleText, setTitleText] = useState("");
  const pictureURICache = React.useRef("");
  const [pictureURI, setPictureURI] = useState("");

  let openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();
    // カメラのアクセス許可
    if (permissionResult.granted === false) {
      alert("カメラロールへのアクセス許可が必要です");
      return;
    }
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      aspect: [1, 1],
      allowsEditing: true,
    });
    // カメラロールの準備を先にしておく
    console.log(pickerResult);
    // pikerResultに画像情報を入れる

    if (pickerResult.cancelled === true) {
      return;
    } else {
      setPictureURI(pickerResult.uri);
      pictureURICache.current = pickerResult.uri;
    }
  };

  React.useEffect(() => {
    return () => {
      // キャッシュを削除
      if (pictureURICache.current !== "") {
        FileSystem.deleteAsync(pictureURICache.current, { idempotent: true });
      }
    };
  }, []);

  const saveAsync = async () => {
    // タイトルが設定されていないとアラート
    if (titleText === "") {
      alert("タイトルを入力してください");
      return;
    }
    // タイトルが設定されていないとアラート
    if (pictureURI === "") {
      alert("写真が有りません");
      return;
    }

    // 画像のアップロード
    const storageRef = firebase.storage().ref("Avatar");
    const remotePath = `${moment.now()}.jpg`;
    const ref = storageRef.child(remotePath);
    // const url = await ref.getDownloadURL();
    const response = await fetch(pictureURI);
    // const responses = await fetch(url); //←
    const blob = await response.blob();
    // const bloba = await responses.blob() //←
    const task = await ref.put(blob);
    const avatar = await task.ref.getDownloadURL();

    // ログイン中のユーザーデータがあるか検索
    const query = await firebase.firestore().collection('User').where('userId', '==', currentUser.uid);
    const snapshot = await query.get();

    if (snapshot.empty) {
      // 検索結果が空なら新規作成
      const docRef = await firebase.firestore().collection("User").doc();
      const newUserInfo = {
        avatar: avatar,
        // emailaddress: string;
        userId: currentUser.uid,
        name: titleText,
        text: "",
        createdAt: firebase.firestore.Timestamp.now(),
        file: remotePath,
      } as UserInfo;
      await docRef.set(newUserInfo);
    } else {
      // すでにデータが有ったら上書き

      const docID = snapshot.docs[0].id;
      let userInfo = snapshot.docs[0].data() as UserInfo;

      //古いアイコンを削除
      storageRef.child(userInfo.file).delete();

      userInfo.name = titleText;
      userInfo.avatar = avatar;
      userInfo.file = remotePath;
      const docRef = firebase.firestore().collection("User").doc(docID);
      docRef.set(userInfo);
    }
  
    // キャッシュを削除
    FileSystem.deleteAsync(pictureURI);
    // Homeへ
    props.navigation.goBack();
    setPictureURI("");

    // カメラロールへ画像を保存
    // const asset = await MediaLibrary.createAssetAsync(selectedImage.localUri);
    // ストレージの画像リストに追加
    // const newPictureInfo: PictureInfo = {
    //   title: titleText,
    //   uri: asset.uri,
    //   createdAt: moment.now(),
    // };
    // await saveProfileInfoAsync(newPictureInfo);

    // キャッシュを削除
    FileSystem.deleteAsync(pictureURICache.current);
  };

  const Preview = () => {
    return (
      <Thumbnail large source={{ uri: pictureURI }} style={styles.avatar} />
    );
  };

  const Camera = () => {
    return (
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={openImagePickerAsync}
      >
        <Thumbnail large source={man} style={styles.avatar} />
        <Text>プロフィール写真を変更</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.titleInputConatiner}
          behavior={Platform.OS == "ios" ? "padding" : "height"}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="プロフィール名を編集"
            onChangeText={(value) => setTitleText(value)}
            maxLength={100}
          />
        </KeyboardAvoidingView>
        <View style={styles.previewContainer}>
          {pictureURI ? <Preview /> : <Camera />}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveAsync}>
            <Text style={styles.buttonText}>保存</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => props.navigation.goBack()}
          >
            <Text style={styles.buttonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleInputConatiner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  titleInput: {
    flex: 0.9,
    color: "#000",
    fontSize: 20,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 3,
  },
  cameraButton: {
    width: screenWidth * 0.8,
    height: screenHeight / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    width: screenWidth * 0.8,
    height: (screenWidth * 0.8 * 4) / 3,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#77f",
    padding: 5,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f77",
    padding: 5,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
  },
  avatar: {
    width: screenHeight / 5,
    height: screenHeight / 5,
    borderRadius: screenHeight / 10,
    marginBottom: 15,
    borderColor: "black",
    borderWidth: 2,
  },
});

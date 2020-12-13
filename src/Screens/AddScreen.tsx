
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
import { savePictureInfoAsync } from "../Store";

import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import firebase from "firebase";
import { RouteProp } from "@react-navigation/native";
import non from "../../assets/non.png";

// ナビゲーション情報を設定
type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Add">;
  route: RouteProp<RootStackParamList, "Add">;
};

const screenWidth = Dimensions.get("screen").width;

export function AddScreen(props: Props) {
  const [titleText, setTitleText] = useState("");
  const [pictureURI, setPictureURI] = useState("");
  const pictureURICache = React.useRef("");
  const currentUser = props.route.params.user;
  const navigation = props.navigation;
  const getArticleDocRef = async () => {
    return await firebase.firestore().collection("article").doc();
  };

  // カメラロール
  interface SelectedImageInfo {
    localUri: string;
  }
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo>();

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
    // pikerResultに画像情報を入れる

    if (pickerResult.cancelled === true) {
      return;
    } else {
      setSelectedImage({ localUri: pickerResult.uri });
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
    if (!selectedImage?.localUri) {
      alert("写真が有りません");
      return;
    }

    const storageRef = firebase.storage().ref("Photo");
    const remotePath = `${moment.now()}.jpg`;
    const ref = storageRef.child(remotePath);
    // const url = await ref.getDownloadURL();
    const response = await fetch(selectedImage.localUri);
    // const responses = await fetch(url); //←
    const blob = await response.blob();
    // const bloba = await responses.blob() //←
    const task = await ref.put(blob);
    const photoURI = await task.ref.getDownloadURL();
    const docRef = await getArticleDocRef();
    const newArticle = {
      PhotoURI: photoURI,
      title: titleText,
      text: "",
      createdAt: firebase.firestore.Timestamp.now(),
      userId: currentUser.uid,
      file: remotePath,
    } as Article;
    await docRef.set(newArticle);
    

    // カメラロールへ画像を保存
    const asset = await MediaLibrary.createAssetAsync(selectedImage.localUri);

    // ストレージの画像リストに追加
    const newPictureInfo: PictureInfo = {
      title: titleText,
      uri: asset.uri,
      createdAt: moment.now(),
    };
    await savePictureInfoAsync(newPictureInfo);
    console.log(newPictureInfo);

    // キャッシュを削除
    FileSystem.deleteAsync(selectedImage.localUri);

    // Homeへ
    navigation.goBack();
    setPictureURI("");
  };

  const Preview = () => {
    return (
      <Image style={styles.preview} source={{ uri: selectedImage?.localUri }} />
    );
  };

  const Camera = () => {
    return (
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={openImagePickerAsync}
      >
        <Icon name="camera" size={100} />
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveAsync}>
            <Text style={styles.buttonText}>シェア</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.previewContainer}>
          {selectedImage?.localUri ? <Preview /> : <Camera />}
        </View>
        <KeyboardAvoidingView
          style={styles.titleInputConatiner}
          behavior={Platform.OS == "ios" ? "padding" : "height"}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="テキストを入力"
            onChangeText={(value) => setTitleText(value)}
            maxLength={100}
          />
        </KeyboardAvoidingView>
      </View>
    </KeyboardAwareScrollView>
  );
}

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
    flex: 0.8,
    color: "#000",
    fontSize: 20,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 3,
    marginTop:10,
    marginBottom:10
  },
  cameraButton: {
    width: screenWidth * 0.8,
    height: (screenWidth * 0.8 * 4) / 3,
    borderRadius: 30,
    borderWidth: 2,
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
    alignItems: "flex-start",
    width: "100%",
    marginTop:10,
    marginBottom:10
  },
  saveButton: {
    padding: 5,
    borderRadius: 10,
    width: 75,
    alignItems: "center",
    borderWidth:2,
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
});

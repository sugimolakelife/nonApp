
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



type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Edit">;
};

export function ProfileEditScreen({ navigation }: Props) {
  const [titleText, setTitleText] = useState("");
  const pictureURICache = React.useRef("");

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
    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    // カメラロールの準備を先にしておく
    console.log(pickerResult);
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
    if (selectedImage?.localUri === "") {
      alert("写真が有りません");
      return;
    }

    // カメラロールへ画像を保存
    const asset = await MediaLibrary.createAssetAsync(selectedImage.localUri);

    // ストレージの画像リストに追加
    const newPictureInfo: PictureInfo = {
      title: titleText,
      uri: asset.uri,
      createdAt: moment.now(),
    };
    await saveProfileInfoAsync(newPictureInfo);

    // キャッシュを削除
    FileSystem.deleteAsync(selectedImage.localUri);

    // Homeへ
    navigation.goBack();
  };

  const Preview = () => {
    return (
      
      <Thumbnail large source={{ uri: selectedImage?.localUri }} style={styles.avatar} />
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
          {selectedImage?.localUri ? <Preview /> : <Camera />}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveAsync}>
            <Text style={styles.buttonText}>保存</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
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

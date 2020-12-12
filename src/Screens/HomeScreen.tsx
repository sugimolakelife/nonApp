import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  ListRenderItemInfo,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import moment from "moment";
import home from "../../assets/icons8-home-50.png";
import man from "../../assets/icons8-person-64.png";

// モジュールを追加
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

import {
  useFocusEffect,
  RouteProp,
  useNavigation,
} from "@react-navigation/native";
import { loadPictureInfoListAsync, removePictureInfoAsync } from "../Store";

import Icon from "react-native-vector-icons/FontAwesome";
import firebase from "firebase";

// ナビゲーション情報を設定
// type Props = {
//   navigation: StackNavigationProp<RootStackParamList, "Home">;
// };
const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
type ChatScreenRouteProps = RouteProp<RootStackParamList, "Home">;
type Props = {
  route: ChatScreenRouteProps;
};

export function HomeScreen(props: Props) {
  const currentUser = props.route.params.user;
  const [hasPermission, setHasPermission] = useState(false);
  // const [pictureInfoList, setPictureInfoList] = useState<PictureInfo[]>([]);
  const [ArticleList, setArticleList] = useState<Article[]>([]);

  useEffect(() => {
    //この中をまるまる変更(関数getMessagesの中身をここに記述)
    const article = [] as Article[];
    /* const unsubscribe = の部分を追加 */
    const unsubscribe = firebase
      .firestore()
      .collection("article")
      .orderBy("createdAt")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          //変化の種類が"added"だったときの処理
          if (change.type === "added") {
            //今アプリにもっているarticleに取得した差分を追加
            article.unshift(change.doc.data() as Article);
          }
        });
        
        setArticleList(article.slice());

        
      });
    /* この部分を追加 */
    return unsubscribe; //リスナーのデタッチ
  }, []);

  // アプリの初期化
  const initAppAsync = async () => {
    //カメラのアクセス権限を取得
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const cameraRollPermission = await ImagePicker.requestCameraRollPermissionsAsync();
    const granted = cameraPermission.granted && cameraRollPermission.granted;
    setHasPermission(granted);
  };

  // 画像リストをストレージから読み込み、更新する

  // const updatePictureInfoListAsync = async () => {
  //   const newPictureInfoList = await loadPictureInfoListAsync();
  //   setArticleList(article.slice());
  // };

  // 初期化処理
  React.useEffect(() => {
    initAppAsync();
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     updatePictureInfoListAsync();
  //   }, [])
  // );

  // 画像情報の削除処理 + 画面更新
  // const removePictureInfoAndUpdateAsync = async (pictureInfo: PictureInfo) => {
  //   await removePictureInfoAsync(pictureInfo);
  //   updatePictureInfoListAsync();
  // };

  const removeArticleAsync = async (article: Article) => {
    alert("消去しました");
    try {
      // Create a reference to the file to delete
      const storageRef = firebase.storage().ref("Photo");
      const deleteRef = storageRef.child(article.file);
      // Delete the file
      deleteRef.delete();
    } catch (error) {
      alert("Delete Storage " + error.toString());
    }
    try {
      const query = firebase
        .firestore()
        .collection("article")
        .where("createdAt", "==", article.createdAt);
      const docs = await query.get();
      docs.forEach((result) => {
        result.ref.delete();
      });
    } catch (error) {
      alert("Delete Firestore " + error.toString());
    }
  };
  const removeArticleAndUpdateAsync = async (article: Article) => {
    await removeArticleAsync(article);
  };

  // 写真を長押ししたときの処理
  const handleLongPressPicture = (item: Article) => {
    Alert.alert(item.title, "この写真の削除ができます。", [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "削除",
        onPress: () => {
          removeArticleAndUpdateAsync(item);
        },
      },
    ]);
  };
  // 画面遷移
  const navigation = useNavigation();
  const handleAddButton = () => {
    navigation.navigate("Add");
  };
  const handleProfileButton = () => {
    navigation.navigate("Profile");
  };
  const handleHomeButton = () => {
    navigation.navigate("Home");
  };

  const UnPermission = () => {
    return <Text>カメラ及びカメラロールへのアクセス許可が有りません。</Text>;
  };

  const renderPictureInfo = ({ item }: ListRenderItemInfo<Article>) => {
    return (
      <TouchableOpacity onLongPress={() => handleLongPressPicture(item)}>
        <View style={styles.pictureInfoContainer}>
          <Text style={styles.pictureTitle}>{item.title}</Text>
          <Image style={styles.picture} source={{ uri: item.PhotoURI }} />
          <Text style={styles.timestamp}>
            撮影日時:{" "}
            {moment(item.createdAt.toDate()).format("YYYY/MM/DD HH:mm:ss")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // FlatList部分
  const PictureDiaryList = () => {
    return (
      <View style={{ flex: 1 }}>
        <Text>{currentUser.email}でログイン中</Text>
        <FlatList
          data={ArticleList}
          renderItem={renderPictureInfo}
          keyExtractor={(item) => `${item.createdAt}`}
        />
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleHomeButton}
          >
            <Image source={home} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddButton}>
            <Icon style={styles.addButtonIcon} name="plus" size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manButton}
            onPress={handleProfileButton}
          >
            <Image source={man} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 権限が無かった時 */}
      {!hasPermission && <UnPermission />}
      {hasPermission && <PictureDiaryList />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
  footer: {
    textAlign: "center",
    bottom: 0,
    height: screenHeight * 0.12,
    width: screenWidth,
    borderColor: "black",
    borderWidth: 2,
    flexDirection: "row",
  },
  addButton: {
    position: "absolute",
    top: "50%",
    right: "50%",
    transform: [{ translateX: 25 }, { translateY: -30 }],
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "black",
    borderWidth: 2,
  },
  addButtonIcon: {
    color: "black",
  },
  homeButton: {
    position: "absolute",
    top: "50%",
    left: "10%",
    transform: [{ translateY: -30 }],
  },
  manButton: {
    position: "absolute",
    top: "50%",
    right: "10%",
    transform: [{ translateY: -40 }],
  },
});

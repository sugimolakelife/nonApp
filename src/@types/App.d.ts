

interface PictureInfo {
  title: string;
  uri: string;
  createdAt: number;
}

    type RootStackParamList = {
  //  受け取るパラメータは無いのでundefined
  Home: {user: signedInUser};
  Add: {user: signedInUser};
  Profile: {user: signedInUser};
  Edit: {user: signedInUser};
  SignIn: undefined;
  SignUp: undefined;
}

declare module "*.png";

type signedInUser = {
    email: string;
    uid: string;
};

type Article = {
    PhotoURI: string;
    title: string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
    file: string;
};

type ArticleContainer = {
    PhotoURI: string;
    title: string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
    file: string;
    avatar: string;
    name: string; 
};

type MainTabParamList = {
    Home: {user: signedInUser};
    PostImage: {user: signedInUser};
    Profile: { user: signedInUser };
    Post: undefined;
    Profileedit: undefined;
};

type UserInfo = {
    avatar: string;
    // emailaddress: string; //メアド編集機能つける時
    name: string;    
    userId: string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    file: string;
};

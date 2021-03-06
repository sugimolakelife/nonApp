

interface PictureInfo {
  title: string;
  uri: string;
  createdAt: number;
}

    type RootStackParamList = {
  //  受け取るパラメータは無いのでundefined
  Home: undefined;
  Add: undefined;
  Profile: undefined;
  Edit: undefined;
  SignIn: undefined;
  SignUp: undefined;
}

    declare module "*.png";

    type signedInUser = {
    email: string;
    uid: string;
};


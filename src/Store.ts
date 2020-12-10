import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PICTURE_INFO_KEY = 'PictureInfo';
const PROFILE_INFO_KEY = 'ProfileInfo';

// 初期化処理 ストレージの初期化(無期限)
const storage = new Storage({
    size: 1000,
    storageBackend: AsyncStorage,
    defaultExpires: null,
    enableCache: true,
});

// 保存処理 keyとidでdataを保存(keyでデータはひとまとめ データ毎にidで整理)
export const savePictureInfoAsync = async (pictureInfo: PictureInfo) => {
    await storage.save({
    key: PICTURE_INFO_KEY,
    id: `${pictureInfo.createdAt}`,
    data: pictureInfo
    });
};

export const saveProfileInfoAsync = async (profileInfo: PictureInfo) => {
    await storage.save({
    key: PROFILE_INFO_KEY,
    id: `${profileInfo.createdAt}`,
    data: profileInfo
    });
};

// 読み込み処理 keyに対応するデータをすべて取得
export const loadPictureInfoListAsync = async () => {
    const pictureInfoList = await storage.getAllDataForKey<PictureInfo>(PICTURE_INFO_KEY);
    return pictureInfoList;
};
export const loadProfileInfoListAsync = async () => {
    const profileInfoList = await storage.getAllDataForKey<PictureInfo>(PROFILE_INFO_KEY);
    return profileInfoList;
};

// 削除処理 keyに対応するデータの中からidのデータを削除
export const removePictureInfoAsync = async (pictureInfo: PictureInfo) => {
    await storage.remove({
    key: PICTURE_INFO_KEY,
    id: `${pictureInfo.createdAt}`,
    });
}

export const removeProfileInfoAsync = async (pictureInfo: PictureInfo) => {
    await storage.remove({
    key: PROFILE_INFO_KEY,
    id: `${pictureInfo.createdAt}`,
    });
}
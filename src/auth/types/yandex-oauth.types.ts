type YandexProfileJson = {
  id: string;
  login: string;
  client_id: string;
  display_name: string;
  real_name: string;
  first_name: string;
  last_name: string;
  sex: string | null;
  default_email: string;
  emails: string[];
  birthday: string;
  default_avatar_id: string;
  is_avatar_empty: boolean;
  default_phone?: {
    id: number;
    number: string;
  };
  psuid: string;
};

export type YandexProfile = {
  provider: string;
  id: string;
  username: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  gender: string | null;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
  _raw: string;
  _json: YandexProfileJson;
};

export type YandexOauthData = {
  provider: string;
  providerId: string;
  email: string;
  name: string;
};

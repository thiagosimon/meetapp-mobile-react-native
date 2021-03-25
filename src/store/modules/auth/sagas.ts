import { takeLatest, call, put, all } from 'redux-saga/effects';
import { Alert } from 'react-native';
import api from '../../../services/api';
import Navigation from '../../../services/navigation';

import { Action } from './types';

import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }: Action) {
  try {
    const { email, password } = payload;
    console.tron.log(payload);
    const response = yield call(api.post, 'sessions', {
      email,
      password,
    });

    const { token, user } = response.data;
    api.defaults.headers.Authorization = `Bearer ${token}`;
    yield put(signInSuccess(token, user));
  } catch (err) {
    Alert.alert('Falha na autenticação, verifique seus dados');
    yield put(signFailure());
  }
}

export function* signUp({ payload }: Action) {
  try {
    const { name, email, password } = payload;

    yield call(api.post, 'users', {
      name,
      email,
      password,
      provider: true,
    });
    Navigation.navigate('SignIn');
    Alert.alert('Conta criada com sucesso');
  } catch (err) {
    Alert.alert('Falha no cadastro, verifique seus dados');
    yield put(signFailure());
  }
}

export function setToken({ payload }: Action) {
  if (!payload) return;
  const { token } = payload.auth;
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
]);

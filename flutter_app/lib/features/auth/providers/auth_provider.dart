import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/endpoints.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../models/user_model.dart';

part 'auth_provider.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(UserProfile user) = _Authenticated;
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.error(String message) = _Error;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._ref) : super(const AuthState.initial()) {
    _initialize();
  }

  final Ref _ref;

  Future<void> _initialize() async {
    final storage = _ref.read(secureStorageProvider);
    final token = await storage.getAccessToken();
    if (token == null) {
      state = const AuthState.unauthenticated();
      return;
    }
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.get(Endpoints.me);
      final user = UserProfile.fromJson(res.data as Map<String, dynamic>);
      state = AuthState.authenticated(user);
    } catch (_) {
      state = const AuthState.unauthenticated();
    }
  }

  Future<void> refreshUser() async {
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.get(Endpoints.me);
      final user = UserProfile.fromJson(res.data as Map<String, dynamic>);
      state = AuthState.authenticated(user);
    } catch (_) {}
  }

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.post(
        Endpoints.login,
        data: {'email': email, 'password': password},
      );
      final tokens = AuthTokens.fromJson(res.data as Map<String, dynamic>);
      final storage = _ref.read(secureStorageProvider);
      await storage.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
      await _initialize();
    } on Exception catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = const AuthState.loading();
    try {
      final dio = _ref.read(apiClientProvider);
      final res = await dio.post(
        Endpoints.register,
        data: {'name': name, 'email': email, 'password': password},
      );
      final tokens = AuthTokens.fromJson(res.data as Map<String, dynamic>);
      final storage = _ref.read(secureStorageProvider);
      await storage.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
      await _initialize();
    } on Exception catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  Future<void> logout() async {
    try {
      final dio = _ref.read(apiClientProvider);
      await dio.post(Endpoints.logout);
    } catch (_) {}
    final storage = _ref.read(secureStorageProvider);
    await storage.clearTokens();
    state = const AuthState.unauthenticated();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref),
);

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';

const _baseUrl = String.fromEnvironment(
  'GRIT_API_URL',
  defaultValue: 'https://web-production-af49a.up.railway.app',
);

final apiClientProvider = Provider<Dio>((ref) {
  final storage = ref.read(secureStorageProvider);
  return _buildDio(storage, ref);
});

Dio _buildDio(SecureStorage storage, Ref ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(_AuthInterceptor(dio, storage));
  return dio;
}

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._dio, this._storage);

  final Dio _dio;
  final SecureStorage _storage;
  bool _isRefreshing = false;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshToken = await _storage.getRefreshToken();
        if (refreshToken == null) {
          await _storage.clearTokens();
          return handler.next(err);
        }
        final response = await _dio.post(
          '/auth/refresh',
          data: {'refresh_token': refreshToken},
        );
        final newToken = response.data['access_token'] as String;
        await _storage.saveAccessToken(newToken);
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final retried = await _dio.fetch(err.requestOptions);
        return handler.resolve(retried);
      } catch (_) {
        await _storage.clearTokens();
        return handler.next(err);
      } finally {
        _isRefreshing = false;
      }
    }
    handler.next(err);
  }
}

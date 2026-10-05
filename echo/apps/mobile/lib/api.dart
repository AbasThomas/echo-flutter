import 'dart:convert';
import 'package:dio/dio.dart';

const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:4000/api/v1');

class TurnResult {
  TurnResult(this.transcript, this.response);
  final String transcript, response;
}

class EchoApi {
  final _dio = Dio(BaseOptions(
      baseUrl: apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 60)));

  Future<TurnResult> voiceTurn(String path, List<Map<String, String>> history) async {
    try {
      final res = await _dio.post('/voice/turn', data: FormData.fromMap({
        'audio': await MultipartFile.fromFile(path,
            filename: 'audio.m4a', contentType: DioMediaType('audio', 'mp4')),
        'history': jsonEncode(history),
      }));
      return TurnResult(res.data['transcript'], res.data['response']);
    } on DioException catch (e) {
      final msg = e.response?.data is Map ? e.response!.data['message'] : null;
      throw Exception(msg ?? 'Could not reach Echo. Check your connection and retry.');
    }
  }
}

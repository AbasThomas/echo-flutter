import 'package:flutter/widgets.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'api.dart';

void main() => runApp(const EchoApp());

enum Phase { idle, recording, processing, speaking, denied, error }

class EchoApp extends StatelessWidget {
  const EchoApp({super.key});
  @override
  Widget build(BuildContext context) => WidgetsApp(
        color: const Color(0xFF000000),
        textStyle: const TextStyle(color: Color(0xFFFFFFFF), fontSize: 18),
        pageRouteBuilder: <T>(settings, builder) => PageRouteBuilder<T>(
            settings: settings, pageBuilder: (c, _, __) => builder(c)),
        home: const Home(),
      );
}

class Home extends StatefulWidget {
  const Home({super.key});
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  final _rec = AudioRecorder();
  final _tts = FlutterTts();
  final _api = EchoApi();
  final _history = <Map<String, String>>[];
  Phase phase = Phase.idle;
  String transcript = '', reply = '', error = '';
  String? _lastPath;

  @override
  void initState() {
    super.initState();
    _tts.setCompletionHandler(() => _set(Phase.idle));
  }

  void _set(Phase p, {String e = ''}) {
    if (mounted) setState(() { phase = p; error = e; });
  }

  Future<void> _toggle() async {
    if (phase == Phase.recording) return _stop();
    if (phase == Phase.speaking) { await _tts.stop(); return _set(Phase.idle); }
    if (phase == Phase.processing) return;
    if (!await Permission.microphone.request().isGranted) return _set(Phase.denied);
    final dir = await getTemporaryDirectory();
    _lastPath = '${dir.path}/turn.m4a';
    await _rec.start(const RecordConfig(encoder: AudioEncoder.aacLc), path: _lastPath!);
    _set(Phase.recording);
  }

  Future<void> _stop() async {
    final path = await _rec.stop();
    if (path == null) return _set(Phase.error, e: 'No recording found. Try again.');
    _lastPath = path;
    await _send();
  }

  Future<void> _send() async {
    if (_lastPath == null) return;
    _set(Phase.processing);
    try {
      final r = await _api.voiceTurn(_lastPath!, _history);
      _history
        ..add({'role': 'user', 'content': r.transcript})
        ..add({'role': 'assistant', 'content': r.response});
      setState(() { transcript = r.transcript; reply = r.response; });
      _set(Phase.speaking);
      await _tts.speak(r.response);
    } catch (e) {
      _set(Phase.error, e: e.toString().replaceFirst('Exception: ', ''));
    }
  }

  String get _label => switch (phase) {
        Phase.idle => 'Tap to talk',
        Phase.recording => 'Listening. Tap to send',
        Phase.processing => 'Thinking',
        Phase.speaking => 'Speaking. Tap to stop',
        Phase.denied => 'Microphone is off. Enable it in Settings to talk to Echo.',
        Phase.error => error,
      };

  @override
  Widget build(BuildContext context) {
    const white = Color(0xFFFFFFFF), grey = Color(0xFF9E9E9E), black = Color(0xFF000000);
    final active = phase == Phase.recording;
    return Container(
      color: black,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Echo', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: white)),
            Expanded(
              child: SingleChildScrollView(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const SizedBox(height: 24),
                  if (transcript.isNotEmpty) Text(transcript, style: const TextStyle(color: grey)),
                  const SizedBox(height: 12),
                  if (reply.isNotEmpty)
                    Text(reply, style: const TextStyle(fontSize: 24, color: white, height: 1.35)),
                ]),
              ),
            ),
            Center(
              child: Semantics(
                button: true,
                label: _label,
                child: GestureDetector(
                  onTap: _toggle,
                  child: Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: active ? white : black,
                      border: Border.all(color: white, width: 3),
                    ),
                    child: Center(
                      child: HugeIcon(
                        icon: phase == Phase.speaking
                            ? HugeIcons.strokeRoundedStop
                            : HugeIcons.strokeRoundedMic01,
                        color: active ? black : white,
                        size: 40,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(child: Text(_label, textAlign: TextAlign.center, style: const TextStyle(color: grey))),
            if (phase == Phase.error && _lastPath != null)
              Center(
                child: GestureDetector(
                  onTap: _send,
                  child: const Padding(
                    padding: EdgeInsets.all(12),
                    child: Text('Retry', style: TextStyle(color: white, decoration: TextDecoration.underline)),
                  ),
                ),
              ),
          ]),
        ),
      ),
    );
  }
}

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'core/pipe_sizing.dart';
import 'core/unit_conversion.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const HvacConverterApp());
}

class HvacConverterApp extends StatelessWidget {
  const HvacConverterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HVAC Unit Converter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
        scaffoldBackgroundColor: const Color(0xFFF4F7FC),
        useMaterial3: true,
      ),
      home: const ConverterHomePage(),
    );
  }
}

class ConverterHomePage extends StatefulWidget {
  const ConverterHomePage({super.key});

  @override
  State<ConverterHomePage> createState() => _ConverterHomePageState();
}

class _ConverterHomePageState extends State<ConverterHomePage> {
  static const double _hintFontScale = 1.25;
  static const double _hintLineHeight = 1.45;
  static const EdgeInsets _hintVerticalPadding = EdgeInsets.symmetric(vertical: 7);

  final _tempController = TextEditingController();
  String _tempUnit = 'C';

  final _areaLengthController = TextEditingController();
  final _areaWidthController = TextEditingController();

  final _coolingCapacityController = TextEditingController();
  String _coolingCapacityUnit = 'RT';

  final _airflowController = TextEditingController();
  String _airflowUnit = 'CFM';

  final _pressureController = TextEditingController();
  String _pressureUnit = 'Pa';

  final _velocityController = TextEditingController();
  String _velocityUnit = 'm/s';

  final _pipeFlowController = TextEditingController();
  String _pipeFlowUnit = 'LPM';

  final _dpMeasuredController = TextEditingController();
  String _dpMeasuredUnit = 'kPa';
  String _dpPipeSize = '15A';
  final _dpRefFlowController = TextEditingController(text: '300');
  final _dpRefLossController = TextEditingController(text: '30');
  String _dpRefLossUnit = 'kPa';

  final _powerController = TextEditingController();
  String _powerUnit = 'kW';

  final _threePhaseVoltageController = TextEditingController();
  final _threePhaseCurrentController = TextEditingController();
  final _threePhasePfController = TextEditingController(text: '0.85');

  final _singlePhaseVoltageController = TextEditingController();
  final _singlePhaseCurrentController = TextEditingController();
  final _singlePhasePfController = TextEditingController(text: '1.0');

  final _estimatePowerController = TextEditingController();
  String _estimatePowerUnit = 'kW';
  final _estimateVoltageController = TextEditingController();
  String _estimatePhase = '單相';
  final _estimatePfController = TextEditingController(text: '0.85');

  static const _airflowToBase = <String, double>{
    'CFM': 0.000471947,
    'CMH': 1 / 3600,
    'm3/s': 1,
    'L/s': 0.001,
    'LPM': 1 / 60000,
    'CMM': 1 / 60,
  };

  static const _coolingCapacityToRt = <String, double>{
    'RT': 1,
    'kW': 1 / 3.517,
    'kcal/h': 1 / 3024,
    'BTU/h': 1 / 12000,
  };

  static const _pressureToPa = <String, double>{
    'Pa': 1,
    'kPa': 1000,
    'mmAq': 9.80665,
    'bar': 100000,
    'psi': 6894.76,
    'N/m2': 1,
  };

  static const _velocityToMs = <String, double>{
    'm/s': 1,
    'ft/s': 1 / 3.28084,
    'mm/s': 1 / 1000,
    'cm/s': 1 / 100,
  };

  static const _dpToPaMap = <String, double>{
    'kPa': 1000,
    'mAq': 9806.65,
    'bar': 100000,
    'psi': 6894.76,
  };

  static const _powerToW = <String, double>{
    'W': 1,
    'kW': 1000,
    'MW': 1000000,
    'HP': 745.7,
  };

  static const _estimatePowerToKw = <String, double>{
    'W': 0.001,
    'kW': 1,
    'HP': 0.7457,
  };

  static const List<PipeSize> _pipeSizeList = [
    PipeSize(a: '15A', inchDn: '1/2" / DN15', innerDiameterMm: 15.8),
    PipeSize(a: '20A', inchDn: '3/4" / DN20', innerDiameterMm: 20.9),
    PipeSize(a: '25A', inchDn: '1" / DN25', innerDiameterMm: 26.6),
    PipeSize(a: '32A', inchDn: '1-1/4" / DN32', innerDiameterMm: 35.1),
    PipeSize(a: '40A', inchDn: '1-1/2" / DN40', innerDiameterMm: 40.9),
    PipeSize(a: '50A', inchDn: '2" / DN50', innerDiameterMm: 52.5),
    PipeSize(a: '65A', inchDn: '2-1/2" / DN65', innerDiameterMm: 62.7),
    PipeSize(a: '80A', inchDn: '3" / DN80', innerDiameterMm: 77.9),
    PipeSize(a: '100A', inchDn: '4" / DN100', innerDiameterMm: 102.3),
    PipeSize(a: '125A', inchDn: '5" / DN125', innerDiameterMm: 128.2),
    PipeSize(a: '150A', inchDn: '6" / DN150', innerDiameterMm: 154.1),
    PipeSize(a: '200A', inchDn: '8" / DN200', innerDiameterMm: 202.7),
    PipeSize(a: '250A', inchDn: '10" / DN250', innerDiameterMm: 254.5),
    PipeSize(a: '300A', inchDn: '12" / DN300', innerDiameterMm: 303.2),
    PipeSize(a: '350A', inchDn: '14" / DN350', innerDiameterMm: 333.4),
  ];

  @override
  void initState() {
    super.initState();
    for (final controller in [
      _tempController,
      _areaLengthController,
      _areaWidthController,
      _coolingCapacityController,
      _airflowController,
      _pressureController,
      _velocityController,
      _pipeFlowController,
      _dpMeasuredController,
      _dpRefFlowController,
      _dpRefLossController,
      _powerController,
      _threePhaseVoltageController,
      _threePhaseCurrentController,
      _threePhasePfController,
      _singlePhaseVoltageController,
      _singlePhaseCurrentController,
      _singlePhasePfController,
      _estimatePowerController,
      _estimateVoltageController,
      _estimatePfController,
    ]) {
      controller.addListener(_handleInputChanged);
    }
  }

  @override
  void dispose() {
    for (final controller in [
      _tempController,
      _areaLengthController,
      _areaWidthController,
      _coolingCapacityController,
      _airflowController,
      _pressureController,
      _velocityController,
      _pipeFlowController,
      _dpMeasuredController,
      _dpRefFlowController,
      _dpRefLossController,
      _powerController,
      _threePhaseVoltageController,
      _threePhaseCurrentController,
      _threePhasePfController,
      _singlePhaseVoltageController,
      _singlePhaseCurrentController,
      _singlePhasePfController,
      _estimatePowerController,
      _estimateVoltageController,
      _estimatePfController,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  void _handleInputChanged() {
    setState(() {});
  }

  double? _parsePositive(String value) {
    final v = double.tryParse(value.trim());
    if (v == null || !v.isFinite || v <= 0) return null;
    return v;
  }

  double? _parseAny(String value) {
    final v = double.tryParse(value.trim());
    if (v == null || !v.isFinite) return null;
    return v;
  }

  String _formatNumber(double? value) {
    if (value == null || !value.isFinite) return '-';
    return value.toStringAsFixed(4);
  }

  String _formatNumber2(double? value) {
    if (value == null || !value.isFinite) return '-';
    return value.toStringAsFixed(2);
  }

  double _pipeAreaM2(PipeSize pipe) {
    final diameterM = pipe.innerDiameterMm / 1000;
    return math.pi * diameterM * diameterM / 4;
  }

  double convertToLpm(double value, String unit) {
    switch (unit) {
      case 'CFM':
        return value * 28.3168;
      case 'CMH':
        return value * 1000 / 60;
      case 'm3/s':
        return value * 60000;
      case 'L/s':
        return value * 60;
      case 'LPM':
        return value;
      case 'CMM':
        return value * 1000;
      default:
        return value;
    }
  }

  PipeSuggestion _suggestPipe(double flowM3s) {
    final candidate = _pipeSizeList.firstWhere(
      (pipe) {
        final velocity = flowM3s / _pipeAreaM2(pipe);
        final a = int.parse(pipe.a.replaceAll('A', ''));
        final limit = a <= 40 ? 1.2 : 3.0;
        return velocity <= limit;
      },
      orElse: () => _pipeSizeList.last,
    );
    final velocity = flowM3s / _pipeAreaM2(candidate);
    final a = int.parse(candidate.a.replaceAll('A', ''));
    final limit = a <= 40 ? 1.2 : 3.0;
    return PipeSuggestion(pipe: candidate, velocity: velocity, exceedsRecommendedRange: velocity > limit);
  }

  Widget _numericField(
    TextEditingController controller, {
    String? label,
    String? hint,
  }) {
    return TextField(
      controller: controller,
      keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
      inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^[-0-9.]*$'))],
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: _hintStyle,
      ),
    );
  }

  double _parsePowerFactor(String value, double defaultValue) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return defaultValue;
    final parsed = double.tryParse(trimmed);
    if (parsed == null || !parsed.isFinite || parsed <= 0) return defaultValue;
    if (parsed > 1) return 1;
    return parsed;
  }

  TextStyle get _hintStyle => TextStyle(
        fontSize: 12 * _hintFontScale,
        height: _hintLineHeight,
        color: Colors.grey[700],
      );

  TextStyle get _sectionDescriptionStyle => TextStyle(
        fontSize: 13 * _hintFontScale,
        height: _hintLineHeight,
        color: Colors.grey[700],
      );

  Widget _resultRows(Map<String, String> data) {
    return Column(
      children: data.entries
          .map(
            (entry) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: Text(entry.key)),
                  const SizedBox(width: 8),
                  Text(entry.value, style: const TextStyle(fontFamily: 'monospace')),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _mobileSafeSelector({
    required String label,
    required String sheetTitle,
    required String value,
    required List<SelectorOption<String>> options,
    required ValueChanged<String> onChanged,
  }) {
    return MobileSafeSelector<String>(
      label: label,
      sheetTitle: sheetTitle,
      value: value,
      options: options,
      onChanged: onChanged,
    );
  }

  Widget _converterCard({required String title, required Widget child}) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }

  Widget _temperatureCard() {
    final input = _parseAny(_tempController.text);
    String result = '-';
    if (input != null) {
      final celsius = _tempUnit == 'C' ? input : (input - 32) * (5 / 9);
      final targetUnit = _tempUnit == 'C' ? 'F' : 'C';
      final output = targetUnit == 'C' ? celsius : celsius * (9 / 5) + 32;
      result = '$targetUnit：${_formatNumber(output)}';
    }

    return _converterCard(
      title: '溫度轉換',
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _numericField(_tempController, hint: '請輸入數值')),
              const SizedBox(width: 8),
              SizedBox(
                width: 110,
                child: _mobileSafeSelector(
                  label: '溫度單位',
                  sheetTitle: '請選擇單位',
                  value: _tempUnit,
                  options: const [
                    SelectorOption(value: 'C', label: 'C'),
                    SelectorOption(value: 'F', label: 'F'),
                  ],
                  onChanged: (value) => setState(() => _tempUnit = value),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Align(alignment: Alignment.centerLeft, child: Text('結果：$result')),
        ],
      ),
    );
  }

  Widget _areaConverterCard() {
    final lengthM = _parseAny(_areaLengthController.text);
    final widthM = _parseAny(_areaWidthController.text);
    final areaM2 = (lengthM == null || widthM == null) ? null : lengthM * widthM;
    final areaFt2 = areaM2 == null ? null : areaM2 * 10.7639;
    final areaPing = areaM2 == null ? null : areaM2 / 3.305785;

    return _converterCard(
      title: '面積換算',
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _numericField(_areaLengthController, label: '長度（m）', hint: '請輸入長度')),
              const SizedBox(width: 8),
              Expanded(child: _numericField(_areaWidthController, label: '寬度（m）', hint: '請輸入寬度')),
            ],
          ),
          const SizedBox(height: 10),
          _resultRows({
            '平方公尺（m²）': _formatNumber2(areaM2),
            '平方英尺（ft²）': _formatNumber2(areaFt2),
            '坪': _formatNumber2(areaPing),
          }),
        ],
      ),
    );
  }

  Widget _coolingCapacityCard() {
    return _multiUnitCard(
      title: '空調能力轉換',
      controller: _coolingCapacityController,
      selectedUnit: _coolingCapacityUnit,
      units: _coolingCapacityToRt.keys.toList(),
      toBase: _coolingCapacityToRt,
      onUnitChanged: (u) => setState(() => _coolingCapacityUnit = u),
    );
  }

  Widget _multiUnitCard({
    required String title,
    required TextEditingController controller,
    required String selectedUnit,
    required List<String> units,
    required Map<String, double> toBase,
    required ValueChanged<String> onUnitChanged,
  }) {
    final input = _parseAny(controller.text);
    final base = input == null ? null : input * toBase[selectedUnit]!;

    final results = <String, String>{
      for (final unit in units)
        if (unit != selectedUnit)
          unit: base == null ? '-' : _formatNumber(base / toBase[unit]!),
    };

    return _converterCard(
      title: title,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _numericField(controller, hint: '請輸入數值')),
              const SizedBox(width: 8),
              SizedBox(
                width: 130,
                child: _mobileSafeSelector(
                  label: '$title 單位',
                  sheetTitle: '請選擇單位',
                  value: selectedUnit,
                  options: units
                      .map((u) => SelectorOption(value: u, label: u))
                      .toList(),
                  onChanged: onUnitChanged,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _resultRows(results),
        ],
      ),
    );
  }

  Widget _pipeSuggestionCard() {
    final inputValue = _parsePositive(_pipeFlowController.text);
    final flowLpm = inputValue == null ? null : convertToLpm(inputValue, _pipeFlowUnit);
    final suggestion = flowLpm == null ? null : PipeSizing.suggest(flowLpm);
    return _converterCard(
      title: '水管管徑建議',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: _numericField(_pipeFlowController, hint: '設計流量，例如 300')),
              const SizedBox(width: 8),
              SizedBox(
                width: 120,
                child: _mobileSafeSelector(
                  label: '流量單位',
                  sheetTitle: '請選擇單位',
                  value: _pipeFlowUnit,
                  options: const ['CFM', 'CMH', 'm3/s', 'L/s', 'LPM', 'CMM']
                      .map((u) => SelectorOption(value: u, label: u))
                      .toList(growable: false),
                  onChanged: (value) => setState(() => _pipeFlowUnit = value),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Padding(
            padding: _hintVerticalPadding,
            child: Text('水管建議流速：1.2～3.0 m/s；最大控制流速：3.0 m/s。', style: _hintStyle),
          ),
          const SizedBox(height: 10),
          _resultRows({
            '輸入流量（LPM）': flowLpm == null ? '-' : _formatNumber(flowLpm),
            '建議管徑': suggestion?.recommended?.pipe.label ?? '-',
            '參考流速（m/s）': suggestion?.recommended == null ? '-' : _formatNumber(suggestion!.recommended!.velocityMps),
            '判定': suggestion?.message ?? '-',
          }),
          if (flowLpm != null && suggestion != null)
            ...suggestion.candidates.map((c) => Text('${c.pipe.nominalA} | 內徑 ${c.pipe.insideDiameterMm} mm | ${_formatNumber(c.velocityMps)} m/s | ${c.judgement == PipeVelocityJudgement.overspeed ? '超速，不建議' : c.judgement == PipeVelocityJudgement.recommended ? '建議' : '偏低但可用'}')),
          Padding(
            padding: _hintVerticalPadding,
            child: Text('依常用 HVAC chilled water / condenser water / hydronic piping design practice，管徑初選需同時考量流速、壓損、噪音、沖蝕與泵浦能耗；本工具為初步估算，最終仍需依專案規範與壓損計算確認。', style: _hintStyle),
          ),
        ],
      ),
    );
  }

  Widget _dpFlowCard() {
    final measured = _parsePositive(_dpMeasuredController.text);
    final refFlow = _parsePositive(_dpRefFlowController.text);
    final refLoss = _parsePositive(_dpRefLossController.text);
    final selectedPipe = _pipeSizeList.firstWhere((pipe) => pipe.a == _dpPipeSize);
    final refPipe = _pipeSizeList.firstWhere((pipe) => pipe.a == '25A');
    final areaRatio = _pipeAreaM2(selectedPipe) / _pipeAreaM2(refPipe);

    double? correctedFlow;
    if (measured != null && refFlow != null && refLoss != null) {
      final measuredPa = measured * _dpToPaMap[_dpMeasuredUnit]!;
      final refDpPa = refLoss * _dpToPaMap[_dpRefLossUnit]!;
      if (measuredPa > 0 && refDpPa > 0) {
        correctedFlow = refFlow * math.sqrt(measuredPa / refDpPa) * areaRatio;
      }
    }

    return _converterCard(
      title: '壓差估算流量（設備修正）',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('目前量測條件', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _numericField(_dpMeasuredController, hint: '目前量測壓差')),
              const SizedBox(width: 8),
              SizedBox(
                width: 120,
                child: _mobileSafeSelector(
                  label: '壓差單位',
                  sheetTitle: '請選擇單位',
                  value: _dpMeasuredUnit,
                  options: const ['kPa', 'mAq', 'bar', 'psi']
                      .map((u) => SelectorOption(value: u, label: u))
                      .toList(growable: false),
                  onChanged: (value) => setState(() => _dpMeasuredUnit = value),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _mobileSafeSelector(
            label: '使用管徑',
            sheetTitle: '請選擇管徑',
            value: _dpPipeSize,
            options: _pipeSizeList
                .map((p) => SelectorOption(value: p.a, label: '${p.a} / ${p.inchDn}'))
                .toList(),
            onChanged: (value) => setState(() => _dpPipeSize = value),
          ),
          const Divider(height: 24),
          _resultRows({'預估流量（LPM）': _formatNumber(correctedFlow)}),
          Padding(
            padding: _hintVerticalPadding,
            child: Text('（依壓差平方關係與管徑修正推估）', style: _hintStyle),
          ),
          Padding(
            padding: _hintVerticalPadding,
            child: Text('管徑修正：以 25A 為基準，依截面積比例修正。', style: _hintStyle),
          ),
          const Divider(height: 24),
          const Text('進階設定：設備已知條件（可選）', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Padding(
            padding: _hintVerticalPadding,
            child: Text(
              '若有設備選機表，可填入「某流量下的水側壓損」作為修正基準。若不清楚，可使用預設值快速估算。',
              style: _sectionDescriptionStyle,
            ),
          ),
          const SizedBox(height: 8),
          _numericField(_dpRefFlowController, hint: '參考流量（LPM）'),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _numericField(_dpRefLossController, hint: '對應水側壓損')),
              const SizedBox(width: 8),
              SizedBox(
                width: 120,
                child: _mobileSafeSelector(
                  label: '參考壓損單位',
                  sheetTitle: '請選擇單位',
                  value: _dpRefLossUnit,
                  options: const ['kPa', 'mAq', 'bar']
                      .map((u) => SelectorOption(value: u, label: u))
                      .toList(growable: false),
                  onChanged: (value) => setState(() => _dpRefLossUnit = value),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _powerUnitCard() {
    final input = _parseAny(_powerController.text);
    final baseW = input == null ? null : input * _powerToW[_powerUnit]!;
    final results = <String, String>{
      for (final unit in _powerToW.keys)
        if (unit != _powerUnit)
          unit: baseW == null ? '-' : _formatNumber(baseW / _powerToW[unit]!),
    };

    return _converterCard(
      title: '電力單位換算',
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _numericField(_powerController, label: '功率數值', hint: '請輸入數值')),
              const SizedBox(width: 8),
              SizedBox(
                width: 120,
                child: _mobileSafeSelector(
                  label: '功率單位',
                  sheetTitle: '請選擇單位',
                  value: _powerUnit,
                  options: _powerToW.keys
                      .map((u) => SelectorOption(value: u, label: u))
                      .toList(growable: false),
                  onChanged: (value) => setState(() => _powerUnit = value),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _resultRows(results),
        ],
      ),
    );
  }

  Widget _threePhasePowerCard() {
    final voltage = _parsePositive(_threePhaseVoltageController.text);
    final current = _parsePositive(_threePhaseCurrentController.text);
    final pf = _parsePowerFactor(_threePhasePfController.text, 0.85);

    double? kva;
    double? kw;
    if (voltage != null && current != null) {
      kva = math.sqrt(3) * voltage * current / 1000;
      kw = math.sqrt(3) * voltage * current * pf / 1000;
    }

    return _converterCard(
      title: '三相電力估算',
      child: Column(
        children: [
          _numericField(_threePhaseVoltageController, label: '電壓 V', hint: '例如 380'),
          const SizedBox(height: 8),
          _numericField(_threePhaseCurrentController, label: '電流 A', hint: '例如 10'),
          const SizedBox(height: 8),
          _numericField(_threePhasePfController, label: '功率因數 PF', hint: '預設 0.85'),
          const SizedBox(height: 10),
          _resultRows({
            '視在功率（kVA）': _formatNumber(kva),
            '有效功率（kW）': _formatNumber(kw),
          }),
        ],
      ),
    );
  }

  Widget _singlePhasePowerCard() {
    final voltage = _parsePositive(_singlePhaseVoltageController.text);
    final current = _parsePositive(_singlePhaseCurrentController.text);
    final pf = _parsePowerFactor(_singlePhasePfController.text, 1.0);

    double? kva;
    double? kw;
    if (voltage != null && current != null) {
      kva = voltage * current / 1000;
      kw = voltage * current * pf / 1000;
    }

    return _converterCard(
      title: '單相電力估算',
      child: Column(
        children: [
          _numericField(_singlePhaseVoltageController, label: '電壓 V', hint: '例如 220'),
          const SizedBox(height: 8),
          _numericField(_singlePhaseCurrentController, label: '電流 A', hint: '例如 10'),
          const SizedBox(height: 8),
          _numericField(_singlePhasePfController, label: '功率因數 PF', hint: '預設 1.0'),
          const SizedBox(height: 10),
          _resultRows({
            '視在功率（kVA）': _formatNumber(kva),
            '有效功率（kW）': _formatNumber(kw),
          }),
        ],
      ),
    );
  }

  Widget _currentEstimateCard() {
    final powerInput = _parsePositive(_estimatePowerController.text);
    final voltage = _parsePositive(_estimateVoltageController.text);
    final pf = _parsePowerFactor(_estimatePfController.text, 0.85);
    final kw = powerInput == null ? null : powerInput * _estimatePowerToKw[_estimatePowerUnit]!;

    double? current;
    if (kw != null && voltage != null) {
      if (_estimatePhase == '三相') {
        current = kw * 1000 / (math.sqrt(3) * voltage * pf);
      } else {
        current = kw * 1000 / (voltage * pf);
      }
    }

    return _converterCard(
      title: '電流估算',
      child: Column(
        children: [
          _numericField(_estimatePowerController, label: '功率數值', hint: '請輸入數值'),
          const SizedBox(height: 8),
          _mobileSafeSelector(
            label: '功率單位',
            sheetTitle: '請選擇功率單位',
            value: _estimatePowerUnit,
            options: const ['W', 'kW', 'HP']
                .map((u) => SelectorOption(value: u, label: u))
                .toList(growable: false),
            onChanged: (value) => setState(() => _estimatePowerUnit = value),
          ),
          const SizedBox(height: 8),
          _numericField(_estimateVoltageController, label: '電壓 V', hint: '例如 220 或 380'),
          const SizedBox(height: 8),
          _mobileSafeSelector(
            label: '相數',
            sheetTitle: '請選擇相數',
            value: _estimatePhase,
            options: const ['單相', '三相']
                .map((u) => SelectorOption(value: u, label: u))
                .toList(growable: false),
            onChanged: (value) => setState(() => _estimatePhase = value),
          ),
          const SizedBox(height: 8),
          _numericField(_estimatePfController, label: '功率因數 PF', hint: '預設 0.85'),
          const SizedBox(height: 10),
          _resultRows({'預估電流（A）': _formatNumber(current)}),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('HVAC Unit Converter V0.19')),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final columns = width >= 1180 ? 3 : width >= 760 ? 2 : 1;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(12),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _areaConverterCard()),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _coolingCapacityCard()),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _temperatureCard()),
                SizedBox(
                  width: (width - (columns - 1) * 12) / columns,
                  child: _multiUnitCard(
                    title: '流量轉換',
                    controller: _airflowController,
                    selectedUnit: _airflowUnit,
                    units: _airflowToBase.keys.toList(),
                    toBase: _airflowToBase,
                    onUnitChanged: (u) => setState(() => _airflowUnit = u),
                  ),
                ),
                SizedBox(
                  width: (width - (columns - 1) * 12) / columns,
                  child: _multiUnitCard(
                    title: '壓力轉換',
                    controller: _pressureController,
                    selectedUnit: _pressureUnit,
                    units: _pressureToPa.keys.toList(),
                    toBase: _pressureToPa,
                    onUnitChanged: (u) => setState(() => _pressureUnit = u),
                  ),
                ),
                SizedBox(
                  width: (width - (columns - 1) * 12) / columns,
                  child: _multiUnitCard(
                    title: '流速轉換',
                    controller: _velocityController,
                    selectedUnit: _velocityUnit,
                    units: _velocityToMs.keys.toList(),
                    toBase: _velocityToMs,
                    onUnitChanged: (u) => setState(() => _velocityUnit = u),
                  ),
                ),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _pipeSuggestionCard()),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _dpFlowCard()),
                SizedBox(
                  width: width,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8, bottom: 4),
                    child: Text(
                      '電力',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _powerUnitCard()),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _threePhasePowerCard()),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _singlePhasePowerCard()),
                SizedBox(width: (width - (columns - 1) * 12) / columns, child: _currentEstimateCard()),
              ],
            ),
          );
        },
      ),
    );
  }
}

class PipeSize {
  final String a;
  final String inchDn;
  final double innerDiameterMm;

  const PipeSize({required this.a, required this.inchDn, required this.innerDiameterMm});
}

class PipeSuggestion {
  final PipeSize pipe;
  final double velocity;
  final bool exceedsRecommendedRange;

  const PipeSuggestion({
    required this.pipe,
    required this.velocity,
    required this.exceedsRecommendedRange,
  });
}

class SelectorOption<T> {
  final T value;
  final String label;

  const SelectorOption({required this.value, required this.label});
}

class MobileSafeSelector<T> extends StatelessWidget {
  final String label;
  final String sheetTitle;
  final T value;
  final List<SelectorOption<T>> options;
  final ValueChanged<T> onChanged;

  const MobileSafeSelector({
    super.key,
    required this.label,
    required this.sheetTitle,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = options.firstWhere((option) => option.value == value);
    return InputDecorator(
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              selected.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Container(
            width: 1,
            height: 30,
            color: Theme.of(context).dividerColor,
          ),
          IconButton(
            tooltip: '開啟選單',
            visualDensity: VisualDensity.standard,
            icon: const Icon(Icons.keyboard_arrow_down),
            onPressed: () => _showSelectorBottomSheet(context),
          ),
        ],
      ),
    );
  }

  Future<void> _showSelectorBottomSheet(BuildContext context) async {
    final selected = await showModalBottomSheet<T>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    sheetTitle,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ),
              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  children: options
                      .map(
                        (option) => ListTile(
                          title: Text(option.label),
                          trailing: option.value == value ? const Icon(Icons.check) : null,
                          onTap: () => Navigator.of(sheetContext).pop(option.value),
                        ),
                      )
                      .toList(),
                ),
              ),
            ],
          ),
        );
      },
    );

    if (selected != null && selected != value) {
      onChanged(selected);
    }
  }
}

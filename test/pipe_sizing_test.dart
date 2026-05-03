import 'package:flutter_test/flutter_test.dart';
import 'package:hvac_unit_converter_test/core/pipe_sizing.dart';

void main() {
  test('5000 LPM 推薦不得小於 200A 且 <=3.0m/s', () {
    final r = PipeSizing.suggest(5000);
    expect(r.recommended, isNotNull);
    expect(int.parse(r.recommended!.pipe.nominalA.replaceAll('A', '')), greaterThanOrEqualTo(200));
    expect(r.recommended!.velocityMps, lessThanOrEqualTo(3.0));
  });

  test('5000 LPM at 150A should be >3.0 m/s', () {
    final q = 5000 / 1000 / 60;
    final area = PipeSizing.areaM2(154.1);
    expect(q / area, greaterThan(3.0));
  });

  test('invalid value should not crash', () {
    expect(PipeSizing.suggest(0).recommended, isNull);
    expect(PipeSizing.suggest(-1).recommended, isNull);
  });
}

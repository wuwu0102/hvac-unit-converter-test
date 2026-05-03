import 'package:flutter_test/flutter_test.dart';
import 'package:hvac_unit_converter_test/core/unit_conversion.dart';

void main() {
  test('lpm m3s reversible', () {
    final v = 5000.0;
    final back = UnitConversion.m3sToLpm(UnitConversion.lpmToM3s(v));
    expect((back - v).abs() / v, lessThan(0.005));
  });
  test('lpm gpm reversible', () {
    final v = 1000.0;
    final back = UnitConversion.gpmToLpm(UnitConversion.lpmToGpm(v));
    expect((back - v).abs() / v, lessThan(0.005));
  });
  test('cooling deltaT formulas', () {
    final kw = UnitConversion.coolingKwFromLpmDeltaT(lpm: 500, deltaTC: 5);
    final lpm = UnitConversion.lpmFromCoolingKwDeltaT(kw: kw, deltaTC: 5);
    expect((lpm - 500).abs() / 500, lessThan(0.005));
  });
}

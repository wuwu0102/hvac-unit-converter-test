import 'package:flutter_test/flutter_test.dart';
import 'package:hvac_unit_converter/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const HvacConverterApp());

    expect(find.text('HVAC Unit Converter'), findsOneWidget);
  });
}

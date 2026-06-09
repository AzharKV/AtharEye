// Smoke test: the comparison app boots to the Projects hero screen.
import 'package:flutter_test/flutter_test.dart';

import 'package:athar_eye_compare/main.dart';

void main() {
  testWidgets('boots to the Projects screen', (tester) async {
    await tester.pumpWidget(const AtharEyeApp());
    await tester.pump();

    // Large title + the bottom tab labels are present.
    expect(find.text('Projects'), findsWidgets);
    expect(find.text('Reports'), findsWidgets);
    expect(find.text('Settings'), findsWidgets);
  });
}

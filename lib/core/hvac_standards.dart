class HvacStandardPipe {
  final String nominalA;
  final String inch;
  final String dn;
  final double insideDiameterMm;
  const HvacStandardPipe({required this.nominalA, required this.inch, required this.dn, required this.insideDiameterMm});
  String get label => '$nominalA / $inch / $dn';
}
/// 此為工程估算用內徑，實際設計仍須依 JIS / CNS / ASTM / 專案規範管材厚度校核。
const List<HvacStandardPipe> hvacStandardPipes = [
  HvacStandardPipe(nominalA: '15A', inch: '1/2"', dn: 'DN15', insideDiameterMm: 15.8),HvacStandardPipe(nominalA: '20A', inch: '3/4"', dn: 'DN20', insideDiameterMm: 20.9),HvacStandardPipe(nominalA: '25A', inch: '1"', dn: 'DN25', insideDiameterMm: 26.6),HvacStandardPipe(nominalA: '32A', inch: '1-1/4"', dn: 'DN32', insideDiameterMm: 35.1),HvacStandardPipe(nominalA: '40A', inch: '1-1/2"', dn: 'DN40', insideDiameterMm: 40.9),HvacStandardPipe(nominalA: '50A', inch: '2"', dn: 'DN50', insideDiameterMm: 52.5),HvacStandardPipe(nominalA: '65A', inch: '2-1/2"', dn: 'DN65', insideDiameterMm: 62.7),HvacStandardPipe(nominalA: '80A', inch: '3"', dn: 'DN80', insideDiameterMm: 77.9),HvacStandardPipe(nominalA: '100A', inch: '4"', dn: 'DN100', insideDiameterMm: 102.3),HvacStandardPipe(nominalA: '125A', inch: '5"', dn: 'DN125', insideDiameterMm: 128.2),HvacStandardPipe(nominalA: '150A', inch: '6"', dn: 'DN150', insideDiameterMm: 154.1),HvacStandardPipe(nominalA: '200A', inch: '8"', dn: 'DN200', insideDiameterMm: 202.7),HvacStandardPipe(nominalA: '250A', inch: '10"', dn: 'DN250', insideDiameterMm: 254.5),HvacStandardPipe(nominalA: '300A', inch: '12"', dn: 'DN300', insideDiameterMm: 303.2),HvacStandardPipe(nominalA: '350A', inch: '14"', dn: 'DN350', insideDiameterMm: 333.4),HvacStandardPipe(nominalA: '400A', inch: '16"', dn: 'DN400', insideDiameterMm: 381.0),
];

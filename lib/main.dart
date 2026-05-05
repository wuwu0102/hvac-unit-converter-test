import 'package:flutter/material.dart';
import 'core/unit_conversion.dart';

void main() {
  runApp(const HvacToolkitApp());
}

class HvacToolkitApp extends StatelessWidget {
  const HvacToolkitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HVAC Engineering Toolkit',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1D4ED8)),
        scaffoldBackgroundColor: const Color(0xFFF3F6FB),
        useMaterial3: true,
      ),
      home: const ToolkitHomePage(),
    );
  }
}

class ToolkitHomePage extends StatelessWidget {
  const ToolkitHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('HVAC Engineering Toolkit'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [Tab(text: 'Convert'), Tab(text: 'Load'), Tab(text: 'Airflow'), Tab(text: 'Data Center')],
          ),
        ),
        body: Column(
          children: const [
            Padding(
              padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Professional HVAC and data center cooling calculations',
                  style: TextStyle(fontSize: 14, color: Colors.black54),
                ),
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [ConvertTab(), LoadTab(), AirflowTab(), DataCenterTab()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ConvertTab extends StatefulWidget { const ConvertTab({super.key}); @override State<ConvertTab> createState()=>_ConvertTabState(); }
class _ConvertTabState extends State<ConvertTab> {
  final v1 = TextEditingController();
  final v2 = TextEditingController();
  final v3 = TextEditingController();
  final v4 = TextEditingController();
  @override void initState(){super.initState(); for(final c in [v1,v2,v3,v4]){c.addListener(()=>setState((){}));}}
  @override void dispose(){for(final c in [v1,v2,v3,v4]){c.dispose();}super.dispose();}
  double? _num(TextEditingController c)=>double.tryParse(c.text.trim());
  String f(double? v)=>v==null?'-':v.toStringAsFixed(2);
  @override
  Widget build(BuildContext context) {
    final kw = _num(v1);
    final kw2 = _num(v2);
    final cfm = _num(v3);
    final c = _num(v4);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _card('HVAC Unit Converter', 'Core engineering conversions for thermal and airflow sizing.', [
          _field('kW', v1), Text('BTU/h: ${f(kw==null?null:kw*3412.142)}'),
          const SizedBox(height: 8),
          _field('kW', v2), Text('RT: ${f(kw2==null?null:UnitConversion.kwToRt(kw2))}'),
          const SizedBox(height: 8),
          _field('CFM', v3), Text('m³/h: ${f(cfm==null?null:UnitConversion.cfmToCmh(cfm))}'),
          const SizedBox(height: 8),
          _field('°C', v4), Text('°F: ${f(c==null?null:(c*9/5)+32)}'),
        ]),
        _disclaimer(),
      ],
    );
  }
}

class LoadTab extends StatefulWidget { const LoadTab({super.key}); @override State<LoadTab> createState()=>_LoadTabState(); }
class _LoadTabState extends State<LoadTab>{
  final area=TextEditingController();
  final height=TextEditingController();
  final density=TextEditingController(text:'150');
  @override void initState(){super.initState(); for(final c in [area,height,density]){c.addListener(()=>setState((){}));}}
  @override void dispose(){for(final c in [area,height,density]){c.dispose();}super.dispose();}
  double? n(TextEditingController c)=>double.tryParse(c.text.trim());
  String f(double? v)=>v==null?'-':v.toStringAsFixed(2);
  @override Widget build(BuildContext context){
    final a=n(area), d=n(density), h=n(height);
    final kw=(a!=null&&d!=null&&a>0&&d>0)?a*d/1000:null;
    return ListView(padding:const EdgeInsets.all(16),children:[
      _card('Cooling Load Estimator','Estimate cooling capacity from area and load density.',[
        _field('Area (m²)',area),
        _field('Ceiling Height (m)',height),
        _field('Load Density (W/m²)',density),
        Text('Estimated Cooling Load (kW): ${f(kw)}'),
        Text('Estimated Cooling Load (BTU/h): ${f(kw==null?null:kw*3412.142)}'),
        Text('Estimated Cooling Load (RT): ${f(kw==null?null:kw/3.5168525)}'),
        Text('Volume Reference (m³): ${f((a!=null&&h!=null)?a*h:null)}'),
      ]),
      _disclaimer(),
    ]);
  }
}

class AirflowTab extends StatefulWidget { const AirflowTab({super.key}); @override State<AirflowTab> createState()=>_AirflowTabState(); }
class _AirflowTabState extends State<AirflowTab>{
  final kw=TextEditingController(); final dt=TextEditingController(text:'10');
  @override void initState(){super.initState(); for(final c in [kw,dt]){c.addListener(()=>setState((){}));}}
  @override void dispose(){for(final c in [kw,dt]){c.dispose();}super.dispose();}
  double? n(TextEditingController c)=>double.tryParse(c.text.trim());
  String f(double? v)=>v==null?'-':v.toStringAsFixed(2);
  @override Widget build(BuildContext context){
    final l=n(kw), t=n(dt);
    final m3s=(l!=null&&t!=null&&t>0)?l/(1.2*1.006*t):null;
    final m3h=m3s==null?null:m3s*3600;
    final cfm=m3h==null?null:m3h/1.699;
    return ListView(padding:const EdgeInsets.all(16),children:[
      _card('Airflow Calculator','Translate cooling load to required supply airflow.',[
        _field('Cooling Load (kW)',kw),_field('Temperature Difference ΔT (°C)',dt),
        Text('Required Airflow (CFM): ${f(cfm)}'),
        Text('Required Airflow (m³/h): ${f(m3h)}'),
      ]),
      _disclaimer(),
    ]);
  }
}

class DataCenterTab extends StatefulWidget { const DataCenterTab({super.key}); @override State<DataCenterTab> createState()=>_DataCenterTabState(); }
class _DataCenterTabState extends State<DataCenterTab>{
  final racks=TextEditingController(); final power=TextEditingController(); final redundancy=TextEditingController(text:'1.2');
  @override void initState(){super.initState(); for(final c in [racks,power,redundancy]){c.addListener(()=>setState((){}));}}
  @override void dispose(){for(final c in [racks,power,redundancy]){c.dispose();}super.dispose();}
  double? n(TextEditingController c)=>double.tryParse(c.text.trim());
  String f(double? v)=>v==null?'-':v.toStringAsFixed(2);
  @override Widget build(BuildContext context){
    final r=n(racks), p=n(power), rf=n(redundancy);
    final it=(r!=null&&p!=null)?r*p:null;
    final cool=(it!=null&&rf!=null)?it*rf:null;
    return ListView(padding:const EdgeInsets.all(16),children:[
      _card('Data Center Quick Check','Rapid capacity check for rack-based cooling planning.',[
        _field('Rack Count',racks),_field('Power per Rack (kW)',power),_field('Redundancy Factor',redundancy),
        Text('Total IT Load (kW): ${f(it)}'),
        Text('Recommended Cooling Capacity (kW): ${f(cool)}'),
        Text('Recommended Cooling Capacity (RT): ${f(cool==null?null:cool/3.5168525)}'),
      ]),
      _disclaimer(),
    ]);
  }
}

Widget _field(String label, TextEditingController controller)=>Padding(
  padding: const EdgeInsets.only(bottom: 10),
  child: TextField(controller: controller, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: InputDecoration(labelText: label, border: const OutlineInputBorder())),
);

Widget _card(String title,String desc,List<Widget> children)=>Card(
  child: Padding(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start,children:[
      Text(title,style: const TextStyle(fontSize: 18,fontWeight: FontWeight.w600)),
      const SizedBox(height: 6),Text(desc,style: const TextStyle(color: Colors.black54)),
      const SizedBox(height: 14),...children,
    ]),
  ),
);

Widget _disclaimer()=>const Card(
  color: Color(0xFFEFF6FF),
  child: Padding(
    padding: EdgeInsets.all(12),
    child: Text('Results are engineering estimates for reference only. Final design should be verified by qualified professionals and project-specific conditions.'),
  ),
);

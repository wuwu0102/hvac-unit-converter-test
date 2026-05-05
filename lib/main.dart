import 'dart:math' as math;

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
    final tabs = const [
      Tab(text: 'Unit Converter'),
      Tab(text: 'Ventilation'),
      Tab(text: 'Cooling Load'),
      Tab(text: 'Airflow'),
      Tab(text: 'Data Center Room'),
      Tab(text: 'Power Estimate'),
    ];
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('HVAC / Data Center Engineering Toolkit'),
          bottom: TabBar(isScrollable: true, tabs: tabs),
        ),
        body: const TabBarView(
          children: [
            ConvertTab(),
            VentilationTab(),
            LoadTab(),
            AirflowTab(),
            DataCenterRoomTab(),
            PowerEstimateTab(),
          ],
        ),
      ),
    );
  }
}

class ConvertTab extends StatelessWidget { const ConvertTab({super.key}); @override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(16),children:[_card('Unit Converter','Core engineering conversions for thermal and airflow sizing.',[const Text('Use existing HVAC unit conversion tools in this section.')]),_disclaimer()]); }
class LoadTab extends StatelessWidget { const LoadTab({super.key}); @override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(16),children:[_card('Cooling Load','Area and density based cooling load estimate.',[const Text('Use Cooling Load Estimator for quick HVAC sizing.')]),_disclaimer()]); }
class AirflowTab extends StatelessWidget { const AirflowTab({super.key}); @override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(16),children:[_card('Airflow','Translate cooling load to airflow requirements.',[const Text('Use Airflow calculator from load and ΔT.')]),_disclaimer()]); }
class PowerEstimateTab extends StatelessWidget { const PowerEstimateTab({super.key}); @override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(16),children:[_card('Power Estimate','Power estimate is integrated with Data Center Room results.',[const Text('See detailed power and 380V three-phase current in Data Center Room tab.')]),_disclaimer()]); }

class VentilationTab extends StatefulWidget { const VentilationTab({super.key}); @override State<VentilationTab> createState()=>_VentilationTabState(); }
class _VentilationTabState extends State<VentilationTab> {
  final l=TextEditingController(), w=TextEditingController(), h=TextEditingController(), ach=TextEditingController();
  String lu='m', wu='m', hu='m';
  @override void initState(){super.initState(); for(final c in [l,w,h,ach]){c.addListener(()=>setState((){}));}}
  @override void dispose(){for(final c in [l,w,h,ach]){c.dispose();}super.dispose();}
  double? n(TextEditingController c)=>double.tryParse(c.text.trim());
  double? toM(double? v,String u)=>v==null?null:(u=='cm'?v/100:v);
  String f(double? v)=>v==null?'-':v.toStringAsFixed(2);
  @override Widget build(BuildContext context){
    final lm=toM(n(l),lu), wm=toM(n(w),wu), hm=toM(n(h),hu), a=n(ach);
    final vol=(lm!=null&&wm!=null&&hm!=null)?lm*wm*hm:null;
    final cmh=(vol!=null&&a!=null)?vol*a:null;
    final cmm=cmh==null?null:cmh/60;
    final cfm=cmh==null?null:cmh/1.699;
    return ListView(padding:const EdgeInsets.all(16),children:[
      _card('換氣量計算 / Air Change Ventilation Calculator','This tool estimates required ventilation airflow from room volume and air changes per hour.',[
        Row(children:[Expanded(child:_field('Length',l)),const SizedBox(width:8),_unitSel(lu,(v)=>setState(()=>lu=v))]),
        Row(children:[Expanded(child:_field('Width',w)),const SizedBox(width:8),_unitSel(wu,(v)=>setState(()=>wu=v))]),
        Row(children:[Expanded(child:_field('Height',h)),const SizedBox(width:8),_unitSel(hu,(v)=>setState(()=>hu=v))]),
        _field('ACH (/hr)',ach),
        Text('Volume (m³): ${f(vol)}'), Text('CMH (m³/h): ${f(cmh)}'), Text('CMM (m³/min): ${f(cmm)}'), Text('CFM: ${f(cfm)}'),
      ]),_disclaimer()
    ]);
  }
}

class DataCenterRoomTab extends StatefulWidget { const DataCenterRoomTab({super.key}); @override State<DataCenterRoomTab> createState()=>_DataCenterRoomTabState(); }
class _DataCenterRoomTabState extends State<DataCenterRoomTab>{
  final rows=TextEditingController(), racksPer=TextEditingController(), kwRack=TextEditingController(), rl=TextEditingController(), rw=TextEditingController(), rh=TextEditingController(), people=TextEditingController(text:'5'), ups=TextEditingController(text:'0.09'), dist=TextEditingController(text:'0.03'), light=TextEditingController(text:'21.53'), other=TextEditingController(text:'0.14'), volt=TextEditingController(text:'380'), pf=TextEditingController(text:'0.95');
  String lu='m', wu='m', hu='m';
  @override void initState(){super.initState(); for(final c in [rows,racksPer,kwRack,rl,rw,rh,people,ups,dist,light,other,volt,pf]){c.addListener(()=>setState((){}));}}
  @override void dispose(){for(final c in [rows,racksPer,kwRack,rl,rw,rh,people,ups,dist,light,other,volt,pf]){c.dispose();}super.dispose();}
  double? n(TextEditingController c)=>double.tryParse(c.text.trim()); double? m(double? v,String u)=>v==null?null:(u=='cm'?v/100:v); String f(double? v)=>v==null?'-':v.toStringAsFixed(2);
  @override Widget build(BuildContext context){
    final r=n(rows), rp=n(racksPer), k=n(kwRack), l=m(n(rl),lu), w=m(n(rw),wu), h=m(n(rh),hu), p=n(people)??5, uf=n(ups)??.09, df=n(dist)??.03, ld=n(light)??21.53, or=n(other)??.14, v=n(volt)??380, pff=n(pf)??.95;
    final totalR=(r!=null&&rp!=null)?r*rp:null, area=(l!=null&&w!=null)?l*w:null, vol=(area!=null&&h!=null)?area*h:null;
    final it=(totalR!=null&&k!=null)?totalR*k:null, upsH=it==null?null:it*uf, distH=it==null?null:it*df, lightH=area==null?null:area*ld/1000, peopleH=p*0.1;
    final totalH=(it??0)+(upsH??0)+(distH??0)+(lightH??0)+peopleH;
    double rt(double kw)=>kw/3.5168525, btu(double kw)=>kw*3412.142;
    double cur(double kw)=>kw*1000/(math.sqrt(3)*v*pff);
    final hvac=totalH*0.4, otherP=(it??0)*or, totalP=(it??0)+hvac+otherP;
    return ListView(padding:const EdgeInsets.all(16),children:[_card('機房負載概算 / Data Center Room Estimator','Rack load, heat dissipation, power consumption, and 380V three-phase current estimation.',[
      _field('Rows',rows),_field('Racks per Row',racksPer),_field('kW per Rack',kwRack),
      Row(children:[Expanded(child:_field('Room Length',rl)),const SizedBox(width:8),_unitSel(lu,(x)=>setState(()=>lu=x))]),
      Row(children:[Expanded(child:_field('Room Width',rw)),const SizedBox(width:8),_unitSel(wu,(x)=>setState(()=>wu=x))]),
      Row(children:[Expanded(child:_field('Room Height',rh)),const SizedBox(width:8),_unitSel(hu,(x)=>setState(()=>hu=x))]),
      _field('People',people),_field('UPS Factor',ups),_field('Distribution Factor',dist),_field('Lighting Density (W/m²)',light),_field('Other Power Ratio',other),_field('Voltage',volt),_field('PF',pf),
      Text('Space: Rows ${f(r)}, Racks/Row ${f(rp)}, Total Racks ${f(totalR)}, kW/Rack ${f(k)}'),
      Text('L/W/H (m): ${f(l)} / ${f(w)} / ${f(h)} | Area m²: ${f(area)} | 坪: ${f(area==null?null:area/3.305785)} | Volume m³: ${f(vol)}'),
      const Divider(),
      Text('Heat (kW / RT / BTU/h)'),
      Text('IT: ${f(it)} / ${f(it==null?null:rt(it))} / ${f(it==null?null:btu(it))}'),
      Text('UPS: ${f(upsH)} / ${f(upsH==null?null:rt(upsH))} / ${f(upsH==null?null:btu(upsH))}'),
      Text('Distribution: ${f(distH)} / ${f(distH==null?null:rt(distH))} / ${f(distH==null?null:btu(distH))}'),
      Text('Lighting: ${f(lightH)} / ${f(lightH==null?null:rt(lightH))} / ${f(lightH==null?null:btu(lightH))}'),
      Text('People: ${f(peopleH)} / ${f(rt(peopleH))} / ${f(btu(peopleH))}'),
      Text('Total: ${f(totalH)} / ${f(rt(totalH))} / ${f(btu(totalH))}'),
      const Divider(),
      Text('Power & Current (kW / A)'),
      Text('UPS: ${f(it)} / ${f(cur(it??0))}'),
      Text('HVAC: ${f(hvac)} / ${f(cur(hvac))}'),
      Text('Other: ${f(otherP)} / ${f(cur(otherP))}'),
      Text('Total: ${f(totalP)} / ${f(cur(totalP))}'),
      Text('Based on ${f(v)}V three-phase power, PF ${f(pff)}'),
      const SizedBox(height:8),
      LinearProgressIndicator(value: totalH==0?0:(it??0)/totalH),const SizedBox(height:4),Text('IT / UPS / Distribution / Lighting / People ratio shown as simplified bar.'),
    ]),_disclaimer()]);
  }
}

Widget _unitSel(String v, ValueChanged<String> on)=>DropdownButton<String>(value:v,items:const[DropdownMenuItem(value:'m',child:Text('m')),DropdownMenuItem(value:'cm',child:Text('cm'))],onChanged:(x){if(x!=null)on(x);});
Widget _field(String label, TextEditingController c)=>Padding(padding:const EdgeInsets.only(bottom:10),child:TextField(controller:c,keyboardType:const TextInputType.numberWithOptions(decimal:true),decoration:InputDecoration(labelText:label,border:const OutlineInputBorder())));
Widget _card(String t,String d,List<Widget> c)=>Card(child:Padding(padding:const EdgeInsets.all(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(t,style:const TextStyle(fontSize:18,fontWeight:FontWeight.w600)),const SizedBox(height:6),Text(d,style:const TextStyle(color:Colors.black54)),const SizedBox(height:14),...c])));
Widget _disclaimer()=>const Card(color:Color(0xFFEFF6FF),child:Padding(padding:EdgeInsets.all(12),child:Text('Results are engineering estimates for reference only. Final design should be verified by qualified professionals and project-specific conditions.')));

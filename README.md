# HVAC Engineering Toolkit

HVAC Engineering Toolkit is a professional calculation app for HVAC engineers, technicians, and data center cooling planners.

## Features
- HVAC unit conversion (kW/BTU/h, kW/RT, CFM/m³/h, °C/°F)
- Cooling Load Estimator (area + load density method)
- Air change ventilation calculator based on room volume and ACH
- Airflow Calculator (from cooling load and ΔT)
- Data center room estimator for rack load, heat dissipation, power consumption, and 380V three-phase current estimation

## Engineering formulas
- **Cooling load**: `kW = Area × Load Density / 1000`
- **Cooling BTU/h**: `BTU/h = kW × 3412.142`
- **Cooling RT**: `RT = kW / 3.5168525`
- **Airflow m³/s**: `m³/s = kW / (1.2 × 1.006 × ΔT)`
- **Airflow m³/h**: `m³/h = m³/s × 3600`
- **Airflow CFM**: `CFM = m³/h / 1.699`
- **Data center IT load**: `Total IT Load = Rack Count × Power per Rack`
- **Recommended cooling**: `Recommended Cooling = Total IT Load × Redundancy Factor`
- **Data center RT**: `RT = Recommended Cooling / 3.5168525`

## Privacy
- No login
- No tracking
- No external API
- No user data collection
- All calculations run locally on device

## App Review differentiation
This app is not a generic unit converter. It includes HVAC-specific engineering workflows such as cooling load estimation, airflow calculation, and data center cooling quick check.
